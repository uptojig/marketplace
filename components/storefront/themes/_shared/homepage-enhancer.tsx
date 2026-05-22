/**
 * Homepage enhancer — wraps an existing homepage component and appends
 * a shadcn product-list block section beneath it.
 *
 * This lets every template's homepage gain a premium product grid
 * without modifying the original component.
 *
 * The appended block reads shadcn semantic tokens (--background,
 * --muted, --primary, ...). Templates whose chrome is hardcoded
 * outside the --shop-* cascade (e.g. talad-see-sod's red/orange
 * palette) can pass a `palette` override so the trailing section
 * blends with the rest of the page instead of falling back to the
 * default shop tokens.
 */

import React from 'react';
import type { HomepageProps } from '@/lib/templates/types';
import {
  makeProductListSection,
  type ProductListVariant,
} from './product-list-adapter';
import type { ComponentType, CSSProperties } from 'react';

export interface ProductListPalette {
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

function paletteToCssVars(p: ProductListPalette): CSSProperties {
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

export function enhanceHomepage(
  OriginalHomepage: ComponentType<HomepageProps>,
  variant: ProductListVariant,
  palette?: ProductListPalette,
) {
  const ProductListSection = makeProductListSection(variant);
  const style = palette ? paletteToCssVars(palette) : undefined;

  return function EnhancedHomepage(props: HomepageProps) {
    const section = (
      <ProductListSection
        products={props.products}
        storeSlug={props.store.slug}
      />
    );

    return (
      <>
        <OriginalHomepage {...props} />
        {style ? <div style={style}>{section}</div> : section}
      </>
    );
  };
}
