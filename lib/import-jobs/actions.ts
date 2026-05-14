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

export async function createImportJob(input: CreateImportJobInput & { storeId?: string }): Promise<ImportJobResult> {
  const session = await requireSession();
  const client = getSupplierClient(input.source);

  // 1. Fetch each product from supplier
  const supplierProducts = await Promise.all(
    input.externalIds.map((id) => client.getProduct(id)),
  );
  const validProducts = supplierProducts.filter((p): p is NonNullable<typeof p> => p !== null);

  // 2. Run pipeline (IP filter + translation)
  const { results, summary } = await processBatch(validProducts);

  // 3. Persist job + items in one transaction
  const job = await prisma.$transaction(async (tx) => {
    const row = await tx.importJob.create({
      data: {
        storeId: input.storeId ?? "",
        userId: session.userId,
        source: input.source,
        status: "REVIEW",
        totalCount: summary.total,
        acceptedCount: summary.accepted,
        flaggedCount: summary.flagged,
        rejectedCount: summary.rejected,
        rejectionBreakdown: summary.rejectionBreakdown as Prisma.InputJsonValue,
      },
    });

    if (results.length > 0) {
      await tx.importJobItem.createMany({
        data: results.map((r, i) => {
          const sp = validProducts[i];
          return {
            jobId: row.id,
            externalId: r.externalId,
            status: r.status,
            title: sp.title,
            titleTh: r.translated?.title.th ?? null,
            primaryImage: sp.primaryImage,
            costTHB: r.translated?.costTHB
              ? new Prisma.Decimal(r.translated.costTHB)
              : null,
            priceTHB: r.translated?.priceTHB
              ? new Prisma.Decimal(r.translated.priceTHB)
              : null,
            rejectionReason: r.rejectionReason ?? null,
            flaggedCategory: r.ipCheck.category ?? null,
            translated:
              (r.translated as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
          };
        }),
      });
    }

    return row;
  });

  const persistedItems = await prisma.importJobItem.findMany({
    where: { jobId: job.id },
    orderBy: { createdAt: "asc" },
  });

  const out: ImportJobResult = {
    jobId: job.id,
    summary,
    items: persistedItems.map((i) => ({
      id: i.id,
      externalId: i.externalId,
      status: i.status as "accepted" | "flagged" | "rejected",
      title: i.title,
      titleTh: i.titleTh ?? undefined,
      primaryImage: i.primaryImage,
      costTHB: i.costTHB ? Number(i.costTHB) : undefined,
      priceTHB: i.priceTHB ? Number(i.priceTHB) : undefined,
      rejectionReason: i.rejectionReason ?? undefined,
      flaggedCategory: i.flaggedCategory ?? undefined,
      translated: i.translated ?? undefined,
    })),
  };

  revalidatePath("/seller/import");
  return out;
}

export async function getImportJob(jobId: string): Promise<ImportJobResult | null> {
  const row = await prisma.importJob.findUnique({
    where: { id: jobId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!row) return null;
  return {
    jobId: row.id,
    summary: {
      total: row.totalCount,
      accepted: row.acceptedCount,
      flagged: row.flaggedCount,
      rejected: row.rejectedCount,
      rejectionBreakdown:
        (row.rejectionBreakdown as Record<string, number> | null) ?? {},
    },
    items: row.items.map((i) => ({
      id: i.id,
      externalId: i.externalId,
      status: i.status as "accepted" | "flagged" | "rejected",
      title: i.title,
      titleTh: i.titleTh ?? undefined,
      primaryImage: i.primaryImage,
      costTHB: i.costTHB ? Number(i.costTHB) : undefined,
      priceTHB: i.priceTHB ? Number(i.priceTHB) : undefined,
      rejectionReason: i.rejectionReason ?? undefined,
      flaggedCategory: i.flaggedCategory ?? undefined,
      translated: i.translated ?? undefined,
    })),
  };
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
  const job = await getImportJob(input.jobId);
  if (!job) return { ok: false, importedCount: 0, error: "job_not_found" };

  const itemsToImport = job.items.filter(
    (i) => input.itemIds.includes(i.id) && i.status !== "rejected" && i.translated,
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

      const created = await prisma.product.create({
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
        select: { id: true },
      });
      // Link the job item back to the Product so the operator can
      // trace a committed item to the live catalog row.
      await prisma.importJobItem.update({
        where: { id: item.id },
        data: { productId: created.id },
      });
      importedCount++;
    } catch (err) {
      console.error("[import] failed to insert", item.externalId, err);
    }
  }

  // Flip the job's status once anything was committed; idempotent.
  if (importedCount > 0) {
    await prisma.importJob.update({
      where: { id: input.jobId },
      data: { status: "COMMITTED" },
    });
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
