/**
 * DELETE /api/admin/digital-assets/[id] — remove a digital asset.
 *
 * Only removes the DigitalAsset row. The Spaces object stays (cheap
 * + lets you re-attach a file you accidentally detached). A separate
 * cron / cleanup job can sweep orphans later if needed.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const existing = await prisma.digitalAsset.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.digitalAsset.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
