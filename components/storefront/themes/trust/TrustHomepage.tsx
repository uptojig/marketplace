/**
 * TrustHomepage — bespoke trust-family landing page. Sections render in the
 * curated default order below; an operator can reorder/hide the non-locked
 * sections via Store.themeConfig (Hero is locked / always first). Shared
 * ShopHeader/ShopFooter chrome comes from app/stores/[slug]/layout.tsx.
 */

import { Fragment } from 'react';
import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { applyThemeConfig, parseThemeConfig, type SectionSlot } from '@/lib/storefront/theme-config';

import { TrustHero } from './TrustHero';
import { TrustHeritageBar } from './TrustHeritageBar';
import { TrustCollectionShowcase } from './TrustCollectionShowcase';
import { TrustBrandStory } from './TrustBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'themeConfig'>;
}

export async function TrustHomepage({ store }: Props) {
  const extras = await prisma.store.findUnique({
    where: { id: store.id },
    select: { bannerUrl: true, tagline: true, description: true },
  });

  const slots: SectionSlot[] = [
    {
      id: 'hero',
      locked: true,
      render: () => (
        <TrustHero
          storeSlug={store.slug}
          storeName={store.name}
          bannerUrl={extras?.bannerUrl ?? null}
        />
      ),
    },
    {
      id: 'heritage-bar',
      hideable: true,
      reorderable: true,
      render: () => <TrustHeritageBar />,
    },
    {
      id: 'collection-showcase',
      hideable: true,
      reorderable: true,
      render: () => (
        <TrustCollectionShowcase storeId={store.id} storeSlug={store.slug} />
      ),
    },
    {
      id: 'brand-story',
      hideable: true,
      reorderable: true,
      // Renders nothing if both tagline and description are empty.
      render: () => (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustBrandStory
            storeSlug={store.slug}
            storeName={store.name}
            tagline={extras?.tagline ?? null}
            description={extras?.description ?? null}
          />
        </div>
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
