'use client';

/**
 * CommunityProductHero — live-commerce / video-feed wrapper. Adds a
 * vivid purple-pink gradient ribbon with a pulse-dot LIVE chip above
 * the default ProductDetailHero. Inherits the community CSS vars so
 * the underlying hero (prices, CTA, etc.) skins automatically.
 */

import { Video } from 'lucide-react';
import {
  ProductDetailHero,
  type ProductDetailHeroProduct,
  type ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';
import { COMMUNITY_TOKENS } from '@/lib/landing/community';

export function CommunityProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center justify-center gap-3 rounded-md px-4 py-3 text-sm font-bold text-white sm:text-base"
        style={{ background: COMMUNITY_TOKENS.primaryGradient }}
      >
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </span>
        <span className="uppercase tracking-[0.06em]">Live now</span>
        <span aria-hidden style={{ opacity: 0.65 }}>·</span>
        <Video className="h-4 w-4" />
        <span>1.2K viewers · KOL กำลังพรีวิวสินค้านี้</span>
      </div>

      <ProductDetailHero product={product} store={store} />
    </div>
  );
}
