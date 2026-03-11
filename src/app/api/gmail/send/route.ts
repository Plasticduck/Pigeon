import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64
}

function buildRawEmail(
  to: string,
  subject: string,
  body: string,
  from: string,
  attachments?: Attachment[],
  inReplyTo?: string,
): string {
  const boundary = "----=_Part_" + Date.now();
  const hasAttachments = attachments && attachments.length > 0;

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/${hasAttachments ? "mixed" : "alternative"}; boundary="${boundary}"`,
  ];
  if (inReplyTo) {
    headers.push(`In-Reply-To: ${inReplyTo}`);
    headers.push(`References: ${inReplyTo}`);
  }

  const plainBody = body.replace(/<[^>]+>/g, "");
  const parts: string[] = [headers.join("\r\n"), ""];

  if (hasAttachments) {
    const altBoundary = "----=_Alt_" + Date.now();
    parts.push(`--${boundary}`);
    parts.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`);
    parts.push("");
    parts.push(`--${altBoundary}`);
    parts.push("Content-Type: text/plain; charset=UTF-8");
    parts.push("");
    parts.push(plainBody);
    parts.push(`--${altBoundary}`);
    parts.push("Content-Type: text/html; charset=UTF-8");
    parts.push("");
    parts.push(body);
    parts.push(`--${altBoundary}--`);

    for (const att of attachments!) {
      parts.push(`--${boundary}`);
      parts.push(`Content-Type: ${att.mimeType}; name="${att.name}"`);
      parts.push("Content-Transfer-Encoding: base64");
      parts.push(`Content-Disposition: attachment; filename="${att.name}"`);
      parts.push("");
      parts.push(att.data);
    }
    parts.push(`--${boundary}--`);
  } else {
    parts.push(`--${boundary}`);
    parts.push("Content-Type: text/plain; charset=UTF-8");
    parts.push("");
    parts.push(plainBody);
    parts.push(`--${boundary}`);
    parts.push("Content-Type: text/html; charset=UTF-8");
    parts.push("");
    parts.push(body);
    parts.push(`--${boundary}--`);
  }

  const raw = parts.join("\r\n");
  return Buffer.from(raw).toString("base64url");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, body, threadId, inReplyTo, attachments } = await req.json();

  if (!to || !subject || !body) {
    return Response.json({ error: "Missing to, subject, or body" }, { status: 400 });
  }

  const raw = buildRawEmail(
    to,
    subject,
    body,
    session.user.email,
    attachments,
    inReplyTo,
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
