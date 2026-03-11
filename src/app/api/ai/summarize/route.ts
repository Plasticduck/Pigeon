import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { emails } = await req.json();

  if (!emails?.length) {
    return Response.json({ digest: "No new emails to summarize." });
  }

  const list = (emails as { senderName: string; subject: string; snippet: string }[])
    .slice(0, 25)
    .map((e, i) => `${i + 1}. From: ${e.senderName} | Subject: ${e.subject} | Preview: ${e.snippet.slice(0, 80)}`)
    .join("\n");

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 250,
    messages: [{
      role: "user",
      content: `You are an email assistant. Give a brief daily inbox digest (3-5 bullet points max) summarizing these emails. Focus on what's important, any actions needed, and group related topics. Be concise and direct.\n\n${list}`,
    }],
  });

  const digest = msg.content[0].type === "text" ? msg.content[0].text : "";
  return Response.json({ digest });
}
