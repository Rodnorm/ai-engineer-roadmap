import {
  DeploymentMetrics,
  ErrorBudgetMetrics,
  PercentileMetrics,
  SLOMeta,
  TargetSummary,
} from "@/types/metrics";
import { InvocationTelemetry } from "@/types/deployment";

export const DEFAULT_SLO: SLOMeta = {
  targetAvailabilityPercent: 99.0,
  maxP95LatencyMs: 2500,
  maxErrorRatePercent: 2.0,
};

export class SLAMonitor {
  /**
   * Computes mathematical percentiles (P50, P90, P95, P99) and average for a list of values.
   */
  public static calculatePercentiles(latencies: number[]): PercentileMetrics {
    if (latencies.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, avgLatencyMs: 0 };
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const n = sorted.length;

    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * n) - 1;
      return sorted[Math.max(0, Math.min(n - 1, index))];
    };

    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      p50: getPercentile(50),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
      avgLatencyMs: Math.round(sum / n),
    };
  }

  /**
   * Aggregates telemetry records into a TargetSummary.
   */
  public static summarize(records: InvocationTelemetry[]): TargetSummary {
    const totalRequests = records.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        successRequests: 0,
        errorRequests: 0,
        errorRatePercent: 0,
        avgTtftMs: 0,
        p95LatencyMs: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        schemaValidRatePercent: 100,
      };
    }

    let successRequests = 0;
    let errorRequests = 0;
    let sumTtft = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;
    let schemaValidCount = 0;
    const latencies: number[] = [];

    for (const record of records) {
      latencies.push(record.latencyMs);
      totalTokens += record.totalTokens;
      totalCostUsd += record.estimatedCostUsd;
      sumTtft += record.ttftMs;

      if (record.success && record.statusCode < 400) {
        successRequests++;
      } else {
        errorRequests++;
      }

      if (record.schemaValid) {
        schemaValidCount++;
      }
    }

    const percentiles = this.calculatePercentiles(latencies);
    const errorRatePercent = Number(((errorRequests / totalRequests) * 100).toFixed(2));
    const schemaValidRatePercent = Number(((schemaValidCount / totalRequests) * 100).toFixed(1));

    return {
      totalRequests,
      successRequests,
      errorRequests,
      errorRatePercent,
      avgTtftMs: Math.round(sumTtft / totalRequests),
      p95LatencyMs: percentiles.p95,
      totalTokens,
      totalCostUsd: Number(totalCostUsd.toFixed(5)),
      schemaValidRatePercent,
    };
  }

  /**
   * Computes Error Budget status based on SLO target availability.
   */
  public static calculateErrorBudget(
    totalRequests: number,
    errorRequests: number,
    slo: SLOMeta = DEFAULT_SLO
  ): ErrorBudgetMetrics {
    const allowableErrorRate = 100 - slo.targetAvailabilityPercent; // e.g. 1.0%

    if (totalRequests === 0) {
      return {
        totalBudgetPercent: allowableErrorRate,
        consumedPercent: 0,
        remainingPercent: 100,
        status: "healthy",
      };
    }

    const actualErrorRate = (errorRequests / totalRequests) * 100;
    const consumedPercent = Number(
      Math.min(100, (actualErrorRate / Math.max(0.001, allowableErrorRate)) * 100).toFixed(1)
    );
    const remainingPercent = Number(Math.max(0, 100 - consumedPercent).toFixed(1));

    let status: ErrorBudgetMetrics["status"] = "healthy";
    if (consumedPercent >= 100) {
      status = "exhausted";
    } else if (consumedPercent >= 50) {
      status = "warning";
    }

    return {
      totalBudgetPercent: allowableErrorRate,
      consumedPercent,
      remainingPercent,
      status,
    };
  }

  /**
   * Evaluates complete deployment metrics across blue and green versions.
   */
  public static evaluateMetrics(
    records: InvocationTelemetry[],
    circuitBreakerState: "CLOSED" | "OPEN" | "HALF-OPEN" = "CLOSED",
    slo: SLOMeta = DEFAULT_SLO
  ): DeploymentMetrics {
    const blueRecords = records.filter((r) => r.target === "blue");
    const greenRecords = records.filter((r) => r.target === "green");

    const overall = this.summarize(records);
    const blue = this.summarize(blueRecords);
    const green = this.summarize(greenRecords);

    const bluePercentiles = this.calculatePercentiles(blueRecords.map((r) => r.latencyMs));
    const greenPercentiles = this.calculatePercentiles(greenRecords.map((r) => r.latencyMs));

    const errorBudget = this.calculateErrorBudget(overall.totalRequests, overall.errorRequests, slo);

    return {
      overall,
      blue,
      green,
      bluePercentiles,
      greenPercentiles,
      errorBudget,
      circuitBreakerState,
      slo,
    };
  }
}
