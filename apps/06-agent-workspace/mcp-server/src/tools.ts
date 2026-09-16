import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import { WorkspaceStore, workspaceStore } from "./store.js";

export const listTasksInput = z.object({
  status: z.enum(["open", "done"]).optional().describe("Optional task status filter"),
});

export const searchNotesInput = z.object({
  query: z.string().trim().min(1).max(120).describe("Words to search for in note titles, content, and tags"),
});

export const createTaskInput = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  confirmed: z.literal(true).describe("Must be true only after the user explicitly confirms the write action"),
});

export async function callWorkspaceTool(
  name: string,
  rawArguments: unknown,
  store: WorkspaceStore = workspaceStore,
): Promise<unknown> {
  if (name === "list_tasks") {
    const { status } = listTasksInput.parse(rawArguments ?? {});
    return { tasks: store.listTasks(status), count: store.listTasks(status).length };
  }
  if (name === "search_notes") {
    const { query } = searchNotesInput.parse(rawArguments);
    const notes = store.searchNotes(query);
    return { notes, count: notes.length };
  }
  if (name === "create_task") {
    const { title, description } = createTaskInput.parse(rawArguments);
    return { task: await store.createTask(title, description), created: true };
  }
  throw new Error(`Unknown tool: ${name}`);
}

function toolResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
    structuredContent: value as Record<string, unknown>,
  };
}

export function registerWorkspaceTools(server: McpServer, store: WorkspaceStore = workspaceStore): void {
  server.registerTool(
    "list_tasks",
    {
      title: "List workspace tasks",
      description: "List the user's workspace tasks, optionally filtered by open or done status.",
      inputSchema: listTasksInput,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async (args) => toolResult(await callWorkspaceTool("list_tasks", args, store)),
  );

  server.registerTool(
    "search_notes",
    {
      title: "Search workspace notes",
      description: "Search safe sample workspace notes by title, content, or tag.",
      inputSchema: searchNotesInput,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async (args) => toolResult(await callWorkspaceTool("search_notes", args, store)),
  );

  server.registerTool(
    "create_task",
    {
      title: "Create a workspace task",
      description: "Create a task only after the user has explicitly confirmed the exact title and description.",
      inputSchema: createTaskInput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async (args) => toolResult(await callWorkspaceTool("create_task", args, store)),
  );
}
