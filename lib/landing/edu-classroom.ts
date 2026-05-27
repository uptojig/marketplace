/**
 * EduClassroom family — Thai K-9 teacher marketplace storefront.
 *
 * Use case: ครูประถม–มัธยมต้น selling digital classroom material
 * (ใบงาน · สไลด์ · ข้อสอบ · แบบทดสอบ) to other teachers. Trust + warmth +
 * a hint of chalkboard cheer — opposite of luxury / opposite of brutalist.
 *
 * Detection — a store opts in by setting `landingThemeVariant = "edu-classroom"`
 * or templateId belonging to the `edu-classroom` group.
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const EDU_CLASSROOM_TEMPLATE_IDS: ReadonlySet<string> = templateIdsForGroup('edu-classroom');

const EDU_CLASSROOM_VARIANT_VALUES: ReadonlySet<string> = new Set([
  'edu-classroom',
  'classroom',
]);

export function isEduClassroomStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && EDU_CLASSROOM_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && EDU_CLASSROOM_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const EDU_CLASSROOM_BODY_CLASS = 'theme-edu-classroom';

/**
 * Friendly classroom palette — pastel-blue primary, chalkboard-yellow accent,
 * gold-star green savings on a warm notebook-page background. Operator brief:
 * "เป็นมิตร · น่าเชื่อถือ · เหมือนหน้ากระดาษสมุดในห้องเรียน".
 *
 * Distinct from `everyday` (Shopee-red) — this theme leans soft + cheerful so
 * teachers feel welcomed instead of pressured to buy.
 */
export const EDU_CLASSROOM_TOKENS = {
  primary: '#2563EB', // classroom blue — CTAs / nav highlights
  primaryHover: '#1D4ED8',
  primaryDark: '#1E40AF',
  accent: '#F59E0B', // chalkboard yellow — secondary badges / pins
  accentHover: '#D97706',
  accentDark: '#B45309',
  savings: '#16A34A', // gold-star green — discount / "ดาวประจำสัปดาห์"
  ink: '#0F172A',
  inkMuted: '#475569',
  bg: '#FAFAF9', // warm white / notebook page
  bgSoft: '#FEF3C7', // cream notebook band for section dividers
  border: '#E2E8F0',
  muted: '#F1F5F9',
  success: '#16A34A',
  warning: '#EAB308',
  error: '#DC2626',
  info: '#0EA5E9',
} as const;

export function eduClassroomCssVars(): Record<string, string> {
  const c = EDU_CLASSROOM_TOKENS;
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
