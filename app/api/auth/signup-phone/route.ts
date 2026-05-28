/**
 * POST /api/auth/signup-phone
 *
 * Phone-only customer registration. The buyer provides name + phone +
 * password (no external email). We create the User, then assign a
 * deterministic synthetic @inbox.basketplace.co address so the rest of
 * the system — which assumes User.email is set — keeps working, and so
 * transactional mail lands in the in-app inbox.
 *
 * The client signs in afterwards via signIn('credentials', { phone,
 * password }) — the existing CredentialsProvider already supports the
 * phone path, so we don't mint a session here.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { deterministicEmail } from "@/lib/inbox/synth-email";

const schema = z.object({
  storeSlug: z.string().min(1),
  name: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  password: z.string().min(8).max(200),
});

/** Strip everything but digits — mirrors the CredentialsProvider login
 *  normalization so the phone we store matches what login looks up. */
function normalizePhone(raw: string): string {
  return raw.replace(/\D+/g, "");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ข้อมูลไม่ครบ", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  if (phone.length < 9) {
    return NextResponse.json(
      { error: "เบอร์โทรไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  // Store must exist — the synthetic email is store-scoped.
  const store = await prisma.store.findUnique({
    where: { slug: parsed.data.storeSlug },
    select: { id: true, slug: true },
  });
  if (!store) {
    return NextResponse.json({ error: "ไม่พบร้านค้า" }, { status: 404 });
  }

  // Phone is globally unique — reject a duplicate before we create.
  const existing = await prisma.user.findFirst({
    where: { phone },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "เบอร์โทรนี้มีบัญชีแล้ว — เข้าสู่ระบบแทน" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Two-step: create to mint the cuid, then assign the deterministic
  // address derived from it. email stays null between the two writes —
  // Postgres treats null as distinct so the @unique constraint allows it.
  // Wrapped in a transaction so a crash never leaves an email-less row.
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: parsed.data.name.trim(),
        phone,
        passwordHash,
        role: "CUSTOMER",
      },
      select: { id: true },
    });
    const email = await deterministicEmail({
      storeSlug: store.slug,
      name: parsed.data.name,
      userId: created.id,
    });
    await tx.user.update({
      where: { id: created.id },
      data: { email },
    });
    return { id: created.id, email };
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    inboxEmail: user.email,
  });
}
