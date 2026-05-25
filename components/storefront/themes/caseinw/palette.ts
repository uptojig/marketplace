/**
 * CaseINW — Gen-Z phone case storefront palette.
 *
 * Electric purple + acid green on off-white, deep charcoal ink.
 * Fuchsia→violet→cyan gradient powers headline accent and CTA gloss.
 * Components prefer the runtime CSS vars (`--shop-primary`,
 * `--shop-primary-gradient`) so a tenant override re-skins the
 * storefront without rebuilding.
 */
export const CASEINW_HEX = {
  bg: '#FAFAF7',
  bgSoft: '#F2F2EC',
  card: '#FFFFFF',
  cardForeground: '#0E0E12',
  primary: '#8B5CF6',
  primaryHover: '#7C3AED',
  primaryDark: '#6D28D9',
  accent: '#A3E635',
  accentDark: '#84CC16',
  ink: '#0E0E12',
  inkMuted: '#5B5B66',
  border: '#E6E6DF',
  surfaceDark: '#0E0E12',
  surfaceDarkInk: '#FAFAF7',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
} as const;

export const CASEINW_GRADIENT =
  'linear-gradient(120deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)';

export const CASEINW_PALETTE = {
  background: CASEINW_HEX.bg,
  muted: CASEINW_HEX.bgSoft,
  card: CASEINW_HEX.card,
  cardForeground: CASEINW_HEX.cardForeground,
  border: CASEINW_HEX.border,
  foreground: CASEINW_HEX.ink,
  mutedForeground: CASEINW_HEX.inkMuted,
  primary: CASEINW_HEX.primary,
  primaryForeground: '#FFFFFF',
} as const;
