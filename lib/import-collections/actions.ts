"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Supplier } from "@prisma/client";
import { translateProduct } from "@/lib/import-pipeline/translate";
import type { CollectionItem } from "./store";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("unauthorized");
  return { userId: session.user.id };
}

/**
 * Server actions for collection bulk operations.
 *
 * Client invokes these from collection detail page after passing items
 * (since Zustand store is client-side and DB persistence is TODO).
 */

export interface BulkTranslateResult {
  itemId: string;
  translated: {
    titleTh: string;
    descriptionTh: string;
    categorySlug: string;
    categoryTh: string;
    priceTHB: number;
    compareAtTHB: number;
    costTHB: number;
  };
}

/**
 * Translate every item in batch (5 concurrent).
 * Returns translation result per item — client merges into Zustand store.
 */
export async function bulkTranslate(items: CollectionItem[]): Promise<BulkTranslateResult[]> {
  await requireSession();

  const CONCURRENCY = 5;
  const results: BulkTranslateResult[] = [];

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const t = await translateProduct(item.product);
        return {
          itemId: item.id,
          translated: {
            titleTh: t.title.th,
            descriptionTh: t.description.th,
            categorySlug: t.categorySlug,
            categoryTh: t.category,
            priceTHB: t.priceTHB,
            compareAtTHB: t.compareAtTHB,
            costTHB: t.costTHB,
          },
        };
      }),
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Commit collection items to the products table.
 * Uses translated data + selected image URLs.
 */
export async function bulkImport(input: {
  collectionId: string;
  storeId: string;
  items: CollectionItem[];
}): Promise<{ ok: boolean; importedCount: number; error?: string }> {
  await requireSession();

  const importable = input.items.filter(
    (i) => i.translated && i.product.ipVerdict !== 'REJECTED',
  );

  if (importable.length === 0) {
    return { ok: false, importedCount: 0, error: 'no_translated_items' };
  }

  let imported = 0;
  for (const item of importable) {
    const t = item.translated!;
    const selectedUrls = (item.selectedImageIndexes ?? item.product.images.map((_, i) => i))
      .map((idx) => item.product.images[idx])
      .filter(Boolean);
    const primaryIdx = item.primaryImageIndex ?? 0;
    const primaryUrl =
      item.product.images[(item.selectedImageIndexes ?? [primaryIdx])[primaryIdx]] ??
      item.product.primaryImage;

    try {
      await prisma.product.create({
        data: {
          storeId: input.storeId,
          title: t.titleTh,
          description: t.descriptionTh,
          priceTHB: new Prisma.Decimal(t.priceTHB),
          compareAtPriceTHB: t.compareAtTHB
            ? new Prisma.Decimal(t.compareAtTHB)
            : null,
          imageUrl: primaryUrl,
          supplier: Supplier.MOCK,
          externalProductId: item.externalId,
          stockTotal: 50,
          categorySlugs: [t.categorySlug] as Prisma.InputJsonValue,
          active: true,
        },
      });
      imported++;
    } catch (err) {
      console.error("[collection-import] failed for", item.externalId, err);
    }
  }

  revalidatePath('/seller/products');
  revalidatePath('/seller/import');
  return { ok: true, importedCount: imported };
}
