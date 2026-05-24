/**
 * Casethep palette — exports kept for back-compat with the registry
 * scaffolding (do not touch). The bespoke chrome / pages in this theme
 * paint via the standard CSS variable cascade (`var(--shop-primary)`,
 * `var(--shop-accent)`, `var(--shop-primary-gradient)`) so the per-store
 * `themeAccentOverride` system from PRs #153 / #154 paints the theme
 * correctly. These hex constants are only a fallback for places that
 * cannot use CSS vars (e.g. SVG `stroke` values inside `dangerouslySet
 * InnerHTML`).
 */

export const NEON_FESTIVAL_HEX = {
  // Casethep defaults — minimal clean phone-case shop. Coral primary
  // with a soft cream backdrop. Live theme paint comes from the
  // --shop-* CSS vars at the family level; these constants are only a
  // fallback for inline SVG / canvas.
  primary: '#FF5A6A',         // coral-rose CTA
  primaryHover: '#FF7588',    // coral-rose-light
  primaryDark: '#E0394C',     // coral-rose-deep
  accent: '#FFD580',          // soft warm yellow accent
  accentBright: '#FFC559',
  secondary: '#5B6B82',       // soft slate
  secondaryBright: '#7C8AA0',
  highlight: '#86EFAC',
  ink: '#1A1A1F',
  inkMuted: '#6B7280',
  bg: '#FBF8F3',              // cream background
  card: '#FFFFFF',

  // Status colors used in inline form / toast surfaces
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',
} as const;
