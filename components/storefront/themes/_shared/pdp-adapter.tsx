/**
 * Shared PDP adapter — factory only.
 *
 * IMPORTANT: this module must NOT carry the `'use client'` directive.
 * `lib/templates/registry.ts` is a server-rendered module that calls
 * `makePdpAdapter('06', '02')` inline at import time for ~30 themes;
 * marking this file as a client module turns those exports into
 * client-reference proxies and the call throws `TypeError: tB is not
 * a function` at `next build` page-data collection (failed the
 * DigitalOcean deploy on 2026-05-22).
 *
 * The actual component lives in `./pdp-adapter-core` with its own
 * `'use client'` directive. The factory here returns a thin wrapper
 * that renders `<PdpAdapterCore />` — no hooks at module level, so
 * the factory itself is safe to invoke server-side.
 *
 * `overview` + `review` params are kept for back-compat with the ~30
 * themes that already pass them (`makePdpAdapter('05', '04', palette)`)
 * but are informational only — same Thai/THB layout renders regardless.
 */

import React from 'react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { paletteToCssVars, type BlockPalette } from './palette';
import { PdpAdapterCore } from './pdp-adapter-core';

export type PdpPalette = BlockPalette;
export type OverviewVariant =
  | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
export type ReviewVariant = '02' | '03' | '04' | '05';

export function makePdpAdapter(
  _overview: OverviewVariant,
  _review: ReviewVariant,
  palette?: PdpPalette,
) {
  const style: React.CSSProperties | undefined = palette
    ? paletteToCssVars(palette)
    : undefined;

  return function PdpAdapter(props: ProductDetailProps) {
    return <PdpAdapterCore style={style} {...props} />;
  };
}
