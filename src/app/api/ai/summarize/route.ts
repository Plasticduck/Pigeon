import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body } = await req.json();

  if (!body) {
    return Response.json({ error: "Missing email body" }, { status: 400 });
  }

  const plainText = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `Summarize this email in 2-3 concise sentences. Focus on the key points and any action items.\n\nSubject: ${subject ?? "(no subject)"}\n\n${plainText}`,
    }],
  });

  const summary = msg.content[0].type === "text" ? msg.content[0].text : "";
  return Response.json({ summary });
}
