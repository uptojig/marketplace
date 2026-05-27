'use client';
/**
 * MysticMu palette — Mario-inspired pixel-art Thai สายมู (auspicious)
 * digital-wallpaper storefront. The 9 CSS vars (--shop-primary,
 * --shop-accent, etc.) come from `lib/landing/mystic-mu.ts → mysticMuCssVars()`
 * at the family level; these extras are theme-specific hex literals used
 * by components that need exact "Mario coin gold" or "pipe green" without
 * relying on the cascade.
 */

import type { BlockPalette } from '../_shared/palette';

export const MYSTIC_MU_PALETTE: BlockPalette = {
  background: '#5C94FC',
  muted: '#E8E8F0',
  card: '#FFFFFF',
  cardForeground: '#1A1A2E',
  border: '#1A1A2E',
  foreground: '#1A1A2E',
  mutedForeground: '#4A4A6E',
  primary: '#E52521',
  primaryForeground: '#FFFFFF',
};

/**
 * Extended Mario palette — used directly by the bespoke chrome / pages
 * when a hex literal beats a CSS var (e.g. coin badges, pipe-green
 * hover swaps, fire-flower discount tags).
 */
export const MYSTIC_MU_HEX = {
  // Core
  primary: '#E52521',       // Mario red — CTA / level-up
  primaryHover: '#FF4D4D',  // brighter red on hover
  primaryDark: '#B71C1C',   // pressed red
  accent: '#009A4E',        // Luigi pipe green
  accentHover: '#00C853',   // brighter pipe green
  accentDark: '#006B36',    // pressed pipe green
  savings: '#FFD700',       // coin gold — discount + star
  savingsBright: '#FFEB3B', // brighter coin
  sky: '#5C94FC',           // Mario sky blue (the bg)
  skyDeep: '#3F6FCB',       // darker sky for footer
  cloud: '#FFFFFF',         // cloud white card
  ink: '#1A1A2E',           // pixel-bold dark border + text
  inkMuted: '#4A4A6E',      // metadata text
  muted: '#E8E8F0',         // disabled surface

  // Mario character / mood accents
  brick: '#C84B16',         // brick orange — accent panel bg
  pipe: '#009A4E',          // green pipe — same as accent
  starYellow: '#FFD700',    // star item yellow
  fire: '#FF6B35',          // fire flower orange

  // Status
  success: '#009A4E',
  warning: '#FFD700',
  error: '#E52521',
  info: '#2196F3',
} as const;
