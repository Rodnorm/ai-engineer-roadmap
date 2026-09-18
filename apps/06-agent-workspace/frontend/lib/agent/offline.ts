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

type Language = "pt" | "en" | "de";

function detectLanguage(prompt: string): Language {
  const lower = prompt.toLowerCase();
  if (/\b(welche|aufgaben|offen|erledigt|suche|notizen|bitte|erstellen|hallo|guten|zeigen)\b/.test(lower)) {
    return "de";
  }
  if (
    /\b(which|tasks?|open|done|closed|search|find|please|notes?|what|show|list|completed)\b/.test(lower) &&
    !/\b(tarefa|aberta|conclu|quais|quaisquer|pesquise|procure|favor|mostrar|listar|notas?)\b/.test(lower)
  ) {
    return "en";
  }
  return "pt";
}

interface TranslatedTaskInfo {
  title: string;
  description?: string;
}

const TASK_TRANSLATIONS: Record<string, Record<Language, TranslatedTaskInfo>> = {
  "Concluir triagem técnica de candidatos para vaga de Tech Lead": {
    pt: {
      title: "Concluir triagem técnica de candidatos para vaga de Tech Lead",
      description: "Avaliar os 8 currículos finalistas com o time de engenharia e encaminhar os 3 mais aderentes para entrevista com o CTO.",
    },
    en: {
      title: "Complete technical candidate screening for Tech Lead role",
      description: "Evaluate the 8 finalist resumes with engineering and forward the 3 most qualified for interview with the CTO.",
    },
    de: {
      title: "Technisches Kandidaten-Screening für Tech-Lead-Position abschließen",
      description: "Die 8 Finalisten-Lebensläufe mit dem Engineering-Team bewerten und die 3 am besten geeigneten an den CTO weiterleiten.",
    },
  },
  "Organizar onboarding dos 4 novos colaboradores de outubro": {
    pt: {
      title: "Organizar onboarding dos 4 novos colaboradores de outubro",
      description: "Verificar liberação de notebooks e acessos com TI, agendar sessões de boas-vindas e despachar kits institucionais.",
    },
    en: {
      title: "Organize onboarding for the 4 new October hires",
      description: "Verify notebook and access provisioning with IT, schedule welcome sessions, and dispatch welcome kits.",
    },
    de: {
      title: "Onboarding für die 4 neuen Oktober-Mitarbeiter organisieren",
      description: "Notebook- und Zugangsfreigabe mit der IT prüfen, Willkommenssitzungen planen und Willkommenspakete versenden.",
    },
  },
  "Consolidar resultados da Pesquisa de Clima Organizacional (Q3)": {
    pt: {
      title: "Consolidar resultados da Pesquisa de Clima Organizacional (Q3)",
      description: "Montar apresentação executiva com os indicadores de eNPS, principais pontos de atenção e plano de ação por departamento.",
    },
    en: {
      title: "Consolidate Q3 Organizational Climate Survey results",
      description: "Prepare executive presentation with eNPS metrics, main attention points, and action plan by department.",
    },
    de: {
      title: "Ergebnisse der Mitarbeiterbefragung (Q3) konsolidieren",
      description: "Vorstandspräsentation mit eNPS-Kennzahlen, wichtigsten Schwerpunkten und Aktionsplan pro Abteilung erstellen.",
    },
  },
  "Revisar proposta de reajuste de benefícios flexíveis": {
    pt: {
      title: "Revisar proposta de reajuste de benefícios flexíveis",
      description: "Analisar cotações de convênios de saúde e opções de cartão multibenefícios para apresentação à diretoria.",
    },
    en: {
      title: "Review flexible benefits adjustment proposal",
      description: "Analyze health insurance quotes and multi-benefit card options for board presentation.",
    },
    de: {
      title: "Vorschlag zur Anpassung der flexiblen Zusatzleistungen prüfen",
      description: "Angebote für Krankenversicherungen und Mehrfach-Leistungskarten für die Geschäftsleitung analysieren.",
    },
  },
  "Agendar exames médicos periódicos pendentes (PCMSO)": {
    pt: {
      title: "Agendar exames médicos periódicos pendentes (PCMSO)",
      description: "Notificar colaboradores do setor de operações com exames admissionais/periódicos a vencer no final do mês.",
    },
    en: {
      title: "Schedule pending periodic medical examinations (PCMSO)",
      description: "Notify operations department employees with periodic medical examinations expiring at the end of the month.",
    },
    de: {
      title: "Ausstehende arbeitsmedizinische Vorsorgeuntersuchungen planen (PCMSO)",
      description: "Mitarbeiter im operativen Bereich mit ausstehenden Vorsorgeuntersuchungen zum Monatsende benachrichtigen.",
    },
  },
  "Divulgar comunicados internos sobre o novo canal de Ouvidoria": {
    pt: {
      title: "Divulgar comunicados internos sobre o novo canal de Ouvidoria",
      description: "Publicar guia no portal interno e disparar newsletter explicando as diretrizes de sigilo e acolhimento.",
    },
    en: {
      title: "Publish internal communications regarding the new Ombudsman channel",
      description: "Publish guide on the internal portal and dispatch newsletter detailing confidentiality and support guidelines.",
    },
    de: {
      title: "Interne Mitteilung über den neuen Beschwerdekanal veröffentlichen",
      description: "Leitfaden im internen Portal veröffentlichen und Newsletter mit Vertraulichkeits- und Richtlinien versenden.",
    },
  },
};

function translateStatus(status: string, lang: Language): string {
  if (lang === "pt") return status === "done" ? "concluída" : "aberta";
  if (lang === "de") return status === "done" ? "erledigt" : "offen";
  return status === "done" ? "done" : "open";
}

function translateTask(task: { title: string; description?: string }, lang: Language): { title: string; description?: string } {
  const match = TASK_TRANSLATIONS[task.title]?.[lang];
  if (match) return match;
  return task;
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
    const lang = detectLanguage(prompt);
    const answer = result.tasks?.length
      ? (lang === "pt"
          ? `Aqui estão as tarefas encontradas no workspace:\n\n${result.tasks.map((task) => {
              const translated = translateTask(task, lang);
              return `• [${translateStatus(task.status, lang)}] ${translated.title}${translated.description ? ` — ${translated.description}` : ""}`;
            }).join("\n")}`
          : lang === "de"
          ? `Hier sind die passenden Aufgaben im Workspace:\n\n${result.tasks.map((task) => {
              const translated = translateTask(task, lang);
              return `• [${translateStatus(task.status, lang)}] ${translated.title}${translated.description ? ` — ${translated.description}` : ""}`;
            }).join("\n")}`
          : `Here are the matching tasks in the workspace:\n\n${result.tasks.map((task) => {
              const translated = translateTask(task, lang);
              return `• [${translateStatus(task.status, lang)}] ${translated.title}${translated.description ? ` — ${translated.description}` : ""}`;
            }).join("\n")}`)
      : (lang === "pt"
          ? "Nenhuma tarefa correspondente foi encontrada no workspace."
          : lang === "de"
          ? "Es wurden keine passenden Aufgaben im Workspace gefunden."
          : "There are no matching tasks in the workspace.");
    yield* streamText(answer);
    return;
  }

  const lang = detectLanguage(prompt);
  if (lang === "de") {
    yield* streamText(
      "Hallo! Ich bin im Offline-Modus des Agent Workspace. Ich kann Ihnen bei Notizen und HR-Aufgaben helfen.\n\n" +
      "Versuchen Sie zu fragen:\n" +
      "• \"Welche Aufgaben sind noch offen?\"\n" +
      "• \"Suche Notizen über Zusatzleistungen und Richtlinien\"\n" +
      "• \"Erstelle eine Aufgabe für das Onboarding neuer Mitarbeiter\""
    );
  } else if (lang === "en") {
    yield* streamText(
      "Hello! I am running in Agent Workspace offline mode. I can assist you with workspace notes and HR tasks.\n\n" +
      "Try asking:\n" +
      "• \"Which HR tasks are still open?\"\n" +
      "• \"Search notes about flexible benefits policy\"\n" +
      "• \"Create a task to organize onboarding for new hires\"\n" +
      "• \"Complete the technical candidate screening task\""
    );
  } else {
    yield* streamText(
      "Olá! Estou no modo offline do Agent Workspace. Posso ajudar você a consultar notas e gerenciar tarefas de RH.\n\n" +
      "Experimente pedir:\n" +
      "• \"Quais tarefas de RH ainda estão em aberto?\"\n" +
      "• \"Pesquise as notas sobre política de benefícios e convênios\"\n" +
      "• \"Crie uma tarefa para organizar o onboarding dos novos contratados\"\n" +
      "• \"Concluir a tarefa de triagem técnica de candidatos\""
    );
  }
}

export async function* approveOfflineTool(
  conversation: Conversation,
  approved: boolean,
): AsyncGenerator<AgentEvent> {
  const pending = conversation.pendingApproval;
  if (!pending) throw new Error("There is no pending approval");
  if (!approved) {
    yield* streamText("Ação cancelada. Nenhum dado do workspace foi alterado.");
    return;
  }

  yield { type: "tool", name: pending.toolName, status: "running" };
  const result = await callMcpTool(pending.toolName, pending.arguments) as {
    task?: { title?: string; status?: string };
  };
  yield { type: "tool", name: pending.toolName, status: "completed" };
  if (pending.toolName === "update_task") {
    yield* streamText(`Tarefa atualizada com sucesso: "${result.task?.title ?? "Tarefa"}" (status: ${result.task?.status === "done" ? "concluída" : "aberta"}).`);
  } else {
    yield* streamText(`Tarefa criada com sucesso: "${result.task?.title ?? "Nova tarefa"}".`);
  }
}
