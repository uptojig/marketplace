/**
 * Shared palette type + CSS variable helper for storefront adapters.
 *
 * Several shared adapters (homepage-enhancer, pdp-adapter, cart-adapter)
 * render shadcn-studio blocks that read semantic tokens (`bg-background`,
 * `bg-card`, `bg-primary`, ...). Templates whose chrome is hardcoded
 * outside the --shop-* cascade (e.g. talad-see-sod's red/orange) can
 * pass a `palette` so the adapter wraps its block tree in a div that
 * remaps the relevant shadcn vars — keeping the section on-theme.
 */

import type { CSSProperties } from 'react';

export interface BlockPalette {
  background?: string;
  muted?: string;
  card?: string;
  cardForeground?: string;
  border?: string;
  foreground?: string;
  mutedForeground?: string;
  primary?: string;
  primaryForeground?: string;
}

export function paletteToCssVars(p: BlockPalette): CSSProperties {
  const vars: Record<string, string> = {};
  if (p.background) vars['--background'] = p.background;
  if (p.muted) vars['--muted'] = p.muted;
  if (p.card) vars['--card'] = p.card;
  if (p.cardForeground) vars['--card-foreground'] = p.cardForeground;
  if (p.border) vars['--border'] = p.border;
  if (p.foreground) vars['--foreground'] = p.foreground;
  if (p.mutedForeground) vars['--muted-foreground'] = p.mutedForeground;
  if (p.primary) vars['--primary'] = p.primary;
  if (p.primaryForeground) vars['--primary-foreground'] = p.primaryForeground;
  return vars as CSSProperties;
}
