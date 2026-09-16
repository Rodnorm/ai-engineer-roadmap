import { randomUUID } from "node:crypto";
import { callMcpTool } from "../mcp-client";
import type { AgentEvent, Conversation, PendingApproval } from "../types";

function chunks(text: string): string[] {
  return text.match(/.{1,24}(?:\s|$)/g) ?? [text];
}

function taskTitle(prompt: string): string {
  return prompt
    .replace(/^(please\s+)?(create|add|make)\s+(a\s+)?task\s*(to|for|:)?\s*/i, "")
    .trim()
    .slice(0, 120) || "New workspace task";
}

async function* streamText(text: string): AsyncGenerator<AgentEvent> {
  for (const textChunk of chunks(text)) {
    yield { type: "delta", text: textChunk };
  }
}

export async function* runOfflineAgent(
  prompt: string,
  conversation: Conversation,
): AsyncGenerator<AgentEvent> {
  void conversation;
  const normalized = prompt.toLocaleLowerCase();

  if (/\b(create|add|make)\b.*\btask\b|\btask\b.*\b(create|add|make)\b/.test(normalized)) {
    const approval: PendingApproval = {
      id: randomUUID(),
      toolName: "create_task",
      arguments: { title: taskTitle(prompt), confirmed: true },
    };
    yield { type: "approval", approval };
    return;
  }

  if (/note|search|find|documentation|deployment|security/.test(normalized)) {
    yield { type: "tool", name: "search_notes", status: "running" };
    const query = normalized.includes("deploy") ? "deployment" : normalized.includes("security") ? "security" : "app-06";
    const result = await callMcpTool("search_notes", { query }) as { notes?: Array<{ title: string; content: string }> };
    yield { type: "tool", name: "search_notes", status: "completed" };
    const answer = result.notes?.length
      ? result.notes.map((note) => `${note.title}: ${note.content}`).join("\n\n")
      : "I could not find a matching workspace note.";
    yield* streamText(answer);
    return;
  }

  yield { type: "tool", name: "list_tasks", status: "running" };
  const result = await callMcpTool("list_tasks", { status: normalized.includes("done") ? "done" : "open" }) as {
    tasks?: Array<{ title: string; description: string }>;
  };
  yield { type: "tool", name: "list_tasks", status: "completed" };
  const answer = result.tasks?.length
    ? `Here are the matching tasks:\n\n${result.tasks.map((task) => `• ${task.title}${task.description ? ` — ${task.description}` : ""}`).join("\n")}`
    : "There are no matching tasks.";
  yield* streamText(answer);
}

export async function* approveOfflineTool(
  conversation: Conversation,
  approved: boolean,
): AsyncGenerator<AgentEvent> {
  const pending = conversation.pendingApproval;
  if (!pending) throw new Error("There is no pending approval");
  if (!approved) {
    yield* streamText("The task creation was cancelled. No workspace data was changed.");
    return;
  }

  yield { type: "tool", name: pending.toolName, status: "running" };
  const result = await callMcpTool(pending.toolName, pending.arguments) as { task?: { title?: string } };
  yield { type: "tool", name: pending.toolName, status: "completed" };
  yield* streamText(`Task created: ${result.task?.title ?? "Untitled task"}.`);
}
