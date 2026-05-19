/**
 * Community theme — live-commerce / video-feed / storyteller templates.
 * Vivid social-commerce feel: red-purple gradient primary, white text,
 * round portrait avatars. Detector covers the three "community" group
 * templates from the 20-template registry.
 */

const COMMUNITY_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  'live-commerce',
  'video-feed',
  'storyteller',
]);

const COMMUNITY_VARIANT_VALUES: ReadonlySet<string> = new Set(['community']);

export function isCommunityStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && COMMUNITY_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && COMMUNITY_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const COMMUNITY_BODY_CLASS = 'theme-community';

export const COMMUNITY_TOKENS = {
  primary: '#9333EA', // vivid purple — primary
  primaryGradient: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
  accent: '#EC4899', // pink — chips
  savings: '#10B981',
  ink: '#0A0A0A',
  inkMuted: '#525252',
  bg: '#FAFAFA',
  bgSoft: '#FAF5FF',
  border: '#E5E5E5',
  muted: '#F5F5F5',
} as const;

export function communityCssVars(): Record<string, string> {
  const c = COMMUNITY_TOKENS;
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
