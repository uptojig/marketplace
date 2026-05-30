/**
 * Shared PDP adapter — Thai/THB bespoke product detail page.
 *
 * IMPORTANT: this module must NOT be `'use client'`. lib/templates/registry.ts
 * builds its `templates` map at module top-level and CALLS `makePdpAdapter(...)`
 * there. registry is reachable from server modules (e.g. /api/admin/stores →
 * lib/store/template-fields → registry), so if the factory lived in a client
 * module the call resolved to a client-reference proxy and threw
 * "TypeError: tN is not a function" while collecting page data — breaking every
 * build (and every storefront route that renders these ~30 themes). The actual
 * rendering component (which needs useState/useCart) lives in the sibling
 * `'use client'` module pdp-adapter-view.tsx; this factory just renders it as
 * JSX, the normal server→client boundary.
 *
 * History: this used to wrap shadcn-studio's `product-overview-0X` +
 * `product-reviews-0X` blocks. Those expected a different data shape than
 * `ProductDetailProps`, so the block hit `.toFixed` / `.map` on `undefined`
 * and crashed `/products/<id>` on ~30 themes. The PDP now renders a
 * self-contained Thai/THB layout from `ProductDetailProps`. Themes that want a
 * fully bespoke layout (talad-see-sod, brutalist-thai) still register their own
 * component under `pages.pdp` and are untouched.
 *
 * `overview` / `review` params are kept for back-compat with existing imports
 * (`makePdpAdapter('05', '04', PALETTE)`) but are informational only — the same
 * component renders for every variant.
 */

import type React from 'react';
import { paletteToCssVars, type BlockPalette } from './palette';
import type { ProductDetailProps } from '@/lib/templates/types';
import { PdpAdapterView } from './pdp-adapter-view';

export type PdpPalette = BlockPalette;
export type OverviewVariant =
  | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
export type ReviewVariant = '02' | '03' | '04' | '05';

export interface PdpAdapterOptions {
  /** How the hero / thumbnail / related images sit inside their square
   *  containers. Default `'cover'` (legacy: fills + crops to fit, ideal
   *  for product photography on uniform backgrounds). Pass `'contain'`
   *  for storefronts whose imageUrl is marketing artwork with text and
   *  device mockups at the edges (mu-wallpaper-th covers, salepage
   *  hero composites, …) — `cover` would crop the readable parts. */
  imageFit?: 'cover' | 'contain';
}

export function makePdpAdapter(
  _overview: OverviewVariant,
  _review: ReviewVariant,
  palette?: PdpPalette,
  options?: PdpAdapterOptions,
) {
  const style: React.CSSProperties = {
    ...(palette ? paletteToCssVars(palette) : {}),
  };
  const imageFit = options?.imageFit ?? 'cover';

  return function PdpAdapter(props: ProductDetailProps) {
    return <PdpAdapterView data={props} style={style} imageFit={imageFit} />;
  };
}
