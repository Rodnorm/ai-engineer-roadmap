import { getConfig } from "./config";

export async function callMcpTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const config = getConfig();
  const response = await fetch(`${config.MCP_SERVER_URL}/internal/tools/call`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(config.INTERNAL_API_TOKEN ? { "x-internal-token": config.INTERNAL_API_TOKEN } : {}),
    },
    body: JSON.stringify({ name, arguments: args }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MCP tool call failed with status ${response.status}`);
  return (await response.json() as { result: unknown }).result;
}
