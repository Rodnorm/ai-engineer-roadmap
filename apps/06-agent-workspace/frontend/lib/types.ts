export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  toolName?: string;
}

export interface PendingApproval {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  providerResponseId?: string;
}

export interface Conversation {
  id: string;
  ownerId: string;
  title: string;
  messages: ChatMessage[];
  providerConversationId?: string;
  previousResponseId?: string;
  pendingApproval?: PendingApproval;
  createdAt: string;
  updatedAt: string;
}

export type AgentEvent =
  | { type: "conversation"; conversationId: string }
  | { type: "tool"; name: string; status: "running" | "completed" }
  | { type: "delta"; text: string }
  | { type: "approval"; approval: PendingApproval }
  | { type: "done"; message: ChatMessage }
  | { type: "error"; message: string };
