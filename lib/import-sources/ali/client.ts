import type {
  AnnotatedSupplierProduct,
  SupplierClient,
  SupplierProduct,
  SupplierSearchQuery,
  SupplierSearchResult,
} from '../types';
import { quickIpScan } from '@/lib/import-pipeline/ip-filter';
import { mapSupplierCategories } from '@/lib/import-filters/categories';
import { getOverlapBatch } from '@/lib/import-marketplace/check';

/**
 * AliExpress Affiliate API client.
 * Real API docs: https://openservice.aliexpress.com/doc/doc.htm
 * Auth: HMAC-MD5 signed requests using AppSecret.
 * Current state: returns mock data.
 */

const APP_KEY = process.env.ALI_APP_KEY;
const APP_SECRET = process.env.ALI_APP_SECRET;
const USE_MOCK = !APP_KEY || !APP_SECRET;

export const aliClient: SupplierClient = {
  source: 'aliexpress',

  async search(query) {
    if (USE_MOCK) return mockSearch(query);
    // Real: aliexpress.affiliate.product.query with HMAC-MD5 signing
    throw new Error('Ali real API not implemented yet');
  },

  async getProduct(externalId) {
    if (USE_MOCK) return mockProducts.find((p) => p.externalId === externalId) ?? null;
    throw new Error('Ali real API not implemented yet');
  },

  async calculateLandedCost(product, qty) {
    const usdRate = 36;
    const shippingPerUnit = product.freeShipping ? 0 : 25;
    return product.costPrice * qty * usdRate + shippingPerUnit * qty;
  },
};

async function annotateProducts(products: SupplierProduct[]): Promise<AnnotatedSupplierProduct[]> {
  const overlapMap = await getOverlapBatch(
    products.map((p) => ({ source: p.source, externalId: p.externalId })),
  );
  return products.map((p) => {
    const ip = quickIpScan(p);
    const overlap = overlapMap.get(p.externalId);
    return {
      ...p,
      ipVerdict: ip.verdict,
      ipCategory: ip.category,
      ipReason: ip.reason,
      thaiCategorySlugs: mapSupplierCategories(p.supplierCategories ?? [], p.title),
      marketplaceStatus: overlap?.status,
      competitorCount: overlap?.competitorCount,
      lowestCompetitorPriceTHB: overlap?.lowestPriceTHB,
    };
  });
}

const mockProducts: SupplierProduct[] = [
  {
    externalId: 'ali_2001',
    source: 'aliexpress',
    sourceUrl: 'https://www.aliexpress.com/item/2001.html',
    title: 'Magnetic Phone Holder Car Mount Dashboard Strong N52 Magnet',
    description: 'Universal magnetic car phone holder, ultra-strong N52 magnet.',
    costPrice: 2.8,
    costCurrency: 'USD',
    listPrice: 9.99,
    images: ['https://picsum.photos/seed/ali1a/400/400', 'https://picsum.photos/seed/ali1b/400/400'],
    primaryImage: 'https://picsum.photos/seed/ali1a/400/400',
    variants: [],
    rating: 4.8,
    ratingCount: 12450,
    ordersCount: 45200,
    shippingDays: { min: 12, max: 25 },
    shippingFrom: 'China',
    freeShipping: true,
    supplierCategories: ['Automobiles & Motorcycles', 'Car Phone Holder', 'Car Accessories'],
    supplierTags: ['bestseller'],
  },
  {
    externalId: 'ali_2002',
    source: 'aliexpress',
    title: 'Korean Style Oversized Knit Sweater Women Vintage Pullover',
    description: 'Oversized Korean-style knit sweater.',
    costPrice: 12.5,
    costCurrency: 'USD',
    listPrice: 34.99,
    images: ['https://picsum.photos/seed/ali2a/400/400'],
    primaryImage: 'https://picsum.photos/seed/ali2a/400/400',
    variants: [
      { externalVariantId: 'ali_2002_beige_m', name: 'Beige M', attributes: { color: 'Beige', size: 'M' }, stock: 120 },
      { externalVariantId: 'ali_2002_beige_l', name: 'Beige L', attributes: { color: 'Beige', size: 'L' }, stock: 95 },
      { externalVariantId: 'ali_2002_brown_m', name: 'Brown M', attributes: { color: 'Brown', size: 'M' }, stock: 78 },
    ],
    rating: 4.6,
    ratingCount: 3210,
    ordersCount: 11800,
    shippingDays: { min: 10, max: 20 },
    shippingFrom: 'China',
    freeShipping: true,
    supplierCategories: ['Women Clothing', 'Women Sweater', 'Korean Fashion'],
  },
  {
    externalId: 'ali_2003',
    source: 'aliexpress',
    title: 'Pokemon Pikachu Plush Backpack Kids School Bag',
    description: 'Pokemon Pikachu plush backpack.',
    costPrice: 14.5,
    costCurrency: 'USD',
    listPrice: 39.99,
    images: ['https://picsum.photos/seed/ali3a/400/400'],
    primaryImage: 'https://picsum.photos/seed/ali3a/400/400',
    variants: [],
    rating: 4.4,
    ratingCount: 567,
    ordersCount: 1890,
    shippingDays: { min: 15, max: 30 },
    shippingFrom: 'China',
    supplierCategories: ['Bags', 'Kids Backpack'],
    supplierTags: ['licensed-character'],
  },
  {
    externalId: 'ali_2004',
    source: 'aliexpress',
    title: 'Silicone Baking Mat Set Non-Stick Reusable BPA Free',
    description: 'Set of 2 silicone baking mats, oven-safe to 230°C.',
    costPrice: 3.4,
    costCurrency: 'USD',
    listPrice: 11.99,
    images: ['https://picsum.photos/seed/ali4a/400/400'],
    primaryImage: 'https://picsum.photos/seed/ali4a/400/400',
    variants: [
      { externalVariantId: 'ali_2004_red', name: 'Red Set of 2', attributes: { color: 'Red' }, stock: 540 },
      { externalVariantId: 'ali_2004_blu', name: 'Blue Set of 2', attributes: { color: 'Blue' }, stock: 410 },
    ],
    rating: 4.9,
    ratingCount: 8920,
    ordersCount: 32100,
    shippingDays: { min: 8, max: 18 },
    shippingFrom: 'China',
    freeShipping: true,
    supplierCategories: ['Home & Garden', 'Baking Mat', 'Kitchen'],
    supplierTags: ['bestseller'],
  },
  {
    externalId: 'ali_2005',
    source: 'aliexpress',
    title: 'Vape Pen 5000 Puffs Disposable Mango Flavor',
    description: 'Disposable vape pen, 5000 puffs.',
    costPrice: 6.5,
    costCurrency: 'USD',
    listPrice: 18.99,
    images: ['https://picsum.photos/seed/ali5a/400/400'],
    primaryImage: 'https://picsum.photos/seed/ali5a/400/400',
    variants: [],
    rating: 4.5,
    ratingCount: 234,
    ordersCount: 5670,
    shippingDays: { min: 7, max: 14 },
    shippingFrom: 'Shenzhen',
    supplierCategories: ['Electronics'],
    supplierTags: ['vape'],
  },
  {
    externalId: 'ali_2006',
    source: 'aliexpress',
    title: 'Acrylic Cosmetic Storage Box Drawer Organizer Clear',
    description: 'Clear acrylic stackable drawer organizer.',
    costPrice: 5.9,
    costCurrency: 'USD',
    listPrice: 19.99,
    images: ['https://picsum.photos/seed/ali6a/400/400'],
    primaryImage: 'https://picsum.photos/seed/ali6a/400/400',
    variants: [],
    rating: 4.7,
    ratingCount: 1432,
    ordersCount: 4520,
    shippingDays: { min: 10, max: 20 },
    shippingFrom: 'China',
    freeShipping: true,
    supplierCategories: ['Home & Garden', 'Storage', 'Drawer Organizer', 'Cosmetic Storage'],
    supplierTags: ['tiktok-trending'],
  },
  {
    externalId: 'ali_2007',
    source: 'aliexpress',
    title: 'Yoga Mat Non Slip 6mm TPE Eco Friendly with Carry Strap',
    description: '6mm non-slip TPE yoga mat with carry strap.',
    costPrice: 8.9,
    costCurrency: 'USD',
    listPrice: 26.99,
    images: ['https://picsum.photos/seed/ali7a/400/400', 'https://picsum.photos/seed/ali7b/400/400'],
    primaryImage: 'https://picsum.photos/seed/ali7a/400/400',
    variants: [
      { externalVariantId: 'ali_2007_purp', name: 'Purple', attributes: { color: 'Purple' }, stock: 320 },
      { externalVariantId: 'ali_2007_pink', name: 'Pink', attributes: { color: 'Pink' }, stock: 280 },
      { externalVariantId: 'ali_2007_blue', name: 'Blue', attributes: { color: 'Blue' }, stock: 240 },
    ],
    rating: 4.8,
    ratingCount: 6740,
    ordersCount: 21800,
    shippingDays: { min: 10, max: 18 },
    shippingFrom: 'China',
    freeShipping: true,
    supplierCategories: ['Sports', 'Yoga', 'Yoga Mat'],
    supplierTags: ['bestseller', 'trending'],
  },
];

async function mockSearch(query: SupplierSearchQuery): Promise<SupplierSearchResult> {
  const kw = query.keyword.toLowerCase();
  let filtered = kw
    ? mockProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.supplierCategories?.some((c) => c.toLowerCase().includes(kw)) ||
          p.supplierTags?.some((t) => t.toLowerCase().includes(kw)),
      )
    : [...mockProducts];

  let result = await annotateProducts(filtered);

  if (query.minPrice !== undefined) result = result.filter((p) => p.costPrice >= query.minPrice!);
  if (query.maxPrice !== undefined) result = result.filter((p) => p.costPrice <= query.maxPrice!);
  if (query.minRating) result = result.filter((p) => (p.rating ?? 0) >= query.minRating!);
  if (query.minOrders) result = result.filter((p) => (p.ordersCount ?? 0) >= query.minOrders!);
  if (query.freeShipping) result = result.filter((p) => p.freeShipping);
  if (query.shipFromTH) result = result.filter((p) => p.shippingFrom?.toLowerCase().includes('thailand'));
  if (query.maxShippingDays) {
    result = result.filter((p) => (p.shippingDays?.max ?? Infinity) <= query.maxShippingDays!);
  }
  if (query.hasVariants) result = result.filter((p) => p.variants.length > 0);
  if (query.hasMultipleImages) result = result.filter((p) => p.images.length > 1);

  if (query.thaiCategories && query.thaiCategories.length > 0) {
    const selected = query.thaiCategories;
    result = result.filter((p) =>
      p.thaiCategorySlugs.some((slug) =>
        selected.some((sel) => slug === sel || slug.startsWith(sel + '-')),
      ),
    );
  }

  if (query.marketplaceStatus && query.marketplaceStatus.length > 0) {
    const allowed = query.marketplaceStatus;
    result = result.filter((p) => p.marketplaceStatus && allowed.includes(p.marketplaceStatus));
  }

  switch (query.sortBy) {
    case 'orders':
      result = [...result].sort((a, b) => (b.ordersCount ?? 0) - (a.ordersCount ?? 0));
      break;
    case 'price_asc':
      result = [...result].sort((a, b) => a.costPrice - b.costPrice);
      break;
    case 'price_desc':
      result = [...result].sort((a, b) => b.costPrice - a.costPrice);
      break;
    case 'rating':
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
  }

  return { products: result.slice(0, query.limit ?? 20), totalCount: result.length };
}
