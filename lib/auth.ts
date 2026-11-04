import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function sessionToken(adminId: number) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters");

  const payload = `${adminId}.${Math.floor(Date.now() / 1000) + SESSION_MAX_AGE}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !token) return false;

  const match = /^([1-9]\d*)\.(\d{10})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;

  const [, adminId, expiresAt, signature] = match;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const payload = `${adminId}.${expiresAt}`;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const isAdmin = () => isValidSessionToken(cookies().get(COOKIE)?.value);

export function requireAdmin() {
  if (!isAdmin()) redirect("/admin/login");
}
