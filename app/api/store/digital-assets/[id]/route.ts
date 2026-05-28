/**
 * DELETE /api/store/digital-assets/[id] — store-owner removal of a
 * digital asset on their OWN product (or admin on any). Mirrors the
 * admin route: only the DigitalAsset row is removed; the Spaces object
 * stays for cheap re-attach + buyers who already unlocked it.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const asset = await prisma.digitalAsset.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      product: { select: { store: { select: { ownerId: true } } } },
    },
  });
  if (!asset || !asset.product?.store) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role !== "ADMIN" && asset.product.store.ownerId !== user.id) {
    // 404, not 403 — don't leak existence across stores.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.digitalAsset.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
