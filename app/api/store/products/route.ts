import { NextResponse } from "next/server";
import { z } from "zod";
import { waitUntil } from "@/lib/wait-until";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { translateProductTitlesForStore } from "@/lib/translate-titles";

/**
 * Store-owner-scoped product CRUD. Pairs with /api/store/products/[id]
 * for update/delete. Auth: NextAuth session → user.email → user.store.
 *
 * Manual products (gradient-builder flow) get supplier=MOCK and a
 * synthetic externalProductId so the schema's @@unique constraint
 * doesn't complain.  Variants without externalVariantId get a
 * synthetic one too.
 */

const variantSchema = z.object({
  externalVariantId: z.string().min(1).optional(),
  attributes: z.record(z.string()).default({}),
  priceTHB: z.number().nonnegative(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  sku: z.string().max(100).optional().or(z.literal("")),
  inventory: z.number().int().min(0).optional().nullable(),
});

const createSchema = z.object({
  title: z.string().min(1).max(300),
  titleTh: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  descriptionTh: z.string().max(5000).optional().or(z.literal("")),
  priceTHB: z.number().positive().max(99999999),
  compareAtPriceTHB: z.number().positive().max(99999999).optional().nullable(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  galleryUrls: z.array(z.string().url()).max(6).optional().default([]),
  categoryName: z.string().max(100).optional().or(z.literal("")),
  // Optional FK to vendor-managed Category. Verified store-scoped at
  // POST time so a tampered request can't attach to another store's
  // category. categoryName is kept in sync as the denormalized label.
  categoryId: z.string().min(1).optional().nullable(),
  active: z.boolean().optional().default(true),
  hasVariants: z.boolean().optional().default(false),
  variants: z.array(variantSchema).max(50).optional().default([]),
  // Digital-product fields. Default PHYSICAL keeps every existing
  // caller unchanged. digitalKind is required when DIGITAL; promptText
  // only applies to the PROMPT kind (the others attach files later via
  // /api/store/digital-assets/upload on the edit page).
  productType: z.enum(["PHYSICAL", "DIGITAL"]).optional().default("PHYSICAL"),
  digitalKind: z
    .enum(["EBOOK", "EXCEL", "VECTOR", "PROMPT", "ARCHIVE", "OTHER"])
    .optional()
    .nullable(),
  promptText: z.string().max(20000).optional().nullable(),
  // import-flow extras (when user pasted a supplier URL)
  supplier: z.enum(["CJ", "ALIEXPRESS", "MOCK"]).optional(),
  externalProductId: z.string().min(1).optional(),
  externalPayload: z.unknown().optional(),
}).refine(
  (d) => d.productType !== "DIGITAL" || !!d.digitalKind,
  { message: "digitalKind required for digital products", path: ["digitalKind"] },
);

// Resolve the dashboard's active store. Mirrors lib/stores/resolve-
// dashboard-store.ts but for API context: prefer the explicit storeSlug
// query / body param (passed from the dashboard URL), fall back to the
// signed-in user's owned store. Admins can target any store via slug.
async function resolveActiveStore(
  email: string,
  requestedSlug?: string | null,
) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      store: { select: { id: true, slug: true, ownerId: true } },
    },
  });
  if (!user) return { user: null, store: null };

  if (requestedSlug) {
    const target = await prisma.store.findUnique({
      where: { slug: requestedSlug },
      select: { id: true, slug: true, ownerId: true },
    });
    if (!target) return { user, store: null };
    // ADMIN can target any; otherwise must own the requested store.
    if (user.role !== "ADMIN" && target.ownerId !== user.id) {
      return { user, store: null };
    }
    return { user, store: target };
  }

  return { user, store: user.store ?? null };
}

function syntheticId(prefix: string) {
  // crypto.randomUUID() is available globally in Node 18+; matches the
  // uniqueness guarantees of cuid without pulling in a new dep.
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const slug = new URL(req.url).searchParams.get("storeSlug");
  const { store } = await resolveActiveStore(session.user.email, slug);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { variants: true } },
    },
  });
  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      priceTHB: Number(p.priceTHB),
      compareAtPriceTHB: p.compareAtPriceTHB ? Number(p.compareAtPriceTHB) : null,
      variantCount: p._count.variants,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // storeSlug can come from the query (?storeSlug=...) OR the body —
  // older form code didn't include it.
  const urlSlug = new URL(req.url).searchParams.get("storeSlug");
  const bodyForSlug = await req.clone().json().catch(() => null);
  const bodySlug = bodyForSlug && typeof bodyForSlug.storeSlug === "string"
    ? bodyForSlug.storeSlug
    : null;
  const { store } = await resolveActiveStore(
    session.user.email,
    urlSlug ?? bodySlug,
  );
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

  // Synthesize identity for manual products. If the user supplied
  // them (import flow), use those instead so the schema-level
  // @@unique([supplier, externalProductId]) keeps deduping.
  const supplier = d.supplier ?? "MOCK";
  const externalProductId = d.externalProductId ?? syntheticId("manual");
  const galleryUrls = (d.galleryUrls ?? []).filter(Boolean);

  // Resolve the optional categoryId → keeps Product.categoryName
  // in sync with Category.name (denormalized label fallback). 404
  // if the operator pointed at a category outside their store.
  let categoryId: string | null = d.categoryId ?? null;
  let categoryName: string | null = d.categoryName || null;
  if (categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { storeId: true, name: true },
    });
    if (!cat || cat.storeId !== store.id) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่" }, { status: 404 });
    }
    categoryName = cat.name;
  }

  const created = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        storeId: store.id,
        title: d.title,
        titleTh: d.titleTh || null,
        description: d.description || null,
        descriptionTh: d.descriptionTh || null,
        priceTHB: d.priceTHB,
        compareAtPriceTHB: d.compareAtPriceTHB ?? null,
        imageUrl: d.imageUrl || null,
        galleryUrls: galleryUrls.length > 0 ? (galleryUrls as Prisma.InputJsonValue) : Prisma.JsonNull,
        categoryName,
        categoryId,
        active: d.active ?? true,
        // Digital products never carry variants — force the flag off so
        // the storefront PDP doesn't render an empty variant picker.
        hasVariants: d.productType === "DIGITAL" ? false : (d.hasVariants ?? false),
        productType: d.productType ?? "PHYSICAL",
        digitalKind: d.productType === "DIGITAL" ? (d.digitalKind ?? null) : null,
        promptText:
          d.productType === "DIGITAL" && d.digitalKind === "PROMPT"
            ? (d.promptText ?? null)
            : null,
        supplier,
        externalProductId,
        externalPayload: (d.externalPayload ?? null) as never,
      },
    });

    if (d.productType !== "DIGITAL" && d.variants && d.variants.length > 0) {
      await tx.productVariant.createMany({
        data: d.variants.map((v) => ({
          productId: product.id,
          externalVariantId: v.externalVariantId ?? syntheticId("manual"),
          attributes: v.attributes as Prisma.InputJsonValue,
          priceTHB: v.priceTHB,
          imageUrl: v.imageUrl || null,
          sku: v.sku || null,
          inventory: v.inventory ?? null,
        })),
      });
    }

    return product;
  });

  // Backfill titleTh for any null rows in the store (idempotent —
  // skips products that already have titleTh, including the one
  // we just created if the operator supplied a Thai title manually).
  // Fire-and-forget so the form save returns instantly.
  waitUntil(
    translateProductTitlesForStore(store.id).catch((err) => {
      console.error("[store/products] titleTh backfill failed:", err);
    }),
  );

  return NextResponse.json({ id: created.id }, { status: 201 });
}
