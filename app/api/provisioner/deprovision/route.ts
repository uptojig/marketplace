// POST /api/provisioner/deprovision { storeId }
//
// Admin-only. Tears down the droplet + CF records. ShopDeployment row stays
// (marked ARCHIVED) so audit history is preserved.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/provisioner/auth";
import { deprovisionStore } from "@/lib/provisioner/orchestrator";

export const dynamic = "force-dynamic";

const schema = z.object({
  storeId: z.string().cuid(),
  // Sanity confirmation — admin UI requires typing the slug to prevent
  // accidental teardown.
  confirmSlug: z.string().min(1),
});

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

  const store = await prisma.store.findUnique({
    where: { id: parsed.data.storeId },
    select: { slug: true, name: true },
  });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  if (store.slug !== parsed.data.confirmSlug) {
    return NextResponse.json(
      { error: "confirmSlug does not match store slug — refused" },
      { status: 400 },
    );
  }

  await deprovisionStore(parsed.data.storeId);

  await prisma.auditLog.create({
    data: {
      actorId: auth.userId,
      actorEmail: auth.email,
      actorRole: "ADMIN",
      action: "deployment.deprovision",
      targetType: "Store",
      targetId: parsed.data.storeId,
      metadata: { storeName: store.name },
    },
  });

  return NextResponse.json({ ok: true });
}
