/**
 * Notion Mart family — Notion-inspired clean storefronts for digital
 * template stores (Notion templates, productivity systems, CRM bases).
 *
 * Vibe: off-white paper · subtle gray + black ink · minimal sidebar.
 * Off-white #F7F6F3 page, black CTA, blue accent (Notion-blue #2563EB),
 * red savings accent. Hairline borders, generous whitespace, mono-tinged
 * Kanit headlines paired with Prompt body — feels like reading a
 * well-typeset Notion doc more than a marketplace.
 *
 * Opt in by setting Store.landingThemeVariant = "notion-mart" or
 * templateId in the `notion-mart` group (currently: 'notion-mart-th').
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const NOTION_MART_TEMPLATE_IDS: ReadonlySet<string> =
  templateIdsForGroup('notion-mart');

const NOTION_MART_VARIANT_VALUES: ReadonlySet<string> = new Set([
  'notion-mart',
]);

export function isNotionMartStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && NOTION_MART_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && NOTION_MART_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const NOTION_MART_BODY_CLASS = 'theme-notion-mart';

export const NOTION_MART_TOKENS = {
  primary: '#000000',
  accent: '#2563EB',
  savings: '#DC2626',
  ink: '#1A1A1A',
  inkMuted: '#6B6B6B',
  bg: '#FFFFFF',
  bgSoft: '#F7F6F3',
  border: '#E5E5E5',
  muted: '#EFEEEC',
} as const;

export function notionMartCssVars(): Record<string, string> {
  const c = NOTION_MART_TOKENS;
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
