/**
 * ResumeForge — bespoke theme palette.
 *
 * The 9 surface vars (--shop-primary, --shop-bg, ...) come from
 * `lib/landing/resume-forge.ts → resumeForgeCssVars()` at the family
 * level. The hex map below is theme-specific accents + state colors
 * used directly in chrome / pages JSX (hover / dark variants,
 * semantic success/warning/error/info) plus the document-tone rotation
 * used for resume category chips (engineering navy, executive gold,
 * design teal, finance forest, healthcare crimson, academic plum).
 */

import type { BlockPalette } from '../_shared/palette';

export const RESUME_FORGE_PALETTE: BlockPalette = {
  background: '#F8FAFC',
  muted: '#E2E8F0',
  card: '#FFFFFF',
  cardForeground: '#0F172A',
  border: '#CBD5E1',
  foreground: '#0F172A',
  mutedForeground: '#475569',
  primary: '#1E3A8A',
  primaryForeground: '#F8FAFC',
};

export const RESUME_FORGE_HEX = {
  // Core (mirrors RESUME_FORGE_TOKENS for direct hex use in JSX)
  primary: '#1E3A8A',
  primaryHover: '#1E40AF',
  primaryDark: '#172554',

  accent: '#B45309',
  accentHover: '#92400E',
  accentDark: '#78350F',

  savings: '#16A34A',
  savingsHover: '#15803D',

  ink: '#0F172A',
  inkMuted: '#475569',
  inkSoft: '#64748B',

  bg: '#F8FAFC',
  bgSoft: '#FFFFFF',
  muted: '#E2E8F0',
  border: '#CBD5E1',
  borderSoft: '#E2E8F0',

  // ATS-pass green chip used on PDP + hero trust strip
  atsBg: '#DCFCE7',
  atsFg: '#15803D',
  atsBorder: '#BBF7D0',

  // Document-tone rotation for resume category chips. Each chip is paired
  // (border + text) so cards read like printed letterhead swatches.
  tones: {
    engineering: { bg: '#DBEAFE', fg: '#1E40AF', border: '#BFDBFE' },
    executive:   { bg: '#FEF3C7', fg: '#B45309', border: '#FDE68A' },
    design:      { bg: '#CCFBF1', fg: '#0F766E', border: '#99F6E4' },
    finance:     { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
    healthcare:  { bg: '#FEE2E2', fg: '#B91C1C', border: '#FECACA' },
    academic:    { bg: '#EDE9FE', fg: '#6D28D9', border: '#DDD6FE' },
    creative:    { bg: '#FCE7F3', fg: '#BE185D', border: '#FBCFE8' },
  },

  // Status
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
  info: '#0EA5E9',
} as const;

/** Stable category-chip rotation — used on Homepage / Catalog category rails
 *  + featured grids so each tile lands on a consistent letterhead tone. */
export const RESUME_FORGE_TONES = [
  RESUME_FORGE_HEX.tones.engineering,
  RESUME_FORGE_HEX.tones.executive,
  RESUME_FORGE_HEX.tones.design,
  RESUME_FORGE_HEX.tones.finance,
  RESUME_FORGE_HEX.tones.healthcare,
  RESUME_FORGE_HEX.tones.academic,
  RESUME_FORGE_HEX.tones.creative,
] as const;
