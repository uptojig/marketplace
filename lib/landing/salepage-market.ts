/**
 * Salepage Market family — ThemeForest-inspired developer marketplace
 * for HTML salepage / landing-page templates. Clean grid, technical
 * badges, signature green primary, live-demo iframe is the differentiator.
 *
 * Opt in by setting Store.landingThemeVariant = "salepage-market" or
 * templateId in the `salepage-market` group (currently: 'salepage-market-th').
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const SALEPAGE_MARKET_TEMPLATE_IDS: ReadonlySet<string> =
  templateIdsForGroup('salepage-market');

const SALEPAGE_MARKET_VARIANT_VALUES: ReadonlySet<string> = new Set([
  'salepage-market',
]);

export function isSalepageMarketStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && SALEPAGE_MARKET_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && SALEPAGE_MARKET_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const SALEPAGE_MARKET_BODY_CLASS = 'theme-salepage-market';

/**
 * ThemeForest-green palette — clean light theme. Lime-green primary
 * (#82B440), sky-blue accent, sunset-orange savings on white surfaces
 * with cool-gray neutrals. Reads as developer-marketplace / dev tooling
 * rather than fashion / FMCG.
 */
export const SALEPAGE_MARKET_TOKENS = {
  primary: '#82B440', // ThemeForest green — CTAs, price, accents
  accent: '#00ADEF',  // sky blue — hover swap, secondary CTA
  savings: '#FF6B35', // sunset orange — sale chips, savings
  ink: '#0D1421',     // near-black slate — text + headings
  inkMuted: '#6B7280',// slate-500 — metadata, breadcrumb
  bg: '#FAFBFC',      // off-white page background
  bgSoft: '#FFFFFF',  // pure white card surfaces
  border: '#E5E7EB',  // gray-200 hairlines
  muted: '#F3F4F6',   // gray-100 — disabled / muted surfaces
} as const;

export function salepageMarketCssVars(): Record<string, string> {
  const c = SALEPAGE_MARKET_TOKENS;
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
