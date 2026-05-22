/**
 * Brutalist Thai — shared palette for shadcn-studio block adapters.
 *
 * The Brutalist Thai chrome (Header, Hero, feature cards) uses pure
 * black-on-white with thick borders and hard drop shadows outside the
 * --shop-* cascade, so any shadcn-studio block we mount inside the
 * storefront (homepage trending list, cart, ...) falls back to neutral
 * default tokens unless we remap them here. This palette is passed to
 * `enhanceHomepage` and `makeCartAdapter` so the appended sections
 * blend with the rest of the page.
 */

import type { BlockPalette } from '../_shared/palette';

export const BRUTALIST_PALETTE: BlockPalette = {
  background: '#ffffff',
  muted: '#f5f5f5',
  card: '#ffffff',
  cardForeground: '#000000',
  border: '#000000',
  foreground: '#000000',
  mutedForeground: '#525252',
  primary: '#000000',
  primaryForeground: '#ffffff',
};
