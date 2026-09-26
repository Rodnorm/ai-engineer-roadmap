import {
  AgentTraceStep,
  BriefTone,
  PipelineExecutionResult,
  ResearchDossierSchema,
} from "@/types/agent";
import { runResearcher } from "@/lib/agents/researcher";
import { runWriter } from "@/lib/agents/writer";
import {
  globalSemaphore,
  isGenerationEnabled,
  rateLimiter,
} from "@/lib/security/rate-limiter";

export interface PipelineOptions {
  topic: string;
  scope?: string;
  tone?: BriefTone;
  locale?: "pt" | "en" | "de";
  clientIp?: string;
  maxRounds?: number;
  onStep?: (step: AgentTraceStep) => void;
}

export function getMaxResearchRounds(): number {
  const raw = process.env.MAX_RESEARCH_ROUNDS;
  if (!raw) return 3;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 5);
}

export async function executeMultiAgentPipeline(
  options: PipelineOptions
): Promise<PipelineExecutionResult> {
  const {
    topic,
    scope = "Enterprise Architecture & Engineering Leadership",
    tone = "executive",
    locale = "pt",
    clientIp = "127.0.0.1",
    onStep,
  } = options;

  // 1. Kill-switch check
  if (!isGenerationEnabled()) {
    throw new Error(
      "Geração suspensa pelo administrador: Kill-switch ativo (GENERATION_ENABLED=false)."
    );
  }

  // 2. Rate limit check
  const rateLimitResult = rateLimiter.check(clientIp);
  if (!rateLimitResult.allowed) {
    const seconds = Math.ceil(rateLimitResult.resetInMs / 1000);
    throw new Error(
      `Limite de requisições excedido. Por favor, aguarde ${seconds} segundos antes de tentar novamente.`
    );
  }

  // 3. Concurrency Semaphore
  const releaseSemaphore = await globalSemaphore.acquire();

  const pipelineStart = Date.now();
  const allSteps: AgentTraceStep[] = [];

  const recordStep = (step: AgentTraceStep) => {
    allSteps.push(step);
    if (onStep) {
      onStep(step);
    }
  };

  try {
    // 4. Orchestrator Start Step
    recordStep({
      id: `step-orchestrator-init-${Date.now()}`,
      agent: "orchestrator",
      action: "Initialize Heterogeneous Multi-Agent Pipeline",
      input: { topic, scope, tone },
      output: {
        topology: "Sequential Deterministic (Researcher -> Handoff -> Writer)",
        status: "pipeline_running",
      },
      latencyMs: 5,
      status: "completed",
      timestamp: new Date().toISOString(),
    });

    // 5. Stage 1: Researcher Agent
    const researchStartTime = Date.now();
    const effectiveMaxRounds =
      typeof options.maxRounds === "number" && options.maxRounds > 0
        ? Math.min(options.maxRounds, 5)
        : getMaxResearchRounds();

    const { dossier, steps: researchSteps } = await runResearcher({
      topic,
      scope,
      tone,
      locale,
      maxRounds: effectiveMaxRounds,
      onStep: recordStep,
    });
    const researchLatencyMs = Date.now() - researchStartTime;

    // 6. Stage Handoff Protocol & Telemetry
    const handoffStart = Date.now();
    // Validate schema
    ResearchDossierSchema.parse(dossier);

    const tokensEstimated = Math.round(
      (JSON.stringify(dossier).length + topic.length * 4) / 4
    );

    recordStep({
      id: `step-handoff-${Date.now()}`,
      agent: "orchestrator",
      action: "Execute Handoff Protocol (Researcher -> Writer)",
      input: {
        dossierVerified: true,
        factsTransferred: dossier.verifiedFacts.length,
        metricsTransferred: dossier.metrics.length,
      },
      output: {
        protocol: "Zero-Tool Context Injection",
        estimatedTokens: tokensEstimated,
        status: "handoff_completed",
      },
      latencyMs: Date.now() - handoffStart,
      status: "completed",
      timestamp: new Date().toISOString(),
    });

    // 7. Stage 2: Writer Agent
    const writerStartTime = Date.now();
    const { brief } = await runWriter({
      dossier,
      onStep: recordStep,
    });
    const writerLatencyMs = Date.now() - writerStartTime;

    const totalLatencyMs = Date.now() - pipelineStart;
    const toolCallsCount = allSteps.filter((s) =>
      s.action.startsWith("Tool Call:")
    ).length;

    // 8. Orchestrator Completion Step
    recordStep({
      id: `step-orchestrator-finish-${Date.now()}`,
      agent: "orchestrator",
      action: "Finalize Pipeline & Compile Telemetry",
      input: { totalSteps: allSteps.length + 1 },
      output: {
        totalLatencyMs,
        researchLatencyMs,
        writerLatencyMs,
        tokensEstimated,
        status: "success",
      },
      latencyMs: 8,
      status: "completed",
      timestamp: new Date().toISOString(),
    });

    return {
      brief,
      dossier,
      trace: allSteps,
      metrics: {
        totalLatencyMs,
        researchLatencyMs,
        writerLatencyMs,
        tokensEstimated,
        toolCallsCount,
      },
    };
  } finally {
    releaseSemaphore();
  }
}
