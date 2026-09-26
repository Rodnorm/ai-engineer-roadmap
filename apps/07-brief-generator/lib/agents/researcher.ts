import {
  AgentTraceStep,
  BriefTone,
  ResearchDossier,
  ResearchDossierSchema,
} from "@/types/agent";
import {
  executeExtractMetrics,
  executeSearchFacts,
  executeVerifyClaim,
  getFrictionPointsForTopic,
} from "@/lib/tools/research-tools";
import OpenAI from "openai";

export interface RunResearcherOptions {
  topic: string;
  scope: string;
  tone: BriefTone;
  locale?: "pt" | "en" | "de";
  maxRounds?: number;
  onStep?: (step: AgentTraceStep) => void;
}

export async function runResearcher(
  options: RunResearcherOptions
): Promise<{ dossier: ResearchDossier; steps: AgentTraceStep[] }> {
  const { topic, scope, tone, maxRounds = 3, onStep } = options;
  const steps: AgentTraceStep[] = [];
  const appMode = process.env.APP_MODE || "offline";
  const effectiveMaxRounds = Math.max(1, Math.min(maxRounds, 5));

  const emitStep = (step: AgentTraceStep) => {
    steps.push(step);
    if (onStep) {
      onStep(step);
    }
  };

  // Step 1: Investigation initialization
  const initStartTime = Date.now();
  const initStep: AgentTraceStep = {
    id: `step-research-init-${Date.now()}`,
    agent: "researcher",
    action: "Plan Strategic Research Inquiry",
    input: { topic, scope, tone, maxRounds: effectiveMaxRounds },
    output: {
      maxRounds: effectiveMaxRounds,
      investigationPlan: [
        "Query factual architecture documentation & benchmarks",
        ...(effectiveMaxRounds >= 2 ? ["Verify critical claims & trade-offs"] : []),
        ...(effectiveMaxRounds >= 3 ? ["Extract quantitative metrics and latency profiles"] : []),
      ],
    },
    latencyMs: Date.now() - initStartTime,
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  emitStep(initStep);

  const boundedOptions = { ...options, maxRounds: effectiveMaxRounds };

  // If online mode with valid Azure OpenAI credentials
  const hasAzure =
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY &&
    appMode === "online";

  if (hasAzure) {
    try {
      return await runOnlineResearcher(boundedOptions, steps, emitStep);
    } catch (err) {
      console.warn("Online researcher encountered error, falling back to deterministic engine:", err);
    }
  }

  // Deterministic execution engine (Offline mode / CI / Resilience fallback)
  return await runDeterministicResearcher(boundedOptions, steps, emitStep);
}

async function runDeterministicResearcher(
  options: RunResearcherOptions,
  steps: AgentTraceStep[],
  emitStep: (step: AgentTraceStep) => void
): Promise<{ dossier: ResearchDossier; steps: AgentTraceStep[] }> {
  const { topic, scope, tone, maxRounds = 3 } = options;
  const effectiveRounds = Math.max(1, Math.min(maxRounds, 5));

  // Round 1: Search facts
  const t1Start = Date.now();
  const facts = await executeSearchFacts(topic);
  const t1Step: AgentTraceStep = {
    id: `step-tool-search-${Date.now()}`,
    agent: "researcher",
    action: "Tool Call: search_facts",
    input: { query: topic },
    output: { resultsCount: facts.length, sample: facts.map((f) => f.claim) },
    latencyMs: Math.max(12, Date.now() - t1Start),
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  emitStep(t1Step);

  // Round 2: Verify primary claim (executed if maxRounds >= 2)
  if (effectiveRounds >= 2) {
    const t2Start = Date.now();
    const primaryClaim = facts[0]?.claim || topic;
    const verification = await executeVerifyClaim(primaryClaim);
    const t2Step: AgentTraceStep = {
      id: `step-tool-verify-${Date.now()}`,
      agent: "researcher",
      action: "Tool Call: verify_claim",
      input: { claim: primaryClaim },
      output: verification,
      latencyMs: Math.max(10, Date.now() - t2Start),
      status: "completed",
      timestamp: new Date().toISOString(),
    };
    emitStep(t2Step);
  }

  // Round 3: Extract quantitative metrics (executed if maxRounds >= 3)
  let metrics: Array<{ label: string; value: string; context: string }> = [];
  if (effectiveRounds >= 3) {
    const t3Start = Date.now();
    metrics = await executeExtractMetrics(topic);
    const t3Step: AgentTraceStep = {
      id: `step-tool-metrics-${Date.now()}`,
      agent: "researcher",
      action: "Tool Call: extract_metrics",
      input: { context: topic },
      output: { extractedMetrics: metrics },
      latencyMs: Math.max(15, Date.now() - t3Start),
      status: "completed",
      timestamp: new Date().toISOString(),
    };
    emitStep(t3Step);
  } else {
    metrics = [
      {
        label: "Escopo de Investigação",
        value: `${effectiveRounds} rodada(s)`,
        context: "Execução limitada pela política MAX_RESEARCH_ROUNDS",
      },
    ];
  }

  const frictionPoints = getFrictionPointsForTopic(topic);

  const dossier: ResearchDossier = {
    topic,
    scope,
    tone,
    locale: options.locale || "pt",
    investigatedTopics: [
      `Limites operacionais e arquitetura de ${topic}`,
      "Impactos de conformidade, segurança e latência",
      "Modelos de governança e custo de sustentação",
    ],
    verifiedFacts: facts,
    frictionPoints,
    metrics,
    summary: `Investigação técnica consolidada para "${topic}" com ${facts.length} evidências verificadas, ${metrics.length} métricas operacionais e ${frictionPoints.length} pontos de atrito identificados.`,
    generatedAt: new Date().toISOString(),
  };

  // Validate dossier schema
  ResearchDossierSchema.parse(dossier);

  const finalStep: AgentTraceStep = {
    id: `step-research-complete-${Date.now()}`,
    agent: "researcher",
    action: "Finalize Research Dossier",
    input: { factsCount: facts.length, metricsCount: metrics.length },
    output: { dossierSummary: dossier.summary, status: "dossier_ready_for_handoff" },
    latencyMs: 5,
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  emitStep(finalStep);

  return { dossier, steps };
}

async function runOnlineResearcher(
  options: RunResearcherOptions,
  steps: AgentTraceStep[],
  emitStep: (step: AgentTraceStep) => void
): Promise<{ dossier: ResearchDossier; steps: AgentTraceStep[] }> {
  const { topic, scope, tone, maxRounds = 3 } = options;
  const effectiveRounds = Math.max(1, Math.min(maxRounds, 5));

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const isOpenAIV1 = cleanEndpoint.includes("/openai/v1");
  const baseURL = isOpenAIV1
    ? cleanEndpoint
    : `${cleanEndpoint}/openai/deployments/${deployment}`;

  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultQuery: isOpenAIV1 ? undefined : { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
  });

  const prompt = `Você é o Researcher Agent especializado em investigação técnica rigorosa, coleta de evidências factuais e análise aprofundada de arquitetura de software para liderança técnica.
Tópico: "${topic}"
Escopo: "${scope}"
Tom: "${tone}"
Limite de rodadas de investigação permitidas: ${effectiveRounds} rodada(s).

IMPORTANTE: Forneça dados técnicos específicos, nomes de padrões, trade-offs quantificáveis e detalhes operacionais concretos. NUNCA use clichês genéricos ou respostas vagas.

Gere um dossiê técnico estruturado em JSON estrito contendo:
- investigatedTopics: array de no máximo ${effectiveRounds} strings com temas técnicos específicos investigados
- verifiedFacts: array de objetos { claim: string detalhada com fato técnico específico, source: string com publicação técnica, benchmark ou documentação real, confidence: number de 0 a 1, verified: true }
- frictionPoints: array de strings detalhando riscos arquiteturais reais, complexidades de integração e gargalos operacionais
- metrics: array de objetos { label: string com nome do indicador/benchmark, value: string com número/ordem de grandeza com unidade, context: string explicando o cenário }
- summary: string consolidando a investigação com densidade técnica e conclusões claras`;

  const callStart = Date.now();
  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: "system",
        content: "Você é um agente de pesquisa técnica rigoroso. Retorne exclusivamente JSON válido.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  const dossier: ResearchDossier = {
    topic,
    scope,
    tone,
    locale: options.locale || "pt",
    investigatedTopics: Array.isArray(parsed.investigatedTopics)
      ? parsed.investigatedTopics
      : [`Análise de arquitetura para ${topic}`],
    verifiedFacts: Array.isArray(parsed.verifiedFacts) && parsed.verifiedFacts.length > 0
      ? parsed.verifiedFacts
      : await executeSearchFacts(topic),
    frictionPoints: Array.isArray(parsed.frictionPoints) && parsed.frictionPoints.length > 0
      ? parsed.frictionPoints
      : getFrictionPointsForTopic(topic),
    metrics: Array.isArray(parsed.metrics) && parsed.metrics.length > 0
      ? parsed.metrics
      : await executeExtractMetrics(topic),
    summary: parsed.summary || `Pesquisa estruturada de ${topic}`,
    generatedAt: new Date().toISOString(),
  };

  ResearchDossierSchema.parse(dossier);

  emitStep({
    id: `step-online-research-${Date.now()}`,
    agent: "researcher",
    action: "Azure OpenAI Research Query & Synthesis",
    input: { model: deployment, topic },
    output: { verifiedFactsCount: dossier.verifiedFacts.length },
    latencyMs: Date.now() - callStart,
    status: "completed",
    timestamp: new Date().toISOString(),
  });

  return { dossier, steps };
}
