import assert from "node:assert/strict";
import test from "node:test";
import { requiredSecret, secureTokenEquals } from "../src/security.js";

test("requiredSecret rejects missing and short secrets", () => {
  assert.throws(() => requiredSecret("TOKEN", undefined), /at least 32 characters/);
  assert.throws(() => requiredSecret("TOKEN", "too-short"), /at least 32 characters/);
});

test("secureTokenEquals accepts only the exact token", () => {
  const secret = "a-secure-test-token-with-at-least-32-characters";
  assert.equal(secureTokenEquals(secret, secret), true);
  assert.equal(secureTokenEquals("different-test-token-with-at-least-32-chars", secret), false);
  assert.equal(secureTokenEquals(undefined, secret), false);
  assert.equal(secureTokenEquals([secret], secret), false);
});
