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

  console.log("[Auth] host:", host);
  console.log("[Auth] NEXTAUTH_URL:", origin);
  console.log("[Auth] NEXTAUTH_SECRET defined:", !!process.env.NEXTAUTH_SECRET);
  console.log("[Auth] NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length ?? 0);

  // Re-apply secret at request time in case it wasn't available at module load
  const options = {
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
  };

  return NextAuth(options);
}

export async function GET(req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const handler = getHandler(req);
  return handler(req, ctx);
}

export async function POST(req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const handler = getHandler(req);
  return handler(req, ctx);
}
