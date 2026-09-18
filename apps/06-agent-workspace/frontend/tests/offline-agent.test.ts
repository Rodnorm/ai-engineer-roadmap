import assert from "node:assert/strict";
import test from "node:test";
import { runOfflineAgent } from "../lib/agent/offline";
import type { AgentEvent, Conversation } from "../lib/types";

function conversation(): Conversation {
  return {
    id: "conversation-1",
    ownerId: "owner-1",
    title: "Test",
    messages: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

async function collect(iterable: AsyncGenerator<AgentEvent>): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const event of iterable) events.push(event);
  return events;
}

test("create task requests approval before calling a tool", async () => {
  const events = await collect(runOfflineAgent("Create a task to ship App 06", conversation()));
  assert.equal(events.length, 1);
  assert.equal(events[0]?.type, "approval");
  if (events[0]?.type === "approval") {
    assert.equal(events[0].approval.toolName, "create_task");
    assert.equal(events[0].approval.arguments.confirmed, true);
  }
});

test("task question calls list_tasks and streams an answer", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    result: { tasks: [{ title: "Verify deployment", description: "Check health endpoints" }] },
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const events = await collect(runOfflineAgent("Which tasks are open?", conversation()));
    assert.ok(events.some((event) => event.type === "tool" && event.name === "list_tasks"));
    assert.ok(events.filter((event) => event.type === "delta").map((event) => event.type === "delta" ? event.text : "").join("").includes("Verify deployment"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Portuguese create task requests approval with cleaned title", async () => {
  const events = await collect(runOfflineAgent("Crie uma tarefa para organizar o onboarding dos novos contratados", conversation()));
  assert.equal(events.length, 1);
  assert.equal(events[0]?.type, "approval");
  if (events[0]?.type === "approval") {
    assert.equal(events[0].approval.toolName, "create_task");
    assert.equal(events[0].approval.arguments.title, "Organizar o onboarding dos novos contratados");
    assert.equal(events[0].approval.arguments.confirmed, true);
  }
});

test("update task requests approval to mark task done", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    result: { tasks: [{ id: "task-1", title: "Triagem técnica", description: "Test", status: "open" }] },
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const events = await collect(runOfflineAgent("Concluir a tarefa de triagem técnica", conversation()));
    const approvalEvent = events.find((e) => e.type === "approval");
    assert.ok(approvalEvent && approvalEvent.type === "approval");
    if (approvalEvent && approvalEvent.type === "approval") {
      assert.equal(approvalEvent.approval.toolName, "update_task");
      assert.equal(approvalEvent.approval.arguments.id, "task-1");
      assert.equal(approvalEvent.approval.arguments.status, "done");
      assert.equal(approvalEvent.approval.arguments.confirmed, true);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("cria uma tarefa nova strips prefix cleanly", async () => {
  const events = await collect(runOfflineAgent("cria uma tarefa nova: limpar a casa", conversation()));
  assert.equal(events.length, 1);
  assert.equal(events[0]?.type, "approval");
  if (events[0]?.type === "approval") {
    assert.equal(events[0].approval.toolName, "create_task");
    assert.equal(events[0].approval.arguments.title, "Limpar a casa");
  }
});

test("casual message returns friendly help without invoking list_tasks", async () => {
  const events = await collect(runOfflineAgent("Olá, tudo bem?", conversation()));
  assert.ok(!events.some((e) => e.type === "tool"));
  const text = events.filter((e) => e.type === "delta").map((e) => e.type === "delta" ? e.text : "").join("");
  assert.ok(text.includes("modo offline"));
});

test("task question in Portuguese formats status as aberta and Portuguese header", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    result: { tasks: [{ title: "Concluir triagem técnica de candidatos para vaga de Tech Lead", description: "Avaliar os currículos", status: "open" }] },
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const events = await collect(runOfflineAgent("Quais tarefas de RH estão abertas?", conversation()));
    const text = events.filter((e) => e.type === "delta").map((e) => e.type === "delta" ? e.text : "").join("");
    assert.ok(text.includes("[aberta]"));
    assert.ok(text.includes("Aqui estão as tarefas encontradas"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("detectPromptLanguage identifies English, German, and Portuguese accurately", async () => {
  const { detectPromptLanguage, formatFoundryPrompt } = await import("../lib/agent/foundry");

  assert.equal(detectPromptLanguage("Which HR tasks are still open?"), "en");
  assert.equal(detectPromptLanguage("What is the status of the onboarding task?"), "en");
  assert.equal(detectPromptLanguage("Welche HR-Aufgaben sind noch offen?"), "de");
  assert.equal(detectPromptLanguage("Quais tarefas de RH ainda estão em aberto?"), "pt");

  const enPrompt = formatFoundryPrompt("Which HR tasks are still open?");
  assert.ok(enPrompt.includes("[SYSTEM MANDATE - LANGUAGE: ENGLISH]"));
  assert.ok(enPrompt.includes("NEVER switch to Portuguese"));
  assert.ok(enPrompt.includes("User query: Which HR tasks are still open?"));

  const dePrompt = formatFoundryPrompt("Welche HR-Aufgaben sind noch offen?");
  assert.ok(dePrompt.includes("[SYSTEMMANDAT - SPRACHE: DEUTSCH]"));

  const ptPrompt = formatFoundryPrompt("Quais tarefas de RH ainda estão em aberto?");
  assert.ok(ptPrompt.includes("[DIRETRIZ DE IDIOMA: PORTUGUÊS]"));
});
