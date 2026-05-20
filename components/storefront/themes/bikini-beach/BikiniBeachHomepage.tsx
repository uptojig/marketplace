/**
 * BikiniBeachHomepage — server wrapper that fetches products + categories
 * and delegates to the BIKINI551 designer's bespoke Homepage page via
 * BikiniHomepageAdapter. Mirrors the wiring pattern of the other 12
 * dispatcher-wired themes — the dispatcher just renders
 * `<BikiniBeachHomepage store={baseStore} />` and this component plumbs
 * the data the adapter needs.
 *
 * Chrome (Header / Footer) comes from app/stores/[slug]/layout.tsx — same
 * as every other wired theme. The designer's bespoke chrome lives in
 * ./chrome and is wired via the registry-scaffold path; the dispatcher
 * path keeps the marketplace's shared chrome for now.
 */

import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { BikiniHomepageAdapter } from './adapters';

interface Props {
  store: Store;
}

export async function BikiniBeachHomepage({ store }: Props) {
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
    <BikiniHomepageAdapter
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
