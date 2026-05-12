// POST /api/provisioner/whitelist
//   { deploymentId, action: "confirm" | "reject", note?: string }
//
// Admin manual workflow: payment provider doesn't have an API, so an admin
// contacts them and then flips this row when the IP is confirmed whitelisted.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/provisioner/auth";
import { confirmPaymentWhitelist, rejectPaymentWhitelist } from "@/lib/provisioner/orchestrator";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("confirm"),
    deploymentId: z.string().cuid(),
    note: z.string().max(2000).optional(),
  }),
  z.object({
    action: z.literal("reject"),
    deploymentId: z.string().cuid(),
    reason: z.string().min(2).max(2000),
  }),
]);

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.reason },
      { status: auth.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.action === "confirm") {
    await confirmPaymentWhitelist({
      deploymentId: parsed.data.deploymentId,
      adminUserId: auth.userId,
      note: parsed.data.note,
    });
    await prisma.auditLog.create({
      data: {
        actorId: auth.userId,
        actorEmail: auth.email,
        actorRole: "ADMIN",
        action: "payment_whitelist.confirm",
        targetType: "ShopDeployment",
        targetId: parsed.data.deploymentId,
        metadata: parsed.data.note ? { note: parsed.data.note } : undefined,
      },
    });
  } else {
    await rejectPaymentWhitelist({
      deploymentId: parsed.data.deploymentId,
      adminUserId: auth.userId,
      reason: parsed.data.reason,
    });
    await prisma.auditLog.create({
      data: {
        actorId: auth.userId,
        actorEmail: auth.email,
        actorRole: "ADMIN",
        action: "payment_whitelist.reject",
        targetType: "ShopDeployment",
        targetId: parsed.data.deploymentId,
        metadata: { reason: parsed.data.reason },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
