/**
 * Handmade — local palette tokens (craft / atelier / textile).
 *
 * The Specialty design family already injects `--shop-*` CSS vars via
 * `specialtyCssVars()` (see `lib/landing/specialty.ts`) — kraft paper
 * background, ochre primary, terra-rose accent, warm-stone ink. This
 * file holds the *hex* values that mirror those vars so chrome
 * components can pass them to block adapters (or to inline-style
 * gradients / shadows) without re-reading the family token bag.
 *
 * Keep these in sync with `SPECIALTY_TOKENS.colors` in
 * `lib/landing/specialty.ts`. The few extra keys (`thread`, `wood`,
 * `linen`) are handmade-specific accents used for stitch / textile /
 * grain decorations and don't need to live in the family bag.
 *
 * NOTE: When wiring this template into the registry, you can pass
 * `HANDMADE_PALETTE.primary` / `.accent` to `enhanceHomepage` or any
 * block adapter that accepts a `palette` prop. The CSS-var cascade
 * (`--shop-*`) is the source of truth for runtime styling; this file
 * exists for adapters that need a raw hex (gradients, SVG fills,
 * canvas paints, etc).
 */

export interface HandmadePaletteShape {
  /** Kraft-paper warm background. */
  bg: string;
  /** Lifted off-bg card surface. */
  surface: string;
  /** Warm-stone ink (near-black, not harsh). */
  ink: string;
  /** Muted secondary ink for captions. */
  inkMuted: string;
  /** Hairline taupe border. */
  border: string;
  /** Ochre primary — CTAs / price emphasis. */
  primary: string;
  /** Terra-rose accent — secondary highlights / strip bg. */
  accent: string;
  /** Faded sage / kraft tint — pricing pills, muted cards. */
  muted: string;
  /** Burnt sienna thread color — for stitch / hand-drawn rule decorations. */
  thread: string;
  /** Walnut wood tone — for testimonial frames / footer band. */
  wood: string;
  /** Pale unbleached linen — for textile-textured sections. */
  linen: string;
}

export const HANDMADE_PALETTE: HandmadePaletteShape = {
  // Mirrors SPECIALTY_TOKENS.colors:
  bg: '#f5efe3',
  surface: '#fbf9f3',
  ink: '#44403c',
  inkMuted: '#78716c',
  border: '#e7e2d6',
  primary: '#ca8a04',
  accent: '#b45309',
  muted: '#dad6c4',
  // Handmade-only accents:
  thread: '#9a3412', // burnt sienna — handmade stitch / hand-drawn rule
  wood: '#57433a', // walnut — testimonial frames / footer band
  linen: '#efe7d4', // unbleached linen — textile-textured sections
};
