import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { detectSupplierFromUrl, getSupplier } from "@/lib/suppliers/registry";
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

  // SAVE: prefer the cookie-session user (onboarding flow), then NextAuth, then first store fallback.
  let storeId: string | null = null;
  const cookieUserId = getCurrentUserId();
  if (cookieUserId) {
    const store = await prisma.store.findUnique({ where: { ownerId: cookieUserId } });
    storeId = store?.id ?? null;
  }
  if (!storeId) {
    const session = await getServerSession(authOptions).catch(() => null);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true },
      });
      storeId = user?.store?.id ?? null;
    }
  }
  if (!storeId) {
    const fallback = await prisma.store.findFirst();
    storeId = fallback?.id ?? null;
  }
  if (!storeId) {
    return NextResponse.json({ error: "No store found. Run db:seed first." }, { status: 400 });
  }

  const created = await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.product.create({
        data: {
          storeId: storeId!,
          title: item.title,
          description: item.description,
          priceTHB: item.priceTHB,
          imageUrl: item.imageUrl,
          supplier: item.supplier,
          externalProductId: item.externalProductId,
          externalPayload: (item.raw ?? null) as never,
        },
        select: { id: true, title: true },
      }),
    ),
  );

  return NextResponse.json({ saved: created.length, ids: created.map((c) => c.id), products: created });
}
