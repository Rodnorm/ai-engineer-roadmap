import { randomUUID } from "node:crypto";
import { getConfig } from "../config";
import { getConversationRepository } from "../repository";
import type { AgentEvent, ChatMessage, Conversation } from "../types";
import { approveFoundryTool, runFoundryAgent } from "./foundry";
import { approveOfflineTool, runOfflineAgent } from "./offline";

type AgentStreamFactory = (conversation: Conversation) => AsyncGenerator<AgentEvent>;

async function* persistAgentStream(
  conversation: Conversation,
  createStream: AgentStreamFactory,
): AsyncGenerator<AgentEvent> {
  const repository = getConversationRepository();
  let answer = "";
  let lastTool: string | undefined;
  let pendingApproval = conversation.pendingApproval;

  for await (const event of createStream(conversation)) {
    if (event.type === "delta") answer += event.text;
    if (event.type === "tool") lastTool = event.name;
    if (event.type === "approval") pendingApproval = event.approval;
    yield event;
  }

  conversation.pendingApproval = pendingApproval;
  if (answer.trim()) {
    const message: ChatMessage = {
      id: randomUUID(),
      role: "assistant",
      content: answer.trim(),
      createdAt: new Date().toISOString(),
      toolName: lastTool,
    };
    conversation.messages.push(message);
    conversation.pendingApproval = undefined;
    conversation.updatedAt = message.createdAt;
    await repository.save(conversation);
    yield { type: "done", message };
  } else {
    conversation.updatedAt = new Date().toISOString();
    await repository.save(conversation);
  }
}

export async function* sendMessage(conversation: Conversation, prompt: string): AsyncGenerator<AgentEvent> {
  const config = getConfig();
  if (config.GENERATION_ENABLED !== "true") throw new Error("Agent generation is temporarily disabled");

  const userMessage: ChatMessage = {
    id: randomUUID(),
    role: "user",
    content: prompt,
    createdAt: new Date().toISOString(),
  };
  conversation.messages.push(userMessage);
  if (conversation.messages.length === 1) conversation.title = prompt.slice(0, 52);
  conversation.updatedAt = userMessage.createdAt;
  await getConversationRepository().save(conversation);

  const factory: AgentStreamFactory = config.AGENT_PROVIDER === "foundry"
    ? (item) => runFoundryAgent(prompt, item)
    : (item) => runOfflineAgent(prompt, item);
  yield* persistAgentStream(conversation, factory);
}

export async function* resolveApproval(
  conversation: Conversation,
  approved: boolean,
): AsyncGenerator<AgentEvent> {
  const provider = getConfig().AGENT_PROVIDER;
  const factory: AgentStreamFactory = provider === "foundry"
    ? (item) => approveFoundryTool(item, approved)
    : (item) => approveOfflineTool(item, approved);
  yield* persistAgentStream(conversation, factory);
}
