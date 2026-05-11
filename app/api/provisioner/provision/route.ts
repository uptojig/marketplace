// POST /api/provisioner/provision { storeId }
//
// Admin-only. Idempotent: starts (or resumes) the provisioning chain for
// a store. Returns the deployment id + initial status.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/provisioner/auth";
import { provisionStore } from "@/lib/provisioner/orchestrator";

export const dynamic = "force-dynamic";

const schema = z.object({ storeId: z.string().cuid() });

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
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const store = await prisma.store.findUnique({
    where: { id: parsed.data.storeId },
    select: { id: true, approvalStatus: true, name: true, slug: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (store.approvalStatus !== "APPROVED") {
    return NextResponse.json(
      { error: `Store must be APPROVED before provisioning (current: ${store.approvalStatus})` },
      { status: 400 },
    );
  }

  try {
    const result = await provisionStore(store.id);
    await prisma.auditLog.create({
      data: {
        actorId: auth.userId,
        actorEmail: auth.email,
        actorRole: "ADMIN",
        action: result.resumed ? "deployment.resume" : "deployment.provision",
        targetType: "Store",
        targetId: store.id,
        metadata: { deploymentId: result.deploymentId, storeSlug: store.slug },
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Provisioning failed to start" },
      { status: 500 },
    );
  }
}
