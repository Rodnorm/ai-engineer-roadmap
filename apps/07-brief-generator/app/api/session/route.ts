import { NextResponse } from "next/server";
import { getOrCreateOwnerId } from "@/lib/session/user-session";
import { briefRepository } from "@/lib/session/brief-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ownerId = await getOrCreateOwnerId();
  const list = await briefRepository.listByOwner(ownerId);

  return NextResponse.json({
    ownerId,
    shortId: `usr_${ownerId.slice(0, 8)}`,
    briefsCount: list.length,
    privacyNotice:
      "Sessão privada neste navegador, protegida por cookie assinado com HMAC-SHA256.",
  });
}
