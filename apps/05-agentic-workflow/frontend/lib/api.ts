export interface AgentStep {
  step_index: number;
  type: 'thought' | 'tool_call' | 'tool_result' | 'waiting_approval' | 'answer' | 'error';
  title: string;
  content: string;
  tool_name?: string;
  tool_args?: Record<string, any>;
  tool_result?: string;
  timestamp: number;
}

export interface PendingApproval {
  tool_name: string;
  tool_args: Record<string, any>;
  message: string;
}

export interface AgentSessionResponse {
  session_id: string;
  status: 'completed' | 'waiting_approval' | 'rejected' | 'error';
  steps: AgentStep[];
  final_answer?: string;
  pending_approval?: PendingApproval;
  request_id: string;
}

const API_BASE = '/api/backend';

export async function runAgentTask(prompt: string, sessionId?: string): Promise<AgentSessionResponse> {
  const res = await fetch(`${API_BASE}/api/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, session_id: sessionId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function approveAgentTask(sessionId: string, approved: boolean, reason?: string): Promise<AgentSessionResponse> {
  const res = await fetch(`${API_BASE}/api/agent/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, approved, reason }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || `Approval request failed with status ${res.status}`);
  }

  return res.json();
}
