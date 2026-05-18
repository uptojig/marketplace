/**
 * TrustHomepage — root composer for the bespoke trust-family landing
 * page. Rendered by app/stores/[slug]/page.tsx when isTrustStore(store)
 * is true, BEFORE the generic catalog grid render path.
 *
 * Section order — sober heritage editorial:
 *   1. TrustHero            — gallery-wall hero (caps + serif + CTA)
 *   2. TrustHeritageBar     — 3 trust pillars on cream bg
 *   3. TrustCollectionShowcase — 4-up square card grid of latest 8
 *   4. TrustBrandStory      — REUSED PDP brand panel for the maison voice
 *
 * The shared <ShopHeader /> + <ShopFooter /> chrome is supplied by
 * app/stores/[slug]/layout.tsx — we do NOT render header / nav / footer
 * here. We only own the page body.
 *
 * Server component — each sub-section that needs product data queries
 * Prisma directly. The composer also fetches tagline / description for
 * TrustBrandStory since that component is reused as-is from the PDP
 * (its public prop shape requires those two fields). The composer's
 * own external API stays narrow — Pick<Store, 'id' | 'slug' | 'name'>
 * — so callers don't need to widen their store-row select.
 */

import type { Store } from '@prisma/client';
import { prisma } from '@/lib/prisma';

import { TrustHero } from './TrustHero';
import { TrustHeritageBar } from './TrustHeritageBar';
import { TrustCollectionShowcase } from './TrustCollectionShowcase';
import { TrustBrandStory } from './TrustBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function TrustHomepage({ store }: Props) {
  // Fetch the extra store fields that the reused brand panel + hero
  // banner need. Kept inside the composer (rather than widened on
  // the prop) so callers can pass a slim 3-field select-shape.
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
      <TrustHero
        storeSlug={store.slug}
        storeName={store.name}
        bannerUrl={extras?.bannerUrl ?? null}
      />
      <TrustHeritageBar />
      <TrustCollectionShowcase storeId={store.id} storeSlug={store.slug} />
      {/* TrustBrandStory renders nothing if both tagline and
          description are empty — no awkward empty frame. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TrustBrandStory
          storeSlug={store.slug}
          storeName={store.name}
          tagline={extras?.tagline ?? null}
          description={extras?.description ?? null}
        />
      </div>
    </div>
  );
}
