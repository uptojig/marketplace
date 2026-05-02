import type { ComponentType } from "react";
import { CuteCTA } from "./CTA";
import { CuteFeatures } from "./Features";
import { CuteFooter } from "./Footer";
import { CuteHero } from "./Hero";
import { CuteNav } from "./Nav";
import { CuteProductGrid } from "./ProductGrid";

export type BlockComponent = ComponentType<{ content: Record<string, unknown> }>;

/**
 * Cute / FurryHappiness theme. Pet-shop palette (pink + rose) with
 * rounded corners and soft shadows.
 */
export const cuteRegistry: Record<string, BlockComponent> = {
  nav: CuteNav as BlockComponent,
  hero: CuteHero as BlockComponent,
  productGrid: CuteProductGrid as BlockComponent,
  features: CuteFeatures as BlockComponent,
  cta: CuteCTA as BlockComponent,
  footer: CuteFooter as BlockComponent,
};
