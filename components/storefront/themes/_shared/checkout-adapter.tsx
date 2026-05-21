'use client';

/**
 * Shared checkout adapter — bridges CheckoutProps from the storefront
 * to shadcn-studio checkout-page blocks (01, 02, 04).
 */

import React, { lazy, Suspense } from 'react';

const checkoutVariants = {
  '01': lazy(() => import('@/components/shadcn-studio/blocks/checkout-page-01/checkout-page-01')),
  '02': lazy(() => import('@/components/shadcn-studio/blocks/checkout-page-02/checkout-page-02')),
  '04': lazy(() => import('@/components/shadcn-studio/blocks/checkout-page-04/checkout-page-04')),
} as const;

export type CheckoutVariant = keyof typeof checkoutVariants;

interface CheckoutItem {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl?: string | null;
  quantity: number;
  variantLabel?: string | null;
}

export interface CheckoutAdapterProps {
  store: { slug: string; name: string };
  items: CheckoutItem[];
}

function toBlockItems(items: CheckoutItem[]) {
  return items.map((item, i) => ({
    id: i + 1,
    name: item.title,
    variant: item.variantLabel ?? 'Standard',
    price: item.priceTHB,
    image: item.imageUrl ?? 'https://placehold.co/200x200/f4f4f5/a1a1aa?text=No+Image',
  }));
}

export function makeCheckoutAdapter(variant: CheckoutVariant) {
  return function CheckoutPage(props: CheckoutAdapterProps) {
    const Block = checkoutVariants[variant];
    const blockItems = toBlockItems(props.items);

    if (variant === '02') {
      // checkout-02 uses paymentMethods prop
      return (
        <Suspense fallback={<div className="h-48" />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Block paymentMethods={{} as any} {...({} as any)} />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<div className="h-48" />}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Block checkoutItems={blockItems as any} {...({} as any)} />
      </Suspense>
    );
  };
}
