/**
 * Packaging Supply — CSS-variable token palette.
 *
 * Playful B2B packaging-supply storefront: vivid hot pink CTAs, sunshine
 * yellow badges, royal-blue savings chips on a clean white canvas. Brief
 * from operator (see `lib/landing/packaging.ts → PACKAGING_TOKENS`):
 * ชมพู / เหลือง / ฟ้า / ขาว — friendly SMB feel, not the muted kraft-
 * brown of the source mockup.
 *
 * The first `--shop-*` block feeds the shared chrome + the bespoke
 * Header / Footer / page components. The optional `--pks-*` vars are
 * scoped to the bespoke per-route page components for playful packaging
 * accents (tape-stripe banners, washi-tape callouts).
 *
 * Pairs with `.theme-packaging-supply` in `app/globals.css` (when wired
 * by the family palette runtime).
 */
export const packagingSupplyTokens: Record<string, string> = {
  '--shop-primary': '#FF4E8B',       // Hot pink — CTAs / links / focus
  '--shop-bg': '#FFFFFF',            // Pure white background
  '--shop-bg-soft': '#FFF0F6',       // Barely-there pink wash for bands
  '--shop-card': '#FFFFFF',          // Card surface
  '--shop-muted': '#FFF7FA',         // Tile-fill / surface-2
  '--shop-ink': '#1A1A2E',           // Near-black text
  '--shop-ink-muted': '#6B7280',     // Secondary text
  '--shop-border': '#FFE0EC',        // Soft pink hairlines
  '--shop-accent': '#FFD93D',        // Sunshine yellow — badges / highlights
  '--shop-savings': '#3B82F6',       // Royal blue — savings / info chips
  // Theme-scoped accents (bespoke pages only).
  '--pks-pink-deep': '#E5326F',      // Pressed CTA / heading underline
  '--pks-yellow-soft': '#FFF4B8',    // Tape-stripe banners
  '--pks-blue-soft': '#DBEAFE',      // MOQ tier-callout tiles
  '--pks-ink-dim': '#9CA3AF',        // Disabled / placeholder
};
