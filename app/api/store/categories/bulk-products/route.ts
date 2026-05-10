import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/store/categories/bulk-products
 *
 * Generalised bulk product update for the categories dashboard. The
 * /bulk-assign endpoint was specifically for category change; this
 * one accepts a small action vocabulary so the action bar can do
 * "ตั้ง active / ตั้ง hidden / ลบ" + category change without each
 * needing its own API surface.
 *
 *   action="set_category"  body: { productIds, categoryId | null }
 *   action="set_active"    body: { productIds, active: true|false }
 *   action="delete"        body: { productIds }
 *
 * Always store-scoped: every productId must belong to the caller's
 * store. Mixed-ownership requests return 403.
 */

const baseSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(500),
});

const setCategorySchema = baseSchema.extend({
  action: z.literal("set_category"),
  categoryId: z.string().min(1).nullable(),
});

const setActiveSchema = baseSchema.extend({
  action: z.literal("set_active"),
  active: z.boolean(),
});

const deleteSchema = baseSchema.extend({
  action: z.literal("delete"),
});

const schema = z.discriminatedUnion("action", [
  setCategorySchema,
  setActiveSchema,
  deleteSchema,
]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });
  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  const storeId = user.store.id;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Verify ownership before any write. The dashboard only surfaces
  // owned rows so a mismatch is either a stale tab or a tampered
  // request — fail closed to avoid silent partial updates.
  const owned = await prisma.product.findMany({
    where: { id: { in: data.productIds }, storeId },
    select: { id: true },
  });
  if (owned.length !== data.productIds.length) {
    return NextResponse.json(
      { error: "บางสินค้าไม่ได้อยู่ในร้านนี้" },
      { status: 403 },
    );
  }

  if (data.action === "set_category") {
    let categoryName: string | null = null;
    if (data.categoryId !== null) {
      const cat = await prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { storeId: true, name: true },
      });
      if (!cat || cat.storeId !== storeId) {
        return NextResponse.json({ error: "ไม่พบหมวดหมู่" }, { status: 404 });
      }
      categoryName = cat.name;
    }
    const result = await prisma.product.updateMany({
      where: { id: { in: data.productIds }, storeId },
      data: { categoryId: data.categoryId, categoryName },
    });
    return NextResponse.json({ ok: true, count: result.count });
  }

  if (data.action === "set_active") {
    const result = await prisma.product.updateMany({
      where: { id: { in: data.productIds }, storeId },
      data: { active: data.active },
    });
    return NextResponse.json({ ok: true, count: result.count });
  }

  // action === "delete"
  try {
    const result = await prisma.product.deleteMany({
      where: { id: { in: data.productIds }, storeId },
    });
    return NextResponse.json({ ok: true, count: result.count });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      // Some products are referenced by historic OrderItem rows —
      // the FK protects them. Surface a friendly suggestion so the
      // operator can hide the rows instead of deleting.
      return NextResponse.json(
        {
          error:
            "ลบบางรายการไม่ได้ — มีออเดอร์เดิมอ้างอิงสินค้าอยู่ กรุณาใช้ \"ซ่อน\" แทน",
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
