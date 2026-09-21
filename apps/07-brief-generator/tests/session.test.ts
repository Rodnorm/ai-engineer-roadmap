import { describe, it } from "node:test";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { createOwnerToken, verifyOwnerToken } from "../lib/session/user-session";
import { briefRepository } from "../lib/session/brief-repository";

describe("App 07: User Session Isolation & Brief Storage", () => {
  const secret = "test-secret-must-be-at-least-32-chars-long";

  it("should create and verify valid owner token", () => {
    const ownerId = randomUUID();
    const token = createOwnerToken(ownerId, secret);

    assert.ok(token.includes("."), "Token must contain dot separator");
    const verified = verifyOwnerToken(token, secret);
    assert.strictEqual(verified, ownerId);
  });

  it("should reject tampered or forged tokens", () => {
    const ownerId = randomUUID();
    const token = createOwnerToken(ownerId, secret);

    // Tamper with payload deterministically
    const [payload, signature] = token.split(".");
    const forgedPayloadToken = `${payload}tampered.${signature}`;
    const verifiedTamperedPayload = verifyOwnerToken(forgedPayloadToken, secret);
    assert.strictEqual(verifiedTamperedPayload, undefined);

    // Tamper with signature deterministically
    const forgedSigToken = `${payload}.${signature}tampered`;
    const verifiedTamperedSig = verifyOwnerToken(forgedSigToken, secret);
    assert.strictEqual(verifiedTamperedSig, undefined);

    // Verify with different secret
    const verifiedWrongSecret = verifyOwnerToken(token, "different-secret-key-32chars-long");
    assert.strictEqual(verifiedWrongSecret, undefined);
  });

  it("should isolate stored briefs per owner session", async () => {
    const userA = randomUUID();
    const userB = randomUUID();

    const dummyResult = {
      brief: {
        title: "Test Brief",
        executiveSummary: "Summary",
        keyInsights: [],
        risksAndTradeoffs: [],
        actionRecommendations: [],
        fullMarkdown: "# Markdown",
      },
      dossier: {
        topic: "Topic A",
        scope: "Scope",
        tone: "executive" as const,
        investigatedTopics: [],
        verifiedFacts: [],
        frictionPoints: [],
        metrics: [],
        summary: "Summary",
        generatedAt: new Date().toISOString(),
      },
      trace: [],
      metrics: {
        totalLatencyMs: 10,
        researchLatencyMs: 5,
        writerLatencyMs: 5,
        tokensEstimated: 100,
        toolCallsCount: 0,
      },
    };

    // Save brief for user A
    await briefRepository.save(userA, "Topic A", "Scope A", "executive", dummyResult);

    // List for user A
    const listA = await briefRepository.listByOwner(userA);
    assert.strictEqual(listA.length, 1);
    assert.strictEqual(listA[0].topic, "Topic A");

    // List for user B must be empty (isolated)
    const listB = await briefRepository.listByOwner(userB);
    assert.strictEqual(listB.length, 0);

    // Cleanup
    await briefRepository.deleteByOwner(userA);
    const listACleaned = await briefRepository.listByOwner(userA);
    assert.strictEqual(listACleaned.length, 0);
  });
});
