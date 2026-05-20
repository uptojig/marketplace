/**
 * Bikini Beach theme — BIKINI551 designer deliverable. Full multi-page
 * scaffold (chrome + Homepage + Catalog + PDP + Cart + Checkout + Lookbook
 * + About + Help) registered in lib/templates/registry.ts under the
 * `bikini-beach` id. Dispatch from app/stores/[slug]/page.tsx happens
 * BEFORE the parent fashion-beauty family detector so bikini stores get
 * the designer's bespoke pages instead of the generic fashion-beauty
 * homepage.
 *
 * Opt in by setting Store.templateId = 'bikini-beach' or
 * Store.landingThemeVariant = 'bikini-beach', or by mapping a legacy
 * slug in lib/landing/legacy-slug-template.ts (e.g. bikini551).
 */

import type { Store } from '@prisma/client';

export function isBikiniBeachStore(
  store: Pick<Store, 'slug' | 'templateId' | 'landingThemeVariant'>,
): boolean {
  if (store.templateId === 'bikini-beach') return true;
  if (store.landingThemeVariant === 'bikini-beach') return true;
  return false;
}
