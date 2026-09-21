export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  chunks_count: number;
  created_at: string;
  source: 'upload' | 'example';
}

export interface ExampleDocument {
  id: string;
  filename: string;
  title: string;
  description: string;
  loaded: boolean;
  download_url: string;
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
  source: 'upload' | 'example';
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  filename: string;
  page_number?: number;
  content: string;
  score?: number;
  source: 'upload' | 'example';
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

export interface SuggestionResponse {
  questions: string[];
  generation_status: 'generated' | 'disabled' | 'not_needed';
}

export interface SystemStats {
  total_documents: number;
  total_chunks: number;
  vector_store_type: string;
}

const API_BASE_URL = '/api/backend';

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

export async function fetchDocuments(scope: 'uploads' | 'examples' | 'all' = 'uploads'): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/documents?scope=${scope}`);
  return (await checked(res)).json();
}

export async function fetchExampleDocuments(): Promise<ExampleDocument[]> {
  const res = await fetch(`${API_BASE_URL}/api/examples`);
  return (await checked(res)).json();
}

export async function loadExampleDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/examples/load`, {
    method: 'POST',
  });
  return (await checked(res)).json();
}

export async function downloadExampleDocument(filename: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/examples/${encodeURIComponent(filename)}`, {
  });
  const blob = await (await checked(res)).blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  return (await checked(res)).json();
}

export async function deleteDocument(docId: string) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
    method: 'DELETE',
  });
  return (await checked(res)).json();
}

export async function clearAllDocuments() {
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    method: 'DELETE',
  });
  return (await checked(res)).json();
}

export async function queryRAG(
  question: string,
  topK: number = 4,
  temperature: number = 0.3,
  language: string = 'en',
  scope: 'uploads' | 'examples' | 'all' = 'uploads',
  signal?: AbortSignal,
): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      top_k: topK,
      temperature,
      language,
      scope,
    }),
    signal,
  });
  return (await checked(res)).json();
}

export async function fetchSuggestedQuestions(
  language: string = 'en',
  signal?: AbortSignal,
): Promise<SuggestionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language }),
    signal,
  });
  return (await checked(res)).json();
}

export async function fetchStats(): Promise<SystemStats> {
  const res = await fetch(`${API_BASE_URL}/api/stats`);
  return (await checked(res)).json();
}
