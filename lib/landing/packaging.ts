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
 * Vibrant Packaging palette — pink primary, sunshine accent, sky savings on
 * a clean white background. Operator brief: ชมพู / เหลือง / ฟ้า / ขาว —
 * playful and cheerful so the storefront reads as friendly SMB instead of
 * the muted kraft-brown source mockup.
 */
export const PACKAGING_TOKENS = {
  primary: '#FF4E8B', // vivid hot pink — CTAs / accents
  accent: '#FFD93D', // sunshine yellow — secondary highlights / badges
  savings: '#3B82F6', // royal blue — savings / info chips
  ink: '#1A1A2E',
  inkMuted: '#6B7280',
  bg: '#FFFFFF', // pure white background
  bgSoft: '#FFF0F6', // barely-there pink wash for section bands
  border: '#FFE0EC', // soft pink hairlines
  muted: '#FFF7FA', // tile-fill / surface-2
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
