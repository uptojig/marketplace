'use server';

import type { SupplierProduct } from '@/lib/import-sources/types';
import { checkIp, type IpCheckResult } from './ip-filter';
import { translateProduct, type TranslatedProduct } from './translate';

/**
 * Per-product processing result. Used to populate import_job_items.
 */
export interface ProcessedProduct {
  externalId: string;
  source: string;
  status: 'accepted' | 'flagged' | 'rejected';
  ipCheck: IpCheckResult;
  translated?: TranslatedProduct;
  rejectionReason?: string;
}

/**
 * Two-stage pipeline: IP filter → translation (only if not rejected).
 * Flagged items still get translated so user can review + approve manually.
 */
export async function processProduct(product: SupplierProduct): Promise<ProcessedProduct> {
  const ipCheck = await checkIp(product);

  if (ipCheck.verdict === 'REJECTED') {
    return {
      externalId: product.externalId,
      source: product.source,
      status: 'rejected',
      ipCheck,
      rejectionReason: ipCheck.reason,
    };
  }

  const translated = await translateProduct(product);

  return {
    externalId: product.externalId,
    source: product.source,
    status: ipCheck.verdict === 'FLAGGED' ? 'flagged' : 'accepted',
    ipCheck,
    translated,
  };
}

export async function processBatch(products: SupplierProduct[]): Promise<{
  results: ProcessedProduct[];
  summary: {
    total: number;
    accepted: number;
    flagged: number;
    rejected: number;
    rejectionBreakdown: Record<string, number>;
  };
}> {
  // Run with limited concurrency to avoid hammering external APIs
  const CONCURRENCY = 5;
  const results: ProcessedProduct[] = [];

  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(processProduct));
    results.push(...batchResults);
  }

  const accepted = results.filter((r) => r.status === 'accepted').length;
  const flagged = results.filter((r) => r.status === 'flagged').length;
  const rejected = results.filter((r) => r.status === 'rejected').length;

  const rejectionBreakdown: Record<string, number> = {};
  for (const r of results) {
    if (r.status === 'rejected' && r.ipCheck.category) {
      rejectionBreakdown[r.ipCheck.category] = (rejectionBreakdown[r.ipCheck.category] ?? 0) + 1;
    }
  }

  return {
    results,
    summary: {
      total: results.length,
      accepted,
      flagged,
      rejected,
      rejectionBreakdown,
    },
  };
}
