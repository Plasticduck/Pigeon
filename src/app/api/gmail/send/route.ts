import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function buildRawEmail(to: string, subject: string, body: string, from: string, inReplyTo?: string, threadId?: string): string {
  const boundary = "----=_Part_" + Date.now();
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  if (inReplyTo) {
    headers.push(`In-Reply-To: ${inReplyTo}`);
    headers.push(`References: ${inReplyTo}`);
  }

  const plainBody = body.replace(/<[^>]+>/g, "");

  const raw = [
    headers.join("\r\n"),
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    plainBody,
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    body,
    `--${boundary}--`,
  ].join("\r\n");

  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, body, threadId, inReplyTo } = await req.json();

  if (!to || !subject || !body) {
    return Response.json({ error: "Missing to, subject, or body" }, { status: 400 });
  }

  const raw = buildRawEmail(
    to,
    subject,
    body,
    session.user.email,
    inReplyTo,
    threadId,
  );

  const payload: Record<string, string> = { raw };
  if (threadId) payload.threadId = threadId;

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return Response.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  return Response.json({ id: data.id, threadId: data.threadId });
}
