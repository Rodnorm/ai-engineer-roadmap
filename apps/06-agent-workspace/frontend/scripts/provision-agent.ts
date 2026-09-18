import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

process.loadEnvFile?.();

async function main() {
  const endpoint = process.env.AZURE_AI_PROJECT_ENDPOINT;
  const model = process.env.AZURE_AI_MODEL_DEPLOYMENT_NAME;
  const rawServerUrl = process.env.PUBLIC_MCP_SERVER_URL;
  const agentName = process.env.AZURE_AI_AGENT_NAME ?? "agent-workspace";

  if (!endpoint || !model || !rawServerUrl) {
    throw new Error("AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT_NAME, and PUBLIC_MCP_SERVER_URL are required");
  }

  const serverUrl = rawServerUrl.replace(/\/+$/, "").endsWith("/mcp")
    ? rawServerUrl.replace(/\/+$/, "")
    : `${rawServerUrl.replace(/\/+$/, "")}/mcp`;

  const connectionName = process.env.AZURE_AI_MCP_CONNECTION_NAME;
  const tool = {
    type: "mcp" as const,
    server_label: "workspace",
    server_url: serverUrl,
    require_approval: "always" as const,
    ...(connectionName ? { project_connection_id: connectionName } : {}),
  };

  const project = new AIProjectClient(endpoint, new DefaultAzureCredential());
  const agent = await project.agents.createVersion(agentName, {
    kind: "prompt",
    model,
    instructions: [
      "You are Agent Workspace, a concise assistant for workspace notes and tasks.",
      "Use only the MCP tools when workspace data is required.",
      "Never invent task or note contents.",
      "Every MCP call requires user approval. Explain why a tool is needed.",
      "For create_task, copy the approved title and description exactly and set confirmed to true.",
      "Always communicate in the user's language.",
      "When presenting workspace tasks or notes to the user, always translate titles, descriptions, and statuses into the user's language so the information is native and natural to them.",
    ].join(" "),
    tools: [tool],
  });

  console.log(`Created ${agent.name} version ${agent.version}. Set AZURE_AI_AGENT_NAME=${agent.name} in the web service.`);
}

main().catch((error) => {
  console.error("Failed to provision agent:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
