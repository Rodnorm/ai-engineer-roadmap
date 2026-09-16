import { getOrCreateOwnerId } from "@/lib/owner-session";
import { getConversationRepository } from "@/lib/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ownerId = await getOrCreateOwnerId();
  const conversations = await getConversationRepository().list(ownerId);
  return Response.json({ conversations });
}

export async function POST() {
  const ownerId = await getOrCreateOwnerId();
  const conversation = await getConversationRepository().create(ownerId);
  return Response.json({ conversation }, { status: 201 });
}
