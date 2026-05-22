'use client';

/**
 * talad-see-sod — bespoke "ขายดีในร้านนี้" trending section.
 *
 * Replaces the shadcn-studio product-list-09 block previously appended
 * via enhanceHomepage(..., '09', TALAD_PALETTE). That block rendered with
 * hardcoded English copy ("Trending In Sports Wear", "Best seller",
 * "X Reviews"), USD `$` prices, soft-rounded cards, a wishlist heart,
 * and a carousel — none of which match the rest of the Talad chrome.
 *
 * This section uses the same red/cream palette, sharp borders and
 * "หยิบใส่ตะกร้า" CTA pattern as the main product grid so the page
 * reads as a single coherent design.
 */

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';

interface TrendingProduct {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
}

interface TaladSeeSodTrendingProps {
  store: { slug: string; name: string };
  products: TrendingProduct[];
}

export function TaladSeeSodTrending({ store, products }: TaladSeeSodTrendingProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  if (products.length === 0) return null;
  const picks = products.slice(0, 5);

  const handleAdd = (p: TrendingProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: p.id,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl ?? undefined,
      storeSlug: store.slug,
      storeName: store.name,
    });
    showConfirm(p.title, store.slug);
  };

  return (
    <section className="bg-[#fff7ed] border-t-2 border-[#fdba74] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-end justify-between border-b-2 border-[#fdba74] pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-[#dc2626] text-white px-2.5 py-1 inline-flex items-center gap-1 font-[family:var(--font-kanit)] font-black text-xs uppercase">
              <Flame className="h-3.5 w-3.5" /> ฮอต
            </span>
            <h2 className="font-[family:var(--font-kanit)] font-black text-xl sm:text-2xl text-[#dc2626] uppercase">
              ขายดีในร้านนี้
            </h2>
          </div>
          <Link
            href={`/stores/${store.slug}`}
            className="text-xs font-bold text-[#dc2626] hover:underline uppercase tracking-wider"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {picks.map((p) => {
            const compare = p.compareAtPriceTHB ?? null;
            const onSale = compare !== null && compare > p.priceTHB;
            const discountPct = onSale
              ? Math.round(((compare - p.priceTHB) / compare) * 100)
              : 0;
            return (
              <Link
                key={p.id}
                href={`/stores/${store.slug}/products/${p.id}`}
                className="group block bg-white border-2 border-[#fdba74] hover:border-[#dc2626] hover:shadow-md transition-all"
              >
                <div className="relative aspect-square bg-orange-50/50 overflow-hidden">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#fdba74] text-xs">
                      ไม่มีรูป
                    </div>
                  )}
                  {onSale && (
                    <span className="absolute top-2 left-2 bg-[#dc2626] text-white font-[family:var(--font-kanit)] font-black text-[10px] px-2 py-0.5 border border-white shadow-sm transform -rotate-3">
                      -{discountPct}%
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-yellow-300 text-red-700 font-[family:var(--font-kanit)] font-black text-[10px] px-2 py-0.5 border border-red-500 transform rotate-3">
                    ขายดี!
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-[family:var(--font-prompt)] text-xs font-bold text-[#7f1d1d] line-clamp-2 leading-snug group-hover:text-[#dc2626] transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-[family:var(--font-prompt)] font-extrabold text-[#dc2626]">
                      {formatTHB(p.priceTHB)}
                    </span>
                    {onSale && compare !== null && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatTHB(compare)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleAdd(p, e)}
                    className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-[family:var(--font-kanit)] font-black text-[10px] py-1.5 uppercase tracking-wider shadow-sm transition-colors"
                  >
                    หยิบใส่ตะกร้า
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TaladSeeSodTrending;
