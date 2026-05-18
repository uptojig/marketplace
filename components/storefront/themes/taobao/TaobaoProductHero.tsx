'use client';

/**
 * TaobaoProductHero — bold marketplace-style PDP wrapper. Adds a hot
 * gradient flash-deal banner above the default ProductDetailHero so the
 * Taobao / AowBao theme reads as marketplace energy without rewriting
 * the gallery + info + CTA stack from scratch. CSS vars from
 * lib/landing/taobao.ts cascade through ProductDetailHero so prices /
 * primary buttons pick up the red-pink palette automatically.
 */

import { Flame } from 'lucide-react';
import {
  ProductDetailHero,
  type ProductDetailHeroProduct,
  type ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';
import { TAOBAO_TOKENS } from '@/lib/landing/taobao';

function stubCountdown(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hh = String(2 + (hash % 6)).padStart(2, '0');
  const mm = String(hash % 60).padStart(2, '0');
  const ss = String((hash >> 8) % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function TaobaoProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  const countdown = stubCountdown(product.id);
  return (
    <div className="space-y-4">
      {/* Gradient flash-deal banner */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white sm:text-base"
        style={{ background: TAOBAO_TOKENS.primaryGradient }}
      >
        <Flame className="h-5 w-5 shrink-0" />
        <span>Flash deal · ลดเฉพาะวันนี้</span>
        <span aria-hidden style={{ opacity: 0.6 }}>·</span>
        <span className="font-mono" style={{ letterSpacing: '0.04em' }}>
          เหลือ {countdown}
        </span>
        <span
          className="hidden rounded px-2 py-0.5 text-xs sm:inline"
          style={{ background: TAOBAO_TOKENS.accent, color: '#1A1A1A' }}
        >
          ลด 20%
        </span>
      </div>

      <ProductDetailHero product={product} store={store} />
    </div>
  );
}
