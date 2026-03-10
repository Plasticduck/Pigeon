import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body, snippet } = await req.json();
  const text = (body || snippet || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    messages: [{
      role: "user",
      content: `Summarize this email in 1-2 sentences. Be direct — state what it's about and any action needed.\n\nSubject: ${subject}\n\n${text}`,
    }],
  });

  const summary = msg.content[0].type === "text" ? msg.content[0].text : "";
  return Response.json({ summary });
}
