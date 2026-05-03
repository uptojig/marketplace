import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Per-user admin operations.
 *
 *   PATCH /api/admin/users/<id>
 *     body: { role: "CUSTOMER" | "VENDOR" | "ADMIN" }
 *     - Changes the user's role. Guards:
 *       1. Self-demotion blocked (admin can't lock themselves out
 *          of the admin namespace).
 *       2. Last-admin guard — if changing this row would leave
 *          zero ADMINs in the system, refuse.
 *
 *   DELETE /api/admin/users/<id>
 *     - Hard-deletes the user. Guards:
 *       1. Cannot delete self.
 *       2. Cannot delete the last ADMIN.
 *     - Cascades per Prisma schema: sessions/accounts/orders/
 *       addresses get cleaned by referential actions where
 *       configured, otherwise the request fails with a foreign
 *       key violation and we surface it as a 409.
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
  role: z.enum(["CUSTOMER", "VENDOR", "ADMIN"]),
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
  const { role } = parsed.data;

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true, email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Self-demotion guard — would leave the operator unable to access
  // /admin/* on their next session, very surprising for the user.
  if (target.id === me.id && role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "cannot_demote_self",
        detail: "ห้ามลด role ของตัวเอง — ขอให้ admin คนอื่นเป็นคนเปลี่ยน",
      },
      { status: 400 },
    );
  }

  // Last-admin guard — applies only when we're demoting an ADMIN.
  if (target.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        {
          error: "last_admin",
          detail:
            "ห้ามลด role ของ ADMIN คนสุดท้าย — สร้าง ADMIN เพิ่มก่อนแล้วค่อยลด role คนนี้",
        },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });
  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const me = await requireAdmin();
  if (!me) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Self-delete guard.
  if (target.id === me.id) {
    return NextResponse.json(
      {
        error: "cannot_delete_self",
        detail: "ห้ามลบบัญชีตัวเอง",
      },
      { status: 400 },
    );
  }

  // Last-admin guard.
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        {
          error: "last_admin",
          detail: "ห้ามลบ ADMIN คนสุดท้าย",
        },
        { status: 409 },
      );
    }
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Foreign-key violation (P2003) — user has orders/store/etc.
    // that aren't set up to cascade. Surface a clear message
    // instead of a generic 500.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error: "user_has_dependencies",
          detail:
            "ผู้ใช้คนนี้มีออเดอร์ / ร้านค้า / ที่อยู่ที่ผูกอยู่ — เปลี่ยน role เป็น CUSTOMER แทนการลบ",
        },
        { status: 409 },
      );
    }
    throw e;
  }
}
