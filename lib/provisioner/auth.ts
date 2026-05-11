// Internal-API authentication helpers — admin + droplet-agent endpoints
// share the same shared-secret bearer-token pattern.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConfig } from "./config";

export async function requireAdmin(): Promise<
  { ok: true; userId: string; email: string } | { ok: false; reason: "unauthenticated" | "forbidden" }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, reason: "unauthenticated" };
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, email: true },
  });
  if (!user || user.role !== "ADMIN") return { ok: false, reason: "forbidden" };
  return { ok: true, userId: user.id, email: user.email ?? "" };
}

export function requireInternalBearer(req: Request): boolean {
  const cfg = getConfig();
  if (!cfg.internalApiSecret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token || token.length !== cfg.internalApiSecret.length) return false;
  // constant-time compare
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ cfg.internalApiSecret.charCodeAt(i);
  }
  return mismatch === 0;
}
