import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const messageId = searchParams.get("messageId");
  const attachmentId = searchParams.get("attachmentId");
  const filename = searchParams.get("filename") ?? "attachment";
  const mimeType = searchParams.get("mimeType") ?? "application/octet-stream";

  if (!messageId || !attachmentId) {
    return Response.json({ error: "Missing messageId or attachmentId" }, { status: 400 });
  }

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!res.ok) {
    return Response.json({ error: "Gmail API error" }, { status: res.status });
  }

  const data = await res.json();
  const base64 = data.data.replace(/-/g, "+").replace(/_/g, "/");
  const binary = Buffer.from(base64, "base64");

  return new Response(binary, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(binary.length),
    },
  });
}
