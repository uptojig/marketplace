/**
 * Bikini Beach — CSS-variable token palette.
 *
 * Imported from the BIKINI551 designer deliverable (originally
 * exported as `tokens`; renamed to `bikiniBeachTokens` to match
 * `app/stores/[slug]/layout.tsx:73` which expects the named export).
 * Pairs with the `.theme-bikini-beach` block in `app/globals.css`.
 *
 * The first 7 `--shop-*` vars feed the shared chrome (ShopHeader /
 * ShopFooter / generic page UI) when this template is active but
 * hasn't yet shipped its own `chrome` components. The `--bikini-*`
 * + `--bikini-grad-*` + `--bikini-bg-*` extras are scoped to the
 * template's bespoke page components for the playful summer accents
 * (sky-coral-sand palette + eight product-card background variants).
 */
export const bikiniBeachTokens: Record<string, string> = {
  // ===== Required canonical slots =====
  '--shop-primary': '#EC4899',        // coral-dark · main CTA, links, active states
  '--shop-bg': '#FFFFFF',             // page background
  '--shop-card': '#FFFFFF',           // card surface
  '--shop-ink': '#1E293B',            // body text (near-navy)
  '--shop-ink-muted': '#64748B',      // secondary text
  '--shop-border': '#E2E8F0',         // dividers, card borders
  '--shop-accent': '#38BDF8',         // sky blue · secondary highlights

  // ===== Brand-specific tokens =====
  // Sky scale (from logo "BIKINI" text)
  '--bikini-sky': '#38BDF8',
  '--bikini-sky-dark': '#0284C7',
  '--bikini-sky-deep': '#1E40AF',
  '--bikini-sky-soft': '#E0F2FE',
  '--bikini-sky-pale': '#F0F9FF',

  // Coral scale (from logo "551" text)
  '--bikini-coral': '#F472B6',
  '--bikini-coral-dark': '#EC4899',
  '--bikini-coral-deep': '#BE185D',
  '--bikini-coral-soft': '#FCE7F3',
  '--bikini-coral-pale': '#FDF2F8',

  // Warm accents
  '--bikini-orange': '#F97316',
  '--bikini-orange-light': '#FB923C',
  '--bikini-yellow': '#FACC15',

  // Sand backgrounds
  '--bikini-sand': '#FEF3E2',
  '--bikini-sand-light': '#FFF8F0',
  '--bikini-text': '#1E293B',
  '--bikini-text-2': '#475569',
  '--bikini-muted': '#94A3B8',
  '--bikini-hint': '#CBD5E1',
  '--bikini-line': '#F1F5F9',

  // Brand gradients
  '--bikini-grad-sky': 'linear-gradient(135deg, #38BDF8 0%, #1E40AF 100%)',
  '--bikini-grad-coral': 'linear-gradient(135deg, #F472B6 0%, #BE185D 100%)',
  '--bikini-grad-summer': 'linear-gradient(135deg, #38BDF8 0%, #F472B6 100%)',
  '--bikini-grad-sunset': 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
  // Back-compat alias for the original scaffold key used by globals.css.
  '--grad-summer': 'linear-gradient(135deg, #38BDF8 0%, #F472B6 100%)',

  // Card background variants (used by product card backgrounds)
  '--bikini-bg-rose': 'linear-gradient(160deg, #FDF2F8 0%, #FCE7F3 100%)',
  '--bikini-bg-sky': 'linear-gradient(160deg, #F0F9FF 0%, #E0F2FE 100%)',
  '--bikini-bg-yellow': 'linear-gradient(160deg, #FEF3C7 0%, #FDE68A 100%)',
  '--bikini-bg-orange': 'linear-gradient(160deg, #FED7AA 0%, #FDBA74 100%)',
  '--bikini-bg-blue': 'linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)',
  '--bikini-bg-green': 'linear-gradient(160deg, #DCFCE7 0%, #BBF7D0 100%)',
  '--bikini-bg-purple': 'linear-gradient(160deg, #F3E8FF 0%, #E9D5FF 100%)',
  '--bikini-bg-coral': 'linear-gradient(160deg, #FFE4E6 0%, #FECDD3 100%)',
};

export default bikiniBeachTokens;
