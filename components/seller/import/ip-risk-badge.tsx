'use client';

import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnnotatedSupplierProduct } from '@/lib/import-sources/types';

const CATEGORY_LABELS: Record<string, string> = {
  brand_counterfeit: 'แบรนด์ปลอม',
  copyrighted_character: 'ลิขสิทธิ์การ์ตูน',
  regulated_substance: 'สินค้าควบคุม',
  weapon: 'อาวุธ',
  adult_content: 'เนื้อหาผู้ใหญ่',
  animal_welfare: 'สวัสดิภาพสัตว์',
  health_claim: 'อ้างผลทางสุขภาพ',
};

interface IpRiskBadgeProps {
  product: AnnotatedSupplierProduct;
  /** Compact mode: just icon */
  compact?: boolean;
}

export function IpRiskBadge({ product, compact = false }: IpRiskBadgeProps) {
  if (product.ipVerdict === 'ACCEPTED') {
    if (compact) return null;
    return (
      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-200">
        <ShieldCheck className="h-2.5 w-2.5" /> ผ่าน IP
      </span>
    );
  }

  const isRejected = product.ipVerdict === 'REJECTED';
  const label = product.ipCategory ? CATEGORY_LABELS[product.ipCategory] : 'มีความเสี่ยง';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium',
        isRejected
          ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200'
          : 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
      )}
      title={product.ipReason}
    >
      {isRejected ? <XCircle className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
      {compact ? '' : label}
    </span>
  );
}

/**
 * Larger banner version for use at top of risky cards.
 */
export function IpRiskBanner({ product }: { product: AnnotatedSupplierProduct }) {
  if (product.ipVerdict === 'ACCEPTED') return null;

  const isRejected = product.ipVerdict === 'REJECTED';
  const label = product.ipCategory ? CATEGORY_LABELS[product.ipCategory] : 'มีความเสี่ยง';

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 flex items-start gap-1.5 px-2 py-1.5 text-[10px] backdrop-blur',
        isRejected
          ? 'bg-red-600/85 text-white'
          : 'bg-amber-500/85 text-white',
      )}
    >
      {isRejected ? (
        <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-tight">
          {isRejected ? 'ปฏิเสธอัตโนมัติ' : 'ต้องตรวจสอบ'} · {label}
        </div>
        {product.ipReason && (
          <div className="line-clamp-2 leading-tight opacity-90">{product.ipReason}</div>
        )}
      </div>
    </div>
  );
}
