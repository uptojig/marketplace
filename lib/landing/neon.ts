/**
 * Neon Festival family — Neo-Brutalism Pop-Art storefronts (Y2K rave /
 * concert merch / party-supply). Signature: thick black borders, hard
 * offset shadows, pink + yellow + blue color blocking, all-uppercase
 * italic Kanit headlines.
 *
 * Opt in by setting Store.landingThemeVariant = "neon" or templateId in
 * the `neon` group (currently: 'neon-festival').
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const NEON_TEMPLATE_IDS: ReadonlySet<string> = templateIdsForGroup('neon');

const NEON_VARIANT_VALUES: ReadonlySet<string> = new Set(['neon']);

export function isNeonStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && NEON_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && NEON_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const NEON_BODY_CLASS = 'theme-neon';

/**
 * Neo-Brutalism Pop-Art palette — pink-500 primary, yellow accent,
 * blue-600 savings/secondary, on a near-white background with HARD
 * black borders + black hard-offset shadows. The mood reads "Y2K rave
 * poster" instead of standard e-commerce neutral.
 */
export const NEON_TOKENS = {
  primary: '#ec4899',  // pink-500 — CTAs, price highlights
  accent: '#eab308',   // yellow-500 — hover swap, badges
  savings: '#2563eb',  // blue-600 — secondary CTA / info chips
  ink: '#000000',      // pure black — text + borders
  inkMuted: '#64748b', // slate-500 — metadata
  bg: '#fafafa',       // off-white page background
  bgSoft: '#ffffff',   // pure white card surfaces
  border: '#000000',   // black hairlines (we draw thick 4px in components)
  muted: '#e2e8f0',    // slate-200 — disabled / muted surfaces
} as const;

export function neonCssVars(): Record<string, string> {
  const c = NEON_TOKENS;
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
