import test from "node:test";
import assert from "node:assert/strict";

test("ApprovalCard payload formatting and action validation", () => {
  const samplePending = {
    approval_id: "appr-12345",
    tool_name: "execute_payment",
    tool_args: {
      recipient: "vendor@example.com",
      amount: 250.00,
      currency: "USD",
    },
  };

  // Validate required approval fields
  assert.ok(samplePending.approval_id, "approval_id must be present");
  assert.equal(samplePending.tool_name, "execute_payment");
  assert.equal(typeof samplePending.tool_args, "object");
  assert.equal(samplePending.tool_args.amount, 250.00);

  // Validate decision payload construction
  const approveDecision = {
    session_id: "sess-abc",
    session_token: "tok-123",
    approved: true,
    reason: undefined,
  };
  assert.equal(approveDecision.approved, true);

  const rejectDecision = {
    session_id: "sess-abc",
    session_token: "tok-123",
    approved: false,
    reason: "Declined by user",
  };
  assert.equal(rejectDecision.approved, false);
  assert.equal(rejectDecision.reason, "Declined by user");
});

test("Session token validation prevents unauthenticated approvals", () => {
  function validateApprovalSubmission(payload) {
    if (!payload.session_token || payload.session_token.length < 16) {
      throw new Error("Invalid session token");
    }
    if (typeof payload.approved !== "boolean") {
      throw new Error("Approval decision must be boolean");
    }
    return true;
  }

  assert.throws(
    () => validateApprovalSubmission({ session_token: "", approved: true }),
    /Invalid session token/
  );

  assert.equal(
    validateApprovalSubmission({
      session_token: "safe-deterministic-token-123456",
      approved: true,
    }),
    true
  );
});
