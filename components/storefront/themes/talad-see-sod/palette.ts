/**
 * Talad See Sod — shared palette for shadcn-studio block adapters.
 *
 * The Talad chrome (Header, Hero, sidebar) is hardcoded with literal
 * red/orange Tailwind classes outside the --shop-* cascade, so any
 * shadcn-studio block we mount inside the storefront (homepage trending
 * list, PDP, cart) falls back to neutral default tokens unless we
 * remap them here. This palette is passed to `enhanceHomepage`,
 * `makePdpAdapter`, and `makeCartAdapter` so the appended sections
 * blend with the rest of the page.
 */

import type { BlockPalette } from '../_shared/palette';

export const TALAD_PALETTE: BlockPalette = {
  background: '#fff7ed',
  muted: '#fff7ed',
  card: '#ffffff',
  cardForeground: '#7f1d1d',
  border: '#fdba74',
  foreground: '#7f1d1d',
  mutedForeground: '#9a3412',
  primary: '#dc2626',
  primaryForeground: '#ffffff',
};
