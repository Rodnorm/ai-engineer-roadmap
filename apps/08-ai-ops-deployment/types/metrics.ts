export interface PercentileMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  avgLatencyMs: number;
}

export interface TargetSummary {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  errorRatePercent: number;
  avgTtftMs: number;
  p95LatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
  schemaValidRatePercent: number;
}

export interface ErrorBudgetMetrics {
  totalBudgetPercent: number; // e.g. 1.0% (for 99.0% SLO)
  consumedPercent: number;
  remainingPercent: number;
  status: "healthy" | "warning" | "exhausted";
}

export interface SLOMeta {
  targetAvailabilityPercent: number; // e.g. 99.0
  maxP95LatencyMs: number;           // e.g. 2500
  maxErrorRatePercent: number;        // e.g. 2.0
}

export interface DeploymentMetrics {
  overall: TargetSummary;
  blue: TargetSummary;
  green: TargetSummary;
  bluePercentiles: PercentileMetrics;
  greenPercentiles: PercentileMetrics;
  errorBudget: ErrorBudgetMetrics;
  circuitBreakerState: "CLOSED" | "OPEN" | "HALF-OPEN";
  slo: SLOMeta;
}
