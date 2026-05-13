"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Supplier } from "@prisma/client";
import { getSupplierClient } from "@/lib/import-sources";
import type { ImportSource } from "@/lib/import-sources/types";
import { processBatch } from "@/lib/import-pipeline/process";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("unauthorized");
  return { userId: session.user.id };
}

/**
 * Import job actions.
 *
 * NOTE: This module assumes you've added these tables to schema.ts:
 *   - import_jobs (id, storeId, userId, source, status, totals, timestamps)
 *   - import_job_items (id, jobId, externalId, status, externalData, processedData, rejectionReason, productId)
 *
 * For brevity, we operate on in-memory job tracking here. Wire to DB tables
 * when you generate the next migration.
 *
 * Flow:
 *   1. createImportJob(storeId, source, externalIds[])
 *      → fetches each from supplier
 *      → runs IP filter + translation
 *      → returns job ID
 *   2. confirmImportJob(jobId, acceptedItemIds[])
 *      → for each approved item: insert product row + variants
 *      → marks job 'completed'
 */

export interface CreateImportJobInput {
  storeId: string;
  source: ImportSource;
  externalIds: string[];
}

export interface ImportJobResult {
  jobId: string;
  summary: {
    total: number;
    accepted: number;
    flagged: number;
    rejected: number;
    rejectionBreakdown: Record<string, number>;
  };
  items: Array<{
    id: string;
    externalId: string;
    status: 'accepted' | 'flagged' | 'rejected';
    title: string;
    titleTh?: string;
    primaryImage: string;
    costTHB?: number;
    priceTHB?: number;
    rejectionReason?: string;
    flaggedCategory?: string;
    translated?: unknown; // full TranslatedProduct
  }>;
}

// In-memory store for demo. Replace with import_jobs DB table.
const jobStore = new Map<string, ImportJobResult>();

export async function createImportJob(input: CreateImportJobInput): Promise<ImportJobResult> {
  const session = await requireSession();
  const client = getSupplierClient(input.source);

  // 1. Fetch each product from supplier
  const supplierProducts = await Promise.all(
    input.externalIds.map((id) => client.getProduct(id)),
  );
  const validProducts = supplierProducts.filter((p): p is NonNullable<typeof p> => p !== null);

  // 2. Run pipeline (IP filter + translation)
  const { results, summary } = await processBatch(validProducts);

  // 3. Build job result
  const jobId = `imp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const items = results.map((r, i) => {
    const sp = validProducts[i];
    return {
      id: `${jobId}_${i}`,
      externalId: r.externalId,
      status: r.status,
      title: sp.title,
      titleTh: r.translated?.title.th,
      primaryImage: sp.primaryImage,
      costTHB: r.translated?.costTHB,
      priceTHB: r.translated?.priceTHB,
      rejectionReason: r.rejectionReason,
      flaggedCategory: r.ipCheck.category,
      translated: r.translated,
    };
  });

  const job: ImportJobResult = {
    jobId,
    summary,
    items,
  };

  // TODO: persist to DB import_jobs + import_job_items
  jobStore.set(jobId, job);

  revalidatePath('/seller/import');
  return job;
}

export async function getImportJob(jobId: string): Promise<ImportJobResult | null> {
  // TODO: query DB
  return jobStore.get(jobId) ?? null;
}

export interface ConfirmImportInput {
  jobId: string;
  itemIds: string[]; // subset of job.items to actually commit to products table
  storeId: string;
}

export async function confirmImport(input: ConfirmImportInput): Promise<{
  ok: boolean;
  importedCount: number;
  error?: string;
}> {
  await requireSession();
  const job = jobStore.get(input.jobId);
  if (!job) return { ok: false, importedCount: 0, error: 'job_not_found' };

  const itemsToImport = job.items.filter(
    (i) => input.itemIds.includes(i.id) && i.status !== 'rejected' && i.translated,
  );

  if (itemsToImport.length === 0) return { ok: false, importedCount: 0, error: 'no_valid_items' };

  let importedCount = 0;

  for (const item of itemsToImport) {
    const t = item.translated as Record<string, unknown>;
    if (!t) continue;

    try {
      const title = (t.title as { th: string }).th;
      const description = (t.description as { th: string }).th;
      const priceTHB = Number(t.priceTHB) || 0;
      const compareAtTHB = t.compareAtTHB ? Number(t.compareAtTHB) : null;
      const stock = (t.stock as number) ?? 0;
      const images = (t.images as Array<{ url: string; primary: boolean }>) ?? [];
      const thumbnailUrl = images[0]?.url ?? item.primaryImage;
      const categorySlugs = [t.categorySlug as string].filter(Boolean);

      await prisma.product.create({
        data: {
          storeId: input.storeId,
          title,
          description,
          priceTHB: new Prisma.Decimal(priceTHB),
          compareAtPriceTHB: compareAtTHB
            ? new Prisma.Decimal(compareAtTHB)
            : null,
          imageUrl: thumbnailUrl,
          supplier: importSourceToPrismaSupplier(item.externalId.startsWith("ali") ? "ali" : "cj"),
          externalProductId: item.externalId,
          stockTotal: stock,
          categorySlugs: categorySlugs as Prisma.InputJsonValue,
          active: true,
        },
      });
      importedCount++;
    } catch (err) {
      console.error("[import] failed to insert", item.externalId, err);
    }
  }

  revalidatePath("/seller/products");
  revalidatePath("/seller/import");
  return { ok: true, importedCount };
}

function importSourceToPrismaSupplier(src: string): Supplier {
  if (src === "ali" || src === "aliexpress") return Supplier.ALIEXPRESS;
  if (src === "cj") return Supplier.CJ;
  return Supplier.MOCK;
}
