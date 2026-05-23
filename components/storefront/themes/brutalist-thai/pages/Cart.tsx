'use client';

/**
 * brutalist-thai — bespoke Cart page.
 *
 * Visual rules (consistent with Homepage / Catalog / PDP):
 *   - 4px black borders, hard offset shadows `[8px_8px_0px_0px_#000]`
 *   - `rounded-none` everywhere — no soft shadows, no rounding
 *   - Display headings: `font-[family:var(--font-google-sans)]` with
 *     `font-black uppercase tracking-tighter`
 *   - Greyscale product images by default, color on hover
 *   - Black / white / zinc palette; red `#dc2626` accent for CTA
 *   - Thai copy for all UI text
 */

import React from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, ChevronRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

const FONT_DISPLAY = 'font-[family:var(--font-google-sans)]';
const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export default function BrutalistCart({ store }: { store: StoreLite }) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (!mounted) {
    return <div className="min-h-[60vh] bg-white" />;
  }

  return (
    <main className={`bg-white text-black min-h-screen ${FONT_DISPLAY}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Breadcrumb strip — flat blocks, no soft styling */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <Link
            href={`/stores/${store.slug}`}
            className="border-2 border-black bg-white px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            หน้าแรก
          </Link>
          <ChevronRight size={12} strokeWidth={3} />
          <span className="border-2 border-black bg-black text-white px-3 py-1">
            ตะกร้า
          </span>
        </nav>

        {/* Page Header */}
        <header className="border-b-4 border-black pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                SHOPPING BAG · {store.name}
              </p>
              <h1 className="font-black text-4xl sm:text-5xl uppercase tracking-tighter leading-none">
                ตะกร้าสินค้า
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {itemCount} รายการ
              </span>
              <div className="border-2 border-black bg-black text-white p-2">
                <ShoppingCart size={14} />
              </div>
            </div>
          </div>
        </header>

        {lines.length === 0 ? (
          <BrutalistEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Line items ───────────────────────────────── */}
            <section aria-labelledby="cart-heading" className="lg:col-span-8 space-y-4">
              <h2 id="cart-heading" className="sr-only">สินค้าในตะกร้า</h2>

              {/* Free shipping nudge */}
              {remainingForFreeShipping > 0 ? (
                <div className="border-4 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
                  <Truck size={18} strokeWidth={3} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    เพิ่มอีก <span className="text-[#dc2626]">{formatTHB(remainingForFreeShipping)}</span> รับส่งฟรี!
                  </p>
                </div>
              ) : (
                <div className="border-4 border-[#dc2626] bg-[#dc2626] text-white p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
                  <Truck size={18} strokeWidth={3} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    ✓ คุณได้รับส่งฟรีแล้ว!
                  </p>
                </div>
              )}

              {/* Cart items */}
              {lines.map((l) => (
                <article
                  key={l.productId}
                  className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000000] group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] transition-all"
                >
                  <div className="flex">
                    {/* Image — greyscale, color on hover */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="block w-28 h-28 sm:w-36 sm:h-36 bg-[#e5e5e5] border-r-4 border-black overflow-hidden shrink-0"
                    >
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          NO IMG
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <Link
                          href={`/stores/${store.slug}/products/${l.productId}`}
                          className="block"
                        >
                          <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-black line-clamp-2 leading-relaxed hover:underline">
                            {l.title}
                          </h3>
                        </Link>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                          {store.name}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                        {/* Qty stepper — brutalist blocks */}
                        <div className="flex items-stretch border-4 border-black">
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                            disabled={l.qty <= 1}
                            aria-label="ลด"
                            className="px-2.5 hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <div className="px-4 py-1.5 font-black text-sm min-w-[2.5rem] text-center border-l-4 border-r-4 border-black">
                            {l.qty}
                          </div>
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                            aria-label="เพิ่ม"
                            className="px-2.5 hover:bg-black hover:text-white transition-colors"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-black text-lg tracking-tighter">
                          {formatTHB(l.priceTHB * l.qty)}
                        </span>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => remove(l.productId, store.slug)}
                          aria-label={`ลบ ${l.title}`}
                          className="border-2 border-black p-1.5 hover:bg-[#dc2626] hover:border-[#dc2626] hover:text-white transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Continue shopping */}
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_#000]"
              >
                ← ช้อปต่อ
              </Link>
            </section>

            {/* ── Order summary ─────────────────────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="lg:col-span-4 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    ORDER SUMMARY
                  </p>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mt-1">
                    สรุปออเดอร์
                  </h3>
                </div>

                <div className="border-t-4 border-b-4 border-black py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-500">ราคารวม ({itemCount} ชิ้น)</span>
                    <span className="text-black">{formatTHB(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-500">ค่าจัดส่ง</span>
                    <span className={shipping === 0 ? 'text-[#dc2626]' : 'text-black'}>
                      {shipping === 0 ? '✓ ฟรี' : formatTHB(shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black uppercase tracking-widest">ยอดรวม</span>
                  <span className="text-3xl font-black tracking-tighter">
                    {formatTHB(total)}
                  </span>
                </div>

                <Link
                  href={`/stores/${store.slug}/checkout`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#dc2626] text-white border-4 border-black px-8 py-4 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                >
                  <ShoppingCart size={18} strokeWidth={3} />
                  ดำเนินการชำระเงิน
                </Link>

                <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <ShieldCheck size={12} />
                  Secure checkout · Basketplace
                </p>
              </div>

              {/* Trust strip — brutalist monochrome facts */}
              <div className="mt-4 border-4 border-black bg-gray-50 shadow-[4px_4px_0px_0px_#000000]">
                <div className="grid grid-cols-2 divide-x-4 divide-black">
                  <div className="p-3 text-center">
                    <Truck size={16} className="mx-auto mb-1" />
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">ส่งฟรี</div>
                    <div className="text-[10px] font-black">ออเดอร์ {formatTHB(FREE_SHIPPING_THRESHOLD)}+</div>
                  </div>
                  <div className="p-3 text-center">
                    <RotateCcw size={16} className="mx-auto mb-1" />
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">คืนสินค้า</div>
                    <div className="text-[10px] font-black">ภายใน 7 วัน</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

      </div>
    </main>
  );
}

function BrutalistEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="border-4 border-black bg-gray-50 shadow-[8px_8px_0px_0px_#000000] py-20 text-center space-y-6">
      <div className="border-4 border-black bg-white w-20 h-20 mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
        <ShoppingCart size={32} strokeWidth={2.5} className="text-gray-400" />
      </div>
      <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tighter ${FONT_DISPLAY}`}>
        ตะกร้าว่างเปล่า
      </h2>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 max-w-md mx-auto">
        ยังไม่มีสินค้าในตะกร้า — เริ่มเลือกสินค้าจากแคตตาล็อกของเราได้เลย
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="inline-flex items-center gap-2 bg-[#dc2626] text-white border-4 border-black px-8 py-3 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
      >
        เริ่มช้อปเลย →
      </Link>
    </div>
  );
}
