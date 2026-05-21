/**
 * Homepage enhancer — wraps an existing homepage component and appends
 * a shadcn product-list block section beneath it.
 *
 * This lets every template's homepage gain a premium product grid
 * without modifying the original component.
 */

import React from 'react';
import type { HomepageProps } from '@/lib/templates/types';
import {
  makeProductListSection,
  type ProductListVariant,
} from './product-list-adapter';
import type { ComponentType } from 'react';

export function enhanceHomepage(
  OriginalHomepage: ComponentType<HomepageProps>,
  variant: ProductListVariant,
) {
  const ProductListSection = makeProductListSection(variant);

  return function EnhancedHomepage(props: HomepageProps) {
    return (
      <>
        <OriginalHomepage {...props} />
        <ProductListSection
          products={props.products}
          storeSlug={props.store.slug}
        />
      </>
    );
  };
}
