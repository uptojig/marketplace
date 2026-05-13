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

const API_BASE = process.env.CJ_API_BASE ?? 'https://developers.cjdropshipping.com/api2.0/v1';
const API_TOKEN = process.env.CJ_API_TOKEN;
const USE_MOCK = !API_TOKEN;

export const cjClient: SupplierClient = {
  source: 'cj',

  async search(query) {
    if (USE_MOCK) return mockSearch(query);

    const params = new URLSearchParams({
      productName: query.keyword,
      pageSize: String(query.limit ?? 20),
      pageNum: query.cursor ?? '1',
    });
    if (query.minPrice) params.set('priceMin', String(query.minPrice));
    if (query.maxPrice) params.set('priceMax', String(query.maxPrice));

    const res = await fetch(`${API_BASE}/product/list?${params}`, {
      headers: { 'CJ-Access-Token': API_TOKEN! },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`CJ search failed: ${res.status}`);
    const data = await res.json();
    const products = (data.data?.list ?? []).map(normalizeCjProduct);
    return {
      products: await annotateProducts(products),
      totalCount: data.data?.total,
      nextCursor: data.data?.pageNum ? String(data.data.pageNum + 1) : undefined,
    };
  },

  async getProduct(externalId) {
    if (USE_MOCK) return mockProducts.find((p) => p.externalId === externalId) ?? null;
    const res = await fetch(`${API_BASE}/product/query?pid=${externalId}`, {
      headers: { 'CJ-Access-Token': API_TOKEN! },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ? normalizeCjProduct(data.data) : null;
  },

  async calculateLandedCost(product, qty) {
    const usdRate = 36;
    const shippingPerUnit = 15;
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

function normalizeCjProduct(raw: Record<string, unknown>): SupplierProduct {
  return {
    externalId: String(raw.pid),
    source: 'cj',
    sourceUrl: `https://www.cjdropshipping.com/product/${raw.pid}`,
    title: String(raw.productNameEn ?? raw.productName ?? ''),
    description: String(raw.description ?? ''),
    costPrice: Number(raw.sellPrice ?? 0),
    costCurrency: 'USD',
    listPrice: Number(raw.sellPrice ?? 0) * 2,
    images: Array.isArray(raw.productImage) ? (raw.productImage as string[]) : [],
    primaryImage: String(
      (Array.isArray(raw.productImage) && raw.productImage[0]) || raw.productImage || '',
    ),
    variants: [],
    rating: Number(raw.rate ?? 0),
    ratingCount: Number(raw.reviewCount ?? 0),
    ordersCount: Number(raw.salesCount ?? 0),
    shippingDays: { min: 7, max: 15 },
    shippingFrom: String(raw.fromWarehouse ?? 'China'),
    supplierCategories: raw.categoryName ? [String(raw.categoryName)] : [],
    rawData: raw,
  };
}

// Mock catalog
const mockProducts: SupplierProduct[] = [
  {
    externalId: 'cj_1001',
    source: 'cj',
    sourceUrl: 'https://www.cjdropshipping.com/product/cj_1001',
    title: 'Bluetooth 5.3 Wireless Earbuds with ENC Noise Cancelling Mic',
    description: 'TWS earbuds with active noise cancelling, 35h playback, IPX5.',
    costPrice: 8.5,
    costCurrency: 'USD',
    listPrice: 24.99,
    images: [
      'https://picsum.photos/seed/cj1a/400/400',
      'https://picsum.photos/seed/cj1b/400/400',
      'https://picsum.photos/seed/cj1c/400/400',
    ],
    primaryImage: 'https://picsum.photos/seed/cj1a/400/400',
    variants: [
      { externalVariantId: 'cj_1001_black', name: 'Black', attributes: { color: 'Black' }, stock: 850 },
      { externalVariantId: 'cj_1001_white', name: 'White', attributes: { color: 'White' }, stock: 620 },
    ],
    rating: 4.7,
    ratingCount: 1842,
    ordersCount: 8540,
    shippingDays: { min: 7, max: 14 },
    shippingFrom: 'Guangzhou Warehouse',
    freeShipping: false,
    supplierCategories: ['Consumer Electronics', 'Audio'],
    supplierTags: ['bestseller'],
  },
  {
    externalId: 'cj_1002',
    source: 'cj',
    title: 'Foldable Aluminum Laptop Stand Adjustable Ergonomic',
    description: 'Heat-dissipating aluminum laptop stand, 6-level height, fits 11-17 inch.',
    costPrice: 4.2,
    costCurrency: 'USD',
    listPrice: 12.99,
    images: ['https://picsum.photos/seed/cj2a/400/400'],
    primaryImage: 'https://picsum.photos/seed/cj2a/400/400',
    variants: [
      { externalVariantId: 'cj_1002_sg', name: 'Silver/Gray', attributes: { color: 'Silver' }, stock: 320 },
      { externalVariantId: 'cj_1002_bk', name: 'Black', attributes: { color: 'Black' }, stock: 410 },
    ],
    rating: 4.8,
    ratingCount: 967,
    ordersCount: 3120,
    shippingDays: { min: 5, max: 10 },
    shippingFrom: 'Thailand Warehouse',
    freeShipping: true,
    supplierCategories: ['Office', 'Laptop Stand', 'Accessories'],
  },
  {
    externalId: 'cj_1003',
    source: 'cj',
    title: 'Disney Mickey Mouse Plush Toy 30cm Soft Cotton',
    description: 'Officially licensed Disney Mickey Mouse plush.',
    costPrice: 6.8,
    costCurrency: 'USD',
    listPrice: 19.99,
    images: ['https://picsum.photos/seed/cj3a/400/400'],
    primaryImage: 'https://picsum.photos/seed/cj3a/400/400',
    variants: [],
    rating: 4.5,
    ratingCount: 234,
    ordersCount: 890,
    shippingDays: { min: 10, max: 20 },
    shippingFrom: 'Yiwu Warehouse',
    supplierCategories: ['Toys', 'Plush'],
    supplierTags: ['licensed-character'],
  },
  {
    externalId: 'cj_1004',
    source: 'cj',
    title: 'Stainless Steel Vacuum Insulated Water Bottle 750ml',
    description: 'Double-wall vacuum insulated water bottle.',
    costPrice: 5.5,
    costCurrency: 'USD',
    listPrice: 17.99,
    images: ['https://picsum.photos/seed/cj4a/400/400', 'https://picsum.photos/seed/cj4b/400/400'],
    primaryImage: 'https://picsum.photos/seed/cj4a/400/400',
    variants: [
      { externalVariantId: 'cj_1004_navy', name: 'Navy 750ml', attributes: { color: 'Navy', size: '750ml' }, stock: 580 },
      { externalVariantId: 'cj_1004_olive', name: 'Olive 750ml', attributes: { color: 'Olive', size: '750ml' }, stock: 420 },
      { externalVariantId: 'cj_1004_sand', name: 'Sand 500ml', attributes: { color: 'Sand', size: '500ml' }, stock: 720 },
    ],
    rating: 4.9,
    ratingCount: 5421,
    ordersCount: 28930,
    shippingDays: { min: 6, max: 12 },
    shippingFrom: 'Shenzhen Warehouse',
    freeShipping: true,
    supplierCategories: ['Home & Garden', 'Drinkware', 'Water Bottle'],
    supplierTags: ['bestseller', 'trending'],
  },
  {
    externalId: 'cj_1005',
    source: 'cj',
    title: 'LED Ring Light 10 inch with Tripod Stand for Phone',
    description: '10-inch dimmable LED ring light, 3 modes, 10 brightness levels.',
    costPrice: 11.2,
    costCurrency: 'USD',
    listPrice: 32.99,
    images: ['https://picsum.photos/seed/cj5a/400/400'],
    primaryImage: 'https://picsum.photos/seed/cj5a/400/400',
    variants: [],
    rating: 4.6,
    ratingCount: 712,
    ordersCount: 2310,
    shippingDays: { min: 8, max: 15 },
    shippingFrom: 'Guangzhou Warehouse',
    supplierCategories: ['Consumer Electronics', 'Photo & Video', 'Ring Light'],
    supplierTags: ['tiktok-trending'],
  },
  {
    externalId: 'cj_1006',
    source: 'cj',
    title: 'Nike Air Max Replica Sneakers Men Women Running Shoes',
    description: 'High quality replica Nike Air Max style sneakers.',
    costPrice: 18.0,
    costCurrency: 'USD',
    listPrice: 45.0,
    images: ['https://picsum.photos/seed/cj6a/400/400'],
    primaryImage: 'https://picsum.photos/seed/cj6a/400/400',
    variants: [],
    rating: 4.3,
    ratingCount: 89,
    ordersCount: 450,
    shippingDays: { min: 10, max: 18 },
    shippingFrom: 'Putian Warehouse',
    supplierCategories: ['Shoes', 'Sneakers'],
    supplierTags: ['replica'],
  },
  {
    externalId: 'cj_1007',
    source: 'cj',
    title: 'Acrylic Stackable Drawer Organizer Storage Box',
    description: 'Clear acrylic stackable drawer organizer.',
    costPrice: 5.9,
    costCurrency: 'USD',
    listPrice: 19.99,
    images: ['https://picsum.photos/seed/cj7a/400/400'],
    primaryImage: 'https://picsum.photos/seed/cj7a/400/400',
    variants: [
      { externalVariantId: 'cj_1007_s', name: 'Small', attributes: { size: 'S' }, stock: 200 },
      { externalVariantId: 'cj_1007_m', name: 'Medium', attributes: { size: 'M' }, stock: 180 },
    ],
    rating: 4.7,
    ratingCount: 1432,
    ordersCount: 4520,
    shippingDays: { min: 10, max: 20 },
    shippingFrom: 'China',
    freeShipping: true,
    supplierCategories: ['Home & Garden', 'Storage', 'Drawer Organizer'],
    supplierTags: ['tiktok-trending'],
  },
  {
    externalId: 'cj_1008',
    source: 'cj',
    title: 'Resistance Bands Set 5 Levels with Door Anchor Workout',
    description: 'Set of 5 resistance bands for full body workout.',
    costPrice: 7.2,
    costCurrency: 'USD',
    listPrice: 22.99,
    images: ['https://picsum.photos/seed/cj8a/400/400'],
    primaryImage: 'https://picsum.photos/seed/cj8a/400/400',
    variants: [],
    rating: 4.7,
    ratingCount: 3210,
    ordersCount: 12400,
    shippingDays: { min: 7, max: 14 },
    shippingFrom: 'Thailand Warehouse',
    freeShipping: true,
    supplierCategories: ['Sports', 'Fitness', 'Resistance Bands', 'Workout'],
    supplierTags: ['bestseller'],
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

  // Annotate first — frontend wants IP + Thai cat + overlap info on every result
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
