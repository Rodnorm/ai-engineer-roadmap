export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  chunks_count: number;
  created_at: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  chunks_created: number;
  message: string;
}

export interface Citation {
  citation_id: number;
  document_id: string;
  filename: string;
  page_number?: number;
  chunk_index: number;
  snippet: string;
  similarity_score: number;
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  filename: string;
  page_number?: number;
  content: string;
  score?: number;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  retrieved_chunks: DocumentChunk[];
  tokens_used: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  estimated_cost_usd: number;
  latency_ms: number;
  generation_status: 'generated' | 'disabled' | 'not_needed';
}

export interface SystemStats {
  total_documents: number;
  total_chunks: number;
  vector_store_type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/backend';
let accessToken = '';

export function setAccessToken(token: string) {
  accessToken = token;
}

function authHeaders(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly requestId?: string) {
    super(message);
  }
}

async function checked(response: Response) {
  if (response.ok) return response;
  const body = await response.json().catch(() => null);
  const error = body?.error;
  throw new ApiError(error?.message || 'Request failed', response.status, error?.request_id);
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return (await checked(res)).json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/documents`, { headers: authHeaders() });
  return (await checked(res)).json();
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  return (await checked(res)).json();
}

export async function deleteDocument(docId: string) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return (await checked(res)).json();
}

export async function clearAllDocuments() {
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return (await checked(res)).json();
}

export async function queryRAG(
  question: string,
  topK: number = 4,
  temperature: number = 0.3,
  language: string = 'en',
  signal?: AbortSignal,
): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      question,
      top_k: topK,
      temperature,
      language,
    }),
    signal,
  });
  return (await checked(res)).json();
}

export async function fetchStats(): Promise<SystemStats> {
  const res = await fetch(`${API_BASE_URL}/api/stats`, { headers: authHeaders() });
  return (await checked(res)).json();
}
