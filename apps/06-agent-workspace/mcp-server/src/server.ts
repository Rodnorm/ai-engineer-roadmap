import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { registerWorkspaceTools } from "./tools.js";
import { workspaceStore } from "./store.js";

export function createWorkspaceMcpServer(): McpServer {
  const server = new McpServer({ name: "agent-workspace", version: "0.1.0" });
  registerWorkspaceTools(server);
  return server;
}

export const mcpHandler = createMcpHandler(() => createWorkspaceMcpServer(), {
  legacy: "stateless",
  responseMode: "auto",
  onerror: (error) => console.error("MCP request failed", error.message),
});

export const nodeMcpHandler = toNodeHandler(mcpHandler, {
  onerror: (error) => console.error("MCP adapter failed", error.message),
});

export async function initializeWorkspace(): Promise<void> {
  await workspaceStore.initialize();
}
