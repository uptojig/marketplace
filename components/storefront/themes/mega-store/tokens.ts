/**
 * Mega Store — CSS-variable token palette.
 *
 * Vibrant Taobao orange + tmall red accent on light-gray surface.
 * Pairs with the `.theme-mega-store` block in app/globals.css.
 *
 * The first 7 `--shop-*` vars feed the shared chrome + the bespoke
 * Header / Footer / page components. The optional `--mega-*` vars are
 * scoped to the bespoke per-route page components for flash-sale
 * highlights and gradient CTAs.
 */
export const megaStoreTokens: Record<string, string> = {
  '--shop-primary': '#FF5000',      // Taobao Orange CTA / Link
  '--shop-bg': '#F4F4F4',           // Light gray page background
  '--shop-card': '#FFFFFF',         // Card surface
  '--shop-ink': '#333333',          // Body text
  '--shop-ink-muted': '#999999',    // Secondary text
  '--shop-border': '#EEEEEE',       // Soft border
  '--shop-accent': '#FF0036',       // Tmall Red secondary accent
  '--mega-highlight': '#FFF0E5',    // Light orange highlight bg
  '--mega-gradient-btn': 'linear-gradient(90deg, #FF9000 0%, #FF5000 100%)',
  '--mega-gradient-accent': 'linear-gradient(90deg, #FF5000 0%, #FF0036 100%)',
};
