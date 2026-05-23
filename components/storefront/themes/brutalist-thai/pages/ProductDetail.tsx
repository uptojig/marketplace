'use client';

/**
 * brutalist-thai — bespoke PDP.
 *
 * Replaces the generic `makePdpAdapter('05', '04')` re-export so the
 * Product page now matches the bespoke Homepage / Catalog instead of
 * dropping into shadcn's product-overview-05 (which has rounded
 * corners, soft shadows, none of the Brutalist visual language).
 *
 * Visual rules pulled from `pages/Homepage.tsx`:
 *   - 4px black borders, hard offset shadows `[8px_8px_0px_0px_#000]`
 *   - `rounded-none`, no soft shadows anywhere
 *   - Display headings use `font-[family:var(--font-google-sans)]` with
 *     `font-black uppercase tracking-tighter`
 *   - Greyscale product images by default
 *   - Black/white/zinc surface palette; red `#dc2626` accent reserved
 *     for the buy CTA so it pops against the monochrome layout.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import type { ProductDetailProps } from '@/lib/templates/types';

const FONT_DISPLAY = 'font-[family:var(--font-google-sans)]';

export default function BrutalistProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const add = useCart((s) => s.add);

  const gallery = product.images.length > 0
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const cover = gallery[activeImage] ?? null;

  const discount = product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
    ? Math.round((1 - product.priceTHB / product.originalPriceTHB) * 100)
    : 0;

  function addToCart() {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: product.priceTHB,
        imageUrl: product.imageUrl ?? undefined,
      },
      qty,
    );
  }

  return (
    <main className={`bg-white text-black min-h-screen py-8 ${FONT_DISPLAY}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Breadcrumb strip — flat blocks, no soft styling */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <Link
            href={`/stores/${store.slug}`}
            className="border-2 border-black bg-white px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            หน้าแรก
          </Link>
          <ChevronRight size={12} strokeWidth={3} />
          <Link
            href={`/stores/${store.slug}/category`}
            className="border-2 border-black bg-white px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            แคตตาล็อก
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight size={12} strokeWidth={3} />
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="border-2 border-black bg-white px-3 py-1 hover:bg-black hover:text-white transition-colors"
              >
                {product.categoryName}
              </Link>
            </>
          )}
        </nav>

        {/* Main 2-col grid — gallery left, info right. Hard shadow on both. */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border-4 border-black bg-[#e5e5e5] aspect-square overflow-hidden shadow-[8px_8px_0px_0px_#000000]">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={product.title}
                  className="w-full h-full object-cover grayscale"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                  NO IMAGE
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 5).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square border-4 overflow-hidden ${
                      i === activeImage
                        ? 'border-black shadow-[4px_4px_0px_0px_#000]'
                        : 'border-zinc-300 hover:border-black'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover grayscale" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="lg:col-span-5 space-y-6 border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#000000]">
            {product.categoryName && (
              <div className="inline-block border-2 border-black bg-black text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                {product.categoryName}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
              {product.title}
            </h1>

            {/* Price block — heavy red CTA-leading display */}
            <div className="border-t-4 border-b-4 border-black py-4 flex items-baseline gap-3">
              <span className="text-4xl font-black tracking-tighter">
                ฿{product.priceTHB.toLocaleString('th-TH')}
              </span>
              {product.originalPriceTHB && product.originalPriceTHB > product.priceTHB && (
                <>
                  <span className="text-base font-bold line-through text-zinc-500">
                    ฿{product.originalPriceTHB.toLocaleString('th-TH')}
                  </span>
                  <span className="ml-auto border-2 border-black bg-[#dc2626] text-white px-2 py-0.5 text-xs font-black tracking-wider uppercase">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed text-zinc-800">
                {product.description}
              </p>
            )}

            {/* Variants — square chips, no rounding */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest">
                  ตัวเลือก
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const label = Object.values(v.attributes).join(' / ');
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className="border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
                      >
                        {label || v.id.slice(0, 6)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + Buy */}
            <div className="space-y-3 pt-2">
              <div className="flex items-stretch border-4 border-black w-fit">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="ลด"
                  className="px-3 hover:bg-black hover:text-white transition-colors"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <div className="px-5 py-2 font-black text-lg min-w-[3rem] text-center border-l-4 border-r-4 border-black">
                  {qty}
                </div>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="เพิ่ม"
                  className="px-3 hover:bg-black hover:text-white transition-colors"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#dc2626] text-white border-4 border-black px-8 py-4 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
              >
                <ShoppingCart size={18} strokeWidth={3} />
                ใส่ตะกร้า
              </button>
            </div>

            {/* Meta strip — small monochrome facts */}
            <div className="border-t-4 border-black pt-4 grid grid-cols-3 gap-3 text-[10px] font-bold uppercase tracking-widest">
              <div>
                <div className="text-zinc-500">SKU</div>
                <div className="text-black mt-0.5">{product.id.slice(0, 8)}</div>
              </div>
              <div>
                <div className="text-zinc-500">สต็อก</div>
                <div className="text-black mt-0.5">
                  {product.stockLeft != null ? `${product.stockLeft} ชิ้น` : 'พร้อมส่ง'}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">ส่ง</div>
                <div className="text-black mt-0.5">1-3 วัน</div>
              </div>
            </div>
          </div>
        </section>

        {/* Related rail */}
        {related.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-black pb-3">
              สินค้าอื่นๆ ในร้าน
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  href={`/stores/${store.slug}/products/${r.id}`}
                  className="group border-4 border-black bg-white block shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                >
                  <div className="aspect-square bg-[#e5e5e5] border-b-4 border-black overflow-hidden">
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition"
                      />
                    ) : null}
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="text-xs font-bold uppercase tracking-tight line-clamp-2 leading-tight">
                      {r.title}
                    </div>
                    <div className="text-sm font-black">
                      ฿{r.priceTHB.toLocaleString('th-TH')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
