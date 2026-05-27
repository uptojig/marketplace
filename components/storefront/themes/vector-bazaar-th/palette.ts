/**
 * Vector Bazaar — bespoke theme palette.
 *
 * The 9 surface vars (--shop-primary, --shop-bg, ...) come from
 * `lib/landing/vector-bazaar.ts → vectorBazaarCssVars()` at the family
 * level. The hex map below is theme-specific accents + state colors that
 * don't fit the standard --shop-* cascade (hover / dark variants,
 * semantic success/warning/error/info) and the rainbow spectrum used
 * for category chips / hero gradient bands.
 */

import type { BlockPalette } from '../_shared/palette';

export const VECTOR_BAZAAR_PALETTE: BlockPalette = {
  background: '#FEFCE8',
  muted: '#FCE7F3',
  card: '#FFFFFF',
  cardForeground: '#1E1B4B',
  border: '#FBCFE8',
  foreground: '#1E1B4B',
  mutedForeground: '#6366F1',
  primary: '#F472B6',
  primaryForeground: '#FFFFFF',
};

export const VECTOR_BAZAAR_HEX = {
  // Core (mirrors VECTOR_BAZAAR_TOKENS for direct hex use)
  primary: '#F472B6',         // pink-400
  primaryHover: '#EC4899',    // pink-500
  primaryDark: '#DB2777',     // pink-600

  accent: '#60A5FA',          // blue-400
  accentHover: '#3B82F6',     // blue-500
  accentDark: '#2563EB',      // blue-600

  savings: '#FBBF24',         // amber-400
  savingsHover: '#F59E0B',    // amber-500

  ink: '#1E1B4B',             // indigo-950
  inkMuted: '#6366F1',        // indigo-500

  bg: '#FEFCE8',              // yellow-50 cream
  bgSoft: '#FFFFFF',
  muted: '#FCE7F3',           // pink-100
  border: '#FBCFE8',          // pink-200

  // Rainbow spectrum — category chips / hero band / featured cards
  rainbow: {
    pink: '#F472B6',
    coral: '#FB7185',
    amber: '#FBBF24',
    lime: '#84CC16',
    mint: '#34D399',
    sky: '#60A5FA',
    violet: '#A78BFA',
  },

  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
} as const;

/** Stable rainbow rotation for category chips / featured grids. */
export const VECTOR_BAZAAR_RAINBOW = [
  VECTOR_BAZAAR_HEX.rainbow.pink,
  VECTOR_BAZAAR_HEX.rainbow.amber,
  VECTOR_BAZAAR_HEX.rainbow.mint,
  VECTOR_BAZAAR_HEX.rainbow.sky,
  VECTOR_BAZAAR_HEX.rainbow.violet,
  VECTOR_BAZAAR_HEX.rainbow.coral,
  VECTOR_BAZAAR_HEX.rainbow.lime,
] as const;
