import { NextRequest, NextResponse } from "next/server";

async function isValidSessionToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;

  const match = /^([1-9]\d*)\.(\d{10})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;

  const [, adminId, expiresAt, signature] = match;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signatureBytes = Uint8Array.from(signature.match(/.{2}/g)!, (byte) => Number.parseInt(byte, 16));
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(`${adminId}.${expiresAt}`),
  );
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();
  if (await isValidSessionToken(req.cookies.get("admin_session")?.value, process.env.AUTH_SECRET)) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
