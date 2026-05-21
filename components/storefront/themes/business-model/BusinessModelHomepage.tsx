/**
 * BusinessModelHomepage — bespoke business-model (deal / wholesale) landing
 * page. Sections render in the curated default order below; an operator can
 * reorder/hide the non-locked sections via Store.themeConfig (Hero is locked).
 * Shared ShopHeader/ShopFooter chrome comes from app/stores/[slug]/layout.tsx.
 */

import { Fragment } from 'react';
import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { applyThemeConfig, parseThemeConfig, type SectionSlot } from '@/lib/storefront/theme-config';
import { BusinessModelHero } from './BusinessModelHero';
import { BusinessModelCouponStrip } from './BusinessModelCouponStrip';
import { BusinessModelDealsGrid } from './BusinessModelDealsGrid';
import { BusinessModelBrandStory } from './BusinessModelBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'themeConfig'>;
}

export async function BusinessModelHomepage({ store }: Props) {
  const extra = await prisma.store.findUnique({
    where: { id: store.id },
    select: { bannerUrl: true, tagline: true, description: true },
  });

  const slots: SectionSlot[] = [
    {
      id: 'hero',
      locked: true,
      render: () => (
        <BusinessModelHero
          storeSlug={store.slug}
          storeName={store.name}
          bannerUrl={extra?.bannerUrl ?? null}
          tagline={extra?.tagline ?? null}
          description={extra?.description ?? null}
        />
      ),
    },
    {
      id: 'coupon-strip',
      hideable: true,
      reorderable: true,
      render: () => <BusinessModelCouponStrip />,
    },
    {
      id: 'deals-grid',
      hideable: true,
      reorderable: true,
      render: () => (
        <BusinessModelDealsGrid storeId={store.id} storeSlug={store.slug} />
      ),
    },
    {
      id: 'brand-story',
      hideable: true,
      reorderable: true,
      render: () => (
        <BusinessModelBrandStory
          storeSlug={store.slug}
          storeName={store.name}
          tagline={extra?.tagline ?? null}
          description={extra?.description ?? null}
        />
      ),
    },
  ];

  const sections = applyThemeConfig(slots, parseThemeConfig(store.themeConfig));

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      {sections.map((s) => (
        <Fragment key={s.id}>{s.render()}</Fragment>
      ))}
    </div>
  );
}
