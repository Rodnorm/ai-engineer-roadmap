import test from "node:test";
import assert from "node:assert/strict";
import { TrafficRouter } from "../lib/router/traffic-router";
import { TrafficPolicy } from "../types/deployment";

const basePolicy: TrafficPolicy = {
  mode: "canary",
  blueWeight: 90,
  greenWeight: 10,
  blueModel: "gpt-4o",
  greenModel: "gpt-4o-mini",
  isRollbackActive: false,
};

test("TrafficRouter respects manual override headers", () => {
  const canaryOverride = TrafficRouter.route(basePolicy, {
    overrideTarget: "canary",
  });
  assert.equal(canaryOverride.target, "green");
  assert.equal(canaryOverride.manualOverride, true);

  const baselineOverride = TrafficRouter.route(basePolicy, {
    overrideTarget: "baseline",
  });
  assert.equal(baselineOverride.target, "blue");
  assert.equal(baselineOverride.manualOverride, true);
});

test("TrafficRouter enforces atomic 100% Blue during active rollback", () => {
  const rollbackPolicy: TrafficPolicy = {
    ...basePolicy,
    blueWeight: 50,
    greenWeight: 50,
    isRollbackActive: true,
    rollbackReason: "Canary P95 latency exceeded 2500ms",
  };

  const decision = TrafficRouter.route(rollbackPolicy);
  assert.equal(decision.target, "blue");
  assert.equal(decision.model, "gpt-4o");
  assert.ok(decision.reason.includes("Automated Rollback Active"));
});

test("TrafficRouter handles atomic Blue-Green switch mode", () => {
  const green100Policy: TrafficPolicy = {
    mode: "blue-green",
    blueWeight: 0,
    greenWeight: 100,
    blueModel: "gpt-4o",
    greenModel: "gpt-4o-mini",
  };

  const decisionGreen = TrafficRouter.route(green100Policy);
  assert.equal(decisionGreen.target, "green");
  assert.equal(decisionGreen.model, "gpt-4o-mini");

  const blue100Policy: TrafficPolicy = {
    mode: "blue-green",
    blueWeight: 100,
    greenWeight: 0,
    blueModel: "gpt-4o",
    greenModel: "gpt-4o-mini",
  };

  const decisionBlue = TrafficRouter.route(blue100Policy);
  assert.equal(decisionBlue.target, "blue");
  assert.equal(decisionBlue.model, "gpt-4o");
});

test("TrafficRouter handles shadow mirroring mode", () => {
  const shadowPolicy: TrafficPolicy = {
    mode: "shadow-mirror",
    blueWeight: 100,
    greenWeight: 0,
    blueModel: "gpt-4o",
    greenModel: "gpt-4o-mini",
  };

  const decision = TrafficRouter.route(shadowPolicy);
  assert.equal(decision.target, "blue");
  assert.equal(decision.isShadow, true);
});

test("TrafficRouter deterministically partitions requests by id hash", () => {
  const canaryPolicy: TrafficPolicy = {
    mode: "canary",
    blueWeight: 50,
    greenWeight: 50,
    blueModel: "gpt-4o",
    greenModel: "gpt-4o-mini",
  };

  const decision1 = TrafficRouter.route(canaryPolicy, { requestId: "req-deterministic-123" });
  const decision2 = TrafficRouter.route(canaryPolicy, { requestId: "req-deterministic-123" });
  assert.equal(decision1.target, decision2.target);
  assert.equal(decision1.model, decision2.model);
});
