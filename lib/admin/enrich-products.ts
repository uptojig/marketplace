"use server";

/**
 * Admin server actions: per-store product enrichment.
 *
 * Why this exists:
 *   The 6 real pilot stores have ~394 products imported from CJ
 *   Dropshipping in English with sparse images and no Category
 *   assignments. The product owner wants every product to have:
 *     - Thai title  (Product.titleTh)
 *     - Thai description (Product.descriptionTh)
 *     - A real Category row assigned (Product.categoryId + categoryName)
 *     - >= 2 images (imageUrl + galleryUrls)
 *
 *   This module batch-fills the first three via Anthropic Claude Haiku
 *   4.5 and flags rows under the 2-image threshold so the operator can
 *   manually decide how to source more shots (we deliberately do NOT
 *   auto-scrape — image sourcing is out of scope for this PR).
 *
 * Scope:
 *   - Operator triggers per-store from the admin UI. No cron, no
 *     auto-enrichment of new imports — that's a follow-up.
 *   - Idempotent: re-running only touches rows that are still missing
 *     a field. Already-translated products are skipped.
 *
 * Auth:
 *   - Admin-only (uses `requireAdmin` from the provisioner module so
 *     we don't fork yet another auth helper).
 */

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/provisioner/auth";
import {
  TranslateNotConfiguredError,
  translateProductCopy,
  type TranslatedCopy,
} from "@/lib/import-pipeline/translate";

export interface EnrichSkipped {
  productId: string;
  reason: string;
}

export interface EnrichLowImage {
  productId: string;
  title: string;
  imageCount: number;
}

export interface EnrichResult {
  storeId: string;
  scanned: number;
  translated: number;
  categorized: number;
  flaggedLowImage: EnrichLowImage[];
  skipped: EnrichSkipped[];
  /**
   * Set when the Anthropic API key is missing or the caller is not an
   * admin — caller surfaces this verbatim so the operator knows why
   * nothing happened.
   */
  error?: "agent_not_configured" | "forbidden" | "store_not_found";
}

/**
 * Quality counts for the per-store dashboard column. Cheap to call —
 * no LLM, no external network, just three count() queries.
 */
export interface QualitySnapshot {
  total: number;
  translated: number;
  categorized: number;
  lowImage: number;
}

const CONCURRENCY = 5;
const MIN_IMAGES = 2;

function imageCountFor(p: { imageUrl: string | null; galleryUrls: Prisma.JsonValue | null }): number {
  const gallery = Array.isArray(p.galleryUrls)
    ? p.galleryUrls.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  const primary = p.imageUrl && p.imageUrl.trim().length > 0 ? 1 : 0;
  return primary + gallery.length;
}

/**
 * Read-only summary for a store, used by the admin index column.
 * Returns zero counts (not an error) if the store doesn't exist —
 * the column UI shouldn't crash if a store is mid-delete.
 *
 * NOTE: For list views of 200 stores prefer the batch variant below —
 * calling this once-per-row is an N+1 query (200 stores ≈ 200 row
 * scans).
 */
export async function getStoreQualitySnapshot(storeId: string): Promise<QualitySnapshot> {
  const snapshots = await getStoresQualitySnapshotBatch([storeId]);
  return (
    snapshots[storeId] ?? {
      total: 0,
      translated: 0,
      categorized: 0,
      lowImage: 0,
    }
  );
}

/**
 * Batch variant for the /admin/stores list page.
 *
 * Pulls every active product for the requested stores in a *single*
 * SELECT and aggregates per-store in Node. This replaces the
 * fan-out of N × findMany (which previously scanned N store
 * product subsets sequentially and made the list page O(N) database
 * trips). 200 stores collapse to 1 query that returns ≤ ~2000 product
 * rows total — well within the result set Prisma is happy with.
 *
 * Caller passes `storeIds`; result is keyed by storeId. Stores with
 * zero products are populated with zero counts so the UI doesn't have
 * to special-case "missing" entries.
 *
 * Defensive against per-store JSON malformations: a single bad
 * `galleryUrls` row can't crash the whole list because we don't
 * dereference it as a typed array — `imageCountFor` already guards
 * non-array JSON shapes.
 */
export async function getStoresQualitySnapshotBatch(
  storeIds: string[],
): Promise<Record<string, QualitySnapshot>> {
  // Pre-seed every requested storeId so callers iterating
  // `storeIds.map(id => snapshots[id])` never hit `undefined`.
  const result: Record<string, QualitySnapshot> = {};
  for (const id of storeIds) {
    result[id] = { total: 0, translated: 0, categorized: 0, lowImage: 0 };
  }
  if (storeIds.length === 0) return result;

  const rows = await prisma.product.findMany({
    where: { storeId: { in: storeIds }, active: true },
    select: {
      storeId: true,
      titleTh: true,
      descriptionTh: true,
      categoryId: true,
      imageUrl: true,
      galleryUrls: true,
    },
  });

  for (const p of rows) {
    const acc = result[p.storeId];
    if (!acc) continue;
    acc.total += 1;
    if (p.titleTh && p.descriptionTh) acc.translated += 1;
    if (p.categoryId) acc.categorized += 1;
    if (imageCountFor(p) < MIN_IMAGES) acc.lowImage += 1;
  }

  return result;
}

interface ChunkInput {
  product: {
    id: string;
    title: string;
    titleTh: string | null;
    description: string | null;
    descriptionTh: string | null;
    categoryId: string | null;
    categoryName: string | null;
    imageUrl: string | null;
    galleryUrls: Prisma.JsonValue | null;
  };
  needsTranslation: boolean;
  needsCategory: boolean;
}

interface ChunkOutcome {
  productId: string;
  translated: boolean;
  categorized: boolean;
  lowImage?: EnrichLowImage;
  skipped?: EnrichSkipped;
}

interface ExistingCategory {
  id: string;
  name: string;
  slug: string;
}

function basicSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Make the proposed slug unique within the store. We re-query the DB
 * inside the per-product transaction so two parallel chunks racing
 * for the same slug can't collide — the unique index would throw
 * P2002 but that aborts the whole row, which is louder than needed.
 */
async function uniqueCategorySlug(
  tx: Prisma.TransactionClient,
  storeId: string,
  base: string,
): Promise<string> {
  const root = basicSlug(base) || "category";
  let slug = root;
  let n = 1;
  // Loop bounded — 50 attempts is well past any reasonable collision
  // count for a single store's category list.
  while (n < 50) {
    const taken = await tx.category.findUnique({
      where: { storeId_slug: { storeId, slug } },
      select: { id: true },
    });
    if (!taken) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
  // Final fallback — append a short random suffix. Genuinely unlikely
  // to ever execute but cheaper than throwing.
  return `${root}-${Math.random().toString(36).slice(2, 6)}`;
}

async function processOne(
  storeId: string,
  input: ChunkInput,
  existingCategories: ExistingCategory[],
): Promise<ChunkOutcome> {
  const { product, needsTranslation, needsCategory } = input;

  // Image flag is purely informational and decoupled from the LLM
  // call — compute it up-front so we can short-circuit when nothing
  // else needs doing.
  const imgCount = imageCountFor({
    imageUrl: product.imageUrl,
    galleryUrls: product.galleryUrls,
  });
  const lowImage: EnrichLowImage | undefined =
    imgCount < MIN_IMAGES
      ? {
          productId: product.id,
          title: product.titleTh ?? product.title,
          imageCount: imgCount,
        }
      : undefined;

  if (!needsTranslation && !needsCategory) {
    return { productId: product.id, translated: false, categorized: false, lowImage };
  }

  // Always call translateProductCopy when either field is missing —
  // the model returns both copy and a category proposal in one call,
  // so we get the categorization "for free" even if only Thai copy
  // was the missing piece (and vice versa).
  let copy: TranslatedCopy;
  try {
    copy = await translateProductCopy({
      title: product.title,
      description: product.description ?? undefined,
      storeCategoryHints: existingCategories.map((c) => c.name),
    });
  } catch (err) {
    if (err instanceof TranslateNotConfiguredError) {
      return {
        productId: product.id,
        translated: false,
        categorized: false,
        lowImage,
        skipped: { productId: product.id, reason: "agent_not_configured" },
      };
    }
    const msg = err instanceof Error ? err.message.slice(0, 200) : "unknown_error";
    return {
      productId: product.id,
      translated: false,
      categorized: false,
      lowImage,
      skipped: { productId: product.id, reason: `translate_failed: ${msg}` },
    };
  }

  // Decide on the category. Prefer an existing row whose slug matches
  // the model's proposal. If we don't have a hit, we create a fresh
  // Category row inside the per-product transaction.
  const proposedSlug = basicSlug(copy.categorySlug) || basicSlug(copy.categoryNameTh) || "other";
  const matchingExisting =
    existingCategories.find((c) => c.slug === proposedSlug) ??
    existingCategories.find(
      (c) => c.name.trim().toLowerCase() === copy.categoryNameTh.trim().toLowerCase(),
    );

  let categorized = false;
  let translated = false;

  await prisma.$transaction(async (tx) => {
    let categoryId: string | null = product.categoryId;
    let categoryName: string | null = product.categoryName;

    if (needsCategory) {
      if (matchingExisting) {
        categoryId = matchingExisting.id;
        categoryName = matchingExisting.name;
      } else {
        const slug = await uniqueCategorySlug(tx, storeId, proposedSlug);
        const created = await tx.category.create({
          data: {
            storeId,
            name: copy.categoryNameTh,
            slug,
          },
          select: { id: true, name: true, slug: true },
        });
        categoryId = created.id;
        categoryName = created.name;
        // Append to the in-process cache so subsequent products in
        // this run hit the existing-category branch instead of
        // creating duplicates. NB: this mutates the array shared
        // across the chunk — safe because all chunks run on the
        // same Node process inside one server-action invocation.
        existingCategories.push({ id: created.id, name: created.name, slug: created.slug });
      }
      categorized = categoryId !== product.categoryId;
    }

    const data: Prisma.ProductUpdateInput = {};
    if (needsTranslation) {
      data.titleTh = copy.titleTh;
      data.descriptionTh = copy.descriptionTh;
      translated = true;
    }
    if (needsCategory && categoryId) {
      data.category = { connect: { id: categoryId } };
      data.categoryName = categoryName;
    }

    if (Object.keys(data).length > 0) {
      await tx.product.update({ where: { id: product.id }, data });
    }
  });

  return { productId: product.id, translated, categorized, lowImage };
}

/**
 * Iterate the store's products and fill missing Thai content +
 * Category assignments. Image deficiency is reported but not auto-fixed.
 *
 * Runs at limited concurrency (5) so we don't overwhelm the Anthropic
 * API or the database. Per-product failures are captured in `skipped`
 * and DO NOT halt the run — partial progress beats nothing.
 */
export async function enrichStoreProducts(storeId: string): Promise<EnrichResult> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return {
      storeId,
      scanned: 0,
      translated: 0,
      categorized: 0,
      flaggedLowImage: [],
      skipped: [],
      error: "forbidden",
    };
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!store) {
    return {
      storeId,
      scanned: 0,
      translated: 0,
      categorized: 0,
      flaggedLowImage: [],
      skipped: [],
      error: "store_not_found",
    };
  }

  // Cheap up-front check — surface "no API key" before scanning the
  // table so the operator gets an immediate error instead of waiting
  // for the first product to fail.
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      storeId,
      scanned: 0,
      translated: 0,
      categorized: 0,
      flaggedLowImage: [],
      skipped: [],
      error: "agent_not_configured",
    };
  }

  // Pull every active product. We filter the work list per-product
  // (translation vs categorization vs image) rather than relying on
  // a complex OR in the WHERE clause — gives us cleaner per-row
  // status counts in the return value AND lets us still flag
  // low-image rows that already have Thai copy + a category.
  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    select: {
      id: true,
      title: true,
      titleTh: true,
      description: true,
      descriptionTh: true,
      categoryId: true,
      categoryName: true,
      imageUrl: true,
      galleryUrls: true,
    },
  });

  const existingCategoryRows = await prisma.category.findMany({
    where: { storeId },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });
  const existingCategories: ExistingCategory[] = existingCategoryRows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const work: ChunkInput[] = [];
  const flaggedLowImage: EnrichLowImage[] = [];
  for (const p of products) {
    const needsTranslation = !p.titleTh || !p.descriptionTh;
    const needsCategory = !p.categoryId;
    const imgCount = imageCountFor({ imageUrl: p.imageUrl, galleryUrls: p.galleryUrls });
    const isLow = imgCount < MIN_IMAGES;

    if (needsTranslation || needsCategory) {
      work.push({ product: p, needsTranslation, needsCategory });
    } else if (isLow) {
      // Already-enriched rows: still flag image deficiency so the
      // operator sees the whole picture, not just "what changed".
      flaggedLowImage.push({
        productId: p.id,
        title: p.titleTh ?? p.title,
        imageCount: imgCount,
      });
    }
  }

  const result: EnrichResult = {
    storeId,
    scanned: products.length,
    translated: 0,
    categorized: 0,
    flaggedLowImage,
    skipped: [],
  };

  if (work.length === 0) {
    return result;
  }

  // Bounded concurrency loop. Five products at a time keeps us under
  // the Haiku-tier per-minute caps with comfortable headroom while
  // cutting an N-product run from ~N×latency to ~N/5×latency.
  for (let i = 0; i < work.length; i += CONCURRENCY) {
    const slice = work.slice(i, i + CONCURRENCY);
    const outcomes = await Promise.all(slice.map((w) => processOne(storeId, w, existingCategories)));
    for (const o of outcomes) {
      if (o.translated) result.translated += 1;
      if (o.categorized) result.categorized += 1;
      if (o.lowImage) result.flaggedLowImage.push(o.lowImage);
      if (o.skipped) result.skipped.push(o.skipped);
    }
  }

  // Invalidate cached admin views — the store edit page surfaces
  // product counts that should reflect the new categories, and the
  // admin index card shows the per-store quality snapshot.
  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${storeId}`);

  return result;
}
