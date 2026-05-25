/**
 * Casetify Clone — phone-case storefront palette.
 *
 * White surface, black ink, red electric accent — modelled on the
 * CASETiFY visual language. Components in this theme prefer the
 * runtime CSS vars (`--shop-primary`, `--shop-primary-gradient`) for
 * the accent so a tenant override re-skins the storefront live.
 */
export const CASETIFY_CLONE_HEX = {
  bg: '#ffffff',
  bgSoft: '#f4f4f5',
  card: '#fafafa',
  cardForeground: '#0a0a0a',
  primary: '#EA1C5C',
  primaryHover: '#c91250',
  primaryDark: '#a30f41',
  accent: '#EA1C5C',
  ink: '#0a0a0a',
  inkMuted: '#6b7280',
  border: '#e5e7eb',
  surfaceDark: '#000000',
  surfaceDarkInk: '#ffffff',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const CASETIFY_CLONE_PALETTE = {
  background: CASETIFY_CLONE_HEX.bg,
  muted: CASETIFY_CLONE_HEX.bgSoft,
  card: CASETIFY_CLONE_HEX.card,
  cardForeground: CASETIFY_CLONE_HEX.cardForeground,
  border: CASETIFY_CLONE_HEX.border,
  foreground: CASETIFY_CLONE_HEX.ink,
  mutedForeground: CASETIFY_CLONE_HEX.inkMuted,
  primary: CASETIFY_CLONE_HEX.primary,
  primaryForeground: '#ffffff',
} as const;
