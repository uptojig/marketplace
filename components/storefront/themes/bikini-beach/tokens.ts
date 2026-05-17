/**
 * Bikini Beach — CSS-variable token palette.
 *
 * Sky-blue + coral-pink + sand from the BIKINI551 reference design
 * (see /tmp/bikini-template/bikini551/README.md). Pairs with the
 * `.theme-bikini-beach` block in app/globals.css.
 *
 * The first 7 `--shop-*` vars feed the shared chrome (ShopHeader /
 * ShopFooter / generic page UI) when this template is active but
 * hasn't yet shipped its own `chrome` components. The `--bikini-*`
 * + `--grad-*` extras are scoped to the template's bespoke page
 * components (filled in by downstream page agents) for the playful
 * summer accents.
 */
export const bikiniBeachTokens: Record<string, string> = {
  '--shop-primary': '#38BDF8',
  '--shop-bg': '#FFF8F0',
  '--shop-card': '#FFFFFF',
  '--shop-ink': '#0F172A',
  '--shop-ink-muted': '#64748B',
  '--shop-border': '#E2E8F0',
  '--shop-accent': '#F472B6',
  '--bikini-sand': '#FEF3E2',
  '--bikini-coral': '#F472B6',
  '--bikini-coral-deep': '#BE185D',
  '--bikini-sky': '#38BDF8',
  '--bikini-sky-deep': '#1E40AF',
  '--bikini-yellow': '#FACC15',
  '--bikini-orange': '#F97316',
  '--grad-summer': 'linear-gradient(135deg, #38BDF8 0%, #F472B6 100%)',
  '--grad-coral': 'linear-gradient(135deg, #F472B6, #BE185D)',
  '--grad-sky': 'linear-gradient(135deg, #38BDF8, #1E40AF)',
};
