/**
 * IconMart (iconmart-th) palette — Thai digital icon-pack store.
 *
 * Extracted from the exported "Glyphkit" design (modern-minimal,
 * Linear/Vercel language). The export defines its tokens in OKLCH; the
 * hex values below are the sRGB conversions, frozen here so coding tools
 * don't substitute default theme colors.
 *
 * Every component references `var(--shop-*)` FIRST and only uses these
 * hex constants as the fallback. The family layout seeds the 9 storefront
 * CSS vars (--shop-primary, --shop-bg, --shop-ink, ...) from the store's
 * admin-chosen palette, so the whole storefront stays recolorable while
 * shipping this opinionated cool-blue look out of the box.
 *
 * Export accent (`oklch(56% 0.18 256)`) maps to `--shop-primary`.
 */

export const ICONMART_HEX = {
  // Brand accent (recolorable via --shop-primary / --shop-accent).
  // oklch(56% 0.18 256) → vivid Linear/Vercel blue.
  primary: '#1572DB', // accent
  primaryHover: '#005FC6', // accent-d
  accentSoft: '#E5F3FF', // accent-sf — soft tint for hover fills / badges

  // Ink + surfaces (light, premium).
  ink: '#12161B', // fg — near-black slate
  inkMuted: '#6A6F76', // muted
  faint: '#94999E', // faint — captions / tertiary
  bg: '#FAFCFE', // bg — faint cool-white page
  surface: '#FFFFFF', // surface — card
  surface2: '#F5F7F9', // surface-2 — inset / cover tiles
  border: '#E2E5E8', // border
  border2: '#D5D8DB', // border-2 — stronger hairline

  // Status (forms, badges).
  success: '#0FA05C', // good
  warning: '#DF911A', // warn
  error: '#D33A3C', // danger
} as const;

/** Radii from the export (--r / --r-s / --r-l). */
export const ICONMART_RADIUS = {
  base: '14px',
  small: '10px',
  large: '22px',
} as const;

/**
 * Token map used as inline `--shop-*` fallbacks on the theme root so the
 * cool-blue look renders even before the family layout seeds the cascade.
 * Admin-set `--shop-primary|accent|bg|ink` override these.
 */
export const ICONMART_SHOP_VARS = {
  '--shop-primary': ICONMART_HEX.primary,
  '--shop-primary-hover': ICONMART_HEX.primaryHover,
  '--shop-accent': ICONMART_HEX.primary,
  '--shop-bg': ICONMART_HEX.bg,
  '--shop-surface': ICONMART_HEX.surface,
  '--shop-ink': ICONMART_HEX.ink,
  '--shop-ink-muted': ICONMART_HEX.inkMuted,
  '--shop-border': ICONMART_HEX.border,
} as const;
