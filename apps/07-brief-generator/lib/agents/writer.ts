import { AgentTraceStep, ExecutiveBrief, ResearchDossier } from "@/types/agent";
import OpenAI from "openai";

export interface RunWriterOptions {
  dossier: ResearchDossier;
  onStep?: (step: AgentTraceStep) => void;
}

export async function runWriter(
  options: RunWriterOptions
): Promise<{ brief: ExecutiveBrief; steps: AgentTraceStep[] }> {
  const { dossier, onStep } = options;
  const steps: AgentTraceStep[] = [];
  const appMode = process.env.APP_MODE || "offline";

  const emitStep = (step: AgentTraceStep) => {
    steps.push(step);
    if (onStep) {
      onStep(step);
    }
  };

  const startStep: AgentTraceStep = {
    id: `step-writer-ingest-${Date.now()}`,
    agent: "writer",
    action: "Ingest Research Dossier & Formulate Structure",
    input: {
      topic: dossier.topic,
      factsCount: dossier.verifiedFacts.length,
      metricsCount: dossier.metrics.length,
      tone: dossier.tone,
    },
    output: {
      framework: "Executive Briefing (McKinsey Pyramid / PR-FAQ)",
      sections: [
        "Executive Summary",
        "Strategic Findings & Factual Insights",
        "Operational Metrics & Benchmarks",
        "Risks, Constraints & Trade-offs",
        "Actionable Recommendations",
      ],
    },
    latencyMs: 12,
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  emitStep(startStep);

  const hasAzure =
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY &&
    appMode === "online";

  if (hasAzure) {
    try {
      return await runOnlineWriter(options, steps, emitStep);
    } catch (err) {
      console.warn("Online writer encountered error, falling back to deterministic engine:", err);
    }
  }

  return await runDeterministicWriter(options, steps, emitStep);
}

async function runDeterministicWriter(
  options: RunWriterOptions,
  steps: AgentTraceStep[],
  emitStep: (step: AgentTraceStep) => void
): Promise<{ brief: ExecutiveBrief; steps: AgentTraceStep[] }> {
  const { dossier } = options;
  const tStart = Date.now();

  const title = `Briefing Executivo: ${dossier.topic}`;
  const executiveSummary = `Este documento sintetiza a investigação técnica e estratégica sobre "${dossier.topic}". O objetivo é orientar decisões de arquitetura e liderança de engenharia com foco em mitigação de riscos operacionais, previsibilidade de custos e sustentabilidade de entrega sob o prisma do escopo "${dossier.scope}".`;

  const keyInsights = dossier.verifiedFacts.map((fact) => `${fact.claim} (Fonte: ${fact.source})`);

  const risksAndTradeoffs = dossier.frictionPoints.map(
    (point, idx) => `Ponto de Atenção #${idx + 1}: ${point}`
  );

  const actionRecommendations = [
    "Instituir prova de conceito (PoC) com métricas de sucesso quantificáveis e monitoramento contínuo.",
    "Alinhar governança e contratos de serviço antes de expandir escopo para ambientes produtivos críticos.",
    "Adotar arquitetura orientada a observabilidade para identificar gargalos de latência precocemente.",
    "Revisar estimativas orçamentárias de nuvem com base nos parâmetros levantados pelo dossiê.",
  ];

  // Compose clean, high-impact Markdown
  const markdownChunks: string[] = [];
  markdownChunks.push(`# ${title}\n`);
  markdownChunks.push(`> **Tom:** ${dossier.tone.toUpperCase()} | **Data:** ${new Date(dossier.generatedAt).toLocaleDateString("pt-BR")} | **Status:** Aprovado para Distribuição Executiva\n`);
  markdownChunks.push(`## 1. Sumário Executivo\n\n${executiveSummary}\n`);

  markdownChunks.push(`## 2. Principais Evidências & Fatos Verificados\n`);
  for (const fact of dossier.verifiedFacts) {
    markdownChunks.push(`- **${fact.claim}**\n  *Referência:* \`${fact.source}\` (Confiabilidade: ${(fact.confidence * 100).toFixed(0)}%)`);
  }
  markdownChunks.push("");

  if (dossier.metrics.length > 0) {
    markdownChunks.push(`## 3. Métricas Operacionais & Indicadores de Performance\n`);
    markdownChunks.push(`| Métrica / Benchmark | Valor Estimado | Contexto de Aplicação |`);
    markdownChunks.push(`| :--- | :--- | :--- |`);
    for (const metric of dossier.metrics) {
      markdownChunks.push(`| **${metric.label}** | \`${metric.value}\` | ${metric.context} |`);
    }
    markdownChunks.push("");
  }

  markdownChunks.push(`## 4. Riscos, Restrições & Trade-offs Críticos\n`);
  for (const friction of dossier.frictionPoints) {
    markdownChunks.push(`- ⚠️ **${friction}**`);
  }
  markdownChunks.push("");

  markdownChunks.push(`## 5. Recomendações Estratégicas de Ação\n`);
  actionRecommendations.forEach((rec, idx) => {
    markdownChunks.push(`${idx + 1}. **${rec}**`);
  });

  const fullMarkdown = markdownChunks.join("\n");

  const synthStep: AgentTraceStep = {
    id: `step-writer-synthesize-${Date.now()}`,
    agent: "writer",
    action: "Synthesize Executive Document & Structure Callouts",
    input: { factsIncluded: keyInsights.length, tone: dossier.tone },
    output: {
      sectionsGenerated: 5,
      markdownLength: fullMarkdown.length,
      status: "briefing_finalized",
    },
    latencyMs: Math.max(18, Date.now() - tStart),
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  emitStep(synthStep);

  const brief: ExecutiveBrief = {
    title,
    executiveSummary,
    keyInsights,
    risksAndTradeoffs,
    actionRecommendations,
    fullMarkdown,
  };

  return { brief, steps };
}

async function runOnlineWriter(
  options: RunWriterOptions,
  steps: AgentTraceStep[],
  emitStep: (step: AgentTraceStep) => void
): Promise<{ brief: ExecutiveBrief; steps: AgentTraceStep[] }> {
  const { dossier } = options;

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const baseURL = cleanEndpoint.includes("/openai/v1")
    ? cleanEndpoint
    : `${cleanEndpoint}/openai/deployments/${deployment}`;

  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
  });

  const prompt = `Você é o Writer Agent especializado em redação executiva e sumários de alta gestão (McKinsey / Amazon PR/FAQ).
Você NÃO possui ferramentas de busca. Seu trabalho é redigir um briefing impecável com base EXCLUSIVAMENTE no Research Dossier abaixo:

${JSON.stringify(dossier, null, 2)}

Retorne um JSON estrito com as chaves:
- title (string)
- executiveSummary (string)
- keyInsights (array de strings)
- risksAndTradeoffs (array de strings)
- actionRecommendations (array de strings)
- fullMarkdown (string formatada em markdown com títulos, tabela de métricas e alertas)`;

  const callStart = Date.now();
  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: "system",
        content: "Você é um redator executivo sênior. Retorne exclusivamente JSON válido.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  const brief: ExecutiveBrief = {
    title: parsed.title || `Briefing Executivo: ${dossier.topic}`,
    executiveSummary: parsed.executiveSummary || dossier.summary,
    keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
    risksAndTradeoffs: Array.isArray(parsed.risksAndTradeoffs) ? parsed.risksAndTradeoffs : dossier.frictionPoints,
    actionRecommendations: Array.isArray(parsed.actionRecommendations) ? parsed.actionRecommendations : [],
    fullMarkdown: parsed.fullMarkdown || `# ${dossier.topic}\n\n${dossier.summary}`,
  };

  emitStep({
    id: `step-online-writer-${Date.now()}`,
    agent: "writer",
    action: "Azure OpenAI Executive Drafting",
    input: { model: deployment, dossierSummary: dossier.summary },
    output: { briefTitle: brief.title, markdownChars: brief.fullMarkdown.length },
    latencyMs: Date.now() - callStart,
    status: "completed",
    timestamp: new Date().toISOString(),
  });

  return { brief, steps };
}
