import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Organiser login for /admin. One shared password, set as the ADMIN_PASSWORD
// env var. If it isn't set, the admin section stays locked for everyone.
//
// The cookie holds an HMAC derived from the password, never the password
// itself. Changing ADMIN_PASSWORD logs everyone out.

export const ADMIN_COOKIE = "epoch_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 12; // 12 hours

const password = () => process.env.ADMIN_PASSWORD ?? "";

export const adminConfigured = () => password().length >= 8;

function token(): string {
  return createHmac("sha256", password()).update("epoch-admin-session-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordMatches(attempt: string): boolean {
  if (!adminConfigured()) return false;
  // Compare HMACs so the comparison is constant-time regardless of length.
  const hash = (s: string) => createHmac("sha256", "epoch-admin-compare").update(s).digest("hex");
  return safeEqual(hash(attempt), hash(password()));
}

export function sessionToken(): string {
  return token();
}

/** True if this request carries a valid admin cookie. Call in every admin page, action and route. */
export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!value && safeEqual(value, token());
}
