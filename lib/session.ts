import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mp_uid";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex").slice(0, 32);
}

export function setUserCookie(userId: string) {
  const sig = sign(userId);
  cookies().set(COOKIE_NAME, `${userId}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearUserCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getCurrentUserId(): string | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [uid, sig] = raw.split(".");
  if (!uid || !sig) return null;
  if (sign(uid) !== sig) return null;
  return uid;
}
