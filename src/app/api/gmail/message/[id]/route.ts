import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function findPart(parts: any[], mimeType: string): any {
  for (const part of parts) {
    if (part.mimeType === mimeType) return part;
    if (part.parts) {
      const found = findPart(part.parts, mimeType);
      if (found) return found;
    }
  }
  return null;
}

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/html" && payload.body?.data)
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  if (payload.mimeType === "text/plain" && payload.body?.data)
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  if (payload.parts) {
    const html = findPart(payload.parts, "text/html");
    if (html?.body?.data) return Buffer.from(html.body.data, "base64url").toString("utf-8");
    const text = findPart(payload.parts, "text/plain");
    if (text?.body?.data) return Buffer.from(text.body.data, "base64url").toString("utf-8");
  }
  return "";
}

function extractAttachments(payload: any): any[] {
  const attachments: any[] = [];
  function traverse(part: any) {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        name: part.filename,
        size: formatSize(part.body.size ?? 0),
        mimeType: part.mimeType,
        attachmentId: part.body.attachmentId,
      });
    }
    if (part.parts) part.parts.forEach(traverse);
  }
  traverse(payload);
  return attachments;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseSender(from: string): { senderName: string; senderEmail: string } {
  const match = from.match(/^"?(.+?)"?\s*<(.+)>$/);
  if (match) return { senderName: match[1].trim(), senderEmail: match[2].trim() };
  return { senderName: from.trim(), senderEmail: from.trim() };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!res.ok) return Response.json({ error: "Gmail API error" }, { status: res.status });

  const data = await res.json();
  const headers: { name: string; value: string }[] = data.payload?.headers ?? [];
  const from = headers.find(h => h.name === "From")?.value ?? "";
  const to = headers.find(h => h.name === "To")?.value ?? "";
  const subject = headers.find(h => h.name === "Subject")?.value ?? "(no subject)";
  const date = headers.find(h => h.name === "Date")?.value ?? "";
  const { senderName, senderEmail } = parseSender(from);

  return Response.json({
    id: data.id,
    threadId: data.threadId,
    senderName,
    senderEmail,
    to,
    subject,
    date: new Date(date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    isUnread: data.labelIds?.includes("UNREAD") ?? false,
    body: extractBody(data.payload),
    snippet: data.snippet ?? "",
    attachments: extractAttachments(data.payload),
    labelIds: data.labelIds ?? [],
  });
}
