import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await req.json();
  if (!id || !action) {
    return Response.json({ error: "Missing id or action" }, { status: 400 });
  }

  const base = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`;
  const headers = {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  };

  let res: Response;

  switch (action) {
    case "trash":
      res = await fetch(`${base}/trash`, { method: "POST", headers });
      break;
    case "archive":
      res = await fetch(`${base}/modify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ removeLabelIds: ["INBOX"] }),
      });
      break;
    case "star":
      res = await fetch(`${base}/modify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ addLabelIds: ["STARRED"] }),
      });
      break;
    case "unstar":
      res = await fetch(`${base}/modify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ removeLabelIds: ["STARRED"] }),
      });
      break;
    case "read":
      res = await fetch(`${base}/modify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
      });
      break;
    case "unread":
      res = await fetch(`${base}/modify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ addLabelIds: ["UNREAD"] }),
      });
      break;
    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!res.ok) {
    const err = await res.json();
    return Response.json({ error: err }, { status: res.status });
  }

  return Response.json({ success: true });
}
