import { z } from "zod";
import { eventStream, clientKey } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { getConversationRepository } from "@/lib/repository";
import { sendMessage } from "@/lib/agent/service";
import { releaseGeneration, tryAcquireGeneration } from "@/lib/concurrency";
import type { AgentEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ message: z.string().trim().min(1).max(2_000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rate = checkRateLimit(clientKey(request));
  if (!rate.allowed) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "retry-after": String(rate.retryAfter) } },
    );
  }

  const { id } = await params;
  const conversation = await getConversationRepository().get(id);
  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });
  if (conversation.pendingApproval) {
    return Response.json({ error: "Resolve the pending tool approval first" }, { status: 409 });
  }

  try {
    const { message } = bodySchema.parse(await request.json());
    if (!tryAcquireGeneration()) {
      return Response.json({ error: "The agent is busy. Try again shortly." }, { status: 503 });
    }
    async function* withSlot(): AsyncGenerator<AgentEvent> {
      try {
        yield* sendMessage(conversation!, message);
      } finally {
        releaseGeneration();
      }
    }
    return eventStream(withSlot());
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid message" }, { status: 400 });
    throw error;
  }
}
