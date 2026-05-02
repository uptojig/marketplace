import type { ComponentType } from "react";
import { MinimalCTA } from "./CTA";
import { MinimalFeatures } from "./Features";
import { MinimalFooter } from "./Footer";
import { MinimalHero } from "./Hero";
import { MinimalNav } from "./Nav";
import { MinimalProductGrid } from "./ProductGrid";

export type BlockComponent = ComponentType<{ content: Record<string, unknown> }>;

/**
 * Minimal theme. Black/white/grey, generous whitespace, subtle borders.
 */
export const minimalRegistry: Record<string, BlockComponent> = {
  nav: MinimalNav as BlockComponent,
  hero: MinimalHero as BlockComponent,
  productGrid: MinimalProductGrid as BlockComponent,
  features: MinimalFeatures as BlockComponent,
  cta: MinimalCTA as BlockComponent,
  footer: MinimalFooter as BlockComponent,
};
