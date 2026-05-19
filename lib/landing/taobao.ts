/**
 * Taobao / AowBao theme — bold marketplace-style PDP with orange/red/pink
 * gradient hero, marketplace badges, dense product grid. Inspired by the
 * Taobao / Lazada / Shopee aesthetic.
 *
 * Opt in by setting Store.landingThemeVariant = "taobao" or templateId =
 * "marketplace-hot".
 */

const TAOBAO_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  'marketplace-hot',
  'taobao-style',
]);

const TAOBAO_VARIANT_VALUES: ReadonlySet<string> = new Set(['taobao']);

export function isTaobaoStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && TAOBAO_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && TAOBAO_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const TAOBAO_BODY_CLASS = 'theme-taobao';

/**
 * Bold marketplace palette — orange/red/pink gradient primary, golden
 * yellow accent. Matches the AowBao mockup vibe (Taobao / Lazada /
 * Shopee aesthetic).
 */
export const TAOBAO_TOKENS = {
  primary: '#FF1A1A', // hot red — primary CTA
  primaryGradient: 'linear-gradient(135deg, #FF4D00 0%, #FF1A1A 50%, #FF3D8B 100%)',
  accent: '#FFD600', // golden yellow — flash deal / sale chip
  savings: '#22C55E', // green — savings chip
  ink: '#0F0F0F',
  inkMuted: '#525252',
  bg: '#FAFAFA',
  bgSoft: '#FFEDED',
  border: '#E5E5E5',
  muted: '#F5F5F5',
} as const;

export function taobaoCssVars(): Record<string, string> {
  const c = TAOBAO_TOKENS;
  return {
    '--shop-primary': c.primary,
    '--shop-primary-gradient': c.primaryGradient,
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
