import assert from "node:assert/strict";
import test from "node:test";
import { WorkspaceStore } from "../src/store.js";
import { callWorkspaceTool } from "../src/tools.js";
import type { WorkspaceData } from "../src/types.js";

function store(): WorkspaceStore {
  const data: WorkspaceData = {
    tasks: [
      { id: "1", title: "Open item", description: "", status: "open", createdAt: "2026-01-01T00:00:00Z" },
      { id: "2", title: "Done item", description: "", status: "done", createdAt: "2026-01-01T00:00:00Z" },
    ],
    notes: [{ id: "1", title: "Coolify", content: "Deploy with Docker", tags: ["hosting"] }],
  };
  return new WorkspaceStore(undefined, data);
}

test("list_tasks filters by status", async () => {
  const result = await callWorkspaceTool("list_tasks", { status: "open" }, store()) as { count: number };
  assert.equal(result.count, 1);
});

test("search_notes matches note content", async () => {
  const result = await callWorkspaceTool("search_notes", { query: "docker" }, store()) as { count: number };
  assert.equal(result.count, 1);
});

test("create_task requires explicit confirmation", async () => {
  await assert.rejects(() => callWorkspaceTool("create_task", { title: "Unsafe" }, store()));
});

test("create_task creates a confirmed task", async () => {
  const result = await callWorkspaceTool("create_task", { title: "Ship App 06", confirmed: true }, store()) as { created: boolean };
  assert.equal(result.created, true);
});
