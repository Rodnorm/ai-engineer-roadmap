import { NextRequest, NextResponse } from "next/server";
import { getOrCreateOwnerId } from "@/lib/session/user-session";
import { deploymentRepository } from "@/lib/session/deployment-repository";
import {
  globalSemaphore,
  isDeployEnabled,
  rateLimiter,
} from "@/lib/security/rate-limiter";
import { TrafficRouter } from "@/lib/router/traffic-router";
import { InferenceClient } from "@/lib/models/inference-client";
import { ChaosConfig, ChaosInjector } from "@/lib/simulation/chaos-injector";
import { RollbackTrigger } from "@/lib/resilience/rollback-trigger";
import { InvocationTelemetry } from "@/types/deployment";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SimulateSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  batchSize: z.number().int().min(1).max(10).default(1),
  chaosType: z
    .enum(["none", "latency_spike", "azure_429", "prompt_injection", "schema_corruption"])
    .default("none"),
  chaosDelayMs: z.number().min(500).max(6000).optional(),
  overrideTarget: z.string().optional(),
  requireStructuredJson: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting Check
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const rateLimitStatus = rateLimiter.check(ip);

  if (!rateLimitStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Maximum 30 requests per minute allowed.",
        resetInMs: rateLimitStatus.resetInMs,
      },
      { status: 429 }
    );
  }

  // 2. Master Kill-Switch Check
  if (!isDeployEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: "Emergency Kill-Switch Active: AI inference deployments are temporarily disabled.",
      },
      { status: 503 }
    );
  }

  // 3. Concurrency Semaphore Throttling
  const release = await globalSemaphore.acquire();

  try {
    const ownerId = await getOrCreateOwnerId();
    const body = await req.json().catch(() => ({}));
    const parsed = SimulateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid simulation parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { prompt, batchSize, chaosType, chaosDelayMs, overrideTarget, requireStructuredJson } =
      parsed.data;

    // Header override fallback
    const headerOverride = req.headers.get("x-deployment-target") || overrideTarget;

    const state = deploymentRepository.getOrCreate(ownerId);
    const invocations: InvocationTelemetry[] = [];
    const chaosConfig: ChaosConfig = {
      type: chaosType,
      delayMs: chaosDelayMs ?? (chaosType === "latency_spike" ? 2700 : undefined),
    };

    for (let i = 0; i < batchSize; i++) {
      const requestId = randomUUID();
      const decision = TrafficRouter.route(state.policy, {
        overrideTarget: headerOverride,
        requestId,
      });

      // Circuit Breaker Guard for Target
      if (!state.circuitBreaker.canExecute()) {
        const trippedTelemetry: InvocationTelemetry = {
          id: requestId,
          timestamp: new Date().toISOString(),
          target: decision.target,
          model: decision.model,
          prompt,
          response: "",
          latencyMs: 12,
          ttftMs: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCostUsd: 0,
          statusCode: 503,
          success: false,
          error: "Circuit Breaker OPEN: Invocations blocked to protect upstream availability.",
          schemaValid: false,
        };

        state.telemetry.unshift(trippedTelemetry);
        invocations.push(trippedTelemetry);
        continue;
      }

      // Check Prompt Injection before model call if chaos requested
      if (chaosType === "prompt_injection" || ChaosInjector.isPromptInjection(prompt)) {
        const blockedTelemetry = await ChaosInjector.applyChaos(
          { type: "prompt_injection" },
          {
            id: requestId,
            timestamp: new Date().toISOString(),
            target: decision.target,
            model: decision.model,
            prompt,
            response: "",
            latencyMs: 25,
            ttftMs: 0,
            promptTokens: Math.max(10, Math.round(prompt.length / 4)),
            completionTokens: 0,
            totalTokens: Math.max(10, Math.round(prompt.length / 4)),
            estimatedCostUsd: 0,
            statusCode: 400,
            success: false,
            schemaValid: false,
          }
        );

        deploymentRepository.addTelemetry(ownerId, blockedTelemetry);
        invocations.push(blockedTelemetry);
        continue;
      }

      // Execute primary model inference
      let telemetry = await InferenceClient.execute({
        target: decision.target,
        model: decision.model,
        prompt,
        requireStructuredJson,
      });

      // Handle Shadow Mirroring (Parallel Execution)
      if (decision.isShadow) {
        try {
          const shadowTelemetry = await InferenceClient.execute({
            target: "green",
            model: state.policy.greenModel,
            prompt,
            requireStructuredJson,
          });

          telemetry.shadowResult = {
            model: shadowTelemetry.model,
            response: shadowTelemetry.response.slice(0, 180) + "...",
            latencyMs: shadowTelemetry.latencyMs,
            ttftMs: shadowTelemetry.ttftMs,
            tokens: shadowTelemetry.totalTokens,
            statusCode: shadowTelemetry.statusCode,
          };
        } catch (shadowErr) {
          console.warn("[Shadow Execution Error]:", shadowErr);
        }
      }

      // Apply Chaos Fault Injection if active
      if (chaosConfig.type !== "none") {
        telemetry = await ChaosInjector.applyChaos(chaosConfig, telemetry);
      }

      deploymentRepository.addTelemetry(ownerId, telemetry);
      invocations.push(telemetry);

      // Automated Rollback Guardrail Check
      const evaluatedMetrics = deploymentRepository.getMetrics(ownerId);
      const { updatedPolicy, incident } = RollbackTrigger.evaluateAndExecute(
        state.policy,
        evaluatedMetrics,
        state.circuitBreaker
      );

      if (incident) {
        deploymentRepository.updatePolicy(ownerId, updatedPolicy);
        deploymentRepository.addIncident(ownerId, incident);
      }
    }

    const currentMetrics = deploymentRepository.getMetrics(ownerId);

    return NextResponse.json({
      success: true,
      invocations,
      policy: state.policy,
      metrics: currentMetrics,
      incidents: state.incidents.slice(0, 5),
    });
  } catch (error) {
    console.error("[Simulation API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal error executing simulation" },
      { status: 500 }
    );
  } finally {
    release();
  }
}
