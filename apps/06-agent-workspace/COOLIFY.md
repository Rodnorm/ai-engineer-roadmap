# App 06 deployment with Coolify

Deploy App 06 as two independent services from the same GitHub repository. Keep ports `3006` and `8006` private; Coolify's proxy publishes only the configured HTTPS domains.

## 1. MCP service

Create a Dockerfile application with:

- Branch: `main` after the App 06 PR is merged
- Base directory: `/apps/06-agent-workspace/mcp-server`
- Dockerfile: `/Dockerfile`
- Port: `8006`
- Health path: `/health`
- Domain: `https://mcp-app06.<your-domain>`
- Persistent volume: `/data`

Runtime variables:

```dotenv
PORT=8006
HOST=0.0.0.0
ALLOWED_HOSTS=mcp-app06.<your-domain>,mcp,localhost,127.0.0.1
WORKSPACE_DATA_FILE=/data/workspace.json
INTERNAL_API_TOKEN=<random-long-secret>
MCP_API_KEY=<optional-random-long-secret>
```

If `MCP_API_KEY` is set, configure a Foundry remote-tool project connection that sends the same value as the `x-mcp-api-key` header. Put the resulting connection name in `AZURE_AI_MCP_CONNECTION_NAME` when provisioning the agent.

Verify:

```bash
curl https://mcp-app06.<your-domain>/health
```

## 2. Provision the Foundry agent

From `apps/06-agent-workspace/frontend`, authenticate with Azure CLI or export service-principal variables, then run:

```bash
AZURE_AI_PROJECT_ENDPOINT="https://<account>.services.ai.azure.com/api/projects/<project>" \
AZURE_AI_MODEL_DEPLOYMENT_NAME="<model-deployment>" \
AZURE_AI_AGENT_NAME="agent-workspace" \
PUBLIC_MCP_SERVER_URL="https://mcp-app06.<your-domain>/mcp" \
AZURE_AI_MCP_CONNECTION_NAME="<optional-connection-name>" \
npm run provision:agent
```

The script prints the agent name required by the web service.

## 3. Web service

Create a second Dockerfile application with:

- Branch: `main`
- Base directory: `/apps/06-agent-workspace/frontend`
- Dockerfile: `/Dockerfile`
- Port: `3006`
- Health path: `/api/health`
- Domain: `https://app06.<your-domain>`

Required runtime variables:

```dotenv
AGENT_PROVIDER=foundry
GENERATION_ENABLED=true
REQUESTS_PER_MINUTE=20
MAX_CONCURRENT_REQUESTS=2

MCP_SERVER_URL=https://mcp-app06.<your-domain>
INTERNAL_API_TOKEN=<same-internal-secret>

AZURE_AI_PROJECT_ENDPOINT=https://<account>.services.ai.azure.com/api/projects/<project>
AZURE_AI_AGENT_NAME=agent-workspace
AZURE_TENANT_ID=<service-principal-tenant>
AZURE_CLIENT_ID=<service-principal-client>
AZURE_CLIENT_SECRET=<service-principal-secret>

COSMOS_ENDPOINT=https://<account>.documents.azure.com:443/
COSMOS_KEY=<optional-key-if-not-using-Entra-ID>
COSMOS_DATABASE_NAME=agent-workspace
COSMOS_CONTAINER_NAME=conversations
```

Keep every secret as a Coolify runtime-only variable. Do not expose it as a build argument or a `NEXT_PUBLIC_*` value.

## 4. Final checks

1. `GET https://mcp-app06.<your-domain>/health` returns `healthy`.
2. `GET https://app06.<your-domain>/api/health` reports `provider: foundry` and `persistence: cosmos`.
3. A read prompt produces streamed text after approving the MCP call.
4. A create-task prompt pauses and shows the exact arguments.
5. The conversation remains available after redeploying the web service.
6. Coolify logs contain no prompt contents, tokens, keys, or raw Azure payloads.
