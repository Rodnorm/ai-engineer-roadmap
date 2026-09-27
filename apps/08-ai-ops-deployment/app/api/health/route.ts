import { NextResponse } from "next/server";
import { isDeployEnabled } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  const isOnline = (process.env.APP_MODE || "offline").toLowerCase() === "online";
  const deployActive = isDeployEnabled();

  return NextResponse.json({
    status: "ok",
    app: "08-ai-ops-deployment",
    mode: isOnline ? "online" : "offline",
    deployEnabled: deployActive,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
