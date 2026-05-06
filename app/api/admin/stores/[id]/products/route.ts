/**
 * Store-scoped product CRUD for the admin product picker.
 *
 * - GET    → list products in this store (incl. inactive). Used by the
 *           /admin/stores/[id]/products picker as the source-of-truth.
 * - DELETE → bulk remove products by id. Default = soft remove
 *           (active=false, keeps Order history intact via cascade-safe
 *           reference). Pass `?hard=1` or `{ hard: true }` to actually
 *           delete the row — only safe for products that never sold.
 *
 * The "operator picks their own 50 products" flow uses POST .../import
 * (separate route) to add products and DELETE here to remove.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, Supplier } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, name: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const products = await prisma.product.findMany({
    where: { storeId: params.id },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      titleTh: true,
      priceTHB: true,
      imageUrl: true,
      supplier: true,
      externalProductId: true,
      categoryName: true,
      active: true,
      hasVariants: true,
      createdAt: true,
    },
  });

  // Decimal isn't JSON-serializable directly — convert to number once at
  // the API edge so the client doesn't need to handle BigDecimal-ish.
  return NextResponse.json({
    store: { id: store.id, slug: store.slug, name: store.name },
    products: products.map((p) => ({
      ...p,
      priceTHB: Number(p.priceTHB),
    })),
  });
}

const deleteBody = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
  hard: z.boolean().optional(),
});

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const queryHard = url.searchParams.get("hard") === "1";
  const raw = await req.json().catch(() => ({}));
  const parsed = deleteBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { ids } = parsed.data;
  const hard = parsed.data.hard ?? queryHard;

  // Scope by storeId so an operator can't delete another store's
  // products by guessing IDs. Prisma's `deleteMany` / `updateMany`
  // both honour the where filter.
  const where: Prisma.ProductWhereInput = { id: { in: ids }, storeId: params.id };

  if (hard) {
    // Block hard delete if any of these products have ever been
    // ordered — Prisma's relation is `OrderItem.productId`.
    // Keeping order history is more important than a pristine DB,
    // so fall through to soft-delete in that case.
    const sold = await prisma.orderItem.findMany({
      where: { productId: { in: ids } },
      select: { productId: true },
      distinct: ["productId"],
    });
    if (sold.length > 0) {
      const soldIds = new Set(sold.map((s) => s.productId));
      // Soft-delete the sold ones, hard-delete the rest.
      const safe = ids.filter((id) => !soldIds.has(id));
      await Promise.all([
        prisma.product.updateMany({
          where: { id: { in: Array.from(soldIds) }, storeId: params.id },
          data: { active: false },
        }),
        safe.length > 0
          ? prisma.product.deleteMany({
              where: { id: { in: safe }, storeId: params.id },
            })
          : Promise.resolve(undefined),
      ]);
      return NextResponse.json({
        ok: true,
        hardDeleted: safe.length,
        softDeleted: soldIds.size,
      });
    }
    const r = await prisma.product.deleteMany({ where });
    return NextResponse.json({ ok: true, hardDeleted: r.count });
  }

  const r = await prisma.product.updateMany({ where, data: { active: false } });
  return NextResponse.json({ ok: true, softDeleted: r.count });
}

// Re-export the Supplier enum shape so the import route's type comes
// from the same module path — keeps client/server in sync.
export type { Supplier };
