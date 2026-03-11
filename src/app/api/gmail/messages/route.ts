import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function parseSender(from: string): { senderName: string; senderEmail: string } {
  const match = from.match(/^"?(.+?)"?\s*<(.+)>$/);
  if (match) return { senderName: match[1].trim(), senderEmail: match[2].trim() };
  return { senderName: from.trim(), senderEmail: from.trim() };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const label = searchParams.get("label") || "INBOX";
  const q = searchParams.get("q") || "";
  const pageToken = searchParams.get("pageToken") || "";

  const query = new URLSearchParams({ maxResults: "25", labelIds: label });
  if (q) query.set("q", q);
  if (pageToken) query.set("pageToken", pageToken);

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${query}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!listRes.ok) {
    const err = await listRes.json();
    return Response.json({ error: err }, { status: listRes.status });
  }

  const listData = await listRes.json();
  if (!listData.messages?.length) return Response.json({ emails: [], nextPageToken: null });

  const emails = await Promise.all(
    listData.messages.map(async (msg: { id: string }) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      const msgData = await msgRes.json();
      const headers: { name: string; value: string }[] = msgData.payload?.headers ?? [];
      const from = headers.find(h => h.name === "From")?.value ?? "";
      const subject = headers.find(h => h.name === "Subject")?.value ?? "(no subject)";
      const date = headers.find(h => h.name === "Date")?.value ?? "";
      const { senderName, senderEmail } = parseSender(from);
      return {
        id: msg.id,
        threadId: msgData.threadId,
        senderName,
        senderEmail,
        subject,
        date: formatDate(date),
        isUnread: msgData.labelIds?.includes("UNREAD") ?? false,
        snippet: msgData.snippet ?? "",
      };
    })
  );

  return Response.json({ emails, nextPageToken: listData.nextPageToken ?? null });
}
