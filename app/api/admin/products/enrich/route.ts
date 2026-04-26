import { NextResponse } from "next/server";
import { z } from "zod";
import { Supplier } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";

export const maxDuration = 60; // Vercel: allow up to 60s for batch

const schema = z.object({
  productId: z.string().optional(),
  storeId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

function extractGallery(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;
  const set = r.productImageSet ?? r.productImageList;
  if (Array.isArray(set)) return set.filter((x): x is string => typeof x === "string");
  if (typeof set === "string") {
    return set.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { productId, storeId, limit } = parsed.data;

  const products = await prisma.product.findMany({
    where: {
      supplier: Supplier.CJ,
      ...(productId ? { id: productId } : {}),
      ...(storeId ? { storeId } : {}),
    },
    select: { id: true, externalProductId: true, title: true },
    take: limit,
  });

  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const p of products) {
    try {
      const detail = await cjAdapter.fetchProductById(p.externalProductId);
      const gallery = extractGallery(detail.raw);
      await prisma.product.update({
        where: { id: p.id },
        data: {
          description: detail.description ?? null,
          imageUrl: detail.imageUrl ?? null,
          galleryUrls: gallery.length > 0 ? gallery : undefined,
          externalPayload: detail.raw as never,
        },
      });
      results.push({ id: p.id, ok: true });
    } catch (e) {
      results.push({
        id: p.id,
        ok: false,
        error: e instanceof Error ? e.message : "unknown",
      });
    }
    // Throttle: CJ rate limit ~1 req/sec
    await new Promise((r) => setTimeout(r, 1100));
  }

  return NextResponse.json({
    total: products.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
