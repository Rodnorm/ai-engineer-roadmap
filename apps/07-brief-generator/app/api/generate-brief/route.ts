import { NextRequest } from "next/server";
import { z } from "zod";
import { executeMultiAgentPipeline } from "@/lib/orchestrator/pipeline";
import { getOrCreateOwnerId } from "@/lib/session/user-session";
import { briefRepository } from "@/lib/session/brief-repository";
import { AgentTraceStep, PipelineEvent } from "@/types/agent";

const RequestSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(3, "O tópico deve ter no mínimo 3 caracteres.")
    .max(300, "O tópico deve ter no máximo 300 caracteres."),
  scope: z
    .string()
    .trim()
    .max(1000, "O escopo deve ter no máximo 1000 caracteres.")
    .optional(),
  tone: z.enum(["executive", "technical", "critical"]).default("executive"),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  // Extract client IP for rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "127.0.0.1";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Corpo da requisição inválido (JSON esperado)." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parseResult = RequestSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({
        error: parseResult.error.errors.map((e) => e.message).join(", "),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { topic, scope, tone } = parseResult.data;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: PipelineEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      try {
        const result = await executeMultiAgentPipeline({
          topic,
          scope,
          tone,
          clientIp,
          onStep: (step: AgentTraceStep) => {
            sendEvent({ type: "step", step });
          },
        });

        // Save generated brief to current user session repository
        try {
          const ownerId = await getOrCreateOwnerId();
          await briefRepository.save(
            ownerId,
            topic,
            scope || "Geral",
            tone,
            result
          );
        } catch (saveErr) {
          console.warn("Falha ao persistir briefing na sessão:", saveErr);
        }

        // Send completed dossier and brief
        sendEvent({
          type: "dossier",
          dossier: result.dossier,
        });

        sendEvent({
          type: "complete",
          result,
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido durante a execução.";
        sendEvent({
          type: "error",
          error: errorMessage,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
