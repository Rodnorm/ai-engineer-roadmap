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
}

export interface SystemStats {
  total_documents: number;
  total_chunks: number;
  vector_store_type: string;
  monthly_cloud_savings_usd: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/backend';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(errorData.detail || 'Failed to upload document');
  }

  return res.json();
}

export async function clearAllDocuments() {
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear documents');
  return res.json();
}

export async function queryRAG(
  question: string,
  topK: number = 4,
  temperature: number = 0.3,
  language: string = 'en'
): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      top_k: topK,
      temperature,
      language,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Query failed' }));
    throw new Error(errorData.detail || 'Failed to process RAG query');
  }

  return res.json();
}

export async function fetchStats(): Promise<SystemStats> {
  const res = await fetch(`${API_BASE_URL}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
