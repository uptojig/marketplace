/**
 * Mystic Mu (มูเลเวลอัพ) family — Mario-inspired Thai สายมู / auspicious
 * digital-goods storefronts. Signature: pixel-art bold black borders +
 * hard offset shadows + Mario red / pipe-green / coin-gold on a Mario
 * sky-blue background. Lucky-themed wallpapers, charms, prosperity
 * downloads. The vibe reads "✨ มูเลเวลอัพชีวิต ✨" — playful retro pixel
 * with auspicious Thai twist.
 *
 * Opt in by setting Store.landingThemeVariant = "mystic-mu" or templateId
 * in the `mystic-mu` group (currently: 'mystic-mu-th').
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const MYSTIC_MU_TEMPLATE_IDS: ReadonlySet<string> = templateIdsForGroup('mystic-mu');

const MYSTIC_MU_VARIANT_VALUES: ReadonlySet<string> = new Set(['mystic-mu']);

export function isMysticMuStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && MYSTIC_MU_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && MYSTIC_MU_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const MYSTIC_MU_BODY_CLASS = 'theme-mystic-mu';

/**
 * Mario-inspired auspicious palette — Mario red primary, Luigi pipe-green
 * accent, coin-gold savings on a Mario sky-blue background with pixel-
 * bold black borders + hard offset shadows. The mood reads "retro Mario
 * level-up screen" while leaning into Thai สายมู (lucky / auspicious)
 * culture — red + gold + green are auspicious colors anyway.
 */
export const MYSTIC_MU_TOKENS = {
  primary: '#E52521',  // Mario red — CTA, price highlights, level-up
  accent: '#009A4E',   // Luigi pipe green — hover swap, secondary CTA
  savings: '#FFD700',  // Coin gold — discount badge, star burst
  ink: '#1A1A2E',      // dark almost-black for sky-bg readability
  inkMuted: '#4A4A6E', // muted purple-grey for metadata
  bg: '#5C94FC',       // Mario sky blue — page background
  bgSoft: '#FFFFFF',   // cloud white — card surfaces
  border: '#1A1A2E',   // pixel-art bold black border (drawn 2-4px)
  muted: '#E8E8F0',    // light gray — disabled / muted surfaces
} as const;

export function mysticMuCssVars(): Record<string, string> {
  const c = MYSTIC_MU_TOKENS;
  return {
    '--shop-primary': c.primary,
    '--shop-accent': c.accent,
    '--shop-savings': c.savings,
    '--shop-ink': c.ink,
    '--shop-ink-muted': c.inkMuted,
    '--shop-bg': c.bg,
    '--shop-bg-soft': c.bgSoft,
    '--shop-border': c.border,
    '--shop-muted': c.muted,
  };
}
