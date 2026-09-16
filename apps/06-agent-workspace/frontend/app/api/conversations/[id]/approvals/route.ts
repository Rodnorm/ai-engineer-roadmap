import { z } from "zod";
import { eventStream, clientKey } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { getConversationRepository } from "@/lib/repository";
import { resolveApproval } from "@/lib/agent/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ approved: z.boolean() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rate = checkRateLimit(clientKey(request));
  if (!rate.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });
  const { id } = await params;
  const conversation = await getConversationRepository().get(id);
  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });
  if (!conversation.pendingApproval) return Response.json({ error: "No approval is pending" }, { status: 409 });

  try {
    const { approved } = bodySchema.parse(await request.json());
    return eventStream(resolveApproval(conversation, approved));
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid approval" }, { status: 400 });
    throw error;
  }
}
