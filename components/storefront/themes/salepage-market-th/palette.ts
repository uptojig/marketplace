'use client';

/**
 * SalepageMarket palette — ThemeForest-inspired developer marketplace.
 * The 9 CSS vars (--shop-primary, --shop-accent, etc.) come from
 * `lib/landing/salepage-market.ts → salepageMarketCssVars()` at the family
 * level; these extras are theme-specific accents / state colors for direct
 * hex use in components (hover/dark states, status colors, badges).
 */

import type { BlockPalette } from '../_shared/palette';

export const SALEPAGE_MARKET_HEX = {
  // Core palette (mirror SALEPAGE_MARKET_TOKENS for direct hex use)
  primary: '#82B440',        // ThemeForest green
  primaryHover: '#6B9D33',
  primaryDark: '#5A8329',
  accent: '#00ADEF',         // sky blue
  accentHover: '#0093CC',
  accentDark: '#007BAD',
  savings: '#FF6B35',        // sunset orange
  ink: '#0D1421',
  inkMuted: '#6B7280',
  bg: '#FAFBFC',
  bgSoft: '#FFFFFF',
  muted: '#F3F4F6',
  border: '#E5E7EB',

  // Status (forms, badges)
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#0EA5E9',
} as const;

/**
 * shadcn BlockPalette — fed to copied shadcn block primitives so any
 * neutral defaults blend with the live storefront. Mirrors the 9 family
 * tokens above plus the foreground/cardForeground naming the shadcn
 * block adapters expect.
 */
export const SALEPAGE_MARKET_PALETTE: BlockPalette = {
  background: SALEPAGE_MARKET_HEX.bg,
  muted: SALEPAGE_MARKET_HEX.muted,
  card: SALEPAGE_MARKET_HEX.bgSoft,
  cardForeground: SALEPAGE_MARKET_HEX.ink,
  border: SALEPAGE_MARKET_HEX.border,
  foreground: SALEPAGE_MARKET_HEX.ink,
  mutedForeground: SALEPAGE_MARKET_HEX.inkMuted,
  primary: SALEPAGE_MARKET_HEX.primary,
  primaryForeground: '#FFFFFF',
};
