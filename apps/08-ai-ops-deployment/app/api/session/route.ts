import { NextResponse } from "next/server";
import { getOrCreateOwnerId } from "@/lib/session/user-session";
import { deploymentRepository } from "@/lib/session/deployment-repository";
import { isDeployEnabled } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ownerId = await getOrCreateOwnerId();
    const state = deploymentRepository.getOrCreate(ownerId);
    const metrics = deploymentRepository.getMetrics(ownerId);

    return NextResponse.json({
      success: true,
      ownerId,
      policy: state.policy,
      telemetry: state.telemetry.slice(0, 25),
      incidents: state.incidents,
      metrics,
      deployEnabled: isDeployEnabled(),
      mode: process.env.APP_MODE || "offline",
    });
  } catch (error) {
    console.error("[Session API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load session state" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const ownerId = await getOrCreateOwnerId();
    deploymentRepository.reset(ownerId);
    const state = deploymentRepository.getOrCreate(ownerId);
    const metrics = deploymentRepository.getMetrics(ownerId);

    return NextResponse.json({
      success: true,
      message: "Session telemetry and policies reset successfully",
      policy: state.policy,
      metrics,
    });
  } catch (error) {
    console.error("[Session Reset Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset session" },
      { status: 500 }
    );
  }
}
