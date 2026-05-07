import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // NextAuth-only — deleting an address is a meaningful op that
  // shouldn't fall through to a shared guest user. Old cookie-session
  // path was a /onboarding leftover and was always null after that
  // flow shipped.
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const found = await prisma.address.findUnique({ where: { id: params.id } });
  if (!found || found.userId !== me.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
