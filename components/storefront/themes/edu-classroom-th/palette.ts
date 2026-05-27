/**
 * EduClassroom — shared palette for the bespoke pages.
 *
 * Exported as both a `BlockPalette` (kept for parity with the rest of
 * the marketplace — none of the bespoke pages render shadcn-studio
 * blocks anymore so the cascade is mostly informational) and as raw
 * HEX constants so the Header / Footer / chrome strips can hand-pick
 * the exact shade they want.
 *
 * Theme variables from the spec:
 *   Primary  #2563EB  — classroom blue, anchors all interactive accents
 *   Accent   #F59E0B  — chalk amber, used for stamps / "ครูแชร์ครู" / stars
 *   Savings  #16A34A  — fern green, used for discount + download badges
 *   Ink      #0F172A  — slate-900 body copy
 *   InkMuted #475569  — slate-600 secondary copy
 *   BG       #FAFAF9  — neutral notebook page background
 *   BG_SOFT  #FEF3C7  — chalk-yellow soft panel (margin / pre-footer strip)
 *   Border   #E2E8F0  — slate-200 card borders / dividers
 */

import type { BlockPalette } from '../_shared/palette';

// Raw HEX constants — referenced directly by Header / Footer / pages so
// the visual language matches everywhere without re-declaring the
// classroom colours in each file.
export const EDU_PRIMARY = '#2563EB';
export const EDU_PRIMARY_DEEP = '#1D4ED8';
export const EDU_ACCENT = '#F59E0B';
export const EDU_ACCENT_DEEP = '#B45309';
export const EDU_SAVINGS = '#16A34A';
export const EDU_INK = '#0F172A';
export const EDU_INK_MUTED = '#475569';
export const EDU_BG = '#FAFAF9';
export const EDU_BG_SOFT = '#FEF3C7';
export const EDU_BORDER = '#E2E8F0';
export const EDU_BORDER_SOFT = '#F1F5F9';

export const EDU_PALETTE: BlockPalette = {
  background: EDU_BG,
  muted: EDU_BG_SOFT,
  card: '#FFFFFF',
  cardForeground: EDU_INK,
  border: EDU_BORDER,
  foreground: EDU_INK,
  mutedForeground: EDU_INK_MUTED,
  primary: EDU_PRIMARY,
  primaryForeground: '#FFFFFF',
};
