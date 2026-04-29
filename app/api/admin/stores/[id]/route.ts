import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const slugRegex = /^[a-z0-9฀-๿](?:[a-z0-9฀-๿-]*[a-z0-9฀-๿])?$/;
const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

// Empty strings → null so admins can clear optional fields.
const trimNullable = z
  .string()
  .max(500)
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const t = v.trim();
    return t === "" ? null : t;
  });

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(slugRegex, "Slug ใช้ได้เฉพาะ a-z, 0-9, ภาษาไทย และ -")
    .optional(),
  description: trimNullable,
  logoUrl: trimNullable,
  bannerUrl: trimNullable,
  tagline: trimNullable,
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "ใส่สี HEX เช่น #2563eb")
    .optional()
    .or(z.literal("").transform(() => null))
    .nullable(),
  customDomain: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim().toLowerCase();
      return t === "" ? null : t;
    })
    .refine((v) => v == null || domainRegex.test(v), "โดเมนไม่ถูกต้อง (เช่น shop.example.com)"),
  logoPosition: z.enum(["left", "center"]).optional(),
  menuPosition: z.enum(["left", "center", "right"]).optional(),
  contactEmail: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t === "" ? null : t;
    })
    .refine((v) => v == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "อีเมลไม่ถูกต้อง"),
  contactPhone: trimNullable,
  facebookUrl: trimNullable,
  messengerUrl: trimNullable,
  twitterUrl: trimNullable,
  instagramUrl: trimNullable,
  websiteUrl: trimNullable,
  lineId: trimNullable,
  companyName: trimNullable,
  taxId: trimNullable,
  addressLine1: trimNullable,
  addressLine2: trimNullable,
  subdistrict: trimNullable,
  district: trimNullable,
  province: trimNullable,
  postalCode: trimNullable,
  country: trimNullable,
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data: Prisma.StoreUpdateInput = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) (data as Record<string, unknown>)[k] = v;
  }

  try {
    const store = await prisma.store.update({
      where: { id: params.id },
      data,
      select: { id: true, slug: true, name: true },
    });
    return NextResponse.json(store);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }
      if (e.code === "P2002") {
        const target = (e.meta?.target as string[] | undefined)?.join(",") ?? "";
        const field = target.includes("slug")
          ? "slug"
          : target.includes("customDomain")
            ? "customDomain"
            : "field";
        return NextResponse.json(
          { error: { [field]: [`${field === "slug" ? "Slug" : "Domain"} นี้มีคนใช้แล้ว`] } },
          { status: 409 },
        );
      }
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await prisma.store.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    throw e;
  }
}
