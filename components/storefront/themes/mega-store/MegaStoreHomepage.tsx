/**
 * MegaStoreHomepage — server wrapper that fetches products + categories
 * and delegates to the designer's bespoke Homepage page via
 * MegaStoreHomepageAdapter. Mirrors the wiring pattern of the other 12
 * dispatcher-wired themes.
 *
 * Chrome (Header / Footer) comes from app/stores/[slug]/layout.tsx.
 */

import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { MegaStoreHomepageAdapter } from './adapters';

interface Props {
  store: Store;
}

export async function MegaStoreHomepage({ store }: Props) {
  const dbProducts = await prisma.product.findMany({
    where: { storeId: store.id, active: true },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });

  const categoryRows = await prisma.product.findMany({
    where: { storeId: store.id, active: true, categoryName: { not: null } },
    select: { categoryName: true },
    distinct: ['categoryName'],
    orderBy: { categoryName: 'asc' },
    take: 12,
  });
  const categories = categoryRows
    .map((r) => r.categoryName)
    .filter((c): c is string => !!c);

  return (
    <MegaStoreHomepageAdapter
      store={{
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        tagline: store.tagline,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
        primaryColor: store.primaryColor,
      }}
      products={dbProducts.map((p) => ({
        id: p.id,
        title: p.titleTh ?? p.title,
        imageUrl: p.imageUrl,
        priceTHB: Number(p.priceTHB),
        compareAtPriceTHB: p.compareAtPriceTHB
          ? Number(p.compareAtPriceTHB)
          : null,
        categoryName: p.categoryName,
      }))}
      categories={categories}
    />
  );
}
