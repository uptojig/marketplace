/**
 * Vector Bazaar family — designer-friendly storefront for SVG illustrations,
 * icon packs, and editable vector assets. Signature: playful pastel rainbow
 * primaries on warm cream, soft rounded cards, generous whitespace that
 * reads "creative marketplace" rather than standard e-commerce.
 *
 * Opt in by setting Store.landingThemeVariant = "vector-bazaar" or
 * templateId in the `vector-bazaar` group (currently: 'vector-bazaar-th').
 */
import { templateIdsForGroup } from '@/lib/templates/template-groups';

const VECTOR_BAZAAR_TEMPLATE_IDS: ReadonlySet<string> =
  templateIdsForGroup('vector-bazaar');

const VECTOR_BAZAAR_VARIANT_VALUES: ReadonlySet<string> = new Set([
  'vector-bazaar',
]);

export function isVectorBazaarStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && VECTOR_BAZAAR_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && VECTOR_BAZAAR_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const VECTOR_BAZAAR_BODY_CLASS = 'theme-vector-bazaar';

/**
 * Vector Bazaar palette — bubblegum pink primary, sky-blue accent, sunshine
 * savings on a warm cream background. Surfaces stay pure white so SVG
 * thumbnails (which are mostly black-line) read cleanly, while accent
 * surfaces use a soft pink wash for category bands / hover.
 */
export const VECTOR_BAZAAR_TOKENS = {
  primary: '#F472B6',  // pink-400 — CTAs, price highlights
  accent: '#60A5FA',   // blue-400 — secondary, links, focus
  savings: '#FBBF24',  // amber-400 — badges / discount chips
  ink: '#1E1B4B',      // indigo-950 — primary text
  inkMuted: '#6366F1', // indigo-500 — metadata / muted text
  bg: '#FEFCE8',       // yellow-50 cream — page background
  bgSoft: '#FFFFFF',   // pure white card surfaces
  border: '#FBCFE8',   // pink-200 — soft hairlines
  muted: '#FCE7F3',    // pink-100 — tile-fill / hover surface
} as const;

export function vectorBazaarCssVars(): Record<string, string> {
  const c = VECTOR_BAZAAR_TOKENS;
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
