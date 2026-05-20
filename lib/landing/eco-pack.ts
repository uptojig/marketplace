/**
 * Eco Pack theme — full multi-page scaffold (chrome + Homepage + Catalog
 * + PDP + Cart + Checkout + About + Help) registered in
 * lib/templates/registry.ts under the `eco-pack` id. Dispatch from
 * app/stores/[slug]/page.tsx happens BEFORE the parent business-model
 * family detector so eco-pack stores get the designer's bespoke pages
 * instead of the generic business-model homepage.
 *
 * Opt in by setting Store.templateId = 'eco-pack' or
 * Store.landingThemeVariant = 'eco-pack'.
 */

import type { Store } from '@prisma/client';

export function isEcoPackStore(
  store: Pick<Store, 'slug' | 'templateId' | 'landingThemeVariant'>,
): boolean {
  if (store.templateId === 'eco-pack') return true;
  if (store.landingThemeVariant === 'eco-pack') return true;
  return false;
}
