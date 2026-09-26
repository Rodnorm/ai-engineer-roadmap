import { NextResponse } from "next/server";
import { isGenerationEnabled } from "@/lib/security/rate-limiter";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "07-brief-generator",
    mode: process.env.APP_MODE || "offline",
    generationEnabled: isGenerationEnabled(),
    timestamp: new Date().toISOString(),
  });
}
