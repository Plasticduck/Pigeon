import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { emails } = await req.json();

  const list = (emails as { senderName: string; subject: string }[])
    .slice(0, 20)
    .map((e, i) => `${i + 1}. ${e.senderName}: ${e.subject}`)
    .join("\n");

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{
      role: "user",
      content: `Based on these emails, suggest 4-6 smart inbox category labels. Return ONLY a valid JSON array of short strings (1-2 words max). Example: ["Finance","Work","Shopping","Updates"]\n\n${list}`,
    }],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "[]";
  try {
    const match = raw.match(/\[.*\]/s);
    const labels: string[] = match ? JSON.parse(match[0]) : [];
    return Response.json({ labels });
  } catch {
    return Response.json({ labels: [] });
  }
}
