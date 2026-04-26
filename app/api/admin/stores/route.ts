import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Slug ใช้ได้เฉพาะ a-z 0-9 และ -"),
  ownerEmail: z.string().email(),
  ownerName: z.string().max(80).optional(),
  description: z.string().max(500).optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session.user.email : null;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, slug, ownerEmail, ownerName, description } = parsed.data;

  // Reject if slug already taken
  const slugTaken = await prisma.store.findUnique({ where: { slug } });
  if (slugTaken) {
    return NextResponse.json(
      { error: { slug: ["Slug นี้มีคนใช้แล้ว"] } },
      { status: 409 },
    );
  }

  // Find or create the owner user
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { role: "VENDOR" },
    create: {
      email: ownerEmail,
      name: ownerName ?? null,
      role: "VENDOR",
    },
  });

  // Owner can only have ONE store (Store.ownerId is @unique)
  const existing = await prisma.store.findUnique({ where: { ownerId: owner.id } });
  if (existing) {
    return NextResponse.json(
      {
        error: {
          ownerEmail: [
            `อีเมลนี้เป็นเจ้าของร้าน "${existing.name}" อยู่แล้ว — 1 user มีได้ 1 ร้าน`,
          ],
        },
      },
      { status: 409 },
    );
  }

  const store = await prisma.store.create({
    data: {
      name,
      slug,
      ownerId: owner.id,
      description: description ?? null,
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(store, { status: 201 });
}
