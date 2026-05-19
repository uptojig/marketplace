/**
 * Eco Pack — CSS-variable token palette.
 *
 * Kraft-brown + warm off-white + emerald-green accent. Pairs with
 * the `.theme-eco-pack` block in app/globals.css.
 *
 * The first 7 `--shop-*` vars feed the shared chrome + the bespoke
 * Header / Footer / page components. The optional `--eco-*` vars are
 * scoped to the bespoke per-route page components for kraft-paper
 * accents (banners, callouts).
 */
export const ecoPackTokens: Record<string, string> = {
  '--shop-primary': '#8C6239',      // Kraft Brown CTA / Link
  '--shop-bg': '#FAFAF9',           // Warm off-white background
  '--shop-card': '#FFFFFF',         // Card surface
  '--shop-ink': '#292524',          // Dark stone text
  '--shop-ink-muted': '#78716C',    // Muted stone text
  '--shop-border': '#E7E5E4',       // Soft border
  '--shop-accent': '#10B981',       // Eco Emerald green
  '--eco-kraft': '#D4A373',         // Light kraft accent
  '--eco-kraft-dark': '#5C4033',    // Dark brown text accents
};
