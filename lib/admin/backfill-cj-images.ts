"use server";

/**
 * Admin server action: re-run the image extractor over every CJ product
 * in a given store, populating `galleryUrls` (and `imageUrl` if blank)
 * from the cached `externalPayload`.
 *
 * Why this is a separate action vs reusing `enrichCJProduct`:
 *   - `enrichCJProduct` re-hits the CJ API (per-product latency ~1s
 *     because of CJ's rate limit). For a store with 100 products that's
 *     well over a minute and uses our CJ API budget.
 *   - The PDP "1 duplicate image" bug is rooted in stale gallery data
 *     for *already-imported* products. Their `externalPayload` already
 *     contains the full image set — we just never persisted it because
 *     the old extractor only read `productImageSet`.
 *
 *   So: backfill iterates the table, re-runs `extractAllImages(payload)`,
 *   and writes the result without any external network. Fast + safe.
 *
 * Auth:
 *   - Admins always pass (via `requireAdmin()`).
 *   - Store owners can backfill THEIR OWN store (`store.ownerId === userId`).
 *
 * Scope decisions:
 *   - CJ only. We could trivially generalize once another supplier needs
 *     it, but the AliExpress adapter doesn't expose `extractAllImages`
 *     yet, so keep this CJ-specific.
 *   - Updates `imageUrl` only when blank — never overwrites a vendor's
 *     manually-uploaded cover.
 *   - Cover URL is always stripped from `galleryUrls` (the critical rule
 *     from the PDP bug — dupes in gallery were the user-visible symptom).
 */

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractAllImages } from "@/lib/suppliers/cj/extract-images";

export interface BackfillSkipped {
  productId: string;
  reason: string;
}

export interface BackfillResult {
  storeId: string;
  scanned: number;
  updated: number;
  skipped: BackfillSkipped[];
  error?: "unauthenticated" | "forbidden" | "store_not_found";
}

/**
 * Iterate every CJ product on a store and re-run the image extractor.
 *
 * Returns counts + per-product skip reasons so the admin UI can surface
 * a summary toast and (when needed) a details accordion.
 */
export async function backfillCJImagesForStore(storeId: string): Promise<BackfillResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { storeId, scanned: 0, updated: 0, skipped: [], error: "unauthenticated" };
  }

  // Admins bypass the ownership check; everyone else has to own the store.
  // We do both lookups in parallel to keep the latency budget tight on
  // the action — the table iteration is what dominates anyway.
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
    return { storeId, scanned: 0, updated: 0, skipped: [], error: "unauthenticated" };
  }
  if (!store) {
    return { storeId, scanned: 0, updated: 0, skipped: [], error: "store_not_found" };
  }
  const isAdmin = user.role === "ADMIN";
  const isOwner = store.ownerId === user.id;
  if (!isAdmin && !isOwner) {
    return { storeId, scanned: 0, updated: 0, skipped: [], error: "forbidden" };
  }

  const products = await prisma.product.findMany({
    where: { storeId, supplier: "CJ" },
    select: {
      id: true,
      imageUrl: true,
      galleryUrls: true,
      externalPayload: true,
    },
  });

  const result: BackfillResult = {
    storeId,
    scanned: products.length,
    updated: 0,
    skipped: [],
  };

  for (const p of products) {
    if (!p.externalPayload) {
      result.skipped.push({ productId: p.id, reason: "no_external_payload" });
      continue;
    }

    const allImages = extractAllImages(p.externalPayload);
    if (allImages.length === 0) {
      result.skipped.push({ productId: p.id, reason: "no_images_in_payload" });
      continue;
    }

    // Decide on the cover. Keep the vendor's existing cover when set,
    // otherwise fall back to the first image we extracted. This means
    // vendors can manually upload a hero shot and the backfill won't
    // clobber it.
    const cover = p.imageUrl && p.imageUrl.trim().length > 0 ? p.imageUrl : allImages[0];
    const gallery = allImages.filter((u) => u !== cover);

    const currentGallery = Array.isArray(p.galleryUrls)
      ? (p.galleryUrls as unknown[]).filter(
          (x): x is string => typeof x === "string" && x.length > 0,
        )
      : [];

    // Skip rows whose persisted gallery already matches what we'd write
    // — saves us from churning `updatedAt` on every product on every
    // re-run of the action.
    const sameGallery =
      currentGallery.length === gallery.length &&
      currentGallery.every((u, i) => u === gallery[i]);
    const coverUnchanged = (p.imageUrl ?? null) === (cover ?? null);
    if (sameGallery && coverUnchanged) {
      result.skipped.push({ productId: p.id, reason: "already_up_to_date" });
      continue;
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        // Only touch imageUrl when previously blank — never overwrite a
        // vendor-chosen cover.
        ...(p.imageUrl && p.imageUrl.trim().length > 0
          ? {}
          : { imageUrl: cover }),
        galleryUrls: gallery as never,
      },
    });
    result.updated += 1;
  }

  // Invalidate the admin index + the store edit page since the quality
  // snapshot column on /admin/stores depends on imageCount.
  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${storeId}`);
  // Storefront PDPs are dynamic (`force-dynamic`) so they pick up the
  // new gallery on next request without an explicit revalidate.

  return result;
}
