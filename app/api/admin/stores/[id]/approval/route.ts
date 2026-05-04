import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin endpoint for changing a store's approval status.
 *
 *   PATCH /api/admin/stores/<id>/approval
 *     body: { status: "APPROVED" | "REJECTED" | "SUSPENDED" | "PENDING", note? }
 *
 * Writes an AuditLog row on every successful change. The store's
 * `approvedAt` + `approvedById` fields are updated whenever the
 * status moves to APPROVED. `approvalNote` carries the admin's
 * reason for REJECTED / SUSPENDED transitions so the vendor can
 * see why their shop is unpublished.
 */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, role: true },
  });
  return me?.role === "ADMIN" ? me : null;
}

const patchSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  note: z.string().trim().max(500).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const me = await requireAdmin();
  if (!me) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { status, note } = parsed.data;

  const before = await prisma.store.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      slug: true,
      name: true,
      approvalStatus: true,
      approvalNote: true,
    },
  });
  if (!before) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Reject + suspend require a note — admin must justify killing
  // a vendor's shop. Approve + back-to-pending don't need one.
  if ((status === "REJECTED" || status === "SUSPENDED") && !note) {
    return NextResponse.json(
      {
        error: "note_required",
        detail:
          "ระบุเหตุผลของการ reject/suspend — vendor จะเห็นข้อความนี้",
      },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.store.update({
      where: { id: params.id },
      data: {
        approvalStatus: status,
        approvalNote: status === "APPROVED" ? null : (note ?? null),
        approvedAt: status === "APPROVED" ? new Date() : null,
        approvedById: status === "APPROVED" ? me.id : null,
      },
      select: {
        id: true,
        slug: true,
        approvalStatus: true,
        approvalNote: true,
        approvedAt: true,
      },
    });

    // Map status → audit verb. Use stable, dot-separated names.
    const verb =
      status === "APPROVED"
        ? "approve"
        : status === "REJECTED"
          ? "reject"
          : status === "SUSPENDED"
            ? "suspend"
            : "reset_to_pending";

    await audit(`store.${verb}`, {
      targetType: "Store",
      targetId: before.id,
      metadata: {
        slug: before.slug,
        name: before.name,
        before: {
          status: before.approvalStatus,
          note: before.approvalNote,
        },
        after: {
          status: updated.approvalStatus,
          note: updated.approvalNote,
        },
      },
    });

    return NextResponse.json({ ok: true, store: updated });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    throw e;
  }
}
