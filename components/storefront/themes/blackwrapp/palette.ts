/**
 * BlackWrapp palette — scaffolded by `pnpm theme:new`.
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

export const BLACKWRAPP_PALETTE: BlockPalette = {
  background: '#FFFFFF',
  muted: '#FFFFFF',
  card: '#ffffff',
  cardForeground: '#0F172A',
  border: '#00FF88',
  foreground: '#0F172A',
  mutedForeground: '#0F172A',
  primary: '#1A1A1A',
  primaryForeground: '#ffffff',
};

export const BLACKWRAPP_HEX = {
  primary: '#1A1A1A',
  primaryHover: '#1A1A1A',
  primaryDark: '#1A1A1A',
  accent: '#00FF88',
  ink: '#0F172A',
  bg: '#FFFFFF',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#2563eb',
} as const;
