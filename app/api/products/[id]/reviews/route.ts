/**
 * GET  /api/products/[id]/reviews — public list of storefront reviews
 * POST /api/products/[id]/reviews — auth-gated submit/edit
 *
 * Anyone signed in can submit. "Verified Purchase" is computed at read
 * time (see lib/reviews/listReviews) based on whether the reviewer
 * actually owns a DigitalUnlock or paid Order containing this product.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  listReviews,
  upsertReview,
  getProductRatingStats,
} from "@/lib/reviews";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(req.url);
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") ?? "20", 10));
  const skip = Math.max(0, parseInt(url.searchParams.get("skip") ?? "0", 10));

  const [reviews, stats] = await Promise.all([
    listReviews({ productId: params.id, limit, skip }),
    getProductRatingStats(params.id),
  ]);

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      verifiedPurchase: r.verifiedPurchase,
      author: {
        // Display name from User row. Fall back to a derived initial-only
        // form ("ผู้ใช้ A.") when name is missing so reviewers stay anon.
        name:
          r.user.name?.trim()
          || (r.user.email ? `ผู้ใช้ ${r.user.email[0]!.toUpperCase()}.` : "ผู้ใช้"),
      },
    })),
    stats: {
      averageRating: stats.averageRating,
      count: stats.count,
      buckets: stats.buckets,
    },
  });
}

const postSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }

  try {
    const review = await upsertReview({
      userId: user.id,
      productId: params.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    });
    return NextResponse.json({ ok: true, reviewId: review.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create review";
    const status = msg.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
