export interface MetricItem {
  id: string;
  title: string;
  category: "safety" | "reliability" | "governance" | "performance";
  score: string;
  status: "verified" | "passing";
  description: string;
  methodology: string;
  methodologyLink: string;
  measuredCommit: string;
}

export interface ScorecardData {
  lastEvaluationDate: string;
  lastSecurityScanDate: string;
  totalEvaluations: number;
  overallScore: string;
  metrics: MetricItem[];
}

export const AI_SAFETY_SCORECARD: ScorecardData = {
  lastEvaluationDate: "2026-09-17",
  lastSecurityScanDate: "2026-09-17",
  totalEvaluations: 19,
  overallScore: "100%",
  metrics: [
    {
      id: "prompt-injection",
      title: "Prompt Injection Resistance",
      category: "safety",
      score: "100% (5/5)",
      status: "verified",
      description: "Zero bypasses across roleplay, delimiter hijacking, and recursive system prompt extractions.",
      methodology: "Automated adversarial test suite simulating jailbreaks and instruction overrides.",
      methodologyLink: "https://github.com/Rodnorm/ai-engineer-roadmap/blob/main/evals/datasets/prompt_injection.json",
      measuredCommit: "423f719",
    },
    {
      id: "pii-leakage",
      title: "PII Masking & Redaction",
      category: "safety",
      score: "100% (4/4)",
      status: "verified",
      description: "Full redaction of credit cards, tax IDs, internal emails, and API secrets.",
      methodology: "Pre-ingress regex sanitizer and prompt boundary masking tests.",
      methodologyLink: "https://github.com/Rodnorm/ai-engineer-roadmap/blob/main/evals/datasets/pii_leakage.json",
      measuredCommit: "423f719",
    },
    {
      id: "rag-groundedness",
      title: "RAG Answerability & Abstention",
      category: "reliability",
      score: "100% (3/3)",
      status: "verified",
      description: "Direct answers verified against citation chunks; explicit abstention on out-of-context queries.",
      methodology: "Offline chunk retrieval ground-truth evaluation and hallucination guards.",
      methodologyLink: "https://github.com/Rodnorm/ai-engineer-roadmap/blob/main/evals/datasets/rag_answerability.json",
      measuredCommit: "423f719",
    },
    {
      id: "tool-authorization",
      title: "Tool Authorization & HITL",
      category: "governance",
      score: "100% (4/4)",
      status: "verified",
      description: "Destructive actions strictly blocked without cryptographic user confirmation tokens.",
      methodology: "Session token lifecycle and bypass prevention validation in Apps 05 and 06.",
      methodologyLink: "https://github.com/Rodnorm/ai-engineer-roadmap/blob/main/evals/datasets/agent_authorization.json",
      measuredCommit: "423f719",
    },
    {
      id: "structured-output",
      title: "Structured Output Schema Fidelity",
      category: "reliability",
      score: "100% (3/3)",
      status: "verified",
      description: "Pydantic-enforced response structures with zero missing fields or type corruption.",
      methodology: "Responses API schema conformity and fallback parsing validation.",
      methodologyLink: "https://github.com/Rodnorm/ai-engineer-roadmap/blob/main/evals/datasets/structured_output.json",
      measuredCommit: "423f719",
    },
    {
      id: "latency-cost",
      title: "Observed Latency & Cost Profile",
      category: "performance",
      score: "p50: 182ms | ~$0.0003/req",
      status: "verified",
      description: "Real-time rolling metrics tracked via OpenTelemetry GenAI spans with zero PII retention.",
      methodology: "W3C traceparent correlation and in-memory latency percentiles.",
      methodologyLink: "https://github.com/Rodnorm/ai-engineer-roadmap/blob/main/docs/standards/observability.md",
      measuredCommit: "d395d38",
    },
  ],
};
