/**
 * ElectronicsTechHomepage — root component composing the bespoke
 * electronics-tech landing page. Rendered by `app/stores/[slug]/page.tsx`
 * BEFORE the other render paths when `isElectronicsTechStore(store)`
 * is true (catalog-dense / tech-compare / single-product templates,
 * or `landingThemeVariant` "electronics-tech" / "E").
 *
 * Section order: Hero → Specs bar → Catalog index (latest 12) →
 * Brand story. The shared <ShopHeader /> and <ShopFooter /> chrome
 * (from app/stores/[slug]/layout.tsx) wraps this entire tree — we
 * do NOT render header/nav/footer here.
 *
 * Server component. The catalog-index sub-section queries Prisma
 * directly; the composer itself only fetches the small set of Store
 * fields (tagline / description / bannerUrl) that the brand-story +
 * hero need but that aren't part of the slim `store` prop.
 */

import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ElectronicsTechHero } from './ElectronicsTechHero';
import { ElectronicsTechSpecsBar } from './ElectronicsTechSpecsBar';
import { ElectronicsTechCatalogIndex } from './ElectronicsTechCatalogIndex';
import { ElectronicsTechBrandStory } from './ElectronicsTechBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function ElectronicsTechHomepage({ store }: Props) {
  // The slim `store` prop intentionally only carries id / slug / name.
  // The hero (bannerUrl) + brand story (tagline / description) need
  // a couple of extra fields, so fetch them here once.
  const detail = await prisma.store.findUnique({
    where: { id: store.id },
    select: {
      tagline: true,
      description: true,
      bannerUrl: true,
    },
  });

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <ElectronicsTechHero
        storeSlug={store.slug}
        storeName={store.name}
        bannerUrl={detail?.bannerUrl ?? null}
      />
      <ElectronicsTechSpecsBar />
      <ElectronicsTechCatalogIndex
        storeId={store.id}
        storeSlug={store.slug}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ElectronicsTechBrandStory
          storeSlug={store.slug}
          storeName={store.name}
          tagline={detail?.tagline ?? null}
          description={detail?.description ?? null}
        />
      </div>
    </div>
  );
}
