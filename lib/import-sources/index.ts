import { cjClient } from './cj/client';
import { aliClient } from './ali/client';
import type { ImportSource, SupplierClient } from './types';

const REGISTRY: Record<ImportSource, SupplierClient> = {
  cj: cjClient,
  aliexpress: aliClient,
  // alibaba: alibabaClient,  // TODO
  // banggood: banggoodClient, // TODO
  alibaba: cjClient, // fallback
  banggood: cjClient, // fallback
};

export function getSupplierClient(source: ImportSource): SupplierClient {
  return REGISTRY[source];
}

export const ENABLED_SOURCES: Array<{ source: ImportSource; label: string; logo?: string }> = [
  { source: 'cj', label: 'CJ Dropshipping' },
  { source: 'aliexpress', label: 'AliExpress' },
];

export * from './types';
