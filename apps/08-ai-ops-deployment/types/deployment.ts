export type DeploymentTarget = "blue" | "green";

export type RoutingMode = "canary" | "blue-green" | "shadow-mirror" | "maintenance";

export interface ModelVersionConfig {
  id: string;
  name: string;
  deploymentName: string;
  versionLabel: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

export interface TrafficPolicy {
  mode: RoutingMode;
  blueWeight: number; // 0 to 100
  greenWeight: number; // 0 to 100
  blueModel: string;
  greenModel: string;
  isRollbackActive?: boolean;
  rollbackReason?: string;
  rollbackTimestamp?: string;
  lastUpdated?: string;
}

export interface RoutingDecision {
  target: DeploymentTarget;
  model: string;
  policy: TrafficPolicy;
  reason: string;
  isShadow: boolean;
  manualOverride: boolean;
}

export interface InvocationTelemetry {
  id: string;
  timestamp: string;
  target: DeploymentTarget;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number;
  ttftMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  statusCode: number;
  success: boolean;
  error?: string;
  schemaValid: boolean;
  isChaosInjected?: boolean;
  chaosType?: string;
  shadowResult?: {
    model: string;
    response: string;
    latencyMs: number;
    ttftMs: number;
    tokens: number;
    statusCode: number;
  };
}

export interface StructuredBriefPayload {
  summary: string;
  riskAssessment: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
  latencyTargetMet: boolean;
}
