import { Fragment } from 'react';
import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { applyThemeConfig, parseThemeConfig, type SectionSlot } from '@/lib/storefront/theme-config';
import { FashionBeautyHero } from './FashionBeautyHero';
import { FashionBeautyEditorialPicks } from './FashionBeautyEditorialPicks';
import { FashionBeautyBestsellers } from './FashionBeautyBestsellers';
import { FashionBeautyBrandStory } from './FashionBeautyBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'themeConfig'>;
}

/**
 * FashionBeautyHomepage — root composer for the fashion-beauty landing page.
 *
 * Sections render in the order declared below (the curated default). Hero is
 * `locked` (always first). Once Store.themeConfig lands (Phase 3) an operator
 * can reorder / hide the non-locked sections; passing `null` here keeps the
 * default order, byte-identical to the previous hardcoded JSX.
 *
 * The shared <ShopHeader /> + <ShopFooter /> chrome (from
 * app/stores/[slug]/layout.tsx) wraps this tree, so the composer never renders
 * header/nav/footer of its own. Each sub-section fetches its own product slice.
 */
export async function FashionBeautyHomepage({ store }: Props) {
  // Editorial fields (tagline / description / banner) for Hero + BrandStory.
  const editorial = await prisma.store.findUnique({
    where: { id: store.id },
    select: { tagline: true, description: true, bannerUrl: true },
  });

  const slots: SectionSlot[] = [
    {
      id: 'hero',
      locked: true,
      render: () => (
        <FashionBeautyHero
          storeSlug={store.slug}
          storeName={store.name}
          bannerUrl={editorial?.bannerUrl ?? null}
        />
      ),
    },
    {
      id: 'editorial-picks',
      hideable: true,
      reorderable: true,
      render: () => (
        <FashionBeautyEditorialPicks storeId={store.id} storeSlug={store.slug} />
      ),
    },
    {
      id: 'bestsellers',
      hideable: true,
      reorderable: true,
      render: () => (
        <FashionBeautyBestsellers storeId={store.id} storeSlug={store.slug} />
      ),
    },
    {
      id: 'brand-story',
      hideable: true,
      reorderable: true,
      // BrandStory renders nothing if both tagline and description are empty —
      // safe to mount unconditionally.
      render: () => (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FashionBeautyBrandStory
            storeSlug={store.slug}
            storeName={store.name}
            tagline={editorial?.tagline ?? null}
            description={editorial?.description ?? null}
          />
        </div>
      ),
    },
  ];

  // Per-store section order/visibility (null → curated default order).
  const sections = applyThemeConfig(slots, parseThemeConfig(store.themeConfig));

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      {sections.map((s) => (
        <Fragment key={s.id}>{s.render()}</Fragment>
      ))}
    </div>
  );
}
