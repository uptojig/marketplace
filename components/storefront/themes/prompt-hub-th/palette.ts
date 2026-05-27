/**
 * PromptHub palette — dark-tech AI prompts marketplace.
 *
 * The 9 core CSS vars (`--shop-primary`, `--shop-bg`, etc.) come from
 * `lib/landing/prompt-hub.ts → promptHubCssVars()` at the family level.
 * The constants below mirror those tokens for direct hex use inside
 * components plus extended state hexes (hover / dark / semantic) that
 * don't fit the standard `--shop-*` surface.
 */

export const PROMPT_HUB_HEX = {
  // Core (mirror PROMPT_HUB_TOKENS for direct hex use)
  primary: '#A855F7',       // purple-500 — CTA, price highlight, glow source
  primaryHover: '#9333EA',  // purple-600
  primaryDark: '#7E22CE',   // purple-700
  accent: '#06B6D4',        // cyan-500 — secondary CTA / info chips
  accentHover: '#0891B2',   // cyan-600
  accentDark: '#0E7490',    // cyan-700
  savings: '#FACC15',       // yellow-400 — discount badges
  ink: '#F8FAFC',           // slate-50
  inkMuted: '#94A3B8',      // slate-400
  bg: '#0B0B1F',            // near-black indigo
  bgSoft: '#13132E',        // surface-1
  muted: '#1E1E3F',         // surface-2 (hover)
  border: '#312E81',        // indigo-900

  // Semantic (forms / toast / cart errors)
  success: '#10B981',       // emerald-500
  warning: '#F59E0B',       // amber-500
  error: '#EF4444',         // red-500
  info: '#06B6D4',          // cyan-500
} as const;
