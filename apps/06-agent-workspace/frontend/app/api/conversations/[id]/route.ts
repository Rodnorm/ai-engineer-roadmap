import { getOrCreateOwnerId } from "@/lib/owner-session";
import { getConversationRepository } from "@/lib/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  const ownerId = await getOrCreateOwnerId();
  const { id } = await params;
  const conversation = await getConversationRepository().get(ownerId, id);
  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });
  return Response.json({ conversation });
}

export async function DELETE(_request: Request, { params }: Context) {
  const ownerId = await getOrCreateOwnerId();
  const { id } = await params;
  await getConversationRepository().delete(ownerId, id);
  return new Response(null, { status: 204 });
}
