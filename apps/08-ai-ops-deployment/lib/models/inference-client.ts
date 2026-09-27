import { InvocationTelemetry, DeploymentTarget } from "@/types/deployment";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";

export interface InferenceRequest {
  target: DeploymentTarget;
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  requireStructuredJson?: boolean;
}

// Cost calculations per 1,000 tokens
export const MODEL_PRICING: Record<string, { promptPer1k: number; completionPer1k: number }> = {
  "gpt-4o": {
    promptPer1k: 0.0025,
    completionPer1k: 0.010,
  },
  "gpt-4o-mini": {
    promptPer1k: 0.00015,
    completionPer1k: 0.0006,
  },
  "gpt-4.1-mini": {
    promptPer1k: 0.00015,
    completionPer1k: 0.0006,
  },
};

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const normalized = model.toLowerCase().includes("mini") ? "gpt-4o-mini" : "gpt-4o";
  const pricing = MODEL_PRICING[normalized] || MODEL_PRICING["gpt-4o"];
  const promptCost = (promptTokens / 1000) * pricing.promptPer1k;
  const completionCost = (completionTokens / 1000) * pricing.completionPer1k;
  return Number((promptCost + completionCost).toFixed(6));
}

export class InferenceClient {
  private static azureClient: OpenAI | null = null;

  private static getAzureClient(): OpenAI | null {
    if (this.azureClient) return this.azureClient;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

    if (endpoint && apiKey && !endpoint.includes("your-resource-name")) {
      try {
        const cleanEndpoint = endpoint.replace(/\/+$/, "");
        const isOpenAIV1 = cleanEndpoint.includes("/openai/v1");
        const baseURL = isOpenAIV1
          ? cleanEndpoint
          : `${cleanEndpoint}/openai/deployments`;

        this.azureClient = new OpenAI({
          apiKey,
          baseURL,
          defaultQuery: isOpenAIV1 ? undefined : { "api-version": apiVersion },
          defaultHeaders: { "api-key": apiKey },
        });
      } catch (err) {
        console.warn("[InferenceClient] Failed to initialize AzureOpenAI client, falling back to offline:", err);
      }
    }
    return this.azureClient;
  }

  /**
   * Dispatches inference execution either to Azure OpenAI (online) or offline deterministic engine.
   */
  public static async execute(request: InferenceRequest): Promise<InvocationTelemetry> {
    const startTime = performance.now();
    const isOnline = (process.env.APP_MODE || "offline").toLowerCase() === "online";
    const client = isOnline ? this.getAzureClient() : null;

    if (isOnline && client) {
      return this.executeAzure(client, request, startTime);
    }

    return this.executeOffline(request, startTime);
  }

  /**
   * Online inference with Azure OpenAI
   */
  private static async executeAzure(
    client: OpenAI,
    request: InferenceRequest,
    startTime: number
  ): Promise<InvocationTelemetry> {
    const invocationId = randomUUID();
    let ttftMs = 0;
    let fullText = "";
    let promptTokens = Math.max(10, Math.round(request.prompt.length / 4));
    let completionTokens = 0;

    const actualModel =
      request.target === "green"
        ? process.env.AZURE_OPENAI_DEPLOYMENT_CANDIDATE || process.env.AZURE_OPENAI_DEPLOYMENT || request.model
        : process.env.AZURE_OPENAI_DEPLOYMENT || request.model;

    try {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (request.systemPrompt) {
        messages.push({ role: "system", content: request.systemPrompt });
      } else {
        messages.push({
          role: "system",
          content: "You are an enterprise AI Operations assistant providing high-precision analysis.",
        });
      }
      messages.push({ role: "user", content: request.prompt });

      const stream = await client.chat.completions.create({
        model: actualModel,
        messages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 800,
        stream: true,
        stream_options: { include_usage: true },
      });

      let firstChunk = true;
      for await (const chunk of stream) {
        if (firstChunk) {
          ttftMs = Math.round(performance.now() - startTime);
          firstChunk = false;
        }
        const delta = chunk.choices[0]?.delta?.content || "";
        fullText += delta;

        if (chunk.usage) {
          promptTokens = chunk.usage.prompt_tokens;
          completionTokens = chunk.usage.completion_tokens;
        }
      }

      if (completionTokens === 0) {
        completionTokens = Math.max(10, Math.round(fullText.length / 4));
      }

      const totalLatency = Math.round(performance.now() - startTime);
      const cost = estimateCost(request.model, promptTokens, completionTokens);

      let schemaValid = true;
      if (request.requireStructuredJson) {
        try {
          JSON.parse(fullText);
        } catch {
          schemaValid = false;
        }
      }

      return {
        id: invocationId,
        timestamp: new Date().toISOString(),
        target: request.target,
        model: request.model,
        prompt: request.prompt,
        response: fullText,
        latencyMs: totalLatency,
        ttftMs: ttftMs > 0 ? ttftMs : Math.round(totalLatency * 0.35),
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCostUsd: cost,
        statusCode: 200,
        success: true,
        schemaValid,
      };
    } catch (err: unknown) {
      const totalLatency = Math.round(performance.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const is429 = errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("quota");

      return {
        id: invocationId,
        timestamp: new Date().toISOString(),
        target: request.target,
        model: request.model,
        prompt: request.prompt,
        response: "",
        latencyMs: totalLatency,
        ttftMs: 0,
        promptTokens,
        completionTokens: 0,
        totalTokens: promptTokens,
        estimatedCostUsd: 0,
        statusCode: is429 ? 429 : 500,
        success: false,
        error: errorMessage,
        schemaValid: false,
      };
    }
  }

  /**
   * Offline Deterministic Engine for zero-cost simulations, testing, and CI
   */
  private static async executeOffline(
    request: InferenceRequest,
    startTime: number
  ): Promise<InvocationTelemetry> {
    const isMini = request.model.toLowerCase().includes("mini");
    // Realistic simulated latency: gpt-4o-mini is faster (120-220ms), gpt-4o is heavier (280-480ms)
    const baseLatency = isMini ? 120 + Math.floor(Math.random() * 80) : 280 + Math.floor(Math.random() * 160);
    const simulatedTtft = isMini ? Math.round(baseLatency * 0.3) : Math.round(baseLatency * 0.4);

    // Yield short sleep for realistic execution loop
    await new Promise((resolve) => setTimeout(resolve, Math.min(baseLatency, 180)));

    const invocationId = randomUUID();
    let responseText = "";
    let schemaValid = true;

    if (request.requireStructuredJson) {
      const mockStructured = {
        summary: `Analysis for deployment target [${request.target.toUpperCase()} / ${request.model}]`,
        riskAssessment: isMini ? "LOW" : "LOW",
        recommendations: [
          "Maintain current canary traffic ratio while observing P95 latency",
          "Ensure schema strictness for downstream clients",
          "Circuit breaker thresholds healthy",
        ],
        latencyTargetMet: true,
        timestamp: new Date().toISOString(),
      };
      responseText = JSON.stringify(mockStructured, null, 2);
    } else {
      responseText = `[AIOps Inference Response - Target: ${request.target.toUpperCase()} | Model: ${request.model}]\n\n` +
        `Evaluation summary for prompt: "${request.prompt.slice(0, 100)}${request.prompt.length > 100 ? "..." : ""}"\n\n` +
        `• Model architecture: ${isMini ? "gpt-4o-mini (high efficiency distilled model)" : "gpt-4o (deep reasoning flagship model)"}\n` +
        `• Production telemetry: Token throughput stable, zero drift detected, latency within designated SLO envelope.\n` +
        `• Security audit: Zero OWASP LLM vulnerabilities detected in payload. Guardrails confirmed active.`;
    }

    const promptTokens = Math.max(12, Math.round(request.prompt.length / 4));
    const completionTokens = Math.max(25, Math.round(responseText.length / 4));
    const totalLatency = Math.round(performance.now() - startTime);
    const cost = estimateCost(request.model, promptTokens, completionTokens);

    return {
      id: invocationId,
      timestamp: new Date().toISOString(),
      target: request.target,
      model: request.model,
      prompt: request.prompt,
      response: responseText,
      latencyMs: totalLatency,
      ttftMs: simulatedTtft,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCostUsd: cost,
      statusCode: 200,
      success: true,
      schemaValid,
    };
  }
}
