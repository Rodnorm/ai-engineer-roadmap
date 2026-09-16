import { getConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getConfig();
  return Response.json({
    status: "healthy",
    service: "app-06-web",
    provider: config.AGENT_PROVIDER,
    persistence: config.COSMOS_ENDPOINT ? "cosmos" : "memory",
  });
}
