/**
 * Marketplace shell tokens — the brand-side design system for
 * basketplace.co's own pages (home, /apply, /signin, /create-store).
 * Operator workspaces use the shadcn/radix operator shell instead.
 *
 * Sibling of lib/landing/{business-model,trust,fashion-beauty,...}.ts —
 * but those theme PER-STORE vendor templates. This one themes the
 * MARKETPLACE/PLATFORM shell itself. Token namespace is `--mp-*`
 * (vs `--shop-*` for vendor templates) so the two cascades stay
 * fully separate — touching marketplace tokens can never leak into a
 * vendor store, and vice versa.
 *
 * Source of truth: the "Editorial Merchant" Stitch design system
 * (asset id `assets/b0e8e92b051040db9cd822105848fb46`). Generated
 * landing HTML lives at `.tmp-audit/stitch-design/basketplace-landing.html`.
 *
 * Wiring:
 *   - `.theme-marketplace` class in `app/globals.css` maps these
 *     tokens to CSS vars + Tailwind `mp-*` color utilities.
 *   - `app/(marketplace)/layout.tsx` adds the class to the outer wrapper.
 *   - Components in `components/marketplace/*` consume the utilities.
 */





// ---------------------------------------------------------------------------
// Token values — keep in sync with the .theme-marketplace block in
// app/globals.css and the @theme inline `--color-mp-*` exports.
// ---------------------------------------------------------------------------

export const MARKETPLACE_TOKENS = {
  code: 'marketplace',
  label: 'Marketplace — Editorial Merchant',
  description:
    'Warm coral + forest green + cream palette for the Basketplace platform shell. ' +
    'IBM Plex Sans Thai headings, Prompt body, JetBrains Mono numerics. ' +
    'Used on basketplace.co/, /apply, /signin, /signup, and /create-store.',
  colors: {
    primary: '#E85D3C',          // warm coral — CTAs
    primaryDark: '#A93013',      // M3-derived deeper coral — hover
    secondary: '#2C5F4F',        // forest green — footer + secondary CTAs
    bg: '#FAF7F2',               // cream page background
    bgAlt: '#F0EBE2',            // darker cream — section dividers
    surface: '#FCF9F8',          // off-white card tint
    surfaceContrast: '#FFFFFF',  // pure white — inputs / modals
    ink: '#1A1A1A',              // near-black body
    inkMuted: '#6B6B6B',         // muted body
    border: '#E5DDD0',           // hairline warm border
    warning: '#D49C3D',          // star + alert
  },
  typography: {
    displayFontVar:
      'var(--font-ibm-thai, "IBM Plex Sans Thai"), "Prompt", system-ui, sans-serif',
    bodyFontVar:
      'var(--font-prompt, "Prompt"), var(--font-google-sans, "DM Sans"), system-ui, sans-serif',
    monoFontVar:
      'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace',
  },
  spacing: {
    containerMax: '1200px',
    sectionDesktop: 'py-20',     // 80px
    sectionMobile: 'py-12',      // 48px
    gutter: 'gap-6',             // 24px
  },
};

/**
 * Body class applied to the marketplace shell root.
 * Pairs with the `.theme-marketplace` block in globals.css to switch
 * the page into the brand cascade.
 */
export const MARKETPLACE_BODY_CLASS = 'theme-marketplace';

/**
 * Inline-style helper — used by layouts that want to set the marketplace
 * CSS-var cascade without depending on globals.css class ordering.
 * Mirrors `businessModelCssVars()` from lib/landing/business-model.ts.
 */
export function marketplaceCssVars(): Record<string, string> {
  const c = MARKETPLACE_TOKENS.colors;
  return {
    '--mp-primary': c.primary,
    '--mp-primary-dark': c.primaryDark,
    '--mp-secondary': c.secondary,
    '--mp-bg': c.bg,
    '--mp-bg-alt': c.bgAlt,
    '--mp-surface': c.surface,
    '--mp-surface-contrast': c.surfaceContrast,
    '--mp-ink': c.ink,
    '--mp-ink-muted': c.inkMuted,
    '--mp-border': c.border,
    '--mp-warning': c.warning,
  };
}
