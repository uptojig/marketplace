/**
 * SpecialtyHomepage — bespoke artisan / vintage landing page. Sections render
 * in the curated default order below; an operator can reorder/hide the
 * non-locked sections via Store.themeConfig (Hero is locked). Shared
 * ShopHeader/ShopFooter chrome comes from app/stores/[slug]/layout.tsx.
 */

import { Fragment } from 'react';
import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { applyThemeConfig, parseThemeConfig, type SectionSlot } from '@/lib/storefront/theme-config';
import { SpecialtyHero } from './SpecialtyHero';
import { SpecialtyMakersBar } from './SpecialtyMakersBar';
import { SpecialtyHandcrafted } from './SpecialtyHandcrafted';
import { SpecialtyBrandStory } from './SpecialtyBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'themeConfig'>;
}

export async function SpecialtyHomepage({ store }: Props) {
  const extras = await prisma.store.findUnique({
    where: { id: store.id },
    select: { bannerUrl: true, tagline: true, description: true },
  });

  const slots: SectionSlot[] = [
    {
      id: 'hero',
      locked: true,
      render: () => (
        <SpecialtyHero
          storeSlug={store.slug}
          storeName={store.name}
          bannerUrl={extras?.bannerUrl ?? null}
        />
      ),
    },
    {
      id: 'makers-bar',
      hideable: true,
      reorderable: true,
      render: () => <SpecialtyMakersBar />,
    },
    {
      id: 'handcrafted',
      hideable: true,
      reorderable: true,
      render: () => (
        <SpecialtyHandcrafted storeId={store.id} storeSlug={store.slug} />
      ),
    },
    {
      id: 'brand-story',
      hideable: true,
      reorderable: true,
      render: () => (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SpecialtyBrandStory
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
