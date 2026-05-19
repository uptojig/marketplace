'use client';

/**
 * PackagingProductHero — cheerful pink-yellow-sky retail wrapper for the
 * Packaging theme. Adds a vibrant ribbon above the default
 * ProductDetailHero so the storefront reads as friendly SMB instead of
 * the muted kraft-brown source mockup. CSS vars from
 * lib/landing/packaging.ts already cascade through ProductDetailHero,
 * so the rest of the hero (prices, CTA) picks up the pink palette
 * without any further wiring.
 */

import { Sparkles, Truck } from 'lucide-react';
import {
  ProductDetailHero,
  type ProductDetailHeroProduct,
  type ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';
import { PACKAGING_TOKENS } from '@/lib/landing/packaging';

export function PackagingProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="space-y-4">
      {/* Vibrant ribbon — pink primary + yellow accent + sky chip */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-sm sm:text-base"
        style={{ background: PACKAGING_TOKENS.primary }}
      >
        <Sparkles className="h-5 w-5 shrink-0" />
        <span className="uppercase tracking-[0.06em]">ส่วนลดประจำสัปดาห์</span>
        <span aria-hidden style={{ opacity: 0.7 }}>·</span>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-extrabold tracking-wide"
          style={{ background: PACKAGING_TOKENS.accent, color: PACKAGING_TOKENS.ink }}
        >
          ลด 15% สำหรับสั่ง 100+ ชิ้น
        </span>
        <span className="hidden items-center gap-1 text-xs sm:inline-flex" style={{ opacity: 0.95 }}>
          <Truck className="h-3.5 w-3.5" /> ส่งฟรีทั่วประเทศ ฿590+
        </span>
      </div>

      <ProductDetailHero product={product} store={store} />
    </div>
  );
}
