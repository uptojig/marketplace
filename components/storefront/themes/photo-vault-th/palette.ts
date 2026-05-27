/**
 * Photo Vault — โฟโต้วอลต์
 *
 * Bespoke palette + extended state colors. Chrome and pages reference
 * --shop-* CSS vars from `lib/landing/photo-vault.ts` for the canonical
 * 9-color system; this file defines the extra hover / dark / semantic
 * states the photographer-luxe components need (amber-700 dark, rose-700
 * accent dark, success/warning/error chips on a dark canvas).
 */

import type { BlockPalette } from '../_shared/palette';

/** BlockPalette consumed by `paletteToCssVars` when (rarely) embedding a
 *  shadcn-studio block inside the bespoke pages. The bespoke pages
 *  primarily read --shop-* vars directly, so this stays a backup. */
export const PHOTO_VAULT_PALETTE: BlockPalette = {
  background: '#0C0A09',
  muted: '#1C1917',
  card: '#1C1917',
  cardForeground: '#F5F5F4',
  border: '#44403C',
  foreground: '#F5F5F4',
  mutedForeground: '#A8A29E',
  primary: '#F59E0B',
  primaryForeground: '#0C0A09',
};

/** Extended hex tokens for hover/dark/semantic states. Used inline by
 *  bespoke components that need neon-glow-style amber shadows or rose
 *  "limited drop" badges without polluting --shop-*. */
export const PHOTO_VAULT_HEX = {
  // Core (mirror PHOTO_VAULT_TOKENS from lib/landing for direct hex use)
  primary: '#F59E0B', // amber-500
  primaryHover: '#FBBF24', // amber-400
  primaryDark: '#D97706', // amber-600
  primaryDeep: '#B45309', // amber-700
  accent: '#E11D48', // rose-600
  accentHover: '#F43F5E', // rose-500
  accentDark: '#BE123C', // rose-700
  savings: '#FBBF24', // amber-300

  ink: '#F5F5F4', // stone-100
  inkMuted: '#A8A29E', // stone-400
  bg: '#0C0A09', // stone-950
  bgSoft: '#1C1917', // stone-900
  muted: '#292524', // stone-800
  border: '#44403C', // stone-700
  borderSoft: '#57534E', // stone-600

  // Semantic state colors readable on a dark canvas
  success: '#10B981', // emerald-500
  warning: '#F59E0B', // amber-500
  error: '#EF4444', // red-500
  info: '#3B82F6', // blue-500

  // Hero gradient stops (golden hour through magic hour)
  gradientFrom: '#0C0A09',
  gradientVia: '#1C1917',
  gradientTo: '#0C0A09',
} as const;
