/**
 * LifestyleHomepage — bespoke lifestyle landing page. Sections render in the
 * curated default order below; an operator can reorder/hide the non-locked
 * sections via Store.themeConfig (Hero is locked). Shared ShopHeader/ShopFooter
 * chrome comes from app/stores/[slug]/layout.tsx.
 */

import { Fragment } from 'react';
import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { applyThemeConfig, parseThemeConfig, type SectionSlot } from '@/lib/storefront/theme-config';
import { LifestyleHero } from './LifestyleHero';
import { LifestyleMoodSelector } from './LifestyleMoodSelector';
import { LifestyleBestsellers } from './LifestyleBestsellers';
import { LifestyleBrandStory } from './LifestyleBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'themeConfig'>;
}

export async function LifestyleHomepage({ store }: Props) {
  const storeMeta = await prisma.store.findUnique({
    where: { id: store.id },
    select: { tagline: true, description: true, bannerUrl: true },
  });

  const slots: SectionSlot[] = [
    {
      id: 'hero',
      locked: true,
      render: () => (
        <LifestyleHero
          storeSlug={store.slug}
          storeName={store.name}
          bannerUrl={storeMeta?.bannerUrl ?? null}
        />
      ),
    },
    {
      id: 'mood-selector',
      hideable: true,
      reorderable: true,
      render: () => <LifestyleMoodSelector storeSlug={store.slug} />,
    },
    {
      id: 'bestsellers',
      hideable: true,
      reorderable: true,
      render: () => (
        <LifestyleBestsellers storeId={store.id} storeSlug={store.slug} />
      ),
    },
    {
      id: 'brand-story',
      hideable: true,
      reorderable: true,
      render: () => (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LifestyleBrandStory
            storeSlug={store.slug}
            storeName={store.name}
            tagline={storeMeta?.tagline ?? null}
            description={storeMeta?.description ?? null}
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
