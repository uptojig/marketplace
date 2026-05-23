/**
 * Shared cart adapter — Thai/THB bespoke cart shared across every
 * non-bespoke theme.
 *
 * IMPORTANT: this module must NOT be `'use client'`. lib/templates/registry.ts
 * CALLS `makeCartAdapter(...)` at module top-level while building its
 * `templates` map, and registry is reachable from server modules (e.g.
 * /api/admin/stores → lib/store/template-fields → registry). If the factory
 * lived in a client module the call resolved to a client-reference proxy and
 * threw "TypeError: rS is not a function" while collecting page data —
 * breaking every build (same pattern that broke pdp-adapter; see commit
 * 6122a97). The actual rendering component (which needs useState/useCart and
 * the /api/coupons/preview fetch flow) lives in the sibling `'use client'`
 * module cart-adapter-view.tsx; this factory just renders it as JSX, the
 * normal server→client boundary.
 *
 * History: this used to wrap shadcn-studio's `shopping-cart-01..04`
 * blocks (with hardcoded English labels + USD prices) and pass it
 * `items={[]}` from the server. Buyers ended up at "Your cart is
 * empty / Refresh the page to restore items" no matter what they
 * had added. Now the adapter reads line items + applied coupons
 * straight from `useCart` (zustand, persisted to localStorage,
 * scoped per-store-slug) and renders a clean Thai/THB layout that
 * picks up palette CSS variables so each theme can tint itself.
 *
 * The `variant` param is kept for back-compat with the ~31 themes
 * that call `makeCartAdapter('01' | '02' | '03' | '04', palette)`
 * but is informational only — same cart structure renders for
 * every variant. Themes that want a fully bespoke cart layout
 * (talad-see-sod, brutalist-thai) still register their own
 * component under `pages.cart`.
 */

import type React from 'react';
import { paletteToCssVars, type BlockPalette } from './palette';
import { CartAdapterView } from './cart-adapter-view';

// Variant labels kept around so existing theme imports still type-check.
export type CartVariant = '01' | '02' | '03' | '04';
export type CartPalette = BlockPalette;

interface AdapterItem {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl?: string | null;
  quantity: number;
  variantLabel?: string | null;
}

export interface CartAdapterProps {
  // The route still spreads items+store onto the cart component for
  // back-compat with the older shadcn-block wrapper. We ignore the
  // server-side items and read from zustand instead — see the file
  // header for the why.
  store: { id?: string; slug: string; name: string };
  items: AdapterItem[];
}

export function makeCartAdapter(_variant: CartVariant, palette?: CartPalette) {
  const style: React.CSSProperties = {
    ...(palette ? paletteToCssVars(palette) : {}),
  };

  return function CartPage({ store }: CartAdapterProps) {
    return <CartAdapterView store={store} style={style} />;
  };
}
