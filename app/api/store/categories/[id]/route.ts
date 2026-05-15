import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Per-Category PATCH + DELETE for the store owner.
 *
 * DELETE detaches products via the FK's ON DELETE SET NULL — the
 * products themselves stay (their categoryName is preserved as the
 * fallback label) so deleting a Category is non-destructive.
 */

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  slug: z.string().min(2).max(60).regex(slugRegex).optional(),
  description: z.string().max(500).optional().or(z.literal("")),
  bannerUrl: z.string().url().or(z.literal("")).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

// Authorize via the category's own storeId so ADMIN users (whose User
// row has no Store back-ref) can edit any store's categories — same
// pattern we use in /api/store/products/[id]. Without this, admin
// edits on /dashboard/store/categories?storeSlug=… 404'd with "Store
// not found" even though the admin was clearly authenticated.
async function authorize(categoryId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { store: { select: { id: true, slug: true, ownerId: true } } },
  });
  // 404 (not 403) on missing/cross-store access so we don't leak existence.
  if (!category) {
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }
  if (user.role !== "ADMIN" && category.store.ownerId !== user.id) {
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }
  return { store: category.store, category };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authorize(params.id);
  if ("error" in auth) return auth.error;
  const { category } = auth;
  const productCount = await prisma.product.count({
    where: { categoryId: category.id },
  });
  return NextResponse.json({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    bannerUrl: category.bannerUrl,
    sortOrder: category.sortOrder,
    productCount,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authorize(params.id);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id: params.id },
        data: {
          ...(d.name !== undefined ? { name: d.name } : {}),
          ...(d.slug !== undefined ? { slug: d.slug } : {}),
          ...(d.description !== undefined
            ? { description: d.description || null }
            : {}),
          ...(d.bannerUrl !== undefined
            ? { bannerUrl: d.bannerUrl || null }
            : {}),
          ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        },
      });
      // Keep Product.categoryName denormalized in sync when the name
      // changes so storefront tiles still show the right label even
      // when rendered without a Category JOIN.
      if (d.name !== undefined) {
        await tx.product.updateMany({
          where: { categoryId: params.id },
          data: { categoryName: d.name },
        });
      }
    });
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

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authorize(params.id);
  if ("error" in auth) return auth.error;
  // FK is ON DELETE SET NULL → products are detached, not deleted.
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
