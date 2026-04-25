import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Slug must be lowercase letters, numbers, and dashes"),
  description: z.string().max(500).optional().default(""),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const userId = getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const slugInUse = await prisma.store.findUnique({ where: { slug: parsed.data.slug } });
  if (slugInUse && slugInUse.ownerId !== userId) {
    return NextResponse.json({ error: { slug: ["Slug already taken"] } }, { status: 409 });
  }

  const store = await prisma.store.upsert({
    where: { ownerId: userId },
    update: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      logoUrl: parsed.data.logoUrl || null,
    },
    create: {
      ownerId: userId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.VENDOR },
  });

  return NextResponse.json({ storeId: store.id, slug: store.slug });
}
