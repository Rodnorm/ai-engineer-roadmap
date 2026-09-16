import { createServer } from "node:http";
import { z } from "zod/v4";
import { initializeWorkspace, nodeMcpHandler } from "./server.js";
import { callWorkspaceTool } from "./tools.js";

const port = Number.parseInt(process.env.PORT ?? "8006", 10);
const host = process.env.HOST ?? "0.0.0.0";
const allowedHosts = new Set(
  (process.env.ALLOWED_HOSTS ?? "localhost,127.0.0.1,mcp")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

function sendJson(response: import("node:http").ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function requestHost(request: import("node:http").IncomingMessage): string {
  const hostHeader = request.headers.host ?? "";
  try {
    return new URL(`http://${hostHeader}`).hostname;
  } catch {
    return "";
  }
}

function hasValidToken(request: import("node:http").IncomingMessage, header: string, expected?: string): boolean {
  return !expected || request.headers[header] === expected;
}

async function readJson(request: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 16_384) throw new Error("Request body is too large");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

await initializeWorkspace();

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (url.pathname === "/health" && request.method === "GET") {
      sendJson(response, 200, { status: "healthy", service: "app-06-mcp" });
      return;
    }

    if (!allowedHosts.has(requestHost(request))) {
      sendJson(response, 403, { error: "Host is not allowed" });
      return;
    }

    if (url.pathname === "/internal/tools/call" && request.method === "POST") {
      if (!hasValidToken(request, "x-internal-token", process.env.INTERNAL_API_TOKEN)) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
      }
      const payload = z.object({ name: z.string(), arguments: z.unknown().optional() }).parse(await readJson(request));
      sendJson(response, 200, { result: await callWorkspaceTool(payload.name, payload.arguments ?? {}) });
      return;
    }

    if (url.pathname === "/mcp") {
      if (!hasValidToken(request, "x-mcp-api-key", process.env.MCP_API_KEY)) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
      }
      await nodeMcpHandler(request, response);
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid request" : "Request failed";
    console.error("MCP HTTP error", error instanceof Error ? error.message : String(error));
    if (!response.headersSent) sendJson(response, 400, { error: message });
    else response.end();
  }
});

server.listen(port, host, () => {
  console.error(`App 06 MCP server listening on http://${host}:${port}`);
});

function shutdown(): void {
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
