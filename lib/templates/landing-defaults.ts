/**
 * Per-template fallback copy for `StoreLandingContent`-driven sections.
 *
 * Storefront renderers AND the BackOffice editor both import from this
 * map so the form shows the operator what's currently visible on the
 * site as a placeholder, and the renderer falls back to the same text
 * when the corresponding row column is null/empty.
 *
 * Add an entry here when a theme starts reading any landingContent
 * field — keep the keys lean (only the strings we actually surface).
 */

import type { TemplateId } from './types';

export interface TemplateLandingDefaults {
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaLabel?: string;
  heroCtaUrl?: string;
  announcementMessage?: string;
  announcementMessageMobile?: string;
}

const TALAD_SEE_SOD: TemplateLandingDefaults = {
  heroHeadline: 'ไอเท็มแกดเจ็ตตัวท็อป\nลดราคาจัดเต็ม!',
  heroSubheadline:
    'รวมสายชาร์จคุณภาพสูง หัวชาร์จเร็ว เคสโทรศัพท์ และของแต่งโต๊ะทำงาน ดีลส่งตรงจากโรงงาน ราคาประหยัดสุดๆ',
  heroCtaLabel: 'ช้อปเลยตอนนี้',
  heroCtaUrl: '#shop-section',
  announcementMessage:
    'ส่งฟรีเมื่อช้อปครบ ฿199.- · มีบริการเก็บเงินปลายทาง (COD) · ร้านแนะนำของแท้ 100%',
};

const DEFAULTS: Partial<Record<TemplateId, TemplateLandingDefaults>> = {
  'talad-see-sod': TALAD_SEE_SOD,
};

/** Lookup defaults for a templateId. Returns an empty object for unknown ids. */
export function getTemplateLandingDefaults(
  templateId: string | null | undefined,
): TemplateLandingDefaults {
  if (!templateId) return {};
  return DEFAULTS[templateId as TemplateId] ?? {};
}
