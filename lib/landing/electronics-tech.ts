/**
 * Electronics-Tech design family — DESIGN-B sibling of fashion-beauty / trust.
 *
 * This module owns the visual language for the `electronics-tech`
 * TemplateGroup (templates: catalog-dense, tech-compare, single-product).
 *
 * Design intent — spec-sheet / consumer-electronics:
 *   • crisp white background (#ffffff) — Apple-store / Best-Buy white
 *   • slate-ink (#0f172a) — slate-900, near-black with cool tone
 *   • electric blue primary (#2563eb) — fills CTAs, price emphasis
 *   • cyan accent (#06b6d4) — secondary highlights, compare-chips
 *   • neon-mint highlight (#34d399) — "in stock" / spec deltas / chips
 *   • pale-slate (#f1f5f9) — card surfaces, spec-table row bg
 *   • hairline (#e2e8f0) — slate-200 borders
 *   • Inter Tight (or Inter) sans-only — NO serif
 *   • JetBrains Mono for SKU strings / spec values / prices
 *   • `rounded-md` cards, rectangular CTAs (sharp corners on primary)
 *   • subtle blue-glow shadow under product images
 *   • dense spec-row tables, compare-chip filter rows, SKU/model eyebrows
 *
 * Wiring:
 *   - `ELECTRONICS_TECH_TOKENS` is the canonical token bag. New shared
 *     chrome can read directly from here when it needs more than what
 *     CSS vars give.
 *   - `isElectronicsTechStore({ templateId, landingThemeVariant })` is
 *     consulted by per-page conditional renderers in `app/stores/[slug]/*`
 *     to swap in the electronics-tech variant.
 *   - The CSS-var cascade (--shop-bg / --shop-primary / --shop-ink) is
 *     also remapped onto these tokens via `theme-electronics-tech` in
 *     globals.css, so legacy pages that only use vars still pick up
 *     the new palette without touching their classNames.
 *
 * Scope: this PR covers `electronics-tech` ONLY. Sibling families
 * (fashion-beauty + trust already shipped; lifestyle / community /
 * specialty ship as separate PRs and intentionally render the default
 * design here untouched).
 */

import type { TemplateId } from '@/lib/templates/types';
import { templateIdsForGroup } from '@/lib/templates/template-groups';

// ---------------------------------------------------------------------------
// Token shape (mirrors trust.ts — colors / typography / radius / spacing)
// ---------------------------------------------------------------------------

export interface ElectronicsTechColors {
  /** CTAs and price emphasis — electric blue (blue-600). Filled. */
  primary: string;
  /** Cyan-500 — secondary accents, compare-chip outlines. */
  accent: string;
  /** Mint highlight — "in stock", spec deltas, success chips. */
  highlight: string;
  /** Card / inner surface — pure white. */
  surface: string;
  /** Page background — pure white (Apple / Best Buy). */
  bg: string;
  /** Muted surface — slate-100 for spec rows + secondary cards. */
  muted: string;
  /** Primary text — slate-900. */
  ink: string;
  /** Muted text — slate-500 for captions / eyebrows. */
  inkMuted: string;
  /** Hairline borders — slate-200. */
  border: string;
}

export interface ElectronicsTechTypography {
  /** Display sans — Inter Tight (or Inter) via CSS var, NEVER serif.
   *  (loaded in app/layout.tsx as --font-tech-display) */
  headingFontVar: string;
  /** Body — same Inter family. */
  bodyFontVar: string;
  /** Mono — JetBrains Mono for SKU strings, spec values, prices.
   *  (loaded in app/layout.tsx as --font-tech-mono) */
  monoFontVar: string;
  /** Display-size scale used by hero / category banners.
   *  Heavier weights, tight tracking — spec-sheet authority. */
  scale: {
    display: string; // hero h1
    h1: string;
    h2: string;
    h3: string;
    body: string;
    /** Eyebrow caps — tight tracking (0.16em — narrower than trust's 0.28em). */
    caption: string;
  };
  /** Default heading weight — bold for spec-sheet authority. */
  headingWeight: 700;
}

export interface ElectronicsTechRadius {
  none: string;
  /** Default cards / spec tables — rounded-md. */
  sm: string;
  md: string;
  /** Reserved aliases — point at rounded-md so the family stays
   *  rectangular-but-not-pill. */
  lg: string;
  xl: string;
  '2xl': string;
  /** Pills explicitly disabled — chips are rectangles. */
  full: string;
}

export interface ElectronicsTechSpacing {
  /** High overall density — translates to py-10 sections, gap-4 grids. */
  density: 'dense';
  /** Section vertical padding utility (Tailwind class). */
  section: string;
  /** Grid gap utility (Tailwind class). */
  grid: string;
}

export interface ElectronicsTechTokens {
  code: 'electronics-tech';
  label: string;
  description: string;
  colors: ElectronicsTechColors;
  typography: ElectronicsTechTypography;
  radius: ElectronicsTechRadius;
  spacing: ElectronicsTechSpacing;
}

// ---------------------------------------------------------------------------
// Token values
// ---------------------------------------------------------------------------

export const ELECTRONICS_TECH_TOKENS: ElectronicsTechTokens = {
  code: 'electronics-tech',
  label: 'Electronics-Tech — Spec-Sheet / Consumer Electronics',
  description:
    'White / slate / electric-blue palette with mono SKU + spec tables. Catalog-dense, Tech-compare, Single-product templates.',
  colors: {
    // Electric blue (blue-600). Used for filled CTAs, price emphasis,
    // and the "buy now" hierarchy peak.
    primary: '#2563eb',
    // Cyan-500 — secondary chip outlines + interactive accents.
    accent: '#06b6d4',
    // Emerald-400 mint — reserved for "in stock", spec deltas,
    // success status chips. Never on CTAs.
    highlight: '#34d399',
    surface: '#ffffff',
    // Crisp white background — Apple Store / Best Buy aesthetic.
    bg: '#ffffff',
    // Slate-100 for spec-row backgrounds + secondary cards.
    muted: '#f1f5f9',
    // Slate-900 ink — near-black with cool tone (no warm sepia).
    ink: '#0f172a',
    inkMuted: '#64748b', // slate-500
    border: '#e2e8f0',   // slate-200 hairline
  },
  typography: {
    // CSS variable loaded in app/layout.tsx — Inter Tight with Inter
    // + IBM Plex Sans Thai fallback. Used for headings + body.
    // Sans ONLY — electronics families never lift into serif.
    headingFontVar:
      'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif',
    bodyFontVar:
      'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif',
    // JetBrains Mono — surfaced on SKU strings, spec values, prices,
    // and the model-number eyebrows. Used opt-in via [data-tech-mono]
    // or `font-mono`.
    monoFontVar:
      'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace',
    scale: {
      display: 'text-4xl sm:text-5xl md:text-6xl',
      h1: 'text-3xl sm:text-4xl',
      h2: 'text-2xl sm:text-3xl',
      h3: 'text-xl sm:text-2xl',
      body: 'text-base',
      // 0.16em — narrower than trust's 0.28em. Reads as spec-sheet
      // label, not luxury display.
      caption: 'text-xs uppercase tracking-[0.16em]',
    },
    headingWeight: 700,
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-md',
    // Reserved aliases — squared down to rounded-md so a generic
    // rounded-2xl card still feels electronics-flat, not soft.
    lg: 'rounded-md',
    xl: 'rounded-md',
    '2xl': 'rounded-md',
    full: 'rounded-md',
  },
  spacing: {
    density: 'dense',
    section: 'py-10 sm:py-12',
    grid: 'gap-4',
  },
};

// ---------------------------------------------------------------------------
// Detection — when do we render the electronics-tech variant?
// ---------------------------------------------------------------------------

/**
 * Template IDs that belong to the electronics-tech TemplateGroup.
 * Derived from the single source in lib/templates/template-groups.ts.
 */
export const ELECTRONICS_TECH_TEMPLATE_IDS: ReadonlySet<TemplateId> =
  templateIdsForGroup('electronics-tech');

/**
 * Operator-facing `landingThemeVariant` values that should also render
 * as electronics-tech. We accept the literal "electronics-tech" string
 * for AI-multi-page operators who picked the group code directly. The
 * v3 picker's family `E` (Cyber Neon) was the closest match aesthetically,
 * so we also accept "E" for back-compat.
 */
const ELECTRONICS_TECH_VARIANT_VALUES = new Set<string>([
  'electronics-tech',
  'E',
]);

/**
 * Detect whether the given store should render the electronics-tech
 * design family. Used by every shared buyer page that opts in via
 * conditional rendering.
 *
 * Inputs are intentionally narrow so callers can pass a slim
 * select-shaped object without dragging the whole Store row.
 */
export function isElectronicsTechStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && (ELECTRONICS_TECH_TEMPLATE_IDS as ReadonlySet<string>).has(tpl)) {
    return true;
  }
  if (variant && ELECTRONICS_TECH_VARIANT_VALUES.has(variant)) {
    return true;
  }
  return false;
}

/**
 * Body className applied to the `<div class="shop-page">` wrapper
 * when a store is in this family. Pairs with the `.theme-electronics-tech`
 * skin in globals.css to remap CSS vars + force sans headings + add
 * subtle blue-glow card shadows.
 */
export const ELECTRONICS_TECH_BODY_CLASS = 'theme-electronics-tech';

/**
 * Inline-style helper — used by layouts that already use CSS vars to
 * override the --shop-* cascade with the electronics-tech palette.
 * The .theme-electronics-tech class in globals.css also does this, but
 * this helper lets a layout opt in without depending on globals.css
 * ordering / specificity.
 */
export function electronicsTechCssVars(): Record<string, string> {
  const c = ELECTRONICS_TECH_TOKENS.colors;
  return {
    '--shop-primary': c.primary,
    '--shop-accent': c.accent,
    '--shop-bg': c.bg,
    '--shop-card': c.surface,
    '--shop-ink': c.ink,
    '--shop-ink-muted': c.inkMuted,
    '--shop-border': c.border,
    '--shop-muted': c.muted,
    // Family-specific extras — surface a mint highlight for "in stock"
    // and a faint blue glow tone for shadows. The .theme block in
    // globals.css mirrors these into card box-shadows.
    '--shop-highlight': c.highlight,
  };
}
