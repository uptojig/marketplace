/**
 * taobao-style — palette tokens
 *
 * Re-exports `TAOBAO_TOKENS` from `lib/landing/taobao.ts` so the
 * chrome / pages can reference a single canonical CSS-var contract
 * (`--shop-*`) that the family-level provider already injects into
 * the storefront tree. Components should always use the CSS vars
 * (`var(--shop-primary)`, `var(--shop-accent)`, ...) instead of
 * hardcoding hex values so the family-level theme cascade keeps
 * working when a downstream store overrides one token.
 *
 * Inspiration: Taobao / Pinduoduo / Lazada — bold orange/red/pink
 * gradient, golden-yellow flash-deal chips, dense urgent UI.
 */

import { TAOBAO_TOKENS } from '@/lib/landing/taobao';

export const TAOBAO_STYLE_PALETTE = {
  /** Hot red primary CTA (`#FF1A1A`). */
  primary: TAOBAO_TOKENS.primary,
  /** Orange → red → pink hero gradient. */
  primaryGradient: TAOBAO_TOKENS.primaryGradient,
  /** Golden yellow — flash-deal / countdown chip background. */
  accent: TAOBAO_TOKENS.accent,
  /** Green — "save X%" badge. */
  savings: TAOBAO_TOKENS.savings,
  /** Charcoal ink for headings on white. */
  ink: TAOBAO_TOKENS.ink,
  /** Mid-gray ink for body / muted captions. */
  inkMuted: TAOBAO_TOKENS.inkMuted,
  /** Off-white page background. */
  bg: TAOBAO_TOKENS.bg,
  /** Pale-pink hero/section background tint. */
  bgSoft: TAOBAO_TOKENS.bgSoft,
  /** Hairline border between cards. */
  border: TAOBAO_TOKENS.border,
  /** Cool-gray neutral for inactive chips. */
  muted: TAOBAO_TOKENS.muted,
} as const;

/**
 * Convenience: the urgent "ขายแล้ว 123 ชิ้น" style chip we use on
 * tiles + the PDP. Keep the format in one place so future tweaks
 * don't drift between pages.
 */
export function soldChip(sold: number | undefined | null): string {
  if (!sold || sold <= 0) return '';
  if (sold >= 1000) return `ขายแล้ว ${(sold / 1000).toFixed(1)}k ชิ้น`;
  return `ขายแล้ว ${sold} ชิ้น`;
}

/**
 * Pseudo-stable countdown seconds — we don't have a real campaign
 * deadline in the data shape so each page derives a deterministic
 * "ends in X" window from the store slug so SSR + CSR match.
 */
export function flashDeadlineSeconds(seedSlug: string): number {
  let h = 0;
  for (let i = 0; i < seedSlug.length; i++) h = (h * 31 + seedSlug.charCodeAt(i)) | 0;
  // Window between 1h and 5h so the countdown always feels urgent.
  const hours = 1 + (Math.abs(h) % 5);
  return hours * 3600;
}
