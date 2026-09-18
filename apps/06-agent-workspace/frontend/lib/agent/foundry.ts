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
  return {
    openai: project.getOpenAIClient(),
    agentName: config.AZURE_AI_AGENT_NAME,
    agentVersion: process.env.AZURE_AI_AGENT_VERSION,
  };
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

export type SupportedLanguage = "en" | "de" | "pt";

export function detectPromptLanguage(prompt: string): SupportedLanguage {
  const text = prompt.toLowerCase();

  const ptMatches = text.match(/\b(quais|qual|tarefa|tarefas|aberta|abertas|conclu[íi]da|conclu[íi]das|listar|pesquisar|procure|crie|ajuda|como|onde|por que|porque|est[ãa]o|est[áa]|para|sobre|notas|ol[áa]|bom dia|boa tarde|voc[êe]|feita|feitas|pendente|pendentes)\b/g);
  const deMatches = text.match(/\b(welche|welcher|welches|aufgabe|aufgaben|offen|offene|erledigt|geschlossen|suche|suchen|erstelle|erstellen|wie|wo|warum|f[üu]r|[üu]ber|notizen|hallo|guten tag|bitte|zeig|zeige|gibt es|noch|sind|ist)\b/g);
  const enMatches = text.match(/\b(which|what|task|tasks|open|completed|done|closed|search|find|create|how|where|why|for|about|notes|hello|hi|please|show|list|any|still|are|is)\b/g);

  const ptScore = ptMatches?.length ?? 0;
  const deScore = deMatches?.length ?? 0;
  const enScore = enMatches?.length ?? 0;

  if (deScore > ptScore && deScore > enScore) return "de";
  if (ptScore > enScore && ptScore > deScore) return "pt";
  return "en";
}

export function formatFoundryPrompt(prompt: string): string {
  const lang = detectPromptLanguage(prompt);

  if (lang === "en") {
    return [
      "[SYSTEM MANDATE - LANGUAGE: ENGLISH]",
      "The user communicates in ENGLISH.",
      "1. Your ENTIRE response (introductory text, lists, explanations, and concluding questions) MUST be written in 100% fluent ENGLISH.",
      "2. The workspace tools return task and note data in Portuguese. You MUST translate all task titles, descriptions, and statuses into English before presenting them.",
      "3. NEVER switch to Portuguese or output Portuguese sentences (such as 'Atualmente...', 'Quer que eu ajude...'). Output English only.",
      "",
      `User query: ${prompt}`,
    ].join("\n");
  }

  if (lang === "de") {
    return [
      "[SYSTEMMANDAT - SPRACHE: DEUTSCH]",
      "Der Benutzer kommuniziert auf DEUTSCH.",
      "1. Deine GESAMTE Antwort (Einleitung, Listen, Erläuterungen und Rückfragen) MUSS zu 100% auf DEUTSCH verfasst sein.",
      "2. Die Workspace-Tools liefern Aufgaben- und Notizdaten auf Portugiesisch. Du MUSST alle Aufgabentitel, Beschreibungen und Status ins Deutsche übersetzen.",
      "3. Wechsle NIEMALS ins Portugiesische. Antworte ausschließlich auf Deutsch.",
      "",
      `Benutzeranfrage: ${prompt}`,
    ].join("\n");
  }

  return [
    "[DIRETRIZ DE IDIOMA: PORTUGUÊS]",
    "O usuário comunica-se em PORTUGUÊS. Mantenha todas as respostas, listas e dados em português.",
    "",
    `Mensagem do usuário: ${prompt}`,
  ].join("\n");
}

export async function* runFoundryAgent(
  prompt: string,
  conversation: Conversation,
): AsyncGenerator<AgentEvent> {
  const { openai, agentName, agentVersion } = clients();
  let providerConversationId = conversation.providerConversationId;
  if (!providerConversationId) {
    const providerConversation = await openai.conversations.create();
    providerConversationId = providerConversation.id;
    conversation.providerConversationId = providerConversationId;
  }

  const agentReference: Record<string, string> = {
    name: agentName,
    type: "agent_reference",
    ...(agentVersion ? { version: agentVersion } : {}),
  };

  const stream = await openai.responses.create(
    {
      conversation: providerConversationId,
      input: formatFoundryPrompt(prompt),
      stream: true,
    },
    { body: { agent_reference: agentReference } },
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
      stream: true,
    },
    { body: { agent_reference: { name: agentName, type: "agent_reference" } } },
  );
  yield* mapFoundryStream(stream as AsyncIterable<unknown>);
}
