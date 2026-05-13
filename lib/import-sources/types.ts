/**
 * Common types for supplier products across CJ, AliExpress, Alibaba, etc.
 */

export type ImportSource = 'cj' | 'aliexpress' | 'alibaba' | 'banggood';

export type IpVerdict = 'ACCEPTED' | 'FLAGGED' | 'REJECTED';

export type IpCategory =
  | 'brand_counterfeit'
  | 'copyrighted_character'
  | 'regulated_substance'
  | 'weapon'
  | 'adult_content'
  | 'animal_welfare'
  | 'health_claim';

export type MarketplaceStatus =
  | 'not_selling'
  | 'low_competition'
  | 'moderate_competition'
  | 'saturated';

export interface SupplierProduct {
  externalId: string;
  source: ImportSource;
  sourceUrl?: string;
  title: string;
  description?: string;
  costPrice: number;
  costCurrency: 'USD' | 'CNY' | 'THB';
  listPrice?: number;
  images: string[];
  primaryImage: string;
  variants: SupplierVariant[];
  rating?: number;
  ratingCount?: number;
  ordersCount?: number;
  shippingDays?: { min: number; max: number };
  shippingFrom?: string;
  freeShipping?: boolean;
  supplierCategories?: string[];
  supplierTags?: string[];
  rawData?: Record<string, unknown>;
}

export interface AnnotatedSupplierProduct extends SupplierProduct {
  ipVerdict: IpVerdict;
  ipCategory?: IpCategory;
  ipReason?: string;
  thaiCategorySlugs: string[];
  /** Marketplace overlap from products table */
  marketplaceStatus?: MarketplaceStatus;
  competitorCount?: number;
  lowestCompetitorPriceTHB?: number;
}

export interface SupplierVariant {
  externalVariantId: string;
  name: string;
  attributes: Record<string, string>;
  price?: number;
  stock?: number;
  sku?: string;
  image?: string;
}

export interface SupplierSearchQuery {
  keyword: string;
  source: ImportSource;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minOrders?: number;
  minReviewCount?: number;
  freeShipping?: boolean;
  shipFromTH?: boolean;
  maxShippingDays?: number;
  hasVariants?: boolean;
  hasMultipleImages?: boolean;
  thaiCategories?: string[];
  marketplaceStatus?: MarketplaceStatus[];
  hideIpRejected?: boolean;
  hideIpFlagged?: boolean;
  excludeIpCategories?: IpCategory[];
  includeTags?: string[];
  excludeTags?: string[];
  sortBy?: 'relevance' | 'orders' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  limit?: number;
  cursor?: string;
}

export interface SupplierSearchResult {
  products: AnnotatedSupplierProduct[];
  totalCount?: number;
  nextCursor?: string;
}

export interface SupplierClient {
  source: ImportSource;
  search(query: SupplierSearchQuery): Promise<SupplierSearchResult>;
  getProduct(externalId: string): Promise<SupplierProduct | null>;
  calculateLandedCost(product: SupplierProduct, qty: number): Promise<number>;
}
