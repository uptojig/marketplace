/**
 * Packaging theme — bright cheerful packaging-supply storefront. The source
 * template (PACKHUB) shipped in earthy kraft tones but operator wants the
 * mood swapped to vibrant / playful — coral, sunshine yellow, mint, sky.
 *
 * Opt in by setting Store.landingThemeVariant = "packaging" or templateId =
 * "packaging-supply".
 */

const PACKAGING_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  'packaging-supply',
  'packhub',
]);

const PACKAGING_VARIANT_VALUES: ReadonlySet<string> = new Set(['packaging']);

export function isPackagingStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && PACKAGING_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && PACKAGING_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const PACKAGING_BODY_CLASS = 'theme-packaging';

/**
 * Vibrant Packaging palette — coral primary, sunshine accent, mint savings.
 * Applied to the page wrapper via inline style so the .theme-packaging
 * class in globals.css can also override these. Kraft-brown source theme
 * was muted; this brightens it for SMB consumer feel.
 */
export const PACKAGING_TOKENS = {
  primary: '#FF6B6B', // coral
  accent: '#FFD93D', // sunshine yellow
  savings: '#06D6A0', // mint
  ink: '#1A1A2E',
  inkMuted: '#5C5C7B',
  bg: '#FFF8F0', // warm cream
  bgSoft: '#FFEDD8',
  border: '#FFE0C2',
  muted: '#FFF5E6',
} as const;

export function packagingCssVars(): Record<string, string> {
  const c = PACKAGING_TOKENS;
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
