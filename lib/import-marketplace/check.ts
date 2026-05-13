'use server';

import type { ImportSource } from '@/lib/import-sources/types';

/**
 * Checks whether a supplier product (externalId) is already being sold
 * in Basketplace by other sellers. Used to:
 *   1. Show competitor count badge on search results
 *   2. Filter "ยังไม่มีคนขาย" vs "ขายแล้ว N ร้าน"
 *
 * Real impl: SQL query against `products` table.
 *   SELECT store_id, store_name, COUNT(*)
 *   FROM products
 *   WHERE source_origin = ? AND source_external_id = ? AND is_active = true
 *   GROUP BY store_id;
 *
 * Requires schema additions to products table:
 *   ALTER TABLE products ADD COLUMN source_origin import_source;
 *   ALTER TABLE products ADD COLUMN source_external_id TEXT;
 *   CREATE INDEX products_source_idx ON products(source_origin, source_external_id);
 */

export type MarketplaceStatus =
  | 'not_selling' // 0 stores
  | 'low_competition' // 1-2 stores
  | 'moderate_competition' // 3-5 stores
  | 'saturated'; // 6+ stores

export interface MarketplaceOverlap {
  externalId: string;
  source: ImportSource;
  status: MarketplaceStatus;
  competitorCount: number;
  competitorStores?: Array<{ id: string; name: string; avgPrice?: number }>;
  /** Most competitive listing's price in THB — undercut hint */
  lowestPriceTHB?: number;
}

// Mock overlap data — keyed by externalId
// In production: dynamic query, cache 1hr
const MOCK_OVERLAPS: Record<string, MarketplaceOverlap> = {
  cj_1001: {
    externalId: 'cj_1001',
    source: 'cj',
    status: 'moderate_competition',
    competitorCount: 4,
    competitorStores: [
      { id: 'store_1', name: 'Audio House BKK', avgPrice: 899 },
      { id: 'store_88', name: 'TechSphere', avgPrice: 990 },
      { id: 'store_42', name: 'SoundMate', avgPrice: 1290 },
      { id: 'store_15', name: 'Gizmo Plus', avgPrice: 850 },
    ],
    lowestPriceTHB: 850,
  },
  cj_1002: {
    externalId: 'cj_1002',
    source: 'cj',
    status: 'not_selling',
    competitorCount: 0,
  },
  cj_1003: {
    externalId: 'cj_1003',
    source: 'cj',
    status: 'low_competition',
    competitorCount: 2,
    competitorStores: [
      { id: 'store_99', name: 'KidsZone', avgPrice: 599 },
      { id: 'store_71', name: 'CharacterShop', avgPrice: 650 },
    ],
    lowestPriceTHB: 599,
  },
  cj_1004: {
    externalId: 'cj_1004',
    source: 'cj',
    status: 'saturated',
    competitorCount: 12,
    competitorStores: [
      { id: 'store_1', name: 'Audio House BKK', avgPrice: 599 },
      { id: 'store_2', name: 'HomeGoods', avgPrice: 549 },
      { id: 'store_5', name: 'LifeStyle Co', avgPrice: 690 },
    ],
    lowestPriceTHB: 499,
  },
  cj_1005: {
    externalId: 'cj_1005',
    source: 'cj',
    status: 'low_competition',
    competitorCount: 1,
    competitorStores: [{ id: 'store_33', name: 'CreatorTools', avgPrice: 1190 }],
    lowestPriceTHB: 1190,
  },
  cj_1006: {
    externalId: 'cj_1006',
    source: 'cj',
    status: 'not_selling',
    competitorCount: 0,
  },
  cj_1007: {
    externalId: 'cj_1007',
    source: 'cj',
    status: 'low_competition',
    competitorCount: 2,
    competitorStores: [
      { id: 'store_2', name: 'HomeGoods', avgPrice: 649 },
      { id: 'store_88', name: 'TechSphere', avgPrice: 599 },
    ],
    lowestPriceTHB: 599,
  },
  cj_1008: {
    externalId: 'cj_1008',
    source: 'cj',
    status: 'moderate_competition',
    competitorCount: 5,
    competitorStores: [
      { id: 'store_50', name: 'FitFam', avgPrice: 779 },
    ],
    lowestPriceTHB: 750,
  },
  ali_2001: {
    externalId: 'ali_2001',
    source: 'aliexpress',
    status: 'saturated',
    competitorCount: 18,
    lowestPriceTHB: 199,
  },
  ali_2002: {
    externalId: 'ali_2002',
    source: 'aliexpress',
    status: 'not_selling',
    competitorCount: 0,
  },
  ali_2003: {
    externalId: 'ali_2003',
    source: 'aliexpress',
    status: 'low_competition',
    competitorCount: 1,
    lowestPriceTHB: 1490,
  },
  ali_2004: {
    externalId: 'ali_2004',
    source: 'aliexpress',
    status: 'moderate_competition',
    competitorCount: 3,
    lowestPriceTHB: 349,
  },
  ali_2005: {
    externalId: 'ali_2005',
    source: 'aliexpress',
    status: 'not_selling',
    competitorCount: 0,
  },
  ali_2006: {
    externalId: 'ali_2006',
    source: 'aliexpress',
    status: 'not_selling',
    competitorCount: 0,
  },
  ali_2007: {
    externalId: 'ali_2007',
    source: 'aliexpress',
    status: 'moderate_competition',
    competitorCount: 4,
    lowestPriceTHB: 199,
  },
};

function classify(count: number): MarketplaceStatus {
  if (count === 0) return 'not_selling';
  if (count <= 2) return 'low_competition';
  if (count <= 5) return 'moderate_competition';
  return 'saturated';
}

export async function getOverlap(
  source: ImportSource,
  externalId: string,
): Promise<MarketplaceOverlap> {
  const mock = MOCK_OVERLAPS[externalId];
  if (mock) return mock;
  return { externalId, source, status: 'not_selling', competitorCount: 0 };
}

export async function getOverlapBatch(
  items: Array<{ source: ImportSource; externalId: string }>,
): Promise<Map<string, MarketplaceOverlap>> {
  const map = new Map<string, MarketplaceOverlap>();
  for (const item of items) {
    const overlap = await getOverlap(item.source, item.externalId);
    map.set(item.externalId, overlap);
  }
  return map;
}

export const MARKETPLACE_STATUS_LABEL: Record<MarketplaceStatus, string> = {
  not_selling: 'ยังไม่มีคนขาย',
  low_competition: 'คู่แข่งน้อย',
  moderate_competition: 'คู่แข่งปานกลาง',
  saturated: 'อิ่มตัว',
};

export const MARKETPLACE_STATUS_COLOR: Record<MarketplaceStatus, string> = {
  not_selling: 'green',
  low_competition: 'blue',
  moderate_competition: 'amber',
  saturated: 'red',
};
