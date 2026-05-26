/**
 * Wishlist — server helpers.
 *
 * The wishlist is per-user (NOT per-store). A buyer can save products
 * from any store; the /account/wishlist page lists everything. Future:
 * a cron job compares current price vs `priceTHBAtSave` and emails
 * the user when their saved item drops.
 */
import { prisma } from "@/lib/prisma";

export interface AddWishlistInput {
  userId: string;
  productId: string;
}

/**
 * Idempotent — upserts on (userId, productId). Re-saving the same
 * item refreshes priceTHBAtSave to today's price so the
 * sale-detector compares against the most recent save.
 */
export async function addToWishlist(input: AddWishlistInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true, priceTHB: true, active: true },
  });
  if (!product) throw new Error("Product not found");
  if (!product.active) throw new Error("Product unavailable");

  return prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: input.userId, productId: input.productId },
    },
    update: { priceTHBAtSave: product.priceTHB },
    create: {
      userId: input.userId,
      productId: input.productId,
      priceTHBAtSave: product.priceTHB,
    },
  });
}

export async function removeFromWishlist(input: AddWishlistInput) {
  await prisma.wishlistItem.deleteMany({
    where: { userId: input.userId, productId: input.productId },
  });
}

export async function isInWishlist(input: AddWishlistInput): Promise<boolean> {
  const row = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId: input.userId, productId: input.productId },
    },
    select: { id: true },
  });
  return row != null;
}

/**
 * List wishlist items for a user. Joins product + store so the UI can
 * render the row without follow-up queries. Filters out items whose
 * product was deleted or deactivated.
 */
export async function listWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          titleTh: true,
          imageUrl: true,
          priceTHB: true,
          compareAtPriceTHB: true,
          active: true,
          store: { select: { slug: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items
    .filter((i) => i.product.active)
    .map((i) => ({
      id: i.id,
      productId: i.productId,
      createdAt: i.createdAt,
      priceTHBAtSave: Number(i.priceTHBAtSave),
      priceTHBNow: Number(i.product.priceTHB),
      compareAtPriceTHB: i.product.compareAtPriceTHB
        ? Number(i.product.compareAtPriceTHB)
        : null,
      onSale:
        Number(i.product.priceTHB) < Number(i.priceTHBAtSave),
      product: {
        id: i.product.id,
        title: i.product.titleTh ?? i.product.title,
        imageUrl: i.product.imageUrl,
        store: i.product.store,
      },
    }));
}
