/**
 * Consolidated API Contracts and Types for AI Engineer Roadmap Applications.
 * Generated from FastAPI OpenAPI 3.1.0 specifications in `contracts/openapi/`.
 */

// ---------------------------------------------------------------------------
// Shared Types & Error Envelopes
// ---------------------------------------------------------------------------

export interface ApiErrorDetail {
  requestId?: string;
  code?: string;
  message: string;
}

export interface StandardApiError {
  error?: {
    code: string;
    message: string;
    request_id?: string;
  };
  detail?: string | ApiErrorDetail;
}

// ---------------------------------------------------------------------------
// App 01: Smart Inspector
// ---------------------------------------------------------------------------

export interface SmartInspectorAnalysisResult {
  tags: string[];
  caption: string;
  objects: string[];
  ocr: string;
  averagePrice: string;
  lowestPriceLink: string;
}

export interface SmartInspectorHealth {
  status: string;
  generation_enabled: boolean;
  azure_openai_configured: boolean;
  rate_limit_enabled: boolean;
  max_image_bytes: number;
}

// ---------------------------------------------------------------------------
// App 02: Support Bot
// ---------------------------------------------------------------------------

export interface SupportBotQueryRequest {
  message: string;
  conversation_id?: string;
  client_id?: string;
}

export interface SupportBotQueryResponse {
  reply: string;
  conversation_id: string;
  sources?: string[];
  sentiment?: string;
}

export interface SupportBotHealth {
  status: string;
  generation_enabled: boolean;
  azure_configured: boolean;
  rate_limit_enabled: boolean;
}

// ---------------------------------------------------------------------------
// App 03: Prompt Forge
// ---------------------------------------------------------------------------

export interface PromptForgeSafetyResponse {
  is_safe: boolean;
  flagged_categories: string[];
  action: "allow" | "warn" | "block";
}

export interface PromptForgeVariation {
  id: string;
  persona: string;
  prompt: string;
  explanation: string;
}

export interface PromptForgeGenerateRequest {
  brief: string;
  personas?: string[];
  temperature?: number;
}

export interface PromptForgeGenerateResponse {
  request_id: string;
  variations: PromptForgeVariation[];
  safety: PromptForgeSafetyResponse;
}

export interface PromptForgeEvaluateRequest {
  prompt: string;
  criteria?: string[];
}

export interface PromptForgeEvaluateResponse {
  request_id: string;
  score: number;
  feedback: string;
  safety: PromptForgeSafetyResponse;
}

// ---------------------------------------------------------------------------
// App 04: Pocket RAG
// ---------------------------------------------------------------------------

export interface PocketRagDocument {
  id: string;
  filename: string;
  chunk_count: number;
  created_at: string;
}

export interface PocketRagQueryRequest {
  query: string;
  top_k?: number;
}

export interface PocketRagQueryResponse {
  answer: string;
  citations: Array<{
    document_id: string;
    chunk_index: number;
    text: string;
    score: number;
  }>;
  request_id: string;
}

// ---------------------------------------------------------------------------
// App 05: Agentic Workflow
// ---------------------------------------------------------------------------

export interface AgentWorkflowRunRequest {
  task: string;
  session_id?: string;
  session_secret?: string;
}

export interface AgentWorkflowStep {
  step_number: number;
  action: string;
  status: "pending" | "running" | "completed" | "failed" | "waiting_approval";
  output?: string;
}

export interface AgentWorkflowRunResponse {
  session_id: string;
  session_secret: string;
  status: "running" | "completed" | "waiting_approval" | "failed";
  steps: AgentWorkflowStep[];
  request_id: string;
  pending_approval?: {
    approval_id: string;
    action: string;
    parameters: Record<string, unknown>;
  };
}

export interface AgentWorkflowApprovalRequest {
  session_id: string;
  session_secret: string;
  approval_id: string;
  approved: boolean;
}
