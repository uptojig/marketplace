/**
 * SpecialtyHomepage — root composer for the bespoke artisan / vintage
 * landing page. Rendered by `app/stores/[slug]/page.tsx` BEFORE the
 * generic render path when `isSpecialtyStore(store)` is true.
 *
 * Section order: SpecialtyHero → SpecialtyMakersBar →
 * SpecialtyHandcrafted → SpecialtyBrandStory. The shared <ShopHeader />
 * and <ShopFooter /> chrome (from `app/stores/[slug]/layout.tsx`) wraps
 * this entire tree — we do NOT render header/nav/footer here.
 *
 * Server component. The hero + makers strip don't need data, the
 * handcrafted grid queries Prisma directly, and the brand story panel
 * needs the store's tagline / description, which aren't included in the
 * narrow `Pick<Store, 'id' | 'slug' | 'name'>` prop. We fetch those two
 * fields lazily here so callers don't have to drill the full Store row
 * down through the page route — keeps the integration surface tight.
 *
 * Mirrors the structural pattern of PetHouseHomepage so future
 * conditional renderers stay easy to read at a glance.
 */

import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { SpecialtyHero } from './SpecialtyHero';
import { SpecialtyMakersBar } from './SpecialtyMakersBar';
import { SpecialtyHandcrafted } from './SpecialtyHandcrafted';
import { SpecialtyBrandStory } from './SpecialtyBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function SpecialtyHomepage({ store }: Props) {
  // Fetch the bits SpecialtyBrandStory needs (tagline/description) and
  // the optional banner the hero shows. The narrow Pick<> on Props
  // keeps the call site clean; we resolve the extras here.
  const extras = await prisma.store.findUnique({
    where: { id: store.id },
    select: {
      bannerUrl: true,
      tagline: true,
      description: true,
    },
  });

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <SpecialtyHero
        storeSlug={store.slug}
        storeName={store.name}
        bannerUrl={extras?.bannerUrl ?? null}
      />
      <SpecialtyMakersBar />
      <SpecialtyHandcrafted storeId={store.id} storeSlug={store.slug} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SpecialtyBrandStory
          storeSlug={store.slug}
          storeName={store.name}
          tagline={extras?.tagline ?? null}
          description={extras?.description ?? null}
        />
      </div>
    </div>
  );
}
