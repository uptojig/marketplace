/**
 * Salepage template registry. Add new templates here so they appear
 * in /themes catalog automatically.
 *
 * Phase 1 = 1 live template + 2 "coming soon" placeholders so the
 * catalog grid shows variety even before the other two ship.
 */
import InfoProductClassicSalepage from '@/components/salepages/info-product-classic/Salepage';
import type { SalepageId, SalepageTemplate } from './types';

const TEMPLATES: SalepageTemplate[] = [
  {
    id: 'info-product-classic',
    name: 'Info Product · Classic',
    description:
      'Long-form sales letter for digital courses, ebooks, and template packs. Hero → pain points → benefits → curriculum → testimonials → pricing → FAQ — conversion-tested section order.',
    category: 'info-product',
    thumbnailUrl: '/salepages/info-product-classic/thumb.jpg',
    accentColor: '#FF6B35',
    status: 'live',
    component: InfoProductClassicSalepage,
  },
  {
    id: 'course-launch-bold',
    name: 'Course Launch · Bold',
    description:
      'High-contrast course launch page with countdown timer, cohort dates, and curriculum carousel. Built for new launches with scarcity built in.',
    category: 'course',
    thumbnailUrl: '/salepages/course-launch-bold/thumb.jpg',
    accentColor: '#0F172A',
    status: 'coming-soon',
  },
  {
    id: 'ebook-minimal',
    name: 'Ebook · Minimal',
    description:
      'Editorial-style single-product page for ebooks and short reads. Quiet typography, focus on the cover, single CTA — for products that sell themselves.',
    category: 'ebook',
    thumbnailUrl: '/salepages/ebook-minimal/thumb.jpg',
    accentColor: '#1E40AF',
    status: 'coming-soon',
  },
];

export const SALEPAGE_TEMPLATES: SalepageTemplate[] = TEMPLATES;

export function getSalepageTemplate(
  id: string,
): SalepageTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function listLiveTemplateIds(): SalepageId[] {
  return TEMPLATES.filter((t) => t.status === 'live').map((t) => t.id);
}
