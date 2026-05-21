'use client';

/**
 * CatalogBridge — client component that reconstructs buildUrl/buildSortUrl
 * from pre-computed URL maps received as serializable props.
 *
 * Server components can't pass functions to client components across the
 * RSC boundary. This bridge receives plain-object URL maps from the server
 * and reconstructs the function interface that bespoke catalog adapters
 * (bikini-beach, eco-pack, mega-store) expect.
 */

import type { ComponentType } from 'react';
import type { CatalogProps } from '@/lib/templates/types';

interface CatalogBridgeProps {
  Component: ComponentType<CatalogProps>;
  store: CatalogProps['store'];
  pageProducts: CatalogProps['pageProducts'];
  categoryNames: CatalogProps['categoryNames'];
  categoryCounts: CatalogProps['categoryCounts'];
  selectedCats: CatalogProps['selectedCats'];
  sortKey: CatalogProps['sortKey'];
  currentPage: CatalogProps['currentPage'];
  totalPages: CatalogProps['totalPages'];
  filteredCount: CatalogProps['filteredCount'];
  /** Pre-computed: categoryName → toggle-URL */
  catToggleUrls: Record<string, string>;
  /** Pre-computed: URL when all filters cleared */
  clearUrl: string;
  /** Pre-computed: sortKey → URL */
  sortUrls: Record<string, string>;
  /** Pre-computed: pageNumber → URL */
  pageUrls: Record<string, string>;
}

export function CatalogBridge({
  Component,
  catToggleUrls,
  clearUrl,
  sortUrls,
  pageUrls,
  ...rest
}: CatalogBridgeProps) {
  // Reconstruct the function interface from pre-computed maps.
  const buildUrl = (toggleCat?: string, page?: number): string => {
    if (page) return pageUrls[String(page)] ?? clearUrl;
    if (toggleCat) return catToggleUrls[toggleCat] ?? clearUrl;
    return clearUrl;
  };
  const buildSortUrl = (sort: string): string => {
    return sortUrls[sort] ?? clearUrl;
  };

  return (
    <Component
      {...rest}
      buildUrl={buildUrl}
      buildSortUrl={buildSortUrl}
    />
  );
}
