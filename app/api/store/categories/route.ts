import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Store-owner-scoped Category CRUD (list + create). Per-row update /
 * delete lives in /api/store/categories/[id]; bulk product assignment
 * lives in /api/store/categories/bulk-assign.
 *
 * Auth model mirrors /api/store/products: NextAuth session →
 * user.email → user.store. Anything outside the caller's own store is
 * 404'd to avoid leaking existence.
 */

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const createSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(slugRegex, "ใช้ได้แค่ a-z 0-9 และ - เท่านั้น"),
  description: z.string().max(500).optional().or(z.literal("")),
  bannerUrl: z.string().url().or(z.literal("")).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

async function getStore(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { store: true },
  });
  return { user, store: user?.store ?? null };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { store } = await getStore(session.user.email);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      bannerUrl: c.bannerUrl,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { store } = await getStore(session.user.email);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;

  try {
    const created = await prisma.category.create({
      data: {
        storeId: store.id,
        name: d.name,
        slug: d.slug,
        description: d.description || null,
        bannerUrl: d.bannerUrl || null,
        sortOrder: d.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: { slug: ["มี slug นี้อยู่แล้วในร้านนี้"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
