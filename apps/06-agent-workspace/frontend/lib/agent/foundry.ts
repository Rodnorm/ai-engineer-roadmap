import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import { getConfig } from "../config";
import type { AgentEvent, Conversation, PendingApproval } from "../types";

function clients() {
  const config = getConfig();
  if (!config.AZURE_AI_PROJECT_ENDPOINT || !config.AZURE_AI_AGENT_NAME) {
    throw new Error("Foundry is selected but its project endpoint or agent name is missing");
  }
  const project = new AIProjectClient(config.AZURE_AI_PROJECT_ENDPOINT, new DefaultAzureCredential());
  return { openai: project.getOpenAIClient(), agentName: config.AZURE_AI_AGENT_NAME };
}

function approvalFromItem(item: Record<string, unknown>, responseId?: string): PendingApproval | undefined {
  if (item.type !== "mcp_approval_request" || typeof item.id !== "string") return undefined;
  let args: Record<string, unknown> = {};
  if (typeof item.arguments === "string") {
    try { args = JSON.parse(item.arguments) as Record<string, unknown>; } catch { args = {}; }
  } else if (item.arguments && typeof item.arguments === "object") {
    args = item.arguments as Record<string, unknown>;
  }
  return {
    id: item.id,
    toolName: typeof item.name === "string" ? item.name : "MCP tool",
    arguments: args,
    providerResponseId: responseId,
  };
}

async function* mapFoundryStream(stream: AsyncIterable<unknown>): AsyncGenerator<AgentEvent> {
  let responseId: string | undefined;
  for await (const rawEvent of stream) {
    const event = rawEvent as Record<string, unknown>;
    const response = event.response as Record<string, unknown> | undefined;
    if (typeof response?.id === "string") responseId = response.id;

    if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
      yield { type: "delta", text: event.delta };
    }
    if (event.type === "response.output_item.added") {
      const item = event.item as Record<string, unknown> | undefined;
      if (item?.type === "mcp_call" && typeof item.name === "string") {
        yield { type: "tool", name: item.name, status: "running" };
      }
    }
    if (event.type === "response.output_item.done") {
      const item = event.item as Record<string, unknown> | undefined;
      const approval = item ? approvalFromItem(item, responseId) : undefined;
      if (approval) yield { type: "approval", approval };
      if (item?.type === "mcp_call" && typeof item.name === "string") {
        yield { type: "tool", name: item.name, status: "completed" };
      }
    }
  }
}

export const FOUNDRY_AGENT_INSTRUCTIONS = [
  "You are Agent Workspace, a concise assistant for workspace notes and tasks.",
  "Use only the MCP tools when workspace data is required.",
  "Never invent task or note contents.",
  "Every MCP call requires user approval. Explain why a tool is needed.",
  "For create_task, copy the approved title and description exactly and set confirmed to true.",
  "CRITICAL INSTRUCTION - LANGUAGE AND TRANSLATION:",
  "Always detect and respond in the language used by the user in the prompt (e.g. English, Portuguese, German).",
  "The workspace MCP server returns tasks and notes stored in Portuguese. When presenting these tasks, notes, or tool results to the user, you MUST ALWAYS translate their titles, descriptions, and statuses into the user's conversation language (e.g. if the user asks in English, translate Portuguese tasks and descriptions into natural, fluent English; if in German, translate into German).",
  "NEVER output raw, untranslated Portuguese task titles, descriptions, or statuses when replying to an English or German user.",
  "Translate them faithfully, keeping all numbers, dates, and proper names accurate.",
].join(" ");

export async function* runFoundryAgent(
  prompt: string,
  conversation: Conversation,
): AsyncGenerator<AgentEvent> {
  const { openai, agentName } = clients();
  let providerConversationId = conversation.providerConversationId;
  if (!providerConversationId) {
    const providerConversation = await openai.conversations.create();
    providerConversationId = providerConversation.id;
    conversation.providerConversationId = providerConversationId;
  }

  const stream = await openai.responses.create(
    {
      conversation: providerConversationId,
      input: prompt,
      instructions: FOUNDRY_AGENT_INSTRUCTIONS,
      stream: true,
    },
    { body: { agent_reference: { name: agentName, type: "agent_reference" } } },
  );
  yield* mapFoundryStream(stream as AsyncIterable<unknown>);
}

export async function* approveFoundryTool(
  conversation: Conversation,
  approved: boolean,
): AsyncGenerator<AgentEvent> {
  const pending = conversation.pendingApproval;
  if (!pending?.providerResponseId) throw new Error("Foundry approval context is missing");
  const { openai, agentName } = clients();
  const stream = await openai.responses.create(
    {
      input: [{
        type: "mcp_approval_response",
        approval_request_id: pending.id,
        approve: approved,
      }],
      previous_response_id: pending.providerResponseId,
      instructions: FOUNDRY_AGENT_INSTRUCTIONS,
      stream: true,
    },
    { body: { agent_reference: { name: agentName, type: "agent_reference" } } },
  );
  yield* mapFoundryStream(stream as AsyncIterable<unknown>);
}
