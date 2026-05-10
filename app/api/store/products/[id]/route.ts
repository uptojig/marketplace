import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Per-product PATCH (full update incl. variants) + DELETE for the
 * store owner.  Replaces variants in-place inside one transaction
 * (delete-then-recreate) — diffing is overkill for hand-edited rows
 * and keeps the API surface simple.
 */

const variantSchema = z.object({
  externalVariantId: z.string().min(1).optional(),
  attributes: z.record(z.string()).default({}),
  priceTHB: z.number().nonnegative(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  sku: z.string().max(100).optional().or(z.literal("")),
  inventory: z.number().int().min(0).optional().nullable(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(300),
  titleTh: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  descriptionTh: z.string().max(5000).optional().or(z.literal("")),
  priceTHB: z.number().positive().max(99999999),
  compareAtPriceTHB: z.number().positive().max(99999999).optional().nullable(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  galleryUrls: z.array(z.string().url()).max(6).optional().default([]),
  categoryName: z.string().max(100).optional().or(z.literal("")),
  categoryId: z.string().min(1).optional().nullable(),
  active: z.boolean().optional().default(true),
  hasVariants: z.boolean().optional().default(false),
  variants: z.array(variantSchema).max(50).optional().default([]),
});

async function getStore(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { store: true },
  });
  return { user, store: user?.store ?? null };
}

function syntheticId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function authorizeOwner(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { store } = await getStore(session.user.email);
  if (!store) {
    return { error: NextResponse.json({ error: "Store not found" }, { status: 404 }) };
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  // 404 (not 403) on cross-store access so we don't leak existence.
  if (!product || product.storeId !== store.id) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { store, product };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authorizeOwner(params.id);
  if ("error" in auth) return auth.error;
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...product,
    priceTHB: Number(product.priceTHB),
    compareAtPriceTHB: product.compareAtPriceTHB
      ? Number(product.compareAtPriceTHB)
      : null,
    variants: product.variants.map((v) => ({
      ...v,
      priceTHB: Number(v.priceTHB),
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authorizeOwner(params.id);
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
  const galleryUrls = (d.galleryUrls ?? []).filter(Boolean);

  // Resolve optional categoryId so storefront tiles render the
  // Category's display name even when the form left categoryName
  // empty. categoryId === null detaches; undefined preserves what
  // was there. We treat the field as "present in payload" since
  // zod parses it to the absent state as undefined.
  let categoryId: string | null | undefined = d.categoryId;
  let categoryName: string | null = d.categoryName || null;
  if (categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { storeId: true, name: true },
    });
    if (!cat || cat.storeId !== auth.store.id) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่" }, { status: 404 });
    }
    categoryName = cat.name;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: params.id },
        data: {
          title: d.title,
          titleTh: d.titleTh || null,
          description: d.description || null,
          descriptionTh: d.descriptionTh || null,
          priceTHB: d.priceTHB,
          compareAtPriceTHB: d.compareAtPriceTHB ?? null,
          imageUrl: d.imageUrl || null,
          galleryUrls: galleryUrls.length > 0
            ? (galleryUrls as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          categoryName,
          ...(categoryId !== undefined ? { categoryId } : {}),
          active: d.active ?? true,
          hasVariants: d.hasVariants ?? false,
        },
      });

      // Replace variants wholesale — simpler than diffing.  Only delete
      // variants that aren't still referenced by an OrderItem; orphan
      // the rest in place so historic orders keep their variant link.
      const existing = await tx.productVariant.findMany({
        where: { productId: params.id },
        select: { id: true },
      });
      const referenced = await tx.orderItem.findMany({
        where: { variantId: { in: existing.map((v) => v.id) } },
        select: { variantId: true },
      });
      const referencedIds = new Set(
        referenced.map((r) => r.variantId).filter(Boolean) as string[],
      );
      const deletable = existing
        .map((v) => v.id)
        .filter((id) => !referencedIds.has(id));
      if (deletable.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: deletable } },
        });
      }

      if (d.variants && d.variants.length > 0) {
        await tx.productVariant.createMany({
          data: d.variants.map((v) => ({
            productId: params.id,
            externalVariantId: v.externalVariantId ?? syntheticId("manual"),
            attributes: v.attributes as Prisma.InputJsonValue,
            priceTHB: v.priceTHB,
            imageUrl: v.imageUrl || null,
            sku: v.sku || null,
            inventory: v.inventory ?? null,
          })),
          skipDuplicates: true, // dedupe by @@unique([productId, externalVariantId])
        });
      }
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${err.code}` },
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
  const auth = await authorizeOwner(params.id);
  if ("error" in auth) return auth.error;
  try {
    await prisma.product.delete({ where: { id: params.id } });
  } catch (err) {
    // If the product is referenced by any OrderItem, the FK protects
    // historic orders.  Surface a friendly message so the form can
    // suggest deactivating instead.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "ลบไม่ได้ — สินค้านี้ถูกอ้างอิงในออเดอร์เดิม กรุณาเปลี่ยนสถานะเป็น inactive แทน",
        },
        { status: 409 },
      );
    }
    throw err;
  }
  return NextResponse.json({ ok: true });
}
