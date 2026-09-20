import { describe, it } from "node:test";
import assert from "node:assert";
import { executeMultiAgentPipeline } from "../lib/orchestrator/pipeline";
import { isGenerationEnabled, rateLimiter } from "../lib/security/rate-limiter";
import { ResearchDossierSchema } from "../types/agent";

describe("App 07: Multi-Agent Core Engine & Handoff Pipeline", () => {
  it("should execute end-to-end multi-agent pipeline deterministically", async () => {
    const result = await executeMultiAgentPipeline({
      topic: "Monólito Modular vs Microsserviços",
      scope: "Arquitetura e Latência",
      tone: "executive",
      clientIp: "test-ip-1",
    });

    assert.ok(result, "Pipeline result should exist");
    assert.ok(result.brief, "Executive brief should exist");
    assert.ok(result.dossier, "Research dossier should exist");
    assert.ok(result.trace.length >= 6, "Trace should contain multiple steps across agents");

    // Check dossier schema conformance
    const validatedDossier = ResearchDossierSchema.parse(result.dossier);
    assert.strictEqual(validatedDossier.topic, "Monólito Modular vs Microsserviços");
    assert.ok(validatedDossier.verifiedFacts.length > 0, "Dossier must have verified facts");
    assert.ok(validatedDossier.metrics.length > 0, "Dossier must have metrics");

    // Verify Handoff step in trace
    const handoffStep = result.trace.find((s) => s.action.includes("Handoff Protocol"));
    assert.ok(handoffStep, "Trace must include Handoff Protocol step");
    assert.strictEqual(handoffStep.status, "completed");

    // Verify Writer output
    assert.ok(result.brief.title.includes("Monólito"), "Brief title should mention topic");
    assert.ok(result.brief.fullMarkdown.includes("## 1. Sumário Executivo"), "Markdown must have Section 1");
    assert.ok(result.brief.fullMarkdown.includes("## 2. Principais Evidências"), "Markdown must have Section 2");
    assert.ok(result.brief.fullMarkdown.includes("## 3. Métricas Operacionais"), "Markdown must have Section 3");
    assert.ok(result.brief.fullMarkdown.includes("## 4. Riscos, Restrições"), "Markdown must have Section 4");
    assert.ok(result.brief.fullMarkdown.includes("## 5. Recomendações Estratégicas"), "Markdown must have Section 5");

    // Verify Telemetry
    assert.ok(result.metrics.totalLatencyMs >= 0);
    assert.ok(result.metrics.toolCallsCount >= 3, "Researcher must have performed at least 3 tool calls");
  });

  it("should enforce rate limiting after repeated requests", () => {
    const testIp = "rate-limit-test-ip";
    rateLimiter.reset(testIp);

    // Default rate limit is 10
    for (let i = 0; i < 10; i++) {
      const check = rateLimiter.check(testIp);
      assert.strictEqual(check.allowed, true, `Request ${i + 1} should be allowed`);
    }

    // 11th request must be blocked
    const blockedCheck = rateLimiter.check(testIp);
    assert.strictEqual(blockedCheck.allowed, false, "11th request must be rate limited");
    assert.strictEqual(blockedCheck.remaining, 0);

    rateLimiter.reset(testIp);
  });

  it("should respect master kill switch flag", () => {
    const original = process.env.GENERATION_ENABLED;
    try {
      process.env.GENERATION_ENABLED = "false";
      assert.strictEqual(isGenerationEnabled(), false);

      process.env.GENERATION_ENABLED = "true";
      assert.strictEqual(isGenerationEnabled(), true);
    } finally {
      process.env.GENERATION_ENABLED = original;
    }
  });
});
