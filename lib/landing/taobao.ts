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
