/**
 * Photo Vault family — โฟโต้วอลต์
 *
 * Bespoke palette for photographer / digital-creator storefronts selling
 * Lightroom presets, Photoshop actions, LUTs (.xmp / .acr / .cube).
 *
 * Vibe: photographer dark luxe · film grain · charcoal + amber accent ·
 * gallery-style grid. The hue avoids the existing 11 families — black
 * charcoal canvas (cooler than konvy / electronics-tech) with warm amber
 * highlights borrowed from camera-lens flare and golden-hour gradient.
 *
 * Opt in by setting Store.landingThemeVariant = "photo-vault" or
 * templateId = "photo-vault-th".
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const PHOTO_VAULT_TEMPLATE_IDS: ReadonlySet<string> =
  templateIdsForGroup('photo-vault');

const PHOTO_VAULT_VARIANT_VALUES: ReadonlySet<string> = new Set([
  'photo-vault',
]);

export function isPhotoVaultStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && PHOTO_VAULT_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && PHOTO_VAULT_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const PHOTO_VAULT_BODY_CLASS = 'theme-photo-vault';

/**
 * Photographer dark luxe palette — amber-500 primary on charcoal
 * stone-950 canvas, rose-600 accent for "limited drop" badges, and
 * amber-300 for savings/discount chips. Stone-* greys keep the
 * background reading like an exposed-film darkroom instead of pure
 * black SaaS.
 */
export const PHOTO_VAULT_TOKENS = {
  primary: '#F59E0B', // amber-500 — CTAs, price highlights
  accent: '#E11D48', // rose-600 — limited / hot drop badges
  savings: '#FBBF24', // amber-300 — discount chips
  ink: '#F5F5F4', // stone-100 — body text on dark
  inkMuted: '#A8A29E', // stone-400 — metadata
  bg: '#0C0A09', // stone-950 — main canvas
  bgSoft: '#1C1917', // stone-900 — card surface
  muted: '#292524', // stone-800 — hover / surface-2
  border: '#44403C', // stone-700 — hairlines
} as const;

export function photoVaultCssVars(): Record<string, string> {
  const c = PHOTO_VAULT_TOKENS;
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
