/**
 * FashionBeautyHomepage — root composer for the bespoke fashion-beauty
 * landing page. Mirrors the structural pattern of PetHouseHomepage:
 * an async server component that wires together the editorial sub-
 * sections in a single cream-bg wrapper.
 *
 * Section order:
 *   1. FashionBeautyHero            — full-bleed magazine cover
 *   2. FashionBeautyEditorialPicks  — 3-up "Today's pick" spread
 *   3. FashionBeautyBestsellers     — 4-up "Loved this season" grid
 *   4. FashionBeautyBrandStory      — already-shipped editorial panel
 *
 * The shared <ShopHeader /> + <ShopFooter /> chrome (from
 * app/stores/[slug]/layout.tsx) wraps the entire tree, so this
 * composer never renders header/nav/footer of its own.
 *
 * Visual language matches FashionBeautyCategoryPage exactly:
 *   - cream `var(--shop-bg)` ground for the whole page
 *   - serif headings via var(--font-fashion-display)
 *   - rose-500 accents, rose-50 muted, rose-300 borders
 *   - airy section padding (handled inside each sub-section)
 *
 * BrandStory needs `tagline` + `description` but the composer prop
 * is intentionally narrow (`Pick<Store, 'id' | 'slug' | 'name'>`) so
 * callers don't need to over-fetch. We fetch the editorial fields
 * here in a single small Prisma read — same pattern other server
 * sub-sections use.
 */

import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { FashionBeautyHero } from './FashionBeautyHero';
import { FashionBeautyEditorialPicks } from './FashionBeautyEditorialPicks';
import { FashionBeautyBestsellers } from './FashionBeautyBestsellers';
import { FashionBeautyBrandStory } from './FashionBeautyBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function FashionBeautyHomepage({ store }: Props) {
  // Fetch editorial fields (tagline / description / banner) for the
  // BrandStory + Hero artwork. Kept narrow so this stays cheap on
  // every storefront render.
  const editorial = await prisma.store.findUnique({
    where: { id: store.id },
    select: { tagline: true, description: true, bannerUrl: true },
  });

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <FashionBeautyHero
        storeSlug={store.slug}
        storeName={store.name}
        bannerUrl={editorial?.bannerUrl ?? null}
      />

      <FashionBeautyEditorialPicks
        storeId={store.id}
        storeSlug={store.slug}
      />

      <FashionBeautyBestsellers
        storeId={store.id}
        storeSlug={store.slug}
      />

      {/* BrandStory renders nothing if both tagline and description
       * are empty — safe to mount unconditionally. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FashionBeautyBrandStory
          storeSlug={store.slug}
          storeName={store.name}
          tagline={editorial?.tagline ?? null}
          description={editorial?.description ?? null}
        />
      </div>
    </div>
  );
}
