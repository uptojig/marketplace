import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  templateFieldsSchema,
  deriveLandingThemeVariant,
} from "@/lib/store/template-fields";

const schema = z
  .object({
    name: z.string().min(2).max(80),
    slug: z
      .string()
      .min(2)
      .max(60)
      .regex(
        /^[a-z0-9฀-๿](?:[a-z0-9฀-๿-]*[a-z0-9฀-๿])?$/,
        "Slug ใช้ได้เฉพาะ a-z, 0-9, ภาษาไทย และ -",
      ),
    ownerEmail: z
      .string()
      .optional()
      .transform((v) => (v?.trim() ? v.trim() : undefined))
      .refine(
        (v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "อีเมลไม่ถูกต้อง",
      ),
    ownerName: z.string().max(80).optional(),
    description: z.string().max(500).optional(),
    logoPosition: z.enum(["left", "center"]).optional(),
    menuPosition: z.enum(["left", "center", "right"]).optional(),
  })
  .merge(templateFieldsSchema);

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

  const {
    name,
    slug,
    ownerEmail,
    ownerName,
    description,
    logoPosition,
    menuPosition,
    templateId,
    paletteId,
    niche,
    brandVoice,
    landingThemeVariant,
  } = parsed.data;

  const slugTaken = await prisma.store.findUnique({ where: { slug } });
  if (slugTaken) {
    return NextResponse.json(
      { error: { slug: ["Slug นี้มีคนใช้แล้ว"] } },
      { status: 409 },
    );
  }

  // Postgres treats NULLs as distinct in @unique columns, so multiple
  // emailless owners can coexist.
  let owner;
  if (ownerEmail) {
    owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: { role: "VENDOR" },
      create: {
        email: ownerEmail,
        name: ownerName ?? null,
        role: "VENDOR",
      },
    });

    // Store.ownerId is @unique — block reuse only when an existing user is
    // being attached; emailless owners are always fresh records.
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
  } else {
    owner = await prisma.user.create({
      data: {
        email: null,
        name: ownerName ?? name,
        role: "VENDOR",
      },
    });
  }

  // Auto-derive landingThemeVariant from templates[templateId].group when
  // the operator picked a templateId but not an explicit variant — same
  // pattern as the wizard server action so stores created via this admin
  // endpoint render via the right family detector instead of falling
  // through to the generic grid in app/stores/[slug]/page.tsx.
  const derivedVariant = deriveLandingThemeVariant({
    templateId,
    landingThemeVariant,
  });
  const effectiveLandingThemeVariant =
    landingThemeVariant ?? derivedVariant ?? undefined;

  const data: Prisma.StoreUncheckedCreateInput = {
    name,
    slug,
    ownerId: owner.id,
    description: description ?? null,
    logoPosition: logoPosition ?? "left",
    menuPosition: menuPosition ?? "right",
    ...(templateId !== undefined ? { templateId } : {}),
    ...(paletteId !== undefined ? { paletteId } : {}),
    ...(niche !== undefined ? { niche } : {}),
    ...(brandVoice !== undefined ? { brandVoice } : {}),
    ...(effectiveLandingThemeVariant !== undefined
      ? { landingThemeVariant: effectiveLandingThemeVariant }
      : {}),
  };

  const store = await prisma.store.create({
    data,
    select: { id: true, slug: true },
  });

  return NextResponse.json(store, { status: 201 });
}
