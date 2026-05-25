import React from 'react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { PdpClientComponent, type PdpPalette, type OverviewVariant, type ReviewVariant } from './pdp-client';

export type { PdpPalette, OverviewVariant, ReviewVariant };

export function makePdpAdapter(
  overview: OverviewVariant,
  review: ReviewVariant,
  palette?: PdpPalette,
) {
  return function PdpAdapter(props: ProductDetailProps) {
    return (
      <PdpClientComponent
        {...props}
        overview={overview}
        review={review}
        palette={palette}
      />
    );
  };
}
