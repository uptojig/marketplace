/**
 * Shared cart adapter — bridges CartProps from the storefront
 * to shadcn-studio shopping-cart blocks (01–04).
 */

import React, { lazy, Suspense } from 'react';
import { paletteToCssVars, type BlockPalette } from './palette';

const cartVariants = {
  '01': lazy(() => import('@/components/shadcn-studio/blocks/shopping-cart-01/shopping-cart-01')),
  '02': lazy(() => import('@/components/shadcn-studio/blocks/shopping-cart-02/shopping-cart-02')),
  '03': lazy(() => import('@/components/shadcn-studio/blocks/shopping-cart-03/shopping-cart-03')),
  '04': lazy(() => import('@/components/shadcn-studio/blocks/shopping-cart-04/shopping-cart-04')),
} as const;

export type CartVariant = keyof typeof cartVariants;
export type CartPalette = BlockPalette;

interface CartItem {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl?: string | null;
  quantity: number;
  variantLabel?: string | null;
}

export interface CartAdapterProps {
  store: { slug: string; name: string };
  items: CartItem[];
}

function toBlockItems(items: CartItem[]) {
  return items.map((item, i) => ({
    id: i + 1,
    name: item.title,
    size: item.variantLabel ?? 'Standard',
    price: item.priceTHB,
    image: item.imageUrl ?? 'https://placehold.co/200x200/f4f4f5/a1a1aa?text=No+Image',
  }));
}

export function makeCartAdapter(variant: CartVariant, palette?: CartPalette) {
  const style = palette ? paletteToCssVars(palette) : undefined;

  return function CartPage(props: CartAdapterProps) {
    const Block = cartVariants[variant];
    const blockItems = toBlockItems(props.items);

    const content = (
      <Suspense fallback={<div className="h-48" />}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Block cartItems={blockItems as any} {...({} as any)} />
      </Suspense>
    );

    return style ? <div style={style}>{content}</div> : content;
  };
}
