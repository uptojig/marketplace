'use client';

import Image from 'next/image';
import { Star, Truck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { IpRiskBadge } from './ip-risk-badge';
import { MarketplaceOverlapBadge } from './marketplace-overlap-badge';
import type { AnnotatedSupplierProduct } from '@/lib/import-sources/types';

interface ListRowProps {
  product: AnnotatedSupplierProduct;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Horizontal row — 1 product per row, max info density.
 * Best for batch reviewing many results.
 */
export function ListRow({ product, selected, onToggle }: ListRowProps) {
  const usdRate = 36;
  const costTHB = Math.round(product.costPrice * usdRate);
  const suggestedPrice = Math.round((product.costPrice * usdRate * 3) / 10) * 10 - 1;
  const isRejected = product.ipVerdict === 'REJECTED';

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-3 border-b px-3 py-2 transition hover:bg-accent/30',
        selected && 'bg-primary/5',
        isRejected && 'opacity-60',
      )}
      onClick={() => !isRejected && onToggle()}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onToggle}
        disabled={isRejected}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 shrink-0"
      />

      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
        <Image
          src={product.primaryImage}
          alt={product.title}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>

      {/* Title + tags */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-1 text-sm">{product.title}</h3>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <IpRiskBadge product={product} />
          <MarketplaceOverlapBadge product={product} />
          {product.freeShipping && (
            <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1 py-0.5 text-green-800 dark:bg-green-950/30 dark:text-green-200">
              <Truck className="h-2.5 w-2.5" /> ส่งฟรี
            </span>
          )}
          {product.shippingFrom?.toLowerCase().includes('thailand') && (
            <span className="rounded bg-blue-100 px-1 py-0.5 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">TH</span>
          )}
          {product.supplierTags?.slice(0, 2).map((t) => (
            <span key={t} className="rounded bg-muted px-1 py-0.5">{t}</span>
          ))}
          <span className="ml-auto">
            {product.shippingFrom} · {product.shippingDays?.min}-{product.shippingDays?.max}d
          </span>
        </div>
      </div>

      {/* Stats column */}
      <div className="hidden shrink-0 sm:flex flex-col items-end text-[10px] text-muted-foreground">
        {product.rating !== undefined && product.rating > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            {product.rating}
            {product.ratingCount !== undefined && (
              <span> ({product.ratingCount.toLocaleString()})</span>
            )}
          </span>
        )}
        {product.ordersCount !== undefined && (
          <span>ขาย {product.ordersCount.toLocaleString()}</span>
        )}
      </div>

      {/* Price column */}
      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold">${product.costPrice.toFixed(2)}</div>
        <div className="text-[10px] text-muted-foreground">฿{costTHB}</div>
        <div className="text-[10px] text-primary">→ ฿{suggestedPrice}</div>
      </div>
    </div>
  );
}
