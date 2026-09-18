import { randomUUID } from "node:crypto";
import { callMcpTool } from "../mcp-client";
import type { AgentEvent, Conversation, PendingApproval } from "../types";

function chunks(text: string): string[] {
  return text.match(/.{1,24}(?:\s|$)/g) ?? [text];
}

function cleanTaskTitle(prompt: string): string {
  const cleaned = prompt
    .replace(/^(por\s+favor\s*,?\s*)?(cria|crie|criar|adicione|adicionar|nova|novo)\s+(uma\s+|o\s+|a\s+)?(tarefa|task)?\s*(nova|novo)?\s*(para|de|:|-)?\s*/i, "")
    .replace(/^(please\s+)?(create|add|make)\s+(a\s+)?(new\s+)?task\s*(to|for|:|-)?\s*/i, "")
    .trim()
    .slice(0, 120);
  if (!cleaned) return "Nova tarefa";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function isCreateTaskIntent(normalized: string): boolean {
  return (
    /\b(create|add|make)\b.*\btask\b|\btask\b.*\b(create|add|make)\b/i.test(normalized) ||
    /\b(cria|crie|criar|adicione|adicionar|nova|novo)\b.*\btarefa\b|\btarefa\b.*\b(cria|crie|criar|adicione|adicionar|nova|novo)\b/i.test(normalized)
  );
}

function isUpdateTaskIntent(normalized: string): boolean {
  return (
    /\b(update|edit|complete|finish|close|done|mark)\b.*\btask\b|\btask\b.*\b(update|edit|complete|finish|close|done|mark)\b/i.test(normalized) ||
    /\b(atualizar|atualize|editar|edite|concluir|conclua|finalizar|finalize|fechar|feche|marcar|marque)\b.*\btarefa\b|\btarefa\b.*\b(atualizar|atualize|editar|edite|concluir|conclua|concluida|concluído|feita|finalizada|fechar)\b/i.test(normalized)
  );
}

function isListTasksIntent(normalized: string): boolean {
  return (
    /\b(list|show|get|which|what|view|all)\b.*\btasks?\b|\btasks?\b.*\b(list|show|open|done|status)\b/i.test(normalized) ||
    /\b(listar|quais|mostrar|mostre|ver|veja|todas|exibir|exiba)\b.*\btarefas?\b|\btarefas?\b.*\b(abertas?|conclu[ií]das?|pendentes?|feitas?|finalizadas?|status|todas|lista|existentes?)\b/i.test(normalized) ||
    /^(tarefas|tasks)$/i.test(normalized.trim())
  );
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

  if (isCreateTaskIntent(normalized)) {
    const approval: PendingApproval = {
      id: randomUUID(),
      toolName: "create_task",
      arguments: { title: cleanTaskTitle(prompt), confirmed: true },
    };
    yield { type: "approval", approval };
    return;
  }

  if (isUpdateTaskIntent(normalized)) {
    yield { type: "tool", name: "list_tasks", status: "running" };
    const listResult = await callMcpTool("list_tasks", {}) as {
      tasks?: Array<{ id: string; title: string; description: string; status: "open" | "done" }>;
    };
    yield { type: "tool", name: "list_tasks", status: "completed" };
    const tasks = listResult.tasks ?? [];

    let targetTask = tasks.find((task) =>
      normalized.includes(task.id.toLocaleLowerCase()) ||
      normalized.includes(`tarefa ${task.id.toLocaleLowerCase()}`) ||
      normalized.includes(`task ${task.id.toLocaleLowerCase()}`),
    );

    if (!targetTask) {
      targetTask = tasks.find((task) => {
        const titleLower = task.title.toLocaleLowerCase();
        if (normalized.includes(titleLower)) return true;
        const words = titleLower.split(/\s+/).filter((word) => word.length > 4);
        return words.some((word) => normalized.includes(word));
      });
    }

    if (!targetTask) {
      targetTask = tasks.find((task) => task.status === "open") ?? tasks[0];
    }

    if (!targetTask) {
      yield* streamText("Não foram encontradas tarefas no workspace para atualizar.");
      return;
    }

    const isMarkDone = /\b(concluir|conclua|finalizar|finalize|fechar|feche|marcar|marque|complete|finish|done|close)\b/.test(normalized);
    const isReopen = /\b(reabrir|reabra|abrir|abra|reopen)\b/.test(normalized);
    const newStatus = isMarkDone ? "done" : isReopen ? "open" : undefined;

    const newTitleMatch = prompt.match(/(?:para|to|como|novo título:?)\s+["']?([^"'\n]+)["']?$/i);
    const newTitle = newTitleMatch && !isMarkDone ? newTitleMatch[1].trim() : undefined;

    const approval: PendingApproval = {
      id: randomUUID(),
      toolName: "update_task",
      arguments: {
        id: targetTask.id,
        title: newTitle ?? targetTask.title,
        status: newStatus ?? targetTask.status,
        confirmed: true,
      },
    };
    yield { type: "approval", approval };
    return;
  }

  if (
    /note|search|find|documentation|security/.test(normalized) ||
    /nota|pesquis|procur|busc|consult|documenta|beneficio|onboarding|clima|lgpd|politica/.test(normalized)
  ) {
    yield { type: "tool", name: "search_notes", status: "running" };
    let query = "rh";
    if (normalized.includes("secur") || normalized.includes("segur") || normalized.includes("lgpd")) query = "segurança";
    else if (normalized.includes("onboard")) query = "onboarding";
    else if (normalized.includes("benefic")) query = "beneficios";
    else if (normalized.includes("recrut") || normalized.includes("vaga") || normalized.includes("entrevist")) query = "recrutamento";
    else if (normalized.includes("desemp") || normalized.includes("clima") || normalized.includes("pdi") || normalized.includes("feedback")) query = "desempenho";
    else if (normalized.includes("polit")) query = "politicas";
    else {
      const extracted = prompt
        .replace(/^(por\s+favor\s*,?\s*)?(pesquise|pesquisar|procure|procurar|busque|buscar|consulte|consultar)\s+(as\s+|os\s+)?(notas?|documenta\w*)\s*(sobre|em\s+busca\s+de|com\s+a\s+tag|de|:)?\s*/i, "")
        .replace(/^(please\s+)?(search|find)\s+(the\s+)?notes?\s*(for|about|with\s+tag|:)?\s*/i, "")
        .trim();
      query = extracted || "rh";
    }

    const result = await callMcpTool("search_notes", { query }) as { notes?: Array<{ title: string; content: string }> };
    yield { type: "tool", name: "search_notes", status: "completed" };
    const answer = result.notes?.length
      ? result.notes.map((note) => `${note.title}: ${note.content}`).join("\n\n")
      : "I could not find a matching workspace note.";
    yield* streamText(answer);
    return;
  }

  if (isListTasksIntent(normalized)) {
    yield { type: "tool", name: "list_tasks", status: "running" };
    const isDoneFilter =
      normalized.includes("done") ||
      normalized.includes("conclu") ||
      normalized.includes("feita") ||
      normalized.includes("finalizada");
    const isOpenFilter =
      normalized.includes("open") ||
      normalized.includes("aberto") ||
      normalized.includes("aberta") ||
      normalized.includes("pendente");

    const statusArg = isDoneFilter ? "done" : isOpenFilter ? "open" : undefined;
    const result = await callMcpTool("list_tasks", statusArg ? { status: statusArg } : {}) as {
      tasks?: Array<{ title: string; description: string; status: string }>;
    };
    yield { type: "tool", name: "list_tasks", status: "completed" };
    const answer = result.tasks?.length
      ? `Here are the matching tasks:\n\n${result.tasks.map((task) => `• [${task.status}] ${task.title}${task.description ? ` — ${task.description}` : ""}`).join("\n")}`
      : "There are no matching tasks.";
    yield* streamText(answer);
    return;
  }

  yield* streamText(
    "Olá! Estou no modo offline do Agent Workspace. Posso ajudar você a consultar notas e gerenciar tarefas de RH.\n\n" +
    "Experimente pedir:\n" +
    "• \"Quais tarefas de RH ainda estão em aberto?\"\n" +
    "• \"Pesquise as notas sobre política de benefícios e convênios\"\n" +
    "• \"Crie uma tarefa para organizar o onboarding dos novos contratados\"\n" +
    "• \"Concluir a tarefa de triagem técnica de candidatos\""
  );
}

export async function* approveOfflineTool(
  conversation: Conversation,
  approved: boolean,
): AsyncGenerator<AgentEvent> {
  const pending = conversation.pendingApproval;
  if (!pending) throw new Error("There is no pending approval");
  if (!approved) {
    yield* streamText("The action was cancelled. No workspace data was changed.");
    return;
  }

  yield { type: "tool", name: pending.toolName, status: "running" };
  const result = await callMcpTool(pending.toolName, pending.arguments) as {
    task?: { title?: string; status?: string };
  };
  yield { type: "tool", name: pending.toolName, status: "completed" };
  if (pending.toolName === "update_task") {
    yield* streamText(`Task updated: "${result.task?.title ?? "Untitled task"}" (status: ${result.task?.status ?? "updated"}).`);
  } else {
    yield* streamText(`Task created: "${result.task?.title ?? "Untitled task"}".`);
  }
}
