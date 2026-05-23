/**
 * Homepage enhancer — historical wrapper around bespoke homepages.
 *
 * Background
 * ----------
 * This helper used to append a shadcn-studio `product-list-XX` block
 * underneath every bespoke homepage so chromed themes would always
 * surface a "premium" product rail. Two problems killed that idea:
 *
 *   1. The shadcn-studio block hard-codes USD ("$") strings and
 *      English star-rating microcopy. On a Thai-first storefront
 *      that ships ฿ prices, this produced a visual conflict
 *      (e.g. `$3` next to `฿120`) — see basketplace.co/stores/
 *      powerpuff678 for the regression report.
 *
 *   2. Every bespoke homepage already includes its own product
 *      rail in the correct currency and language, so the appended
 *      block was redundant noise.
 *
 * Current behaviour
 * -----------------
 * Until a Thai-native / THB-aware product-list block ships, this
 * function is a passthrough: it returns the original homepage
 * component unchanged. The signature (`variant`, `palette`) is
 * preserved so callers in `lib/templates/registry.ts` and theme
 * modules continue to compile without edits.
 */

import type { ComponentType } from 'react';
import type { HomepageProps } from '@/lib/templates/types';
import type { ProductListVariant } from './product-list-adapter';
import type { BlockPalette } from './palette';

export type ProductListPalette = BlockPalette;

/**
 * Historically appended a shadcn-studio product-list block beneath
 * every bespoke homepage. The shadcn block hard-codes `$` currency
 * and ratings, which created a visual conflict with the bespoke
 * homepage's Thai/THB cards. Bespoke homepages already feature their
 * own product rail, so the extra section is redundant and ships
 * incorrect currency — passthrough until we have a Thai-native
 * shadcn block to swap in.
 */
export function enhanceHomepage(
  OriginalHomepage: ComponentType<HomepageProps>,
  _variant: ProductListVariant,
  _palette?: ProductListPalette,
) {
  return OriginalHomepage;
}
