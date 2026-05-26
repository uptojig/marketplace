/**
 * Reviews — server helpers.
 *
 * The "Verified Purchase" badge is computed at read time (NOT stored)
 * by checking whether the reviewer has at least one DigitalUnlock for
 * the product OR a paid Order containing it. We do this so the badge
 * stays accurate when an unlock is revoked / refunded.
 *
 * No moderation queue — anyone signed in can submit. Operator can hide
 * spam/abuse via `hidden=true` (see /admin/reviews).
 */
import { prisma } from "@/lib/prisma";

export interface ReviewInput {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  body: string;
}

/**
 * Upsert a review: if (userId, productId) already exists we update
 * the row in place (reviewer is editing). Throws on invalid rating.
 */
export async function upsertReview(input: ReviewInput) {
  if (
    !Number.isInteger(input.rating)
    || input.rating < 1
    || input.rating > 5
  ) {
    throw new Error("rating must be an integer 1-5");
  }
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true, storeId: true },
  });
  if (!product) throw new Error("Product not found");

  return prisma.review.upsert({
    where: {
      userId_productId: { userId: input.userId, productId: input.productId },
    },
    update: {
      rating: input.rating,
      title: input.title?.trim() || null,
      body: input.body.trim(),
      // Editing resets the moderation flag — operator will re-check.
      hidden: false,
      hiddenById: null,
      hiddenAt: null,
      hiddenNote: null,
    },
    create: {
      userId: input.userId,
      productId: input.productId,
      storeId: product.storeId,
      rating: input.rating,
      title: input.title?.trim() || null,
      body: input.body.trim(),
    },
  });
}

export interface ListReviewsOptions {
  productId: string;
  /** Set true to include hidden rows (admin moderation views only). */
  includeHidden?: boolean;
  limit?: number;
  skip?: number;
}

/**
 * List storefront-visible reviews for a product. Joins user identity
 * (name, email-derived initials) and computes the verified-purchase
 * badge in one round trip.
 */
export async function listReviews(opts: ListReviewsOptions) {
  const reviews = await prisma.review.findMany({
    where: {
      productId: opts.productId,
      ...(opts.includeHidden ? {} : { hidden: false }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 20,
    skip: opts.skip ?? 0,
  });

  // Compute verified-purchase flags in a single query, not N+1.
  const userIds = Array.from(new Set(reviews.map((r) => r.userId)));
  const verifiedSet = new Set<string>();
  if (userIds.length > 0) {
    const unlocks = await prisma.digitalUnlock.findMany({
      where: {
        productId: opts.productId,
        userId: { in: userIds },
        revokedAt: null,
      },
      select: { userId: true },
    });
    for (const u of unlocks) verifiedSet.add(u.userId);

    // Also count paid OrderItems for physical purchases.
    const orders = await prisma.orderItem.findMany({
      where: {
        productId: opts.productId,
        order: { userId: { in: userIds }, status: "PAID" },
      },
      select: { order: { select: { userId: true } } },
    });
    for (const o of orders) verifiedSet.add(o.order.userId);
  }

  return reviews.map((r) => ({
    ...r,
    verifiedPurchase: verifiedSet.has(r.userId),
  }));
}

/**
 * Aggregate stats for the PDP header — average rating + count.
 * Excludes hidden reviews.
 */
export async function getProductRatingStats(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, hidden: false },
    _avg: { rating: true },
    _count: { _all: true },
  });
  // Star distribution (5,4,3,2,1) — single grouped query.
  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, hidden: false },
    _count: { _all: true },
  });
  const buckets: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of grouped) {
    const r = g.rating as 1 | 2 | 3 | 4 | 5;
    if (r >= 1 && r <= 5) buckets[r] = g._count._all;
  }
  return {
    averageRating: agg._avg.rating ?? 0,
    count: agg._count._all,
    buckets,
  };
}

/**
 * Soft-hide a review (admin only). The row stays so the reviewer can
 * still edit + the storefront just refuses to render it.
 */
export async function hideReview(input: {
  reviewId: string;
  adminUserId: string;
  note?: string;
}) {
  return prisma.review.update({
    where: { id: input.reviewId },
    data: {
      hidden: true,
      hiddenById: input.adminUserId,
      hiddenAt: new Date(),
      hiddenNote: input.note ?? null,
    },
  });
}

export async function unhideReview(reviewId: string) {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      hidden: false,
      hiddenById: null,
      hiddenAt: null,
      hiddenNote: null,
    },
  });
}
