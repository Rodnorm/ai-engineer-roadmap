import { DeploymentTarget, RoutingDecision, TrafficPolicy } from "@/types/deployment";

export const DEFAULT_TRAFFIC_POLICY: TrafficPolicy = {
  mode: "canary",
  blueWeight: 90,
  greenWeight: 10,
  blueModel: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
  greenModel: process.env.AZURE_OPENAI_DEPLOYMENT_CANDIDATE || "gpt-4o-mini",
  isRollbackActive: false,
  lastUpdated: new Date().toISOString(),
};

/**
 * Computes a pseudo-deterministic hash integer between 0 and 99 from a string.
 */
function hashToBucket(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
}

export interface RouteOptions {
  overrideTarget?: string | null;
  requestId?: string;
  forceRollbackCheck?: boolean;
}

export class TrafficRouter {
  /**
   * Resolves routing decision based on traffic policy, manual headers, and weights.
   */
  public static route(
    policy: TrafficPolicy = DEFAULT_TRAFFIC_POLICY,
    options?: RouteOptions
  ): RoutingDecision {
    const blueModel = policy.blueModel || "gpt-4o";
    const greenModel = policy.greenModel || "gpt-4o-mini";

    // 1. Manual Override check via header (e.g., x-deployment-target)
    if (options?.overrideTarget) {
      const normalized = options.overrideTarget.trim().toLowerCase();
      if (normalized === "green" || normalized === "canary" || normalized === "candidate") {
        return {
          target: "green",
          model: greenModel,
          policy,
          reason: "Manual header override forced Canary (Green)",
          isShadow: false,
          manualOverride: true,
        };
      }
      if (normalized === "blue" || normalized === "baseline" || normalized === "stable") {
        return {
          target: "blue",
          model: blueModel,
          policy,
          reason: "Manual header override forced Baseline (Blue)",
          isShadow: false,
          manualOverride: true,
        };
      }
    }

    // 2. Automated Rollback Enforcement
    if (policy.isRollbackActive) {
      return {
        target: "blue",
        model: blueModel,
        policy,
        reason: `Automated Rollback Active: ${policy.rollbackReason || "SLO violation"}`,
        isShadow: false,
        manualOverride: false,
      };
    }

    // 3. Maintenance Mode
    if (policy.mode === "maintenance") {
      return {
        target: "blue",
        model: blueModel,
        policy,
        reason: "System in Maintenance Mode",
        isShadow: false,
        manualOverride: false,
      };
    }

    // 4. Shadow Mirroring Mode
    // Evaluates primarily Blue, but flags isShadow so caller triggers duplicate candidate inference
    if (policy.mode === "shadow-mirror") {
      return {
        target: "blue",
        model: blueModel,
        policy,
        reason: "Shadow Mirroring Mode (Primary: Blue, Mirror: Green)",
        isShadow: true,
        manualOverride: false,
      };
    }

    // 5. Blue-Green Switch Mode (Atomic 0/100 or 100/0)
    if (policy.mode === "blue-green") {
      if (policy.greenWeight >= 100 || policy.blueWeight === 0) {
        return {
          target: "green",
          model: greenModel,
          policy,
          reason: "Atomic Blue-Green Switch: 100% Green",
          isShadow: false,
          manualOverride: false,
        };
      }
      return {
        target: "blue",
        model: blueModel,
        policy,
        reason: "Atomic Blue-Green Switch: 100% Blue",
        isShadow: false,
        manualOverride: false,
      };
    }

    // 6. Canary Split (Weighted)
    // Normalize weights to 100
    const totalWeight = Math.max(1, (policy.blueWeight || 0) + (policy.greenWeight || 0));
    const greenPercentage = Math.round(((policy.greenWeight || 0) / totalWeight) * 100);

    // Compute bucket 0..99
    const bucket = options?.requestId
      ? hashToBucket(options.requestId)
      : Math.floor(Math.random() * 100);

    if (bucket < greenPercentage) {
      return {
        target: "green",
        model: greenModel,
        policy,
        reason: `Canary Route (${greenPercentage}% Canary weight, bucket: ${bucket})`,
        isShadow: false,
        manualOverride: false,
      };
    }

    return {
      target: "blue",
      model: blueModel,
      policy,
      reason: `Baseline Route (${100 - greenPercentage}% Blue weight, bucket: ${bucket})`,
      isShadow: false,
      manualOverride: false,
    };
  }
}
