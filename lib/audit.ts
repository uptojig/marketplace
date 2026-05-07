import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { Role, Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Append-only audit log writer.
 *
 *   await audit("store.approve", { targetType: "Store", targetId, metadata });
 *
 * Convention: action names are dot-separated `<resource>.<verb>` with
 * stable values so /admin/audit-log filters can target categories.
 *
 *   store.approve / store.reject / store.suspend / store.delete
 *   product.approve / product.reject / product.delete
 *   user.create / user.role_change / user.delete
 *   landing.regenerate / landing.clear
 *
 * The actor (admin doing the work) is resolved from the active
 * NextAuth session inside this helper — callers don't pass it. If
 * no session exists (e.g. the function is invoked from a webhook
 * or background task), we record `actorId = "system"` so the row
 * still lands.
 */
export async function audit(
  action: string,
  opts: {
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  let actorId = "system";
  let actorEmail = "system@internal";
  let actorRole: Role = "ADMIN";

  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const me = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true, role: true },
      });
      if (me) {
        actorId = me.id;
        actorEmail = me.email ?? session.user.email;
        actorRole = me.role;
      }
    }
  } catch {
    // No request context (e.g. CRON, webhook) — fall back to system.
  }

  // Best-effort capture of request metadata. headers() throws when
  // called outside a request context — wrap defensively so audit
  // writes from background jobs don't fail.
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = headers();
    ipAddress =
      h.get("x-forwarded-for")?.split(",")[0].trim() ??
      h.get("x-real-ip") ??
      null;
    userAgent = h.get("user-agent") ?? null;
  } catch {
    // Outside request scope — skip.
  }

  await prisma.auditLog
    .create({
      data: {
        actorId,
        actorEmail,
        actorRole,
        action,
        targetType: opts.targetType ?? null,
        targetId: opts.targetId ?? null,
        metadata: opts.metadata
          ? (opts.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ipAddress,
        userAgent,
      },
    })
    .catch((e) => {
      // Audit writes must never break the parent action. Log to
      // server logs and swallow — admin can still re-run the
      // operation if the audit row matters and check the log
      // viewer for the missing entry.
      // eslint-disable-next-line no-console
      console.error("[audit] failed to record", action, e);
    });
}
