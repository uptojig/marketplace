import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/seed-user
 * One-time user seeding endpoint. Requires ADMIN_SEED_SECRET header
 * to prevent unauthorized use. Remove this route after seeding.
 */
export async function POST(req: Request) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== (process.env.NEXTAUTH_SECRET ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.upsert({
    where: { email: body.email.toLowerCase() },
    update: {
      passwordHash,
      role: body.role ?? "ADMIN",
      name: body.name ?? body.email.split("@")[0],
    },
    create: {
      email: body.email.toLowerCase(),
      passwordHash,
      role: body.role ?? "ADMIN",
      name: body.name ?? body.email.split("@")[0],
    },
    select: { id: true, email: true, role: true, name: true },
  });

  return NextResponse.json({ ok: true, user });
}
