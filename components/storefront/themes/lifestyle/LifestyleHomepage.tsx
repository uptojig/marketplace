/**
 * LifestyleHomepage — root composer for the bespoke lifestyle landing
 * page. Mirrors PetHouseHomepage's structural pattern (server component
 * that simply assembles each section) and renders inside the shared
 * ShopHeader / ShopFooter chrome that `app/stores/[slug]/layout.tsx`
 * wraps around every store sub-page — so we do NOT render header /
 * nav / footer here.
 *
 * Section order: Hero → Mood Selector → Bestsellers → Brand Story.
 *
 * Visual language matches LifestyleCategoryPage / LifestyleCartPage:
 *   • warm cream `--shop-bg` outer wrapper
 *   • Outfit / Plus Jakarta Sans display headings
 *   • sage + terracotta accents, peach muted secondary cards
 *   • rounded-3xl pillows
 *   • sage SVG squiggle dividers (data-lifestyle-squiggle)
 *
 * Server component: Hero / MoodSelector are static, Bestsellers is the
 * only sub-section that hits Prisma. No client-side state needed at
 * this composer level.
 */

import type { Store } from '@prisma/client';
import { LifestyleHero } from './LifestyleHero';
import { LifestyleMoodSelector } from './LifestyleMoodSelector';
import { LifestyleBestsellers } from './LifestyleBestsellers';
import { LifestyleBrandStory } from './LifestyleBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug' | 'name'>;
}

export async function LifestyleHomepage({ store }: Props) {
  // Hydrate tagline / description from the full Store row so the
  // brand-story panel reads as authentic catalog voice. We use a
  // dynamic import-style fetch via prisma to keep the composer's
  // public Pick narrow (id / slug / name only) — avoids forcing every
  // caller of <LifestyleHomepage /> to hand us the marketing fields.
  const { prisma } = await import('@/lib/prisma');
  const storeMeta = await prisma.store.findUnique({
    where: { id: store.id },
    select: { tagline: true, description: true, bannerUrl: true },
  });

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <LifestyleHero
        storeSlug={store.slug}
        storeName={store.name}
        bannerUrl={storeMeta?.bannerUrl ?? null}
      />
      <LifestyleMoodSelector storeSlug={store.slug} />
      <LifestyleBestsellers storeId={store.id} storeSlug={store.slug} />
      {/* Brand story — REUSE the existing PDP brand panel. Renders
          nothing if neither tagline nor description is present, so
          the homepage still feels intentional on bare stores. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LifestyleBrandStory
          storeSlug={store.slug}
          storeName={store.name}
          tagline={storeMeta?.tagline ?? null}
          description={storeMeta?.description ?? null}
        />
      </div>
    </div>
  );
}
