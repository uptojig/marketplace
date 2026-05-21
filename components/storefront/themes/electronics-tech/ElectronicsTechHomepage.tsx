/**
 * ElectronicsTechHomepage — bespoke electronics-tech landing page. Sections
 * render in the curated default order below; an operator can reorder/hide the
 * non-locked sections via Store.themeConfig (Hero is locked). Shared
 * ShopHeader/ShopFooter chrome comes from app/stores/[slug]/layout.tsx.
 */

import { Fragment } from 'react';
import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { applyThemeConfig, parseThemeConfig, type SectionSlot } from '@/lib/storefront/theme-config';
import { ElectronicsTechHero } from './ElectronicsTechHero';
import { ElectronicsTechSpecsBar } from './ElectronicsTechSpecsBar';
import { ElectronicsTechCatalogIndex } from './ElectronicsTechCatalogIndex';
import { ElectronicsTechBrandStory } from './ElectronicsTechBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'themeConfig'>;
}

export async function ElectronicsTechHomepage({ store }: Props) {
  const detail = await prisma.store.findUnique({
    where: { id: store.id },
    select: { tagline: true, description: true, bannerUrl: true },
  });

  const slots: SectionSlot[] = [
    {
      id: 'hero',
      locked: true,
      render: () => (
        <ElectronicsTechHero
          storeSlug={store.slug}
          storeName={store.name}
          bannerUrl={detail?.bannerUrl ?? null}
        />
      ),
    },
    {
      id: 'specs-bar',
      hideable: true,
      reorderable: true,
      render: () => <ElectronicsTechSpecsBar />,
    },
    {
      id: 'catalog-index',
      hideable: true,
      reorderable: true,
      render: () => (
        <ElectronicsTechCatalogIndex storeId={store.id} storeSlug={store.slug} />
      ),
    },
    {
      id: 'brand-story',
      hideable: true,
      reorderable: true,
      render: () => (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ElectronicsTechBrandStory
            storeSlug={store.slug}
            storeName={store.name}
            tagline={detail?.tagline ?? null}
            description={detail?.description ?? null}
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
