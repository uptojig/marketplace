/**
 * ResumeForge family — รีซูเม่ฟอร์จ
 *
 * Bespoke palette for resume / CV / cover-letter template marketplaces
 * (ATS-friendly .docx / .pdf · LinkedIn header packs). Vibe: pro corporate
 * navy + gold · ATS-friendly cards · clean professional grid ·
 * trustworthy. Distinct from the existing 15 families: corporate navy is
 * cooler / more conservative than the cheerful Vector Bazaar pink-cream
 * or the warm classroom blue, and the gold accent reads "executive
 * career services" rather than e-commerce promotion.
 *
 * Opt in by setting Store.landingThemeVariant = "resume-forge" or
 * templateId belonging to the `resume-forge` group (currently:
 * 'resume-forge-th').
 */
import { templateIdsForGroup } from '@/lib/templates/template-groups';

const RESUME_FORGE_TEMPLATE_IDS: ReadonlySet<string> =
  templateIdsForGroup('resume-forge');

const RESUME_FORGE_VARIANT_VALUES: ReadonlySet<string> = new Set([
  'resume-forge',
]);

export function isResumeForgeStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && RESUME_FORGE_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && RESUME_FORGE_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const RESUME_FORGE_BODY_CLASS = 'theme-resume-forge';

/**
 * Pro corporate navy + gold palette. Navy primary on a cool slate canvas
 * with pure-white card surfaces so ATS-style document previews read like
 * crisp printed pages. Burnt-gold accent for premium / executive badges,
 * green for "ATS pass" savings chips. Stone-100/slate-200 borders keep
 * the layout reading as a hiring portal rather than a marketplace.
 */
export const RESUME_FORGE_TOKENS = {
  primary: '#1E3A8A', // blue-900 — CTAs / nav highlights / price
  primaryHover: '#1E40AF',
  primaryDark: '#172554',
  accent: '#B45309', // amber-700 burnt gold — secondary / premium badges
  accentHover: '#92400E',
  accentDark: '#78350F',
  savings: '#16A34A', // green-600 — ATS pass / discount chips
  ink: '#0F172A', // slate-900 — body text
  inkMuted: '#475569', // slate-600 — metadata / muted text
  bg: '#F8FAFC', // slate-50 — page canvas
  bgSoft: '#FFFFFF', // pure white card surface
  border: '#CBD5E1', // slate-300 — hairlines
  muted: '#E2E8F0', // slate-200 — hover / tile-fill
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
  info: '#0EA5E9',
} as const;

export function resumeForgeCssVars(): Record<string, string> {
  const c = RESUME_FORGE_TOKENS;
  return {
    '--shop-primary': c.primary,
    '--shop-primary-hover': c.primaryHover,
    '--shop-primary-dark': c.primaryDark,
    '--shop-accent': c.accent,
    '--shop-accent-hover': c.accentHover,
    '--shop-accent-dark': c.accentDark,
    '--shop-savings': c.savings,
    '--shop-ink': c.ink,
    '--shop-ink-muted': c.inkMuted,
    '--shop-bg': c.bg,
    '--shop-bg-soft': c.bgSoft,
    '--shop-border': c.border,
    '--shop-muted': c.muted,
  };
}
