/**
 * Mega Store theme — Taobao-style high-density storefront. Full multi-
 * page scaffold (chrome + Homepage + Catalog + PDP + Cart + Checkout +
 * About + Help) registered in lib/templates/registry.ts under the
 * `mega-store` id. Dispatch from app/stores/[slug]/page.tsx happens
 * BEFORE the parent lifestyle family detector so mega-store stores get
 * the designer's bespoke pages instead of the generic lifestyle
 * homepage.
 *
 * Opt in by setting Store.templateId = 'mega-store' or
 * Store.landingThemeVariant = 'mega-store'.
 */

import type { Store } from '@prisma/client';

export function isMegaStoreStore(
  store: Pick<Store, 'slug' | 'templateId' | 'landingThemeVariant'>,
): boolean {
  if (store.templateId === 'mega-store') return true;
  if (store.landingThemeVariant === 'mega-store') return true;
  return false;
}
