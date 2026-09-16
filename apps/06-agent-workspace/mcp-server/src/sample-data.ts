import type { WorkspaceData } from "./types.js";

export const sampleWorkspace: WorkspaceData = {
  tasks: [
    {
      id: "task-1",
      title: "Review App 06 architecture",
      description: "Confirm the Foundry, MCP, streaming, and persistence boundaries.",
      status: "open",
      createdAt: "2026-09-16T08:00:00.000Z",
    },
    {
      id: "task-2",
      title: "Prepare Coolify deployment",
      description: "Create the web and MCP services with health checks.",
      status: "open",
      createdAt: "2026-09-16T08:05:00.000Z",
    },
    {
      id: "task-3",
      title: "Define the MCP tools",
      description: "Keep the first tool set deliberately small.",
      status: "done",
      createdAt: "2026-09-16T08:10:00.000Z",
    },
  ],
  notes: [
    {
      id: "note-1",
      title: "App 06 scope",
      content: "Agent Workspace uses Next.js, Microsoft Foundry Agent Service, a Node MCP server, Cosmos DB, and a streaming chat interface.",
      tags: ["architecture", "app-06"],
    },
    {
      id: "note-2",
      title: "Deployment convention",
      content: "Roadmap applications run on Hetzner through Coolify. Public services use HTTPS subdomains and secrets stay in Coolify.",
      tags: ["deployment", "coolify"],
    },
    {
      id: "note-3",
      title: "Safety baseline",
      content: "Write tools require explicit confirmation. Prompts and secrets are not logged. Public demos use quotas and a generation kill switch.",
      tags: ["security", "guardrails"],
    },
  ],
};
