/**
 * PromptHub family — dark-tech AI prompts marketplace.
 *
 * Opt in by setting `Store.landingThemeVariant = "prompt-hub"` or `templateId`
 * in the `prompt-hub` group (currently: 'prompt-hub-th').
 *
 * Vibe: neon purple + cyan on near-black, developer-grade typography, focused
 * on selling AI prompts (ChatGPT / Midjourney / Sora / Claude) as instant
 * digital downloads.
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const PROMPT_HUB_TEMPLATE_IDS: ReadonlySet<string> =
  templateIdsForGroup('prompt-hub');

const PROMPT_HUB_VARIANT_VALUES: ReadonlySet<string> = new Set(['prompt-hub']);

export function isPromptHubStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && PROMPT_HUB_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && PROMPT_HUB_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const PROMPT_HUB_BODY_CLASS = 'theme-prompt-hub';

/**
 * PromptHub palette — neon purple + cyan on near-black. Mood: "developer
 * marketplace" — like Vercel / Linear / Stripe Press but tuned for an
 * AI-prompt storefront with a single signature neon-purple CTA.
 */
export const PROMPT_HUB_TOKENS = {
  primary: '#A855F7',   // purple-500 — CTAs, price highlights, neon glow source
  accent: '#06B6D4',    // cyan-500 — secondary CTA, info chips, link hover
  savings: '#FACC15',   // yellow-400 — discount / savings badges (rare on dark)
  ink: '#F8FAFC',       // slate-50 — primary text on dark surfaces
  inkMuted: '#94A3B8',  // slate-400 — metadata
  bg: '#0B0B1F',        // near-black indigo — page background
  bgSoft: '#13132E',    // surface-1 — card / panel background
  border: '#312E81',    // indigo-900 — hairlines / dividers
  muted: '#1E1E3F',     // surface-2 — hover state / disabled
} as const;

export function promptHubCssVars(): Record<string, string> {
  const c = PROMPT_HUB_TOKENS;
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
