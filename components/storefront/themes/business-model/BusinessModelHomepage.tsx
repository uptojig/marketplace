/**
 * BusinessModelHomepage — root composer for the bespoke business-model
 * landing page. Mirrors PetHouseHomepage's pattern: a thin server component
 * that vertically stacks BM-flavored sections under the shared ShopHeader /
 * ShopFooter chrome (from app/stores/[slug]/layout.tsx). We do NOT render
 * header / nav / footer here.
 *
 * Section order — all on a white "spreadsheet" background:
 *   1. BusinessModelHero — red countdown stripe + bold sans h1 + 3-stat
 *      ledger row + "Browse deals" / "Request a quote" CTAs.
 *   2. BusinessModelCouponStrip — 3 platform-wide bulk coupons
 *      (BULK10 / BULK15 / BULK20) as click-to-copy cards. Replaces the
 *      earlier auto-tier ladder per ops request — coupons feel more
 *      actionable than an auto-applied tier table.
 *   3. BusinessModelDealsGrid — 12 latest products through the existing
 *      BusinessModelCategoryGrid so card chrome stays catalog-identical.
 *   4. BusinessModelBrandStory — REUSED from the PDP; surfaces tagline /
 *      description in the wholesale-partner panel with a stat ledger row.
 *
 * Why fetch the store inside the composer instead of passing the full row
 * down? The hero needs `name` + optional `bannerUrl`, and the brand-story
 * panel needs `tagline` + `description`. Rather than thread those through
 * Props (which forces every caller to widen the Pick<>), the composer takes
 * the same shape as PetHouseHomepage (`Pick<Store, 'id' | 'slug' | 'name'>`)
 * and re-queries Prisma once for the extra fields it needs. Cheap (PK
 * lookup) and keeps the call sites simple.
 *
 * Server component — async at this level only because the brand-story / hero
 * lookups need a Prisma read. Sub-sections that need their own queries (the
 * deals grid) are also async server components.
 */

import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { BusinessModelHero } from './BusinessModelHero';
import { BusinessModelCouponStrip } from './BusinessModelCouponStrip';
import { BusinessModelDealsGrid } from './BusinessModelDealsGrid';
import { BusinessModelBrandStory } from './BusinessModelBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function BusinessModelHomepage({ store }: Props) {
  // One PK lookup for the extra fields the hero + brand-story panels need.
  // Done here so callers can pass the same slim Pick<Store, ...> shape that
  // PetHouseHomepage accepts.
  const extra = await prisma.store.findUnique({
    where: { id: store.id },
    select: {
      bannerUrl: true,
      tagline: true,
      description: true,
    },
  });

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <BusinessModelHero
        storeSlug={store.slug}
        storeName={store.name}
        bannerUrl={extra?.bannerUrl ?? null}
      />
      <BusinessModelCouponStrip />
      <BusinessModelDealsGrid storeId={store.id} storeSlug={store.slug} />
      <BusinessModelBrandStory
        storeSlug={store.slug}
        storeName={store.name}
        tagline={extra?.tagline ?? null}
        description={extra?.description ?? null}
      />
    </div>
  );
}
