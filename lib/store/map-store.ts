import type { Store as PrismaStore } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPalette } from "@/lib/store/wizard-data";
import type {
  Collection,
  Product,
  Store,
  TemplateId,
} from "@/lib/templates/types";

/**
 * Convert a Prisma `Store` row + its related products/categories into the
 * in-memory `Store` shape the scaffold's `StoreRenderer` expects.
 *
 * Fields with no DB source yet (rating, followers, soldCount) fall back to
 * defaults — wire to real tables when those features ship.
 */
export async function mapStoreFromPrisma(
  prismaStore: PrismaStore,
): Promise<Store> {
  const [dbProducts, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where: {
        storeId: prismaStore.id,
        active: true,
        moderationStatus: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.category.findMany({
      where: { storeId: prismaStore.id },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const products: Product[] = dbProducts.map((p) => {
    const gallery = Array.isArray(p.galleryUrls)
      ? (p.galleryUrls as string[])
      : [];
    const images = p.imageUrl ? [p.imageUrl, ...gallery] : gallery;
    return {
      id: p.id,
      storeId: p.storeId,
      title: p.titleTh ?? p.title,
      description: p.descriptionTh ?? p.description ?? undefined,
      price: Number(p.priceTHB),
      originalPrice: p.compareAtPriceTHB
        ? Number(p.compareAtPriceTHB)
        : undefined,
      currency: "THB",
      images,
      thumbnailUrl: p.imageUrl ?? "",
      rating: 5,
      reviewCount: 0,
      soldCount: 0,
      inStock: true,
    };
  });

  const collections: Collection[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description ?? undefined,
    imageUrl: c.bannerUrl ?? undefined,
    productIds: dbProducts
      .filter((p) => p.categoryId === c.id)
      .map((p) => p.id),
    order: c.sortOrder,
  }));

  const palette = prismaStore.paletteId
    ? getPalette(prismaStore.paletteId)
    : null;
  const primary = palette?.primary ?? prismaStore.primaryColor ?? "#0F172A";
  const accent = palette?.accent ?? "#3B82F6";

  return {
    id: prismaStore.id,
    slug: prismaStore.slug,
    name: prismaStore.name,
    description: prismaStore.description ?? undefined,
    niche: prismaStore.niche ?? "general",
    branding: {
      logoUrl: prismaStore.logoUrl ?? undefined,
      bannerUrl: prismaStore.bannerUrl ?? undefined,
      colors: {
        primary,
        accent,
        surface: "#FFFFFF",
        text: "#0F172A",
      },
    },
    templateId: (prismaStore.templateId ?? "classic") as TemplateId,
    rating: 5,
    followers: 0,
    collections,
    products,
  };
}
