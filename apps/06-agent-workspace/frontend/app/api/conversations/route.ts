import { getConversationRepository } from "@/lib/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const conversations = await getConversationRepository().list();
  return Response.json({ conversations });
}

export async function POST() {
  const conversation = await getConversationRepository().create();
  return Response.json({ conversation }, { status: 201 });
}
