import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { createMemoryConversationRepository } from "../lib/repository";
import { createOwnerToken, verifyOwnerToken } from "../lib/owner-session";

test("conversation repository isolates owners", async () => {
  const repository = createMemoryConversationRepository();
  const ownerA = randomUUID();
  const ownerB = randomUUID();
  const conversation = await repository.create(ownerA);

  assert.equal((await repository.list(ownerA)).length, 1);
  assert.equal((await repository.list(ownerB)).length, 0);
  assert.equal(await repository.get(ownerB, conversation.id), undefined);

  await repository.delete(ownerB, conversation.id);
  assert.ok(await repository.get(ownerA, conversation.id));

  await repository.delete(ownerA, conversation.id);
  assert.equal(await repository.get(ownerA, conversation.id), undefined);
});

test("conversation repository rejects ownership changes", async () => {
  const repository = createMemoryConversationRepository();
  const ownerA = randomUUID();
  const ownerB = randomUUID();
  const conversation = await repository.create(ownerA);

  await assert.rejects(repository.save(ownerB, conversation), /owner mismatch/);
});

test("owner cookies are signed and reject tampering", () => {
  const ownerId = randomUUID();
  const secret = "a-secure-test-secret-with-at-least-32-characters";
  const token = createOwnerToken(ownerId, secret);

  assert.equal(verifyOwnerToken(token, secret), ownerId);
  assert.equal(verifyOwnerToken(`${randomUUID()}.${token.split(".")[1]}`, secret), undefined);
  assert.equal(verifyOwnerToken(token, "another-secure-test-secret-at-least-32-chars"), undefined);
});
