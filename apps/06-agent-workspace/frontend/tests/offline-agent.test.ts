import assert from "node:assert/strict";
import test from "node:test";
import { runOfflineAgent } from "../lib/agent/offline";
import type { AgentEvent, Conversation } from "../lib/types";

function conversation(): Conversation {
  return {
    id: "conversation-1",
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
