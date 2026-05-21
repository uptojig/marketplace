/**
 * Store-scoped product picker (admin-only).
 *
 * Operator workflow this page exists for:
 *   1. After /create-store + brief → system auto-curates a small set
 *      and triggers the landing agent.
 *   2. Operator opens this page to refine the catalog: search CJ for
 *      more items, "เพิ่ม" the ones they like, "ลบ" the ones they
 *      don't, until they have ~50 products that match the brand.
 *   3. (Optional) trigger Regenerate Landing from the existing
 *      landing-form so the homepage is rebuilt against the curated
 *      set — `translateProductTitlesForStore` in the landing-agent
 *      hook backfills `titleTh` for every newly-imported product so
 *      category / PDP / search read in Thai too.
 *
 * The page itself is a thin SSR shell that fetches the current
 * product list once for first paint; the interactive add/remove and
 * CJ search live in <ProductPicker /> on the client.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductPicker } from "./picker";

export const dynamic = "force-dynamic";

export default async function StoreProductsAdminPage({
  params,
}: {
  params: { id: string };
}) {
  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, name: true },
  });
  if (!store) notFound();

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
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
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link
          href={`/admin/stores/${store.id}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> {store.name}
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">เลือกสินค้าให้ร้าน</h1>
            <p className="text-sm text-muted-foreground">
              ค้นหาจาก CJ Dropshipping แล้วเพิ่มเข้าร้าน หรือเลือกสินค้าที่จะเอาออก —
              ตั้งเป้า ~50 ตัวที่เข้ากับแบรนด์
            </p>
          </div>
          <Link
            href={`/admin/stores/${store.id}/products/new`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มสินค้า (3 วิธี)
          </Link>
        </div>
      </div>

      <ProductPicker
        storeId={store.id}
        storeSlug={store.slug}
        initialProducts={products.map((p) => ({
          ...p,
          priceTHB: Number(p.priceTHB),
        }))}
      />
    </div>
  );
}
