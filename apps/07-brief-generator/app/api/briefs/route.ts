import { NextRequest, NextResponse } from "next/server";
import { getOrCreateOwnerId } from "@/lib/session/user-session";
import { briefRepository } from "@/lib/session/brief-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ownerId = await getOrCreateOwnerId();
  const briefs = await briefRepository.listByOwner(ownerId);
  return NextResponse.json({ briefs });
}

export async function DELETE(req: NextRequest) {
  const ownerId = await getOrCreateOwnerId();
  const url = new URL(req.url);
  const briefId = url.searchParams.get("id") || undefined;

  await briefRepository.deleteByOwner(ownerId, briefId);
  return NextResponse.json({ success: true, message: "Histórico atualizado." });
}
