import { NextResponse } from "next/server";
import { z } from "zod";
import { waitUntil } from "@vercel/functions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectSupplierFromUrl, getSupplier } from "@/lib/suppliers/registry";
import { translateProductTitlesForStore } from "@/lib/translate-titles";
import type { Supplier } from "@prisma/client";

const previewSchema = z.object({
  action: z.literal("preview"),
  urls: z.array(z.string().min(1)).min(1).max(50),
});

const saveSchema = z.object({
  action: z.literal("save"),
  items: z
    .array(
      z.object({
        url: z.string().min(1),
        externalProductId: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        priceTHB: z.number().nonnegative(),
        imageUrl: z.string().optional(),
        supplier: z.enum(["CJ", "ALIEXPRESS", "MOCK"]),
        raw: z.unknown().optional(),
      }),
    )
    .min(1)
    .max(50),
  // Optional admin-only override. Lets an ADMIN user import into any
  // store from /admin/stores/[id]/products/new without that store
  // belonging to them. The handler only honours this when the caller
  // is verified ADMIN — non-admin callers passing storeId fall back
  // to their own session store, same as before.
  storeId: z.string().min(1).optional(),
});

const requestSchema = z.union([previewSchema, saveSchema]);

interface PreviewResult {
  url: string;
  ok: boolean;
  supplier: Supplier;
  externalProductId?: string;
  title?: string;
  description?: string;
  priceTHB?: number;
  imageUrl?: string;
  raw?: unknown;
  error?: string;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.action === "preview") {
    const results = await Promise.all(
      parsed.data.urls.map(async (url): Promise<PreviewResult> => {
        const supplierName = detectSupplierFromUrl(url);
        try {
          const normalized = await getSupplier(supplierName).fetchProductByUrl(url);
          return {
            url,
            ok: true,
            supplier: supplierName,
            externalProductId: normalized.externalProductId,
            title: normalized.title,
            description: normalized.description,
            priceTHB: normalized.priceTHB,
            imageUrl: normalized.imageUrl,
            raw: normalized.raw,
          };
        } catch (err) {
          return {
            url,
            ok: false,
            supplier: supplierName,
            error: err instanceof Error ? err.message : "Fetch failed",
          };
        }
      }),
    );
    return NextResponse.json({ items: results });
  }

  // SAVE: resolve target store. Order:
  //   1. Admin override — body.storeId honoured ONLY if the caller is
  //      a verified ADMIN role. Lets /admin/stores/[id]/products add
  //      into stores that aren't owned by the admin's own user.
  //   2. NextAuth session → user.store (the owner-flow path).
  //   3. First store in DB (single-store dev fallback).
  //
  // The cookie-session path that used to sit between (1) and (2) was
  // an /onboarding leftover; that flow is gone (commit 59c7c90) and
  // the cookie was never set anywhere else, so it always resolved
  // null and just slowed every save by one extra Prisma roundtrip.
  let storeId: string | null = null;
  const session = await getServerSession(authOptions).catch(() => null);

  if (parsed.data.storeId && session?.user?.email) {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (me?.role === "ADMIN") {
      const target = await prisma.store.findUnique({
        where: { id: parsed.data.storeId },
        select: { id: true },
      });
      if (target) storeId = target.id;
    }
  }

  if (!storeId && session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true },
    });
    storeId = user?.store?.id ?? null;
  }
  if (!storeId) {
    const fallback = await prisma.store.findFirst();
    storeId = fallback?.id ?? null;
  }
  if (!storeId) {
    return NextResponse.json({ error: "No store found. Run db:seed first." }, { status: 400 });
  }

  const created = await prisma.$transaction(
    parsed.data.items.map((item) => {
      const raw = (item.raw ?? null) as Record<string, unknown> | null;
      const categoryName =
        (raw?.categoryName as string | undefined) ??
        (raw?.threeCategoryName as string | undefined) ??
        (raw?.twoCategoryName as string | undefined) ??
        (raw?.oneCategoryName as string | undefined) ??
        null;
      return prisma.product.create({
        data: {
          storeId: storeId!,
          title: item.title,
          description: item.description,
          priceTHB: item.priceTHB,
          imageUrl: item.imageUrl,
          supplier: item.supplier,
          externalProductId: item.externalProductId,
          externalPayload: (item.raw ?? null) as never,
          categoryName: categoryName ? String(categoryName).trim() : null,
        },
        select: { id: true, title: true },
      });
    }),
  );

  // Fire-and-forget Thai title backfill. Imported products land with
  // English `title` only (suppliers don't ship localized copy that we
  // trust as marketing-quality). `translateProductTitlesForStore` skips
  // rows that already have titleTh, so re-importing the same product
  // doesn't burn extra Claude calls. waitUntil keeps the Vercel
  // function alive past the response so the translate batches finish
  // even though the operator's HTTP response already returned.
  waitUntil(
    translateProductTitlesForStore(storeId).catch((err) => {
      console.error("[products/import] titleTh backfill failed:", err);
    }),
  );

  return NextResponse.json({ saved: created.length, ids: created.map((c) => c.id), products: created });
}
