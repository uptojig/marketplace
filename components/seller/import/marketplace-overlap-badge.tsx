'use client';

import { Sparkles, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnnotatedSupplierProduct, MarketplaceStatus } from '@/lib/import-sources/types';

const LABELS: Record<MarketplaceStatus, string> = {
  not_selling: 'ยังไม่มีคนขาย',
  low_competition: 'คู่แข่งน้อย',
  moderate_competition: 'คู่แข่งปานกลาง',
  saturated: 'อิ่มตัว',
};

const STYLES: Record<MarketplaceStatus, string> = {
  not_selling: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  low_competition: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  moderate_competition: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  saturated: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200',
};

interface Props {
  product: AnnotatedSupplierProduct;
  compact?: boolean;
}

export function MarketplaceOverlapBadge({ product, compact = false }: Props) {
  const status = product.marketplaceStatus;
  if (!status) return null;

  const count = product.competitorCount ?? 0;

  if (status === 'not_selling') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium',
          STYLES.not_selling,
        )}
        title="ยังไม่มีร้านไหนใน Basketplace ขาย — โอกาสดี"
      >
        <Sparkles className="h-2.5 w-2.5" />
        {compact ? '' : 'ยังไม่มีคนขาย'}
      </span>
    );
  }

  // Has competitors
  const Icon = status === 'saturated' ? TrendingUp : Users;
  const tooltip = product.lowestCompetitorPriceTHB
    ? `${count} ร้านขาย · ต่ำสุด ฿${product.lowestCompetitorPriceTHB.toLocaleString()}`
    : `${count} ร้านขาย`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium',
        STYLES[status],
      )}
      title={tooltip}
    >
      <Icon className="h-2.5 w-2.5" />
      {compact ? count : `ขายแล้ว ${count} ร้าน`}
      {!compact && product.lowestCompetitorPriceTHB && (
        <span className="ml-0.5 opacity-75">· ต่ำสุด ฿{product.lowestCompetitorPriceTHB.toLocaleString()}</span>
      )}
    </span>
  );
}
