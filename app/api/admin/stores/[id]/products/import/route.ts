/**
 * Import a single supplier product into a store.
 *
 * Used by the operator-driven product picker:
 *   1. Operator types a keyword in the picker's search box.
 *   2. UI hits GET /api/products/search?q=... (CJ proxy).
 *   3. Operator clicks "เพิ่ม" on a result → POST here with
 *      { supplier, externalProductId } from that result.
 *
 * We:
 *   - Re-fetch the product from CJ (the search result is a partial; the
 *     detail endpoint has the full description, gallery, variants).
 *   - Apply retail markup (MARGIN_MULT) so the cost-only THB from CJ
 *     becomes a sellable price — same policy as /api/products/search
 *     and the auto-curate path in landing-agent-managed.
 *   - Insert the Product row scoped to the store.
 *   - Idempotent: re-importing the same (supplier, externalProductId)
 *     into the same store reactivates the existing row instead of
 *     creating a duplicate. Operator can use this to "undo" a removal.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { Supplier } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";
import { enrichCJProduct } from "@/lib/suppliers/cj/enrich";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// CJ detail + variants is rate-limited; allow some headroom.
export const maxDuration = 60;

const bodySchema = z.object({
  supplier: z.nativeEnum(Supplier),
  externalProductId: z.string().min(1).max(100),
  // Optional override (admin can fine-tune margin per product).
  // Falls back to MARGIN_MULT env (default 1.5).
  marginMult: z.number().positive().max(10).optional(),
  // Skip the second CJ call for variants — useful when bulk-importing
  // and we want to keep CJ requests under their throttle.
  includeVariants: z.boolean().optional(),
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

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { supplier, externalProductId, marginMult, includeVariants } =
    parsed.data;

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // For now the picker only wires CJ. AE follows the same shape but
  // lives behind a separate adapter; surface a clearer error rather
  // than crashing if someone hand-rolls a different supplier in.
  if (supplier !== Supplier.CJ) {
    return NextResponse.json(
      { error: `supplier_${supplier.toLowerCase()}_not_wired` },
      { status: 501 },
    );
  }
  if (!process.env.CJ_API_KEY) {
    return NextResponse.json({ error: "cj_not_configured" }, { status: 503 });
  }

  // Idempotency: did this store already have this supplier product?
  // If yes — just flip active back on (and bump price/title in case
  // CJ's detail moved). Avoids "duplicate row" errors on repeat clicks.
  const existing = await prisma.product.findFirst({
    where: {
      storeId: params.id,
      supplier,
      externalProductId,
    },
    select: { id: true },
  });

  try {
    const detail = await cjAdapter.fetchProductById(externalProductId);
    const margin = marginMult ?? parseFloat(process.env.MARGIN_MULT ?? "1.5");
    const priceTHB = Math.ceil(detail.priceTHB * margin);

    let productId: string;
    if (existing) {
      const updated = await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: detail.title,
          priceTHB,
          imageUrl: detail.imageUrl ?? null,
          active: true,
        },
        select: { id: true },
      });
      productId = updated.id;
    } else {
      const created = await prisma.product.create({
        data: {
          storeId: params.id,
          supplier,
          externalProductId,
          title: detail.title,
          priceTHB,
          imageUrl: detail.imageUrl ?? null,
          galleryUrls: [],
          active: true,
        },
        select: { id: true },
      });
      productId = created.id;
    }

    // Enrich (description, gallery, variants). Best-effort — don't
    // fail the whole import if CJ throttles us on the second call.
    const enrich = await enrichCJProduct(productId, externalProductId, {
      includeVariants: includeVariants !== false,
    });

    return NextResponse.json({
      ok: true,
      productId,
      reactivated: !!existing,
      enriched: enrich.ok,
      variantCount: enrich.variantCount ?? 0,
      enrichError: enrich.error,
      priceTHB,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 500) : "unknown_error";
    console.error("[products/import] failed:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
