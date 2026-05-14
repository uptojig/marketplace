"use server";

/**
 * Admin server action: re-fetch CJ products that are missing their cached
 * `externalPayload`, so the image backfill + rich-data extraction can run
 * on them.
 *
 * Why this exists separately from `backfillCJImagesForStore`:
 *   - The image backfill works purely off the cached `externalPayload`
 *     blob — fast, no CJ API calls.
 *   - But some legacy products were imported before we started persisting
 *     `externalPayload` (or the import failed mid-write). They show
 *     `externalPayload IS NULL` and the image backfill skips them with
 *     `no_external_payload`.
 *   - This action calls `enrichCJProduct(productId, externalProductId)`
 *     for each affected row — same path as a fresh import. It re-fetches
 *     the CJ detail + variants, populates the payload + rich fields, and
 *     the image backfill becomes usable on those rows in a follow-up run.
 *
 * Rate-limit:
 *   CJ throttles around 1 req/sec on `/product/query`. We sleep 1.1s
 *   between products so a 100-product store takes ~2 minutes. For very
 *   large stores the operator can re-run; each call is idempotent.
 *
 * Auth:
 *   - Admins always pass (via role check).
 *   - Store owners can refetch THEIR OWN store.
 */

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrichCJProduct } from "@/lib/suppliers/cj/enrich";

export interface RefetchSkipped {
  productId: string;
  reason: string;
}

export interface RefetchResult {
  storeId: string;
  scanned: number;
  refetched: number;
  skipped: RefetchSkipped[];
  error?: "unauthenticated" | "forbidden" | "store_not_found";
}

const CJ_RATE_LIMIT_MS = 1100;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function refetchCJMissingPayloadForStore(
  storeId: string,
): Promise<RefetchResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { storeId, scanned: 0, refetched: 0, skipped: [], error: "unauthenticated" };
  }

  const [user, store] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    }),
    prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, ownerId: true },
    }),
  ]);
  if (!user) {
    return { storeId, scanned: 0, refetched: 0, skipped: [], error: "unauthenticated" };
  }
  if (!store) {
    return { storeId, scanned: 0, refetched: 0, skipped: [], error: "store_not_found" };
  }
  const isAdmin = user.role === "ADMIN";
  const isOwner = store.ownerId === user.id;
  if (!isAdmin && !isOwner) {
    return { storeId, scanned: 0, refetched: 0, skipped: [], error: "forbidden" };
  }

  // Prisma's Json column has two distinct "null" states:
  //   - Prisma.DbNull  → column is NULL in Postgres
  //   - Prisma.JsonNull → column contains the JSON literal `null`
  // The image-backfill skip uses a JS `!externalPayload` truthy check,
  // which catches both. The prior query here only matched DbNull so
  // products stored as JsonNull slipped through and the operator saw
  // "scanned 0". OR both states explicitly.
  const products = await prisma.product.findMany({
    where: {
      storeId,
      supplier: "CJ",
      OR: [
        { externalPayload: { equals: Prisma.DbNull } },
        { externalPayload: { equals: Prisma.JsonNull } },
      ],
    },
    select: { id: true, externalProductId: true },
  });

  const result: RefetchResult = {
    storeId,
    scanned: products.length,
    refetched: 0,
    skipped: [],
  };

  for (let i = 0; i < products.length; i += 1) {
    const p = products[i];
    if (!p.externalProductId) {
      result.skipped.push({ productId: p.id, reason: "no_external_product_id" });
      continue;
    }

    // Hit CJ — enrichCJProduct fetches detail + variants and persists
    // externalPayload + all the PR #63 rich fields. Soft-fail any single
    // product so a single CJ outage doesn't kill the whole run.
    const r = await enrichCJProduct(p.id, p.externalProductId);
    if (r.ok) {
      result.refetched += 1;
    } else {
      result.skipped.push({
        productId: p.id,
        reason: `enrich_failed: ${r.error ?? "unknown"}`,
      });
    }

    if (i < products.length - 1) {
      await sleep(CJ_RATE_LIMIT_MS);
    }
  }

  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${storeId}`);
  return result;
}
