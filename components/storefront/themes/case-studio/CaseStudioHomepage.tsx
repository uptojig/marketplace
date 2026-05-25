/**
 * CaseStudioHomepage — root component composing the bespoke case-studio
 * landing page for casethep (phone-case store). Rendered by
 * `app/stores/[slug]/page.tsx` BEFORE the other render paths when
 * `isCaseStudioStore(store)` is true.
 *
 * Section order:
 *   1. Top announcement bar    (thin black strip, sits ABOVE chrome
 *                               visually — in practice it renders at
 *                               the top of the page body, just under
 *                               the real ShopHeader. Per the spec
 *                               that's the simpler path and "still
 *                               high".)
 *   2. Hero                    (pink gradient + 2 rotated phone SVGs)
 *   3. Phone Model Selector    (tabs + 12-chip grid, client component)
 *   4. Category Grid           (6-col "Shop by Type")
 *   5. New Arrivals            (4 newest products)
 *   6. Collections             (asymmetric 5-card placeholder grid)
 *   7. Features Bar            (black bg, 4-col trust strip)
 *   8. Bestsellers             (next 4 products — proxy until we
 *                               track sold counts)
 *   9. Customization Promo     (DIY studio — coming-soon CTA)
 *  10. Instagram Grid          (rendered ONLY if Store.instagramUrl
 *                               is set; otherwise hidden)
 *  11. Reviews Band            (HIDDEN entirely — no Review model)
 *  12. Newsletter              (client form, toast-only v1)
 *
 * The shared `<ShopHeader />` and `<ShopFooter />` chrome (from
 * `app/stores/[slug]/layout.tsx`) wraps this entire tree — we do NOT
 * render header/nav/footer here.
 *
 * Server component: each sub-section that needs DB data queries
 * Prisma directly via async sub-components.
 */

import type { Store } from '@prisma/client';
import { CaseStudioAnnouncementBar } from './CaseStudioAnnouncementBar';
import { CaseStudioHero } from './CaseStudioHero';
import { CaseStudioModelSelector } from './CaseStudioModelSelector';
import { CaseStudioCategoryGrid } from './CaseStudioCategoryGrid';
import { CaseStudioProductGrid } from './CaseStudioProductGrid';

import { CaseStudioFeaturesBar } from './CaseStudioFeaturesBar';
import { CaseStudioCustomPromo } from './CaseStudioCustomPromo';
import { CaseStudioInstagramGrid } from './CaseStudioInstagramGrid';
import { CaseStudioNewsletter } from './CaseStudioNewsletter';

interface Props {
  store: Pick<
    Store,
    'id' | 'slug' | 'name' | 'instagramUrl' | 'templateId' | 'landingThemeVariant'
  >;
}

export async function CaseStudioHomepage({ store }: Props) {
  return (
    <div style={{ background: '#FFFFFF' }}>
      <CaseStudioAnnouncementBar />
      <CaseStudioHero storeSlug={store.slug} />
      <CaseStudioModelSelector storeSlug={store.slug} />
      <CaseStudioCategoryGrid storeId={store.id} storeSlug={store.slug} />
      <CaseStudioProductGrid
        storeId={store.id}
        storeSlug={store.slug}
        variant="new-arrivals"
      />

      <CaseStudioFeaturesBar />
      <CaseStudioProductGrid
        storeId={store.id}
        storeSlug={store.slug}
        variant="bestsellers"
      />
      <CaseStudioCustomPromo storeSlug={store.slug} />
      <CaseStudioInstagramGrid instagramUrl={store.instagramUrl} />
      {/*
        Reviews band intentionally omitted — no Review model exists
        yet and the spec calls for "real data only, no fake numbers".
        TODO: re-introduce when a Review schema lands.
      */}
      <CaseStudioNewsletter storeSlug={store.slug} />
    </div>
  );
}
