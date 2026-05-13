import type { ImportSource, MarketplaceStatus } from '@/lib/import-sources/types';

/**
 * Comprehensive filter state for product search.
 * Extends SupplierSearchQuery with frontend-only filters (IP safety, margin)
 * that are applied AFTER search via post-processing.
 */
export interface FilterState {
  // ----- Search params -----
  source: ImportSource;
  keyword: string;

  // ----- Price -----
  minPriceUSD: number;
  maxPriceUSD: number;
  /** Minimum acceptable markup multiplier (cost × N = sell price) */
  minMarginX: number;

  // ----- Quality signals -----
  minRating: number;
  minOrders: number;
  hasVariants: boolean;
  hasMultipleImages: boolean;

  // ----- Shipping -----
  freeShipping: boolean;
  shipFromTH: boolean;
  maxShippingDays: number;

  // ----- Categories (Thai standard slugs) -----
  selectedCategories: string[];

  // ----- Marketplace overlap -----
  marketplaceStatusFilter: MarketplaceStatus[];

  // ----- IP safety (post-search, client-side) -----
  hideRejected: boolean;
  hideFlagged: boolean;
  excludeTags: string[];

  // ----- Sort -----
  sortBy: 'relevance' | 'orders' | 'price_asc' | 'price_desc' | 'rating' | 'margin';
}

export const DEFAULT_FILTERS: FilterState = {
  source: 'cj',
  keyword: '',
  minPriceUSD: 0,
  maxPriceUSD: 100,
  minMarginX: 2,
  minRating: 0,
  minOrders: 0,
  hasVariants: false,
  hasMultipleImages: false,
  freeShipping: false,
  shipFromTH: false,
  maxShippingDays: 30,
  selectedCategories: [],
  marketplaceStatusFilter: [],
  hideRejected: true,
  hideFlagged: false,
  excludeTags: [],
  sortBy: 'orders',
};

export interface SavedPreset {
  id: string;
  name: string;
  filters: Omit<FilterState, 'keyword'>;
  createdAt: string;
  lastUsedAt: string;
}

export function getActiveFilterCount(f: FilterState): number {
  let count = 0;
  if (f.minPriceUSD > 0) count++;
  if (f.maxPriceUSD < 100) count++;
  if (f.minMarginX > 2) count++;
  if (f.minRating > 0) count++;
  if (f.minOrders > 0) count++;
  if (f.hasVariants) count++;
  if (f.hasMultipleImages) count++;
  if (f.freeShipping) count++;
  if (f.shipFromTH) count++;
  if (f.maxShippingDays < 30) count++;
  count += f.selectedCategories.length;
  count += f.marketplaceStatusFilter.length;
  if (!f.hideRejected) count++;
  if (f.hideFlagged) count++;
  count += f.excludeTags.length;
  return count;
}
