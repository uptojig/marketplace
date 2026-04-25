import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const found = await prisma.address.findUnique({ where: { id: params.id } });
  if (!found || found.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
