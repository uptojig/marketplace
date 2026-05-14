/**
 * Fashion-Beauty design family — PILOT.
 *
 * This module owns the visual language for the `fashion-beauty`
 * TemplateGroup (templates: lookbook, beauty-swatch, boutique).
 *
 * Design intent — editorial soft-feminine:
 *   • cream / off-white background (#FBF8F4)
 *   • rose-300 → rose-500 accent (used sparingly)
 *   • serif headlines (Cormorant Garamond / Playfair Display)
 *   • generous whitespace, rounded-2xl cards, soft shadows
 *   • magazine-style imagery (4/5 portrait product hero)
 *
 * Wiring:
 *   - `FASHION_BEAUTY_TOKENS` is the canonical token bag (colors /
 *     typography / radius / spacing). New shared chrome can read
 *     directly from here when it needs more than what CSS vars give.
 *   - `isFashionBeautyStore({ templateId, landingThemeVariant })`
 *     is consulted by per-page conditional renderers in
 *     `app/stores/[slug]/*` to swap in the fashion-beauty variant.
 *   - The CSS-var cascade (--shop-bg / --shop-primary / --shop-ink)
 *     is also remapped onto these tokens via `theme-fashion-beauty`
 *     in globals.css, so legacy pages that only use vars still pick
 *     up the new palette without touching their classNames.
 *
 * Scope: this pilot covers fashion-beauty ONLY. The other 5 families
 * (trust, electronics-tech, lifestyle, community, specialty) ship in
 * DESIGN-B as separate PRs and intentionally render the default
 * design here untouched.
 */

import type { TemplateId } from '@/lib/templates/types';

// ---------------------------------------------------------------------------
// Token shape (per spec — must include colors / typography / radius / spacing)
// ---------------------------------------------------------------------------

export interface FashionBeautyColors {
  /** Hero CTAs, price emphasis, focus rings. Rose-500. */
  primary: string;
  /** Soft accent — rose-300, used for chips / pills / hover. */
  accent: string;
  /** Card / inner surface — pure white. */
  surface: string;
  /** Page background — cream / off-white. */
  bg: string;
  /** Muted surface — peach / blush card tint. */
  muted: string;
  /** Primary text — deep mauve / near-black. */
  ink: string;
  /** Muted text — soft stone for captions. */
  inkMuted: string;
  /** Hairline borders — pale rose. */
  border: string;
}

export interface FashionBeautyTypography {
  /** Used for h1/h2/h3 — serif display font (CSS-var loaded by app/layout.tsx). */
  headingFontVar: string;
  /** Body — DM Sans / Inter via existing --font-sans cascade. */
  bodyFontVar: string;
  /** Display-size scale used by hero / category banners. */
  scale: {
    display: string; // hero h1
    h1: string;
    h2: string;
    h3: string;
    body: string;
    caption: string;
  };
  /** Default heading weight (intentionally lighter — editorial feel). */
  headingWeight: 500;
}

export interface FashionBeautyRadius {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  /** Default for product cards / hero gallery. */
  '2xl': string;
  /** Hero CTA + primary buttons — fully rounded. */
  full: string;
}

export interface FashionBeautySpacing {
  /** Generous overall density — translates to py-12 sections, gap-8 grids. */
  density: 'airy';
  /** Section vertical padding utility (Tailwind class). */
  section: string;
  /** Grid gap utility (Tailwind class). */
  grid: string;
}

export interface FashionBeautyTokens {
  code: 'fashion-beauty';
  label: string;
  description: string;
  colors: FashionBeautyColors;
  typography: FashionBeautyTypography;
  radius: FashionBeautyRadius;
  spacing: FashionBeautySpacing;
}

// ---------------------------------------------------------------------------
// Token values
// ---------------------------------------------------------------------------

export const FASHION_BEAUTY_TOKENS: FashionBeautyTokens = {
  code: 'fashion-beauty',
  label: 'Fashion & Beauty — Editorial Soft',
  description:
    'Rose / cream / peach palette with serif headlines. Lookbook, Beauty-swatch, Boutique templates.',
  colors: {
    primary: '#f43f5e', // rose-500
    accent: '#fda4af', // rose-300
    surface: '#ffffff',
    // Cream / off-white — slightly warmer than stone-50; reads as
    // gallery paper, not Apple white.
    bg: '#fbf8f4',
    // Peach blush for secondary cards / pricing pills.
    muted: '#fef2f2', // rose-50
    // Deep mauve for body — softer than slate-900 so it sits on the
    // cream bg without harshness.
    ink: '#3f1d2c',
    inkMuted: '#a18792',
    // Pale rose hairline.
    border: '#f5e1e8',
  },
  typography: {
    // CSS variable loaded in app/layout.tsx — Cormorant Garamond
    // with Playfair Display fallback. Body stays on --font-sans
    // (DM Sans / Prompt for Thai).
    headingFontVar: 'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif',
    bodyFontVar: 'var(--font-sans, "DM Sans"), "Prompt", system-ui, sans-serif',
    scale: {
      display: 'text-4xl sm:text-5xl md:text-6xl', // PDP / category hero h1
      h1: 'text-3xl sm:text-4xl',
      h2: 'text-2xl sm:text-3xl',
      h3: 'text-xl sm:text-2xl',
      body: 'text-base',
      caption: 'text-xs uppercase tracking-[0.18em]',
    },
    headingWeight: 500,
  },
  radius: {
    xs: 'rounded-sm',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },
  spacing: {
    density: 'airy',
    section: 'py-12 sm:py-16',
    grid: 'gap-8',
  },
};

// ---------------------------------------------------------------------------
// Detection — when do we render the fashion-beauty variant?
// ---------------------------------------------------------------------------

/**
 * Template IDs that belong to the fashion-beauty TemplateGroup.
 * Mirrors `templateGroups['fashion-beauty']` in lib/templates/registry.ts.
 * Listed here separately so we don't drag the full registry into
 * shop layouts that only need the membership check.
 */
export const FASHION_BEAUTY_TEMPLATE_IDS: ReadonlySet<TemplateId> = new Set<TemplateId>([
  'lookbook',
  'beauty-swatch',
  'boutique',
]);

/**
 * Operator-facing `landingThemeVariant` values that should also
 * render as fashion-beauty. Family `B` (Editorial Soft Feminine) is
 * the closest match in the AI-multi-page picker — same rose+serif
 * palette intent.
 */
const FASHION_BEAUTY_VARIANT_VALUES = new Set<string>(['fashion-beauty', 'B']);

/**
 * Detect whether the given store should render the fashion-beauty
 * design family. Used by every shared buyer page that opts in via
 * conditional rendering.
 *
 * Inputs are intentionally narrow so callers can pass a slim
 * select-shaped object without dragging the whole Store row.
 */
export function isFashionBeautyStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && (FASHION_BEAUTY_TEMPLATE_IDS as ReadonlySet<string>).has(tpl)) {
    return true;
  }
  if (variant && FASHION_BEAUTY_VARIANT_VALUES.has(variant)) {
    return true;
  }
  return false;
}

/**
 * Body className applied to the `<div class="shop-page">` wrapper
 * when a store is in this family. Pairs with the `.theme-fashion-beauty`
 * skin in globals.css to remap CSS vars + lift headings into serif.
 */
export const FASHION_BEAUTY_BODY_CLASS = 'theme-fashion-beauty';

/**
 * Inline-style helper — used by layouts that already use CSS vars
 * to override the --shop-* cascade with the fashion-beauty palette.
 * The .theme-fashion-beauty class in globals.css also does this, but
 * this helper lets a layout opt in without depending on globals.css
 * ordering / specificity.
 */
export function fashionBeautyCssVars(): Record<string, string> {
  const c = FASHION_BEAUTY_TOKENS.colors;
  return {
    '--shop-primary': c.primary,
    '--shop-accent': c.accent,
    '--shop-bg': c.bg,
    '--shop-card': c.surface,
    '--shop-ink': c.ink,
    '--shop-ink-muted': c.inkMuted,
    '--shop-border': c.border,
    '--shop-muted': c.muted,
  };
}
