'use client';

import Image from 'next/image';
import { Star, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { IpRiskBadge, IpRiskBanner } from './ip-risk-badge';
import { MarketplaceOverlapBadge } from './marketplace-overlap-badge';
import type { AnnotatedSupplierProduct } from '@/lib/import-sources/types';

interface ProductCardProps {
  product: AnnotatedSupplierProduct;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Large card for "grid" view mode — 2-3 per row, full image + all info.
 */
export function ProductCard({ product, selected, onToggle }: ProductCardProps) {
  const usdRate = 36;
  const costTHB = Math.round(product.costPrice * usdRate);
  const suggestedPrice = Math.round((product.costPrice * usdRate * 3) / 10) * 10 - 1;
  const isRejected = product.ipVerdict === 'REJECTED';

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition',
        selected && 'ring-2 ring-primary',
        isRejected && 'opacity-75',
      )}
      onClick={() => !isRejected && onToggle()}
    >
      <div className="relative aspect-square">
        <Image
          src={product.primaryImage}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 280px, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute left-2 top-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            disabled={isRejected}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 border-2 border-white bg-white/90"
          />
        </div>
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          {product.freeShipping && (
            <Badge className="bg-green-600 hover:bg-green-600 text-[10px]">
              <Truck className="mr-0.5 h-3 w-3" /> ส่งฟรี
            </Badge>
          )}
          {product.shippingFrom?.toLowerCase().includes('thailand') && (
            <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px]">TH</Badge>
          )}
        </div>
        <IpRiskBanner product={product} />
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm">{product.title}</h3>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {product.rating !== undefined && product.rating > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.rating}
              {product.ratingCount !== undefined && (
                <span className="text-[10px]">({product.ratingCount.toLocaleString()})</span>
              )}
            </span>
          )}
          {product.ordersCount !== undefined && product.ordersCount > 0 && (
            <>
              <span>·</span>
              <span>ขาย {product.ordersCount.toLocaleString()}</span>
            </>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">${product.costPrice.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">≈ ฿{costTHB.toLocaleString()}</span>
        </div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">
          ขายต่อ ~฿{suggestedPrice.toLocaleString()} (3× markup)
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <IpRiskBadge product={product} />
          <MarketplaceOverlapBadge product={product} />
          {product.supplierTags?.slice(0, 2).map((t) => (
            <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Truck className="h-3 w-3" />
          {product.shippingFrom} · {product.shippingDays?.min}-{product.shippingDays?.max} วัน
        </div>
      </div>
    </Card>
  );
}
