/**
 * Trust design family — DESIGN-B sibling of the fashion-beauty pilot.
 *
 * This module owns the visual language for the `trust` TemplateGroup
 * (templates: classic, official-brand, premium-luxury).
 *
 * Design intent — department-store / luxury-heritage:
 *   • ivory background (#fefce8) — gallery-paper, warmer than stone-50
 *   • deep navy ink (#0f172a) — slate-900, reads as authority
 *   • gold accent (#a17f56) — hairlines, eyebrows, accents only
 *     (NEVER fill CTAs — that's reserved for charcoal #1e293b)
 *   • charcoal CTAs (#1e293b, slate-800) — high-contrast filled
 *   • pale-stone muted (#f5f5f4)
 *   • hairline border (#e7e5e4) plus accent gold rules between sections
 *   • Playfair Display serif on ALL display + body subheads (h1..h4)
 *   • squared corners — `rounded-none` / `rounded-sm` only
 *   • dense product info — heritage SKU / Est. 19XX / Made in
 *   • square or 4/5 portrait imagery, edge-to-edge (no white mat)
 *   • thin gold-rule image frame
 *
 * Wiring:
 *   - `TRUST_TOKENS` is the canonical token bag. New shared chrome can
 *     read directly from here when it needs more than CSS vars give.
 *   - `isTrustStore({ templateId, landingThemeVariant })` is consulted
 *     by per-page conditional renderers in `app/stores/[slug]/*` to
 *     swap in the trust variant.
 *   - The CSS-var cascade (--shop-bg / --shop-primary / --shop-ink)
 *     is also remapped onto these tokens via `theme-trust` in
 *     globals.css, so legacy pages that only use vars still pick up
 *     the new palette without touching their classNames.
 *
 * Scope: this PR covers `trust` ONLY. Sibling families (fashion-beauty
 * already shipped, electronics-tech / lifestyle / community / specialty
 * ship as separate PRs and intentionally render the default design
 * here untouched).
 */

import type { TemplateId } from '@/lib/templates/types';
import { templateIdsForGroup } from '@/lib/templates/template-groups';

// ---------------------------------------------------------------------------
// Token shape (mirrors fashion-beauty.ts — colors / typography / radius / spacing)
// ---------------------------------------------------------------------------

export interface TrustColors {
  /** CTAs and emphasis ink — charcoal (slate-800). High-contrast fill. */
  primary: string;
  /** Gold — used for hairlines / eyebrows / decorative accents ONLY.
   *  Never as a button fill (luxury rule). */
  accent: string;
  /** Card / inner surface — pure white. */
  surface: string;
  /** Page background — ivory, warmer than stone-50. */
  bg: string;
  /** Muted surface — pale stone for secondary cards. */
  muted: string;
  /** Primary text — deep navy (slate-900). */
  ink: string;
  /** Muted text — slate-500 for captions / eyebrows. */
  inkMuted: string;
  /** Hairline borders — stone-200. */
  border: string;
}

export interface TrustTypography {
  /** Used for h1..h4 + labels — Playfair Display serif via CSS var.
   *  (loaded in app/layout.tsx as --font-trust-display) */
  headingFontVar: string;
  /** Body — DM Sans / Prompt via existing --font-sans cascade. */
  bodyFontVar: string;
  /** Display-size scale used by hero / category banners.
   *  Slightly tighter than FB — luxury is squared, not editorial. */
  scale: {
    display: string; // hero h1
    h1: string;
    h2: string;
    h3: string;
    body: string;
    /** Eyebrow caps — wider tracking than FB (0.28em vs 0.18em). */
    caption: string;
  };
  /** Default heading weight — semibold for authority (vs FB's 500). */
  headingWeight: 600;
}

export interface TrustRadius {
  /** Squared corners — luxury feels rectangular, not soft. */
  none: string;
  /** Default for cards / CTAs — rounded-sm only. */
  sm: string;
  /** Reserved for legacy callers that expect a value here.
   *  Set to rounded-sm so default-styled cards still look squared
   *  if they ask the token bag for radius.md/lg/xl. */
  md: string;
  lg: string;
  xl: string;
  /** Even rounded-2xl in trust → squared. */
  '2xl': string;
  /** Pills explicitly disabled in trust. */
  full: string;
}

export interface TrustSpacing {
  /** Generous overall density — translates to py-16 sections, gap-6 grids. */
  density: 'generous';
  /** Section vertical padding utility (Tailwind class). */
  section: string;
  /** Grid gap utility (Tailwind class). */
  grid: string;
}

export interface TrustTokens {
  code: 'trust';
  label: string;
  description: string;
  colors: TrustColors;
  typography: TrustTypography;
  radius: TrustRadius;
  spacing: TrustSpacing;
}

// ---------------------------------------------------------------------------
// Token values
// ---------------------------------------------------------------------------

export const TRUST_TOKENS: TrustTokens = {
  code: 'trust',
  label: 'Trust — Department-store / Luxury Heritage',
  description:
    'Ivory / navy / gold heritage palette with serif headlines + squared CTAs. Classic, Official-brand, Premium-luxury templates.',
  colors: {
    // Charcoal fill CTAs — slate-800 sits between pure black and
    // navy, giving the heaviness of black with a touch of warmth.
    primary: '#1e293b',
    // Gold — hairlines / eyebrows only. NOT button-safe (we render
    // primary fills with charcoal instead).
    accent: '#a17f56',
    surface: '#ffffff',
    // Ivory — slightly warmer than the FB cream (#fbf8f4), more
    // newspaper-page than gallery-paper.
    bg: '#fefce8',
    // Pale stone for secondary surfaces (price boxes, info cards).
    muted: '#f5f5f4',
    // Deep navy — slate-900, near-black with a hint of blue.
    ink: '#0f172a',
    inkMuted: '#64748b', // slate-500
    border: '#e7e5e4',   // stone-200
  },
  typography: {
    // CSS variable loaded in app/layout.tsx — Playfair Display with
    // Georgia + Noto Serif Thai fallbacks. Used for headings, sub-
    // headings, and labels in the trust family.
    headingFontVar:
      'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif',
    // Body stays sans for legibility; tracking is slightly looser
    // than default (looks more editorial).
    bodyFontVar: 'var(--font-sans, "DM Sans"), "Prompt", system-ui, sans-serif',
    scale: {
      display: 'text-4xl sm:text-5xl md:text-6xl',
      h1: 'text-3xl sm:text-4xl',
      h2: 'text-2xl sm:text-3xl',
      h3: 'text-xl sm:text-2xl',
      body: 'text-base',
      // 0.28em — much wider than FB's 0.18em. Heritage signage feel.
      caption: 'text-xs uppercase tracking-[0.28em]',
    },
    headingWeight: 600,
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-sm',
    lg: 'rounded-sm',
    xl: 'rounded-sm',
    '2xl': 'rounded-sm',
    full: 'rounded-sm',
  },
  spacing: {
    density: 'generous',
    section: 'py-16 sm:py-20',
    grid: 'gap-6',
  },
};

// ---------------------------------------------------------------------------
// Detection — when do we render the trust variant?
// ---------------------------------------------------------------------------

/**
 * Template IDs that belong to the trust TemplateGroup.
 * Derived from the single source in lib/templates/template-groups.ts.
 */
export const TRUST_TEMPLATE_IDS: ReadonlySet<TemplateId> = templateIdsForGroup('trust');

/**
 * Operator-facing `landingThemeVariant` values that should also render
 * as trust. Family `C` (Luxury Heritage Gold) is the closest match in
 * the v3 picker — same gold + serif intent. We also accept the literal
 * "trust" string for AI-multi-page operators who picked the group code
 * directly.
 */
const TRUST_VARIANT_VALUES = new Set<string>(['trust', 'C']);

/**
 * Detect whether the given store should render the trust design family.
 * Used by every shared buyer page that opts in via conditional rendering.
 *
 * Inputs are intentionally narrow so callers can pass a slim
 * select-shaped object without dragging the whole Store row.
 */
export function isTrustStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && (TRUST_TEMPLATE_IDS as ReadonlySet<string>).has(tpl)) {
    return true;
  }
  if (variant && TRUST_VARIANT_VALUES.has(variant)) {
    return true;
  }
  return false;
}

/**
 * Body className applied to the `<div class="shop-page">` wrapper
 * when a store is in this family. Pairs with the `.theme-trust` skin
 * in globals.css to remap CSS vars + lift headings into serif +
 * squared CTAs.
 */
export const TRUST_BODY_CLASS = 'theme-trust';

/**
 * Inline-style helper — used by layouts that already use CSS vars to
 * override the --shop-* cascade with the trust palette. The
 * .theme-trust class in globals.css also does this, but this helper
 * lets a layout opt in without depending on globals.css ordering /
 * specificity.
 */
export function trustCssVars(): Record<string, string> {
  const c = TRUST_TOKENS.colors;
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
