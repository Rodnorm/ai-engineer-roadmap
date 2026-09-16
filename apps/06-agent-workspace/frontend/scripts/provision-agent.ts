import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.AZURE_AI_PROJECT_ENDPOINT;
const model = process.env.AZURE_AI_MODEL_DEPLOYMENT_NAME;
const serverUrl = process.env.PUBLIC_MCP_SERVER_URL;
const agentName = process.env.AZURE_AI_AGENT_NAME ?? "agent-workspace";

if (!endpoint || !model || !serverUrl) {
  throw new Error("AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT_NAME, and PUBLIC_MCP_SERVER_URL are required");
}

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
  ].join(" "),
  tools: [tool],
});

console.log(`Created ${agent.name} version ${agent.version}. Set AZURE_AI_AGENT_NAME=${agent.name} in the web service.`);
