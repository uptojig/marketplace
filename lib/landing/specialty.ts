/**
 * Specialty design family — DESIGN-B sibling to the fashion-beauty pilot.
 *
 * This module owns the visual language for the `specialty`
 * TemplateGroup (templates: handmade, vintage).
 *
 * Design intent — artisan / vintage paper:
 *   • kraft-paper background (#f5efe3)
 *   • warm ink (#44403c) instead of pure black
 *   • ochre primary (#ca8a04) for CTAs / price emphasis
 *   • terra-rose accent (#b45309) for secondary highlights
 *   • Fraunces slab-serif headlines at weight 500 (different from
 *     fashion-beauty's Cormorant — softer, more crafted feel)
 *   • Caveat handwritten font for short decorative accents
 *   • rounded-md cards (rectangular, not luxurious-square)
 *   • stamp-style badges rotated 3deg with dashed borders
 *   • hand-drawn rule-line decorations via inline SVG
 *   • subtle sepia tint on imagery
 *
 * Wiring:
 *   - `SPECIALTY_TOKENS` is the canonical token bag (colors /
 *     typography / radius / spacing). Shared chrome can read directly
 *     from here when it needs more than what CSS vars give.
 *   - `isSpecialtyStore({ templateId, landingThemeVariant })` is
 *     consulted by per-page conditional renderers in
 *     `app/stores/[slug]/*` to swap in the specialty variant.
 *   - The CSS-var cascade (--shop-bg / --shop-primary / --shop-ink)
 *     is also remapped onto these tokens via `theme-specialty` in
 *     globals.css, so legacy pages that only use vars still pick up
 *     the new palette without touching their classNames.
 *
 * Stacking:
 *   In conditional renderers: isFashionBeautyStore(store)
 *     ? FashionBeauty : isSpecialtyStore(store) ? Specialty : Default.
 *
 * Scope: this pilot covers specialty ONLY. The other 4 remaining
 * families (trust, electronics-tech, lifestyle, community,
 * business-model) ship in DESIGN-B as separate PRs and intentionally
 * render the default design here untouched.
 */

import type { TemplateId } from '@/lib/templates/types';

// ---------------------------------------------------------------------------
// Token shape (per spec — must include colors / typography / radius / spacing)
// ---------------------------------------------------------------------------

export interface SpecialtyColors {
  /** Hero CTAs, price emphasis, focus rings. Ochre / yellow-600. */
  primary: string;
  /** Terra-rose accent — used sparingly for secondary highlights. */
  accent: string;
  /** Card / inner surface — soft warm white. */
  surface: string;
  /** Page background — kraft paper warm beige. */
  bg: string;
  /** Muted surface — faded sage / hairline-grey for secondary cards. */
  muted: string;
  /** Primary text — warm near-black (stone-700). */
  ink: string;
  /** Muted text — warm stone for captions. */
  inkMuted: string;
  /** Hairline borders — soft kraft taupe. */
  border: string;
}

export interface SpecialtyTypography {
  /** Used for h1/h2/h3 — Fraunces slab-serif (CSS-var loaded by app/layout.tsx). */
  headingFontVar: string;
  /** Caveat handwritten — for SHORT decorative accents only. */
  handFontVar: string;
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
  /** Default heading weight (500 — crafted feel, not bold-shouty). */
  headingWeight: 500;
}

export interface SpecialtyRadius {
  xs: string;
  sm: string;
  /** Default for product cards / hero gallery — subtle round. */
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface SpecialtySpacing {
  /** Medium density — translates to py-10 sections, gap-6 grids. */
  density: 'medium';
  /** Section vertical padding utility (Tailwind class). */
  section: string;
  /** Grid gap utility (Tailwind class). */
  grid: string;
}

export interface SpecialtyTokens {
  code: 'specialty';
  label: string;
  description: string;
  colors: SpecialtyColors;
  typography: SpecialtyTypography;
  radius: SpecialtyRadius;
  spacing: SpecialtySpacing;
}

// ---------------------------------------------------------------------------
// Token values
// ---------------------------------------------------------------------------

export const SPECIALTY_TOKENS: SpecialtyTokens = {
  code: 'specialty',
  label: 'Specialty — Artisan / Vintage Paper',
  description:
    'Kraft-paper bg with ochre primary + slab-serif headings. Handmade, Vintage templates.',
  colors: {
    primary: '#ca8a04', // ochre — yellow-600
    accent: '#b45309', // terra-rose — amber-700
    surface: '#fbf9f3', // soft warm white (slightly lifted off kraft)
    // Kraft paper beige — warm and textured, reads as artisan paper.
    bg: '#f5efe3',
    // Faded sage / muted kraft tint for secondary cards / pricing pills.
    muted: '#dad6c4',
    // Warm near-black — stone-700 family, sits on kraft without harshness.
    ink: '#44403c',
    // Warm stone-500 for captions.
    inkMuted: '#78716c',
    // Pale hairline taupe.
    border: '#e7e2d6',
  },
  typography: {
    // CSS variable loaded in app/layout.tsx — Fraunces slab-serif.
    // Soft slab serif with crafted feel; pairs with Caveat handwritten
    // for short decorative tags ("handmade with love").
    headingFontVar:
      'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif',
    handFontVar:
      'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive',
    bodyFontVar: 'var(--font-sans, "DM Sans"), "Prompt", system-ui, sans-serif',
    scale: {
      display: 'text-4xl sm:text-5xl md:text-6xl', // PDP / category hero h1
      h1: 'text-3xl sm:text-4xl',
      h2: 'text-2xl sm:text-3xl',
      h3: 'text-xl sm:text-2xl',
      body: 'text-base',
      caption: 'text-xs uppercase tracking-[0.16em]',
    },
    headingWeight: 500,
  },
  radius: {
    xs: 'rounded-sm',
    // Subtle rounding — not luxurious-square, not 2xl-soft. Default.
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },
  spacing: {
    density: 'medium',
    section: 'py-10 sm:py-14',
    grid: 'gap-6',
  },
};

// ---------------------------------------------------------------------------
// Detection — when do we render the specialty variant?
// ---------------------------------------------------------------------------

/**
 * Template IDs that belong to the specialty TemplateGroup.
 * Mirrors `templateGroups['specialty']` in lib/templates/registry.ts.
 * Listed here separately so we don't drag the full registry into
 * shop layouts that only need the membership check.
 */
export const SPECIALTY_TEMPLATE_IDS: ReadonlySet<TemplateId> = new Set<TemplateId>([
  'handmade',
  'vintage',
]);

/**
 * Operator-facing `landingThemeVariant` values that should also
 * render as specialty. Family `H` (Cozy Niche Skeumorphism) is the
 * closest match in the AI-multi-page picker — same warm-textured
 * amber / handmade-craft intent.
 */
const SPECIALTY_VARIANT_VALUES = new Set<string>(['specialty', 'H']);

/**
 * Detect whether the given store should render the specialty design
 * family. Used by every shared buyer page that opts in via
 * conditional rendering.
 *
 * Inputs are intentionally narrow so callers can pass a slim
 * select-shaped object without dragging the whole Store row.
 */
export function isSpecialtyStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && (SPECIALTY_TEMPLATE_IDS as ReadonlySet<string>).has(tpl)) {
    return true;
  }
  if (variant && SPECIALTY_VARIANT_VALUES.has(variant)) {
    return true;
  }
  return false;
}

/**
 * Body className applied to the `<div class="shop-page">` wrapper
 * when a store is in this family. Pairs with the `.theme-specialty`
 * skin in globals.css to remap CSS vars + lift headings into slab serif.
 */
export const SPECIALTY_BODY_CLASS = 'theme-specialty';

/**
 * Inline-style helper — used by layouts that already use CSS vars to
 * override the --shop-* cascade with the specialty palette. The
 * .theme-specialty class in globals.css also does this, but this
 * helper lets a layout opt in without depending on globals.css
 * ordering / specificity.
 */
export function specialtyCssVars(): Record<string, string> {
  const c = SPECIALTY_TOKENS.colors;
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
