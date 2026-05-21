/**
 * Everyday theme — clean consumer-retail PDP design (Shopee/Lazada-style).
 *
 * Use case: small Thai SMB stores that sell direct-to-consumer (not B2B
 * wholesale). The design language is the opposite of BusinessModel —
 * soft rounded corners, brand-warm red CTA, photo-forward gallery, no
 * tier pricing / Net-30 / spreadsheet aesthetics.
 *
 * Detection — a store opts in by setting `landingThemeVariant = "everyday"`
 * on its Store row (or by templateId mapping below). See PDP page.tsx for
 * how the hero is chosen.
 */

import { templateIdsForGroup } from '@/lib/templates/template-groups';

const EVERYDAY_TEMPLATE_IDS: ReadonlySet<string> = templateIdsForGroup('everyday');

// Legacy alias — 'consumer-retail' was the old template name; catch it
// via variant match so old stores still route correctly.
const EVERYDAY_VARIANT_VALUES: ReadonlySet<string> = new Set(['everyday', 'consumer-retail']);

export function isEverydayStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && EVERYDAY_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && EVERYDAY_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const EVERYDAY_BODY_CLASS = 'theme-everyday';
