import { NextRequest, NextResponse } from "next/server";
import { getOrCreateOwnerId } from "@/lib/session/user-session";
import { deploymentRepository } from "@/lib/session/deployment-repository";
import { isDeployEnabled, setDeployEnabled } from "@/lib/security/rate-limiter";
import { TrafficPolicy } from "@/types/deployment";
import { z } from "zod";

export const dynamic = "force-dynamic";

const DeployActionSchema = z.object({
  action: z.enum(["update_policy", "toggle_kill_switch", "promote_green", "revert_blue", "clear_rollback"]).optional(),
  policy: z
    .object({
      mode: z.enum(["canary", "blue-green", "shadow-mirror", "maintenance"]).optional(),
      blueWeight: z.number().min(0).max(100).optional(),
      greenWeight: z.number().min(0).max(100).optional(),
      blueModel: z.string().optional(),
      greenModel: z.string().optional(),
    })
    .optional(),
  deployEnabled: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ownerId = await getOrCreateOwnerId();
    const body = await req.json().catch(() => ({}));
    const parsed = DeployActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { action, policy, deployEnabled: newDeployState } = parsed.data;

    // 1. Toggle Emergency Kill-Switch
    if (action === "toggle_kill_switch" || typeof newDeployState === "boolean") {
      const targetState = typeof newDeployState === "boolean" ? newDeployState : !isDeployEnabled();
      setDeployEnabled(targetState);
      return NextResponse.json({
        success: true,
        message: targetState ? "Deploy re-enabled" : "Emergency Kill-Switch activated: All inferences blocked",
        deployEnabled: isDeployEnabled(),
      });
    }

    // 2. Promote Green to 100% (Atomic Switch)
    if (action === "promote_green") {
      const updated = deploymentRepository.updatePolicy(ownerId, {
        mode: "blue-green",
        blueWeight: 0,
        greenWeight: 100,
        isRollbackActive: false,
        rollbackReason: undefined,
      });
      return NextResponse.json({
        success: true,
        message: "Green version successfully promoted to 100% traffic",
        policy: updated,
      });
    }

    // 3. Revert to Blue 100%
    if (action === "revert_blue") {
      const updated = deploymentRepository.updatePolicy(ownerId, {
        mode: "canary",
        blueWeight: 100,
        greenWeight: 0,
        isRollbackActive: false,
        rollbackReason: undefined,
      });
      return NextResponse.json({
        success: true,
        message: "Reverted 100% traffic to Blue baseline",
        policy: updated,
      });
    }

    // 4. Clear Rollback State
    if (action === "clear_rollback") {
      const updated = deploymentRepository.updatePolicy(ownerId, {
        isRollbackActive: false,
        rollbackReason: undefined,
      });
      return NextResponse.json({
        success: true,
        message: "Rollback condition cleared",
        policy: updated,
      });
    }

    // 5. Update Arbitrary Policy
    if (policy) {
      const updates: Partial<TrafficPolicy> = {};
      if (policy.mode) updates.mode = policy.mode;
      if (typeof policy.blueWeight === "number") updates.blueWeight = policy.blueWeight;
      if (typeof policy.greenWeight === "number") updates.greenWeight = policy.greenWeight;
      if (policy.blueModel) updates.blueModel = policy.blueModel;
      if (policy.greenModel) updates.greenModel = policy.greenModel;

      const updated = deploymentRepository.updatePolicy(ownerId, updates);
      return NextResponse.json({
        success: true,
        message: "Policy updated successfully",
        policy: updated,
      });
    }

    const state = deploymentRepository.getOrCreate(ownerId);
    return NextResponse.json({
      success: true,
      policy: state.policy,
      deployEnabled: isDeployEnabled(),
    });
  } catch (error) {
    console.error("[Deploy API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal error processing deployment policy" },
      { status: 500 }
    );
  }
}
