/**
 * Per-template route dispatch helper.
 *
 * The storefront has 15+ design templates (bikini-beach, eco-pack,
 * mega-store, pet-house, …); some of them ship a full set of bespoke
 * sub-pages (Catalog / Cart / Checkout / Product / About / Help) and
 * some only ship a homepage. Each route under `app/stores/[slug]/...`
 * used to import the family detectors directly and write its own
 * if/else dispatch chain, which left the per-product / per-category /
 * per-cart pages out-of-sync with the homepage.
 *
 * `resolveStoreTemplate` collapses that into a single source of truth:
 * pass the store row, get back the canonical template id (or null when
 * the store has no bespoke pages, in which case the route should keep
 * rendering its generic UI).
 *
 * Only templates that ship multi-page adapters are listed here. Themes
 * with just a homepage helper (e.g. trust, fashion-beauty) are not
 * returned, so their sub-pages continue to use the shared generic
 * layout — same as before.
 */

import type { Store } from '@prisma/client';
import { isBikiniBeachStore } from '@/lib/landing/bikini-beach';
import { isEcoPackStore } from '@/lib/landing/eco-pack';
import { isMegaStoreStore } from '@/lib/landing/mega-store';
import { isPetHouseStore } from '@/lib/landing/pet-house';
import { effectiveTemplateId } from '@/lib/landing/legacy-slug-template';

export type DispatchTemplateId =
  | 'bikini-beach'
  | 'eco-pack'
  | 'mega-store'
  | 'pet-house';

export function resolveStoreTemplate(
  store: Pick<Store, 'slug' | 'templateId' | 'landingThemeVariant'>,
): DispatchTemplateId | null {
  const familyInput = {
    slug: store.slug,
    templateId: effectiveTemplateId(store) ?? null,
    landingThemeVariant: store.landingThemeVariant ?? null,
  };
  if (isBikiniBeachStore(familyInput)) return 'bikini-beach';
  if (isEcoPackStore(familyInput)) return 'eco-pack';
  if (isMegaStoreStore(familyInput)) return 'mega-store';
  if (isPetHouseStore(familyInput)) return 'pet-house';
  return null;
}
