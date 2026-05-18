/**
 * Lifestyle design family — DESIGN-B sibling of the fashion-beauty pilot.
 *
 * This module owns the visual language for the `lifestyle` TemplateGroup
 * (templates: home-living, sport-active, kids-toys).
 *
 * Design intent — warm catalog / outdoorsy (Patagonia × West Elm):
 *   • warm cream background (#fefce8) — sun-soaked paper, friendly
 *   • terracotta primary (#ea580c) — used on filled CTAs, price emphasis
 *   • sage accent (#84cc16) — soft green icons / hairlines / chips
 *   • deep umber ink (#78350f) — warm brown, sits comfortably on cream
 *   • peach muted cards (#fef3c7) — secondary surfaces, in-use scenes
 *   • soft brown hairline (#f5e6d3) — gentle dividers
 *   • Outfit / Plus Jakarta Sans display — geometric humanist sans for
 *     h1/h2/h3 at weight 600. Body stays standard sans for legibility.
 *   • rounded-3xl cards — generous airy radius
 *   • rectangular pill CTAs — not full circle, friendly pill rectangle
 *   • hand-drawn squiggle SVG dividers between sections
 *   • 1/1 square or 16/9 wide imagery, soft natural drop shadow
 *   • lifestyle "in-use" thumbnails encouraged, optimistic tagline copy
 *
 * Wiring:
 *   - `LIFESTYLE_TOKENS` is the canonical token bag. New shared chrome
 *     can read directly from here when it needs more than CSS vars give.
 *   - `isLifestyleStore({ templateId, landingThemeVariant })` is consulted
 *     by per-page conditional renderers in `app/stores/[slug]/*` to swap
 *     in the lifestyle variant.
 *   - The CSS-var cascade (--shop-bg / --shop-primary / --shop-ink) is
 *     also remapped onto these tokens via `theme-lifestyle` in globals.css,
 *     so legacy pages that only use vars still pick up the warm catalog
 *     palette without touching their classNames.
 *
 * Scope: this PR covers `lifestyle` ONLY. Sibling families ship as
 * separate PRs (fashion-beauty pilot, trust DESIGN-B sibling, specialty,
 * electronics-tech, community) and intentionally render the default
 * design here untouched.
 */

import type { TemplateId } from '@/lib/templates/types';

// ---------------------------------------------------------------------------
// Token shape (mirrors trust.ts / fashion-beauty.ts — colors / typography
// / radius / spacing)
// ---------------------------------------------------------------------------

export interface LifestyleColors {
  /** CTAs and price emphasis — terracotta (orange-600). Filled, friendly. */
  primary: string;
  /** Sage — used for icons / hairlines / chip accents. Soft outdoorsy green. */
  accent: string;
  /** Card / inner surface — pure white. */
  surface: string;
  /** Page background — warm cream, friendly outdoor light. */
  bg: string;
  /** Muted surface — peach for secondary cards / in-use scenes. */
  muted: string;
  /** Primary text — deep umber. Warm brown reads as catalog-friendly. */
  ink: string;
  /** Muted text — stone-500 for tagline / benefits. */
  inkMuted: string;
  /** Hairline borders — soft brown. */
  border: string;
}

export interface LifestyleTypography {
  /** Used for h1..h3 — Outfit / Plus Jakarta Sans display via CSS var.
   *  (loaded in app/layout.tsx as --font-lifestyle-display) */
  headingFontVar: string;
  /** Body — DM Sans / Prompt via existing --font-sans cascade. */
  bodyFontVar: string;
  /** Display-size scale — generous + airy, catalog feel. */
  scale: {
    display: string; // hero h1
    h1: string;
    h2: string;
    h3: string;
    body: string;
    /** Tagline caps — moderate tracking. Not as wide as trust luxury. */
    caption: string;
  };
  /** Default heading weight — 600 semibold for friendly authority. */
  headingWeight: 600;
}

export interface LifestyleRadius {
  /** Rare — most chrome lives at rounded-3xl. */
  none: string;
  sm: string;
  md: string;
  lg: string;
  /** Default for buttons / pills (rectangular pill). */
  xl: string;
  /** Default for cards — generous, airy. */
  '2xl': string;
  /** Promoted card radius — even more airy. */
  '3xl': string;
  /** Pills explicitly disabled for full-circle in lifestyle — use rounded
   *  pill rectangles instead. Kept here only for legacy callers expecting
   *  a value at this key. */
  full: string;
}

export interface LifestyleSpacing {
  /** Airy density — translates to py-16 sections, gap-8 grids. */
  density: 'airy';
  /** Section vertical padding utility (Tailwind class). */
  section: string;
  /** Grid gap utility (Tailwind class). */
  grid: string;
}

export interface LifestyleTokens {
  code: 'lifestyle';
  label: string;
  description: string;
  colors: LifestyleColors;
  typography: LifestyleTypography;
  radius: LifestyleRadius;
  spacing: LifestyleSpacing;
}

// ---------------------------------------------------------------------------
// Token values
// ---------------------------------------------------------------------------

export const LIFESTYLE_TOKENS: LifestyleTokens = {
  code: 'lifestyle',
  label: 'Lifestyle — Warm Catalog / Outdoorsy',
  description:
    'Warm cream / terracotta / sage catalog palette with geometric sans headlines + rounded-3xl cards. Home-living, Sport-active, Kids-toys templates.',
  colors: {
    // Terracotta fill CTAs — orange-600 sits warm and friendly,
    // not as fiery as red, more grown-up than orange-500.
    primary: '#ea580c',
    // Sage green — lime-500. Reads as outdoorsy and natural, used
    // for icons / hairlines / chip outlines.
    accent: '#84cc16',
    surface: '#ffffff',
    // Warm cream — yellow-50. Sun-soaked, friendly outdoor light.
    // Slightly more yellow than trust's ivory.
    bg: '#fefce8',
    // Peach blush for secondary cards / in-use scene backgrounds.
    muted: '#fef3c7', // amber-100
    // Deep umber — amber-900. Warm brown ink, sits comfortably on
    // the cream bg without the harshness of pure black.
    ink: '#78350f',
    inkMuted: '#a8a29e', // stone-400
    // Soft brown hairline — custom warm beige between stone-200
    // and amber-100. Gentle, never harsh.
    border: '#f5e6d3',
  },
  typography: {
    // CSS variable loaded in app/layout.tsx — Outfit (with Plus
    // Jakarta Sans + DM Sans fallback) for the geometric humanist
    // sans display face. Pairs with Prompt for Thai glyphs.
    headingFontVar:
      'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif',
    // Body stays sans; the lifestyle display IS sans so we keep the
    // same family for unity (only weight + tracking differ).
    bodyFontVar: 'var(--font-sans, "DM Sans"), "Prompt", system-ui, sans-serif',
    scale: {
      display: 'text-4xl sm:text-5xl md:text-6xl',
      h1: 'text-3xl sm:text-4xl',
      h2: 'text-2xl sm:text-3xl',
      h3: 'text-xl sm:text-2xl',
      body: 'text-base',
      // Moderate tracking — friendly, not luxury. Not as wide as
      // trust (0.28em); a bit warmer + more catalog-like.
      caption: 'text-xs uppercase tracking-[0.18em]',
    },
    headingWeight: 600,
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    '3xl': 'rounded-3xl',
    // Lifestyle pill = rectangular pill (not full circle). Use the
    // 3xl radius so vertical/horizontal both feel pill-like without
    // collapsing into a sphere. Legacy callers expecting `full`
    // still get a soft round.
    full: 'rounded-full',
  },
  spacing: {
    density: 'airy',
    section: 'py-16 sm:py-20',
    grid: 'gap-8',
  },
};

// ---------------------------------------------------------------------------
// Detection — when do we render the lifestyle variant?
// ---------------------------------------------------------------------------

/**
 * Template IDs that belong to the lifestyle TemplateGroup.
 * Mirrors `templateGroups.lifestyle` in lib/templates/registry.ts.
 */
export const LIFESTYLE_TEMPLATE_IDS: ReadonlySet<TemplateId> = new Set<TemplateId>([
  'home-living',
  'sport-active',
  'kids-toys',
  'mega-store',
]);

/**
 * Operator-facing `landingThemeVariant` values that should also render
 * as lifestyle. Families `A` (Editorial Minimal Warm — stone+amber) and
 * `G` (Botanical Lifestyle Premium — green+cream) both share the warm-
 * outdoor / natural-living intent of lifestyle. We also accept the literal
 * "lifestyle" string for AI-multi-page operators who picked the group
 * code directly.
 */
const LIFESTYLE_VARIANT_VALUES = new Set<string>(['lifestyle', 'A', 'G']);

/**
 * Detect whether the given store should render the lifestyle design
 * family. Used by every shared buyer page that opts in via conditional
 * rendering.
 *
 * Inputs are intentionally narrow so callers can pass a slim
 * select-shaped object without dragging the whole Store row.
 */
export function isLifestyleStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && (LIFESTYLE_TEMPLATE_IDS as ReadonlySet<string>).has(tpl)) {
    return true;
  }
  if (variant && LIFESTYLE_VARIANT_VALUES.has(variant)) {
    return true;
  }
  return false;
}

/**
 * Body className applied to the `<div class="shop-page">` wrapper
 * when a store is in this family. Pairs with the `.theme-lifestyle`
 * skin in globals.css to remap CSS vars + lift headings into the
 * geometric sans display + bump card radius to rounded-3xl.
 */
export const LIFESTYLE_BODY_CLASS = 'theme-lifestyle';

/**
 * Inline-style helper — used by layouts that already use CSS vars to
 * override the --shop-* cascade with the lifestyle palette. The
 * .theme-lifestyle class in globals.css also does this, but this helper
 * lets a layout opt in without depending on globals.css ordering /
 * specificity.
 */
export function lifestyleCssVars(): Record<string, string> {
  const c = LIFESTYLE_TOKENS.colors;
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
