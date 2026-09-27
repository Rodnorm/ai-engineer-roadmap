import { TrafficPolicy } from "@/types/deployment";
import { DeploymentMetrics } from "@/types/metrics";
import { CircuitBreaker } from "./circuit-breaker";
import { randomUUID } from "node:crypto";

export interface RollbackIncidentEvent {
  id: string;
  timestamp: string;
  triggerReason: string;
  metricObserved: string;
  thresholdViolated: string;
  actionTaken: string;
  severity: "WARNING" | "CRITICAL";
}

export class RollbackTrigger {
  /**
   * Assesses SLO guardrails and trips atomic rollback to Blue if canary exceeds thresholds.
   */
  public static evaluateAndExecute(
    policy: TrafficPolicy,
    metrics: DeploymentMetrics,
    circuitBreaker: CircuitBreaker
  ): { updatedPolicy: TrafficPolicy; incident: RollbackIncidentEvent | null } {
    // If rollback is already in effect, do nothing
    if (policy.isRollbackActive) {
      return { updatedPolicy: policy, incident: null };
    }

    const greenSummary = metrics.green;
    const greenPercentiles = metrics.greenPercentiles;
    const cbState = circuitBreaker.getState();

    let triggerReason = "";
    let metricObserved = "";
    let thresholdViolated = "";

    // 1. Circuit Breaker tripped
    if (cbState === "OPEN") {
      triggerReason = "Circuit Breaker Tripped (Repeated upstream failures / quota exhaustion)";
      metricObserved = "Circuit Breaker State: OPEN";
      thresholdViolated = "Consecutive failure threshold exceeded";
    }
    // 2. Latency P95 SLO violation on Canary (minimum 3 samples to avoid false positives)
    else if (greenSummary.totalRequests >= 3 && greenPercentiles.p95 > metrics.slo.maxP95LatencyMs) {
      triggerReason = "Canary Latency SLO Breach (P95 Spike Detected)";
      metricObserved = `Canary P95: ${greenPercentiles.p95}ms`;
      thresholdViolated = `Max allowed P95: ${metrics.slo.maxP95LatencyMs}ms`;
    }
    // 3. Error Rate SLO breach on Canary (minimum 3 samples)
    else if (greenSummary.totalRequests >= 3 && greenSummary.errorRatePercent > metrics.slo.maxErrorRatePercent) {
      triggerReason = "Canary Error Rate SLO Breach";
      metricObserved = `Canary Error Rate: ${greenSummary.errorRatePercent}%`;
      thresholdViolated = `Max allowed error rate: ${metrics.slo.maxErrorRatePercent}%`;
    }

    if (!triggerReason) {
      return { updatedPolicy: policy, incident: null };
    }

    const incident: RollbackIncidentEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      triggerReason,
      metricObserved,
      thresholdViolated,
      actionTaken: "Atomic Rollback Executed: Reverted 100% traffic to Baseline (Blue gpt-4o)",
      severity: "CRITICAL",
    };

    const updatedPolicy: TrafficPolicy = {
      ...policy,
      blueWeight: 100,
      greenWeight: 0,
      isRollbackActive: true,
      rollbackReason: triggerReason,
      rollbackTimestamp: incident.timestamp,
      lastUpdated: new Date().toISOString(),
    };

    return { updatedPolicy, incident };
  }
}
