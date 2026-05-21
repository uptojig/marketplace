/**
 * Business-model design family — DESIGN-B sibling of trust + fashion-beauty.
 *
 * This module owns the visual language for the `business-model`
 * TemplateGroup (templates: wholesale-b2b, flash-deal, subscription).
 *
 * Design intent — deal-dashboard / wholesale-utility:
 *   • white background (#ffffff) — clean B2B / spreadsheet feel
 *   • slate-900 ink (#0f172a) — authority + numerics
 *   • red primary (#dc2626) — urgency CTAs (Flash sale, Add to cart)
 *   • amber accent (#f59e0b) — countdown / sale-flag stickers ONLY
 *   • mint savings indicator (#10b981) — "Save 30%" pills
 *   • yellow-50 highlight (#fefce8) — deal cards / row striping
 *   • hairline zinc-200 (#e4e4e7) borders
 *   • Inter sans HEAVY (700) for h1..h4 — bold quantitative voice
 *   • JetBrains Mono for prices, countdowns, SKUs, MOQ codes
 *   • rounded-md cards. Rectangular CTAs (sharp corners).
 *   • HIGH density — tier-pricing table, countdown timer, MOQ chip
 *
 * Wiring:
 *   - `BUSINESS_MODEL_TOKENS` is the canonical token bag (colors /
 *     typography / radius / spacing).
 *   - `isBusinessModelStore({ templateId, landingThemeVariant })` is
 *     consulted by per-page conditional renderers in `app/stores/[slug]/*`
 *     to swap in the business-model variant.
 *   - The CSS-var cascade (--shop-bg / --shop-primary / --shop-ink) is
 *     also remapped onto these tokens via `theme-business-model` in
 *     globals.css, so legacy pages that only use vars still pick up
 *     the new palette without touching their classNames.
 *
 * Scope: this PR covers `business-model` ONLY. Sibling families
 * (fashion-beauty, trust already shipped; electronics-tech / lifestyle
 * / specialty / community ship as separate PRs and intentionally render
 * the default design here untouched).
 */

import type { TemplateId } from '@/lib/templates/types';
import { templateIdsForGroup } from '@/lib/templates/template-groups';

// ---------------------------------------------------------------------------
// Token shape (mirrors trust.ts — colors / typography / radius / spacing)
// ---------------------------------------------------------------------------

export interface BusinessModelColors {
  /** CTAs + urgency ink — red-600. Fills "Add to cart" / "Checkout". */
  primary: string;
  /** Amber-500 — countdown / flash-sale flag stickers ONLY.
   *  Never as a primary button fill (red owns CTAs). */
  accent: string;
  /** Mint green-500 — savings indicator pills ("Save 30%"). */
  savings: string;
  /** Card / inner surface — pure white. */
  surface: string;
  /** Page background — pure white. Spreadsheet / dashboard feel. */
  bg: string;
  /** Muted surface — yellow-50 deal-card tint + row striping. */
  muted: string;
  /** Primary text — slate-900. */
  ink: string;
  /** Muted text — slate-500 for captions. */
  inkMuted: string;
  /** Hairline borders — zinc-200. */
  border: string;
}

export interface BusinessModelTypography {
  /** Headings + numerics — Inter sans loaded via --font-sans (already
   *  in app/layout.tsx as Inter on --font-sans). Heavy weight (700)
   *  for h1..h3 — quantitative B2B voice. */
  headingFontVar: string;
  /** Body sans — DM Sans / Prompt via existing --font-sans cascade. */
  bodyFontVar: string;
  /** Mono for prices / countdowns / SKUs / MOQ codes.
   *  Loaded as --font-bm-mono in app/layout.tsx. */
  monoFontVar: string;
  scale: {
    display: string; // hero h1
    h1: string;
    h2: string;
    h3: string;
    body: string;
    /** Eyebrow caps — tight tracking (0.12em) — B2B utility, not editorial. */
    caption: string;
  };
  /** Default heading weight — bold for authority. */
  headingWeight: 700;
}

export interface BusinessModelRadius {
  /** Squared CTAs — rectangular utility look. */
  none: string;
  /** Default for inputs / chips — rounded-sm. */
  sm: string;
  /** Cards / containers — rounded-md only. */
  md: string;
  lg: string;
  xl: string;
  /** Even rounded-2xl in business-model → rounded-md (sharp utility). */
  '2xl': string;
  /** Pills disabled in business-model — rectangular utility. */
  full: string;
}

export interface BusinessModelSpacing {
  /** High density — tier tables, countdown banner, MOQ chips, savings
   *  callouts all packed together. Translates to py-8 sections, gap-4 grids. */
  density: 'dense';
  /** Section vertical padding utility (Tailwind class). */
  section: string;
  /** Grid gap utility (Tailwind class). */
  grid: string;
}

export interface BusinessModelTokens {
  code: 'business-model';
  label: string;
  description: string;
  colors: BusinessModelColors;
  typography: BusinessModelTypography;
  radius: BusinessModelRadius;
  spacing: BusinessModelSpacing;
}

// ---------------------------------------------------------------------------
// Token values
// ---------------------------------------------------------------------------

export const BUSINESS_MODEL_TOKENS: BusinessModelTokens = {
  code: 'business-model',
  label: 'Business-Model — Deal Dashboard / Wholesale Utility',
  description:
    'White / red / amber / mint dashboard palette with Inter-bold headings + JetBrains Mono numerics + tier-pricing tables. Wholesale-b2b, Flash-deal, Subscription templates.',
  colors: {
    // Red-600 — urgency primary for CTAs + countdown banner.
    primary: '#dc2626',
    // Amber-500 — flash-deal sticker / countdown chrome ONLY.
    accent: '#f59e0b',
    // Mint emerald-500 — "Save XX%" / "Volume discount" pills.
    savings: '#10b981',
    surface: '#ffffff',
    // Pure white bg — dashboard / spreadsheet utility.
    bg: '#ffffff',
    // Yellow-50 — deal-card tint + tier-row striping.
    muted: '#fefce8',
    // Slate-900 ink — authority for prices + headlines.
    ink: '#0f172a',
    inkMuted: '#64748b', // slate-500
    border: '#e4e4e7',   // zinc-200 hairline
  },
  typography: {
    // Inter sans — already loaded as --font-sans. Heavy weight on
    // headings via the .theme-business-model block in globals.css.
    headingFontVar: 'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif',
    bodyFontVar: 'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif',
    // JetBrains Mono — loaded as --font-bm-mono in app/layout.tsx.
    // Used for countdown numbers, prices, MOQ codes, SKUs.
    monoFontVar:
      'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace',
    scale: {
      display: 'text-3xl sm:text-4xl md:text-5xl', // tighter than trust — utility, not luxury
      h1: 'text-2xl sm:text-3xl',
      h2: 'text-xl sm:text-2xl',
      h3: 'text-lg sm:text-xl',
      body: 'text-sm sm:text-base',
      // 0.12em — tight, B2B label-row look (vs trust's 0.28em heritage).
      caption: 'text-xs uppercase tracking-[0.12em]',
    },
    headingWeight: 700,
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-md',
    xl: 'rounded-md',
    '2xl': 'rounded-md',
    full: 'rounded-md',
  },
  spacing: {
    density: 'dense',
    section: 'py-8 sm:py-10',
    grid: 'gap-4',
  },
};

// ---------------------------------------------------------------------------
// Detection — when do we render the business-model variant?
// ---------------------------------------------------------------------------

/**
 * Template IDs that belong to the business-model TemplateGroup.
 * Mirrors `templateGroups['business-model']` in lib/templates/registry.ts.
 */
export const BUSINESS_MODEL_TEMPLATE_IDS: ReadonlySet<TemplateId> = templateIdsForGroup('business-model');

/**
 * Operator-facing `landingThemeVariant` values that should also render
 * as business-model. Accepts the literal "business-model" group code
 * for AI-multi-page operators who picked the group directly. None of
 * the v3 picker family codes (A-I) map cleanly here — business-model
 * is utility, not editorial — so it stays a templateId-driven gate.
 */
const BUSINESS_MODEL_VARIANT_VALUES = new Set<string>(['business-model']);

/**
 * Detect whether the given store should render the business-model
 * design family. Used by every shared buyer page that opts in via
 * conditional rendering.
 *
 * Inputs are intentionally narrow so callers can pass a slim
 * select-shaped object without dragging the whole Store row.
 */
export function isBusinessModelStore(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && (BUSINESS_MODEL_TEMPLATE_IDS as ReadonlySet<string>).has(tpl)) {
    return true;
  }
  if (variant && BUSINESS_MODEL_VARIANT_VALUES.has(variant)) {
    return true;
  }
  return false;
}

/**
 * Body className applied to the `<div class="shop-page">` wrapper
 * when a store is in this family. Pairs with the `.theme-business-model`
 * skin in globals.css to remap CSS vars + lift headings into Inter-bold
 * + rectangular CTAs.
 */
export const BUSINESS_MODEL_BODY_CLASS = 'theme-business-model';

/**
 * Inline-style helper — used by layouts that already use CSS vars to
 * override the --shop-* cascade with the business-model palette. The
 * .theme-business-model class in globals.css also does this, but this
 * helper lets a layout opt in without depending on globals.css
 * ordering / specificity.
 */
export function businessModelCssVars(): Record<string, string> {
  const c = BUSINESS_MODEL_TOKENS.colors;
  return {
    '--shop-primary': c.primary,
    '--shop-accent': c.accent,
    '--shop-bg': c.bg,
    '--shop-card': c.surface,
    '--shop-ink': c.ink,
    '--shop-ink-muted': c.inkMuted,
    '--shop-border': c.border,
    '--shop-muted': c.muted,
    // Extra vars exposed for components that want the deal-dashboard
    // accents directly (no equivalent on the trust/FB families).
    '--shop-savings': c.savings,
  };
}

// ---------------------------------------------------------------------------
// Pure helpers — shared across the per-page variants
// ---------------------------------------------------------------------------

/**
 * Build a deterministic 6-char SKU from the product id so the same
 * product always shows the same B2B SKU. NOT cryptographic.
 * Looks like "BP-A19F4Z".
 *
 * TODO(schema): once Product.sku lands, prefer it over this hash.
 */
export function bmSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `BP-${hash}`;
}

/**
 * Default volume-pricing tiers used when a product has no real tier
 * data on Prisma yet. Each tier reads as MOQ → unit price multiplier:
 *
 *   1-9    → 1.00 × base price
 *   10-49  → 0.90 × base price (10% off)
 *   50+    → 0.80 × base price (20% off)
 *
 * TODO(schema): once Product.tierPricing lands, prefer those rows over
 * this hardcoded default.
 */
export const BM_DEFAULT_TIERS: ReadonlyArray<{
  label: string;
  minQty: number;
  multiplier: number;
  /** Savings % vs tier 1 — displayed in the mint chip. */
  savingsPct: number;
}> = [
  { label: '1-9', minQty: 1, multiplier: 1.0, savingsPct: 0 },
  { label: '10-49', minQty: 10, multiplier: 0.9, savingsPct: 10 },
  { label: '50+', minQty: 50, multiplier: 0.8, savingsPct: 20 },
];

/**
 * Resolve the active tier for a given quantity. Returns the highest
 * tier whose minQty <= qty. Used by the PDP "tier highlight" + cart
 * "volume-discount" banner.
 */
export function bmActiveTier(qty: number) {
  let active = BM_DEFAULT_TIERS[0];
  for (const t of BM_DEFAULT_TIERS) {
    if (qty >= t.minQty) active = t;
  }
  return active;
}
