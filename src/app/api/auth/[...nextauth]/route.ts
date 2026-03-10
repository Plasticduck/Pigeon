import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const allowedHosts = [
  "pigeon.qxmedia.us",
  "pigeonclient.netlify.app",
  "localhost:3000",
];

function getHandler(req: Request) {
  const host = req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const origin = allowedHosts.includes(host)
    ? `${proto}://${host}`
    : process.env.NEXTAUTH_URL!;

  process.env.NEXTAUTH_URL = origin;

  return NextAuth(authOptions);
}

export async function GET(req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const handler = getHandler(req);
  return handler(req, ctx);
}

export async function POST(req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const handler = getHandler(req);
  return handler(req, ctx);
}
