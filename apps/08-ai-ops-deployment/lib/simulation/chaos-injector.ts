import { InvocationTelemetry } from "@/types/deployment";
import { randomUUID } from "node:crypto";

export type ChaosType =
  | "none"
  | "latency_spike"
  | "azure_429"
  | "prompt_injection"
  | "schema_corruption";

export interface ChaosConfig {
  type: ChaosType;
  delayMs?: number;
  injectionMessage?: string;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt/i,
  /reveal\s+(the\s+)?secret/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /override\s+safety/i,
  /bypass\s+filters/i,
];

export class ChaosInjector {
  /**
   * Evaluates if a prompt triggers prompt injection defenses (OWASP LLM01).
   */
  public static isPromptInjection(prompt: string): boolean {
    return INJECTION_PATTERNS.some((pattern) => pattern.test(prompt));
  }

  /**
   * Applies chaos simulation to an invocation before or during execution.
   */
  public static async applyChaos(
    config: ChaosConfig,
    baseTelemetry: InvocationTelemetry
  ): Promise<InvocationTelemetry> {
    if (config.type === "none") {
      return baseTelemetry;
    }

    // 1. Latency Spike (Simulating slow upstream / P95 breach)
    if (config.type === "latency_spike") {
      const extraDelay = config.delayMs ?? 2600;
      await new Promise((resolve) => setTimeout(resolve, Math.min(extraDelay, 300))); // Sleep briefly in runtime but record high latency
      return {
        ...baseTelemetry,
        latencyMs: baseTelemetry.latencyMs + extraDelay,
        ttftMs: baseTelemetry.ttftMs + Math.round(extraDelay * 0.7),
        isChaosInjected: true,
        chaosType: "latency_spike",
      };
    }

    // 2. Azure 429 Throttle / TPM Exhaustion
    if (config.type === "azure_429") {
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        target: baseTelemetry.target,
        model: baseTelemetry.model,
        prompt: baseTelemetry.prompt,
        response: "",
        latencyMs: 140,
        ttftMs: 0,
        promptTokens: baseTelemetry.promptTokens,
        completionTokens: 0,
        totalTokens: baseTelemetry.promptTokens,
        estimatedCostUsd: 0,
        statusCode: 429,
        success: false,
        error: "Azure OpenAI 429: Requests-per-minute or Tokens-per-minute quota exceeded for deployment. Retry-After: 30s",
        schemaValid: false,
        isChaosInjected: true,
        chaosType: "azure_429",
      };
    }

    // 3. Prompt Injection Defense (OWASP LLM01 / Prompt Shield)
    if (config.type === "prompt_injection" || this.isPromptInjection(baseTelemetry.prompt)) {
      return {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        target: baseTelemetry.target,
        model: baseTelemetry.model,
        prompt: baseTelemetry.prompt,
        response: "",
        latencyMs: 45,
        ttftMs: 0,
        promptTokens: baseTelemetry.promptTokens,
        completionTokens: 0,
        totalTokens: baseTelemetry.promptTokens,
        estimatedCostUsd: 0,
        statusCode: 400,
        success: false,
        error: "Prompt Shield Block: OWASP LLM01 Jailbreak / Prompt Injection pattern detected. Request dropped before LLM inference.",
        schemaValid: false,
        isChaosInjected: true,
        chaosType: "prompt_injection",
      };
    }

    // 4. Schema Corruption
    if (config.type === "schema_corruption") {
      return {
        ...baseTelemetry,
        response: `{"summary": "Incomplete json payload...`,
        schemaValid: false,
        isChaosInjected: true,
        chaosType: "schema_corruption",
      };
    }

    return baseTelemetry;
  }
}
