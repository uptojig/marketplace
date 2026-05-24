/**
 * MotoFog palette — scaffolded by `pnpm theme:new`.
 *
 * The 9 family CSS vars (--shop-primary, --shop-accent, --shop-ink,
 * --shop-bg, --shop-bg-soft, --shop-muted, --shop-border,
 * --shop-savings, --shop-ink-muted) come from the family detector in
 * `lib/landing/<family>.ts`. The extended hex below is for state colors
 * (hover / dark / semantic) that don't fit the standard --shop-* surface.
 *
 * Replace these placeholders with the final brand palette once the
 * designer signs off.
 */

import type { BlockPalette } from '../_shared/palette';

export const MOTOFOG_PALETTE: BlockPalette = {
  background: '#FFFFFF',
  muted: '#FFFFFF',
  card: '#ffffff',
  cardForeground: '#0F172A',
  border: '#5C6B73',
  foreground: '#0F172A',
  mutedForeground: '#0F172A',
  primary: '#FF6B35',
  primaryForeground: '#ffffff',
};

export const MOTOFOG_HEX = {
  primary: '#FF6B35',
  primaryHover: '#FF6B35',
  primaryDark: '#FF6B35',
  accent: '#5C6B73',
  ink: '#0F172A',
  bg: '#FFFFFF',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#2563eb',
} as const;
