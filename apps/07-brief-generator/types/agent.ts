import { z } from "zod";

export type BriefTone = "executive" | "technical" | "critical";

export interface VerifiedFact {
  claim: string;
  source: string;
  confidence: number;
  verified: boolean;
}

export interface ExtractedMetric {
  label: string;
  value: string;
  context: string;
}

export interface ResearchDossier {
  topic: string;
  scope: string;
  tone: BriefTone;
  locale?: "pt" | "en" | "de";
  investigatedTopics: string[];
  verifiedFacts: VerifiedFact[];
  frictionPoints: string[];
  metrics: ExtractedMetric[];
  summary: string;
  generatedAt: string;
}

export const ResearchDossierSchema = z.object({
  topic: z.string().min(1),
  scope: z.string().min(1),
  tone: z.enum(["executive", "technical", "critical"]),
  locale: z.enum(["pt", "en", "de"]).optional().default("pt"),
  investigatedTopics: z.array(z.string()),
  verifiedFacts: z.array(
    z.object({
      claim: z.string(),
      source: z.string(),
      confidence: z.number().min(0).max(1),
      verified: z.boolean(),
    })
  ),
  frictionPoints: z.array(z.string()),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      context: z.string(),
    })
  ),
  summary: z.string(),
  generatedAt: z.string(),
});

export interface ExecutiveBrief {
  title: string;
  executiveSummary: string;
  keyInsights: string[];
  risksAndTradeoffs: string[];
  actionRecommendations: string[];
  fullMarkdown: string;
}

export type AgentRole = "orchestrator" | "researcher" | "writer";

export type TraceStepStatus = "running" | "completed" | "failed";

export interface AgentTraceStep {
  id: string;
  agent: AgentRole;
  action: string;
  input?: unknown;
  output?: unknown;
  latencyMs: number;
  status: TraceStepStatus;
  timestamp: string;
}

export interface HandoffPayload {
  dossier: ResearchDossier;
  trace: AgentTraceStep[];
  researchLatencyMs: number;
  tokensEstimated: number;
  handoffTimestamp: string;
}

export interface PipelineExecutionResult {
  brief: ExecutiveBrief;
  dossier: ResearchDossier;
  trace: AgentTraceStep[];
  metrics: {
    totalLatencyMs: number;
    researchLatencyMs: number;
    writerLatencyMs: number;
    tokensEstimated: number;
    toolCallsCount: number;
  };
}

export type PipelineEventType =
  | "step"
  | "dossier"
  | "brief_chunk"
  | "complete"
  | "error";

export interface PipelineEvent {
  type: PipelineEventType;
  step?: AgentTraceStep;
  dossier?: ResearchDossier;
  chunk?: string;
  result?: PipelineExecutionResult;
  error?: string;
}
