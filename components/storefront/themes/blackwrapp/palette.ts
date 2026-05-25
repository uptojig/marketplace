/**
 * BlackWrapp — theme-local palette tokens.
 *
 * The actual palette swatches live in `lib/landing/blackwrapp-palettes.ts`
 * (they're shared with the admin picker). This file exists so the
 * registry / family detector can look up a default surface set if
 * neither the store override nor a palette pick has been resolved yet.
 *
 * Every component in `themes/blackwrapp/**` reads runtime values from
 * the CSS vars below — never these hex constants directly — so swapping
 * a palette via the override system re-skins the storefront live.
 */

import { BLACKWRAPP_PALETTES } from '@/lib/landing/blackwrapp-palettes';

/** First-listed palette — the bootstrap default before any pick. */
const DEFAULT = BLACKWRAPP_PALETTES[0];

export const BLACKWRAPP_HEX = {
  /** The primary surface tone (near-black). */
  bg: DEFAULT.background,
  /** A slightly lifted near-black for cards / overlays. */
  bgSoft: '#0A0A0A',
  /** The single electric accent (primary CTA / price / glow rim). */
  primary: DEFAULT.accent,
  primaryHover: DEFAULT.accent,
  primaryDark: DEFAULT.accent,
  accent: DEFAULT.accent,
  /** Text on near-black. */
  ink: '#FAFAFA',
  /** Muted secondary text (timestamps, helper copy). */
  inkMuted: '#A1A1AA',
  /** Hair-thin divider on a near-black surface. */
  border: 'rgba(255,255,255,0.08)',
  /** Lifted card surface. */
  card: '#141414',
  cardForeground: '#FAFAFA',
  /** Semantic — kept neutral so a palette swap doesn't break states. */
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

/** Optional `_shared/palette` schema — kept thin because BlackWrapp is
 *  surface-led, not card-led. Components consume CSS vars at runtime. */
export const BLACKWRAPP_PALETTE = {
  background: BLACKWRAPP_HEX.bg,
  muted: BLACKWRAPP_HEX.bgSoft,
  card: BLACKWRAPP_HEX.card,
  cardForeground: BLACKWRAPP_HEX.cardForeground,
  border: BLACKWRAPP_HEX.border,
  foreground: BLACKWRAPP_HEX.ink,
  mutedForeground: BLACKWRAPP_HEX.inkMuted,
  primary: BLACKWRAPP_HEX.primary,
  primaryForeground: BLACKWRAPP_HEX.bg,
} as const;
