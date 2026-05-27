/**
 * Salepage template system — separate from the storefront-theme system
 * at lib/templates. Salepages are SINGLE-product long-form conversion
 * pages (hero → benefits → testimonials → CTA → FAQ → footer); they
 * don't ship cart/catalog/PDP routes. A merchant can install a
 * salepage template alongside their normal store theme.
 *
 * Phase 1 = ThemeForest-style catalog at /themes with fullscreen
 * preview using bundled demo data. No payment, no install flow, no
 * builder yet — those land in Phase 2.
 */

import type { ComponentType } from 'react';

export type SalepageId =
  | 'info-product-classic'
  | 'course-launch-bold'
  | 'ebook-minimal';

export type SalepageCategory =
  | 'info-product'
  | 'course'
  | 'ebook'
  | 'service'
  | 'software';

export interface SalepageBenefit {
  icon?: string;
  title: string;
  body: string;
}

export interface SalepageTestimonial {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string | null;
  rating?: number;
}

export interface SalepageFaq {
  q: string;
  a: string;
}

export interface SalepageModule {
  title: string;
  bullets: string[];
}

/**
 * Generic data contract every salepage template renders against.
 * Demo data lives in lib/salepages/demo-data.ts; once the builder
 * lands in Phase 2, merchants will fill this same shape from admin.
 */
export interface SalepageData {
  /** Eyebrow above hero, e.g. "หลักสูตรออนไลน์". */
  eyebrow?: string;
  headline: string;
  subheadline: string;
  heroImageUrl: string;
  heroBadge?: string;

  priceTHB: number;
  compareAtPriceTHB?: number;
  ctaPrimary: string;
  ctaSecondary?: string;
  /** Used to fake scarcity on the salepage — copy only, no real timer. */
  scarcityText?: string;

  painPoints: string[];
  benefits: SalepageBenefit[];
  modules?: SalepageModule[];

  author: {
    name: string;
    title: string;
    bio: string;
    avatarUrl?: string | null;
  };

  testimonials: SalepageTestimonial[];
  faqs: SalepageFaq[];

  brandName: string;
  brandTagline?: string;
}

export interface SalepageTemplate {
  id: SalepageId;
  name: string;
  description: string;
  category: SalepageCategory;
  /** Public catalog thumbnail (1200×800). Generated screenshot or
   *  static asset under /public/salepages/<id>/thumb.jpg. */
  thumbnailUrl: string;
  /** Color accent shown on the catalog card. */
  accentColor: string;
  /** "Coming soon" templates appear in the catalog but the preview +
   *  install CTAs are disabled until the actual component lands. */
  status: 'live' | 'coming-soon';
  component?: ComponentType<{ data: SalepageData }>;
}
