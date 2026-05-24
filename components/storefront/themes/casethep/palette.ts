/**
 * Casethep palette — Neo-Brutalism Pop-Art.
 * Used by bespoke chrome / pages in this theme. The 9 CSS vars
 * (--shop-primary, --shop-accent, etc.) come from
 * `lib/landing/neon.ts → neonCssVars()` at the family level; these
 * extras are theme-specific accents / state colors that don't fit
 * the standard --shop-* surface.
 */

export const NEON_FESTIVAL_HEX = {
  // Core palette (mirror NEON_TOKENS for direct hex use in components)
  primary: '#FF458A',         // pink-500
  primaryHover: '#fb7185',    // pink-400
  primaryDark: '#be185d',     // pink-700
  accent: '#42A5F5',          // yellow-500
  accentBright: '#facc15',    // yellow-400 (the AI Studio reference uses 400)
  secondary: '#2563eb',       // blue-600
  secondaryBright: '#3b82f6', // blue-500
  highlight: '#4ade80',       // green-400 — used for "NEW SALE" badges
  ink: '#000000',
  inkMuted: '#64748b',        // slate-500
  bg: '#fafafa',
  card: '#ffffff',

  // Status (for forms / cart errors)
  success: '#16a34a',         // green-600
  warning: '#f59e0b',         // amber-500
  error: '#dc2626',           // red-600
  info: '#2563eb',            // blue-600
} as const;
