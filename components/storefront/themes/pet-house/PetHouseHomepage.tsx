/**
 * PetHouseHomepage — root component composing the bespoke pet-house
 * landing page. Rendered by `app/stores/[slug]/page.tsx` BEFORE the
 * other render paths when `isPetHouseStore(store)` is true.
 *
 * Section order: Hero → Trust bar → Shop by Pet → Shop by Type →
 * Bestsellers → Brand story. The shared <ShopHeader /> and
 * <ShopFooter /> chrome (from app/stores/[slug]/layout.tsx) wraps
 * this entire tree — we do NOT render header/nav/footer here.
 *
 * Server component: each sub-section queries Prisma directly. No
 * client-side hooks needed for the landing.
 */

import type { Store } from '@prisma/client';
import { PetHouseHero } from './PetHouseHero';
import { PetHouseTrustBar } from './PetHouseTrustBar';
import { PetHouseShopByPet } from './PetHouseShopByPet';
import { PetHouseShopByType } from './PetHouseShopByType';
import { PetHouseBestsellers } from './PetHouseBestsellers';
import { PetHouseBrandStory } from './PetHouseBrandStory';

interface Props {
  store: Pick<Store, 'id' | 'slug'>;
}

export async function PetHouseHomepage({ store }: Props) {
  return (
    <div style={{ background: '#FAF7F4' }}>
      <PetHouseHero storeSlug={store.slug} />
      <PetHouseTrustBar />
      <PetHouseShopByPet storeId={store.id} storeSlug={store.slug} />
      <PetHouseShopByType storeId={store.id} storeSlug={store.slug} />
      <PetHouseBestsellers storeId={store.id} storeSlug={store.slug} />
      <PetHouseBrandStory storeSlug={store.slug} />
    </div>
  );
}
