/**
 * ShopChromeTokens — visual variables a store can override per-tenant.
 * The chrome reads these and writes them onto the wrapper as CSS vars
 * so that nested page content (cart / category / product / wishlist)
 * cascades the same palette.
 *
 * Phase-1 surface: `accent`. More tokens (radius scale, font flavor,
 * neutral palette) land in subsequent phases.
 */

export interface ShopChromeTokens {
  /** Hex accent for primary CTAs, links, focus rings, badges. */
  accent: string;
  /** Optional neutral ink hex (defaults to slate-900). */
  ink?: string;
  /** Optional muted-bg hex (defaults to slate-50). */
  bg?: string;
}

export const DEFAULT_TOKENS: ShopChromeTokens = {
  accent: "#0f172a",
  ink: "#0f172a",
  bg: "#f8fafc",
};

/**
 * Resolve final tokens from a store's primaryColor + any per-store
 * overrides on the schema. Falls back to neutral defaults so the
 * chrome always has a coherent palette even if the operator hasn't
 * set anything yet.
 */
export function resolveChromeTokens(opts: {
  primaryColor?: string | null;
  override?: Partial<ShopChromeTokens>;
}): Required<ShopChromeTokens> {
  return {
    accent:
      opts.override?.accent ?? opts.primaryColor ?? DEFAULT_TOKENS.accent,
    ink: opts.override?.ink ?? DEFAULT_TOKENS.ink!,
    bg: opts.override?.bg ?? DEFAULT_TOKENS.bg!,
  };
}

/**
 * CSS variables emitted on the chrome wrapper. Existing storefront
 * pages reference --shop-primary / --shop-bg / --shop-card / etc., so
 * we keep the same names — that means cart, product, category, etc.
 * inherit the new chrome's palette without any per-page change.
 */
export function tokensToCssVars(tokens: Required<ShopChromeTokens>): React.CSSProperties {
  return {
    ["--shop-primary" as string]: tokens.accent,
    ["--shop-accent" as string]: tokens.accent,
    ["--shop-bg" as string]: tokens.bg,
    ["--shop-card" as string]: "#ffffff",
    ["--shop-ink" as string]: tokens.ink,
    ["--shop-ink-muted" as string]: `color-mix(in srgb, ${tokens.ink} 60%, transparent)`,
    ["--shop-border" as string]: `color-mix(in srgb, ${tokens.ink} 12%, transparent)`,
  } as React.CSSProperties;
}
