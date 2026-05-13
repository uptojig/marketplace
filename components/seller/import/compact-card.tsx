'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { IpRiskBadge } from './ip-risk-badge';
import { MarketplaceOverlapBadge } from './marketplace-overlap-badge';
import type { AnnotatedSupplierProduct } from '@/lib/import-sources/types';

interface CompactCardProps {
  product: AnnotatedSupplierProduct;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Dense card for "compact" view mode — 4-6 per row.
 * Image is much smaller, only essential info shown.
 */
export function CompactCard({ product, selected, onToggle }: CompactCardProps) {
  const usdRate = 36;
  const costTHB = Math.round(product.costPrice * usdRate);
  const suggestedPrice = Math.round((product.costPrice * usdRate * 3) / 10) * 10 - 1;
  const isRejected = product.ipVerdict === 'REJECTED';
  const isFlagged = product.ipVerdict === 'FLAGGED';

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition',
        selected && 'ring-2 ring-primary',
        isRejected && 'opacity-60',
      )}
      onClick={() => !isRejected && onToggle()}
    >
      <div className="relative aspect-square">
        <Image
          src={product.primaryImage}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 140px, (min-width: 1024px) 180px, (min-width: 640px) 33vw, 50vw"
        />
        <div className="absolute left-1 top-1 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            disabled={isRejected}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 border-2 border-white bg-white/90"
          />
        </div>
        {(isRejected || isFlagged) && (
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 px-1 py-0.5 text-[9px] font-medium text-white text-center backdrop-blur',
              isRejected ? 'bg-red-600/85' : 'bg-amber-500/85',
            )}
          >
            {isRejected ? 'ปฏิเสธ' : 'ตรวจสอบ'}
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="line-clamp-2 min-h-[2.2rem] text-[11px] leading-tight">{product.title}</h3>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xs font-semibold">${product.costPrice.toFixed(2)}</span>
          <span className="text-[9px] text-muted-foreground">≈฿{costTHB}</span>
        </div>
        <div className="text-[9px] text-muted-foreground">→ ฿{suggestedPrice}</div>

        <div className="mt-1 flex items-center justify-between gap-1">
          {product.rating !== undefined && product.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {product.rating}
              {product.ordersCount !== undefined && product.ordersCount > 0 && (
                <span className="ml-0.5">· {formatCount(product.ordersCount)}</span>
              )}
            </span>
          )}
          <div className="flex items-center gap-0.5">
            <MarketplaceOverlapBadge product={product} compact />
            <IpRiskBadge product={product} compact />
          </div>
        </div>
      </div>
    </Card>
  );
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
