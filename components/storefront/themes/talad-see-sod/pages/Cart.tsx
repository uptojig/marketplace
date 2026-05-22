'use client';

/**
 * talad-see-sod — bespoke Cart page.
 *
 * Visual rules (consistent with Homepage / PDP / Catalog):
 *   - Cream `#fff7ed` page bg, dark-red `#7f1d1d` ink
 *   - Red `#dc2626` accent for CTAs + price; yellow `#fde047` promo stamps
 *   - Orange `#fdba74` borders on white cards
 *   - Kanit display headings, Prompt body
 *   - Thai copy throughout, THB currency via `formatTHB`
 *
 * Reads line items from the per-store zustand cart so the cart no
 * longer renders the generic English/USD shadcn-studio block.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

export default function TaladSeeSodCart({ store }: { store: StoreLite }) {
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
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (!mounted) {
    return <div className="min-h-[60vh] bg-[#fff7ed]" />;
  }

  return (
    <main className={`bg-[#fff7ed] text-[#7f1d1d] min-h-screen ${FONT_BODY}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className={`flex items-center gap-2 text-xs ${FONT_HEADING} font-bold`}>
          <Link
            href={`/stores/${store.slug}`}
            className="text-[#7f1d1d] hover:text-[#dc2626] transition-colors"
          >
            หน้าร้าน
          </Link>
          <ChevronRight size={12} className="text-[#fdba74]" />
          <span className="text-[#dc2626]">ตะกร้าสินค้า</span>
        </nav>

        {/* Page header with stamps */}
        <header className="bg-white border border-[#fdba74] p-5 shadow-sm flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`bg-yellow-300 text-[#dc2626] ${FONT_HEADING} font-black text-[10px] px-2.5 py-0.5 border border-[#dc2626] shadow-sm -rotate-2`}>
                ตะกร้าของฉัน
              </span>
              <span className={`bg-[#dc2626] text-white ${FONT_HEADING} font-black text-[10px] px-2.5 py-0.5 border border-yellow-300 shadow-sm rotate-1`}>
                {store.name}
              </span>
            </div>
            <h1 className={`${FONT_HEADING} font-black text-3xl sm:text-4xl text-[#7f1d1d] leading-tight`}>
              🛒 ตะกร้าสินค้าของคุณ
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-orange-600 font-bold">รายการในตะกร้า</p>
              <p className={`${FONT_HEADING} font-black text-2xl text-[#dc2626]`}>
                {itemCount}
              </p>
            </div>
            <div className="bg-[#dc2626] text-white p-3 border-2 border-yellow-300 shadow">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
          </div>
        </header>

        {lines.length === 0 ? (
          <TaladEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Line items ───────────────────────────────── */}
            <section aria-labelledby="cart-heading" className="lg:col-span-8 space-y-4">
              <h2 id="cart-heading" className="sr-only">สินค้าในตะกร้า</h2>

              {/* Free-shipping progress */}
              {remainingForFreeShipping > 0 ? (
                <div className="bg-white border border-[#fdba74] p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-[#dc2626]" />
                    <p className={`text-xs ${FONT_HEADING} font-bold text-[#7f1d1d]`}>
                      เพิ่มอีก <span className="text-[#dc2626] font-black">{formatTHB(remainingForFreeShipping)}</span> รับส่งฟรี!
                    </p>
                  </div>
                  <div className="h-2 bg-orange-50 border border-orange-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#dc2626] via-orange-500 to-yellow-400 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className={`bg-gradient-to-r from-[#dc2626] via-orange-500 to-yellow-400 text-white border border-yellow-300 p-4 shadow-sm flex items-center gap-3 ${FONT_HEADING} font-black`}>
                  <Truck size={18} strokeWidth={2.5} />
                  <p className="text-sm">✨ คุณได้รับส่งฟรีแล้ว!</p>
                </div>
              )}

              {/* Items */}
              <ul className="space-y-3">
                {lines.map((l) => (
                  <li
                    key={l.productId}
                    className="bg-white border border-[#fdba74] shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3 p-3">
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="block w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-orange-50 border border-orange-100 overflow-hidden"
                      >
                        {l.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.imageUrl}
                            alt={l.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-orange-200 text-[10px] font-bold">
                            NO IMAGE
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <Link
                          href={`/stores/${store.slug}/products/${l.productId}`}
                          className="block"
                        >
                          <h3 className={`${FONT_BODY} font-bold text-sm text-[#7f1d1d] hover:text-[#dc2626] transition-colors leading-snug line-clamp-2`}>
                            {l.title}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-stretch border border-[#fdba74] bg-orange-50/40">
                            <button
                              type="button"
                              onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                              disabled={l.qty <= 1}
                              aria-label="ลด"
                              className="px-2.5 hover:bg-[#dc2626] hover:text-white transition-colors disabled:opacity-30"
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <div className={`px-3.5 py-1 ${FONT_HEADING} font-black text-sm min-w-[2.25rem] text-center border-x border-[#fdba74] text-[#7f1d1d]`}>
                              {l.qty}
                            </div>
                            <button
                              type="button"
                              onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                              aria-label="เพิ่ม"
                              className="px-2.5 hover:bg-[#dc2626] hover:text-white transition-colors"
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`${FONT_BODY} text-lg font-extrabold text-[#dc2626]`}>
                              {formatTHB(l.priceTHB * l.qty)}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(l.productId, store.slug)}
                              aria-label={`ลบ ${l.title}`}
                              className="border border-[#fdba74] p-1.5 text-orange-500 hover:bg-[#dc2626] hover:border-[#dc2626] hover:text-white transition-colors"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href={`/stores/${store.slug}`}
                className={`inline-flex items-center gap-2 bg-white border border-[#fdba74] px-4 py-2 text-xs ${FONT_HEADING} font-bold text-[#7f1d1d] hover:bg-[#fff7ed] hover:border-[#dc2626] hover:text-[#dc2626] transition-colors shadow-sm`}
              >
                ← เลือกซื้อสินค้าต่อ
              </Link>
            </section>

            {/* ── Order summary ─────────────────────────────── */}
            <aside aria-labelledby="summary-heading" className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 self-start">
              <h2 id="summary-heading" className="sr-only">สรุปออเดอร์</h2>

              <div className="bg-white border-2 border-[#fdba74] shadow-md">
                <div className="bg-gradient-to-r from-[#dc2626] to-orange-500 text-white p-4">
                  <p className={`${FONT_HEADING} font-black text-lg`}>สรุปออเดอร์</p>
                  <p className="text-xs opacity-90 mt-0.5">ตรวจสอบยอดก่อนชำระเงิน</p>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7f1d1d]">ราคารวม ({itemCount} ชิ้น)</span>
                    <span className={`${FONT_BODY} font-bold text-[#7f1d1d]`}>{formatTHB(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7f1d1d]">ค่าจัดส่ง</span>
                    <span className={`${FONT_BODY} font-bold ${shipping === 0 ? 'text-[#dc2626]' : 'text-[#7f1d1d]'}`}>
                      {shipping === 0 ? '✓ ฟรี' : formatTHB(shipping)}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-[#fdba74] pt-3 flex items-baseline justify-between">
                    <span className={`${FONT_HEADING} font-black text-base text-[#7f1d1d]`}>ยอดสุทธิ</span>
                    <span className={`${FONT_BODY} font-black text-3xl text-[#dc2626]`}>
                      {formatTHB(total)}
                    </span>
                  </div>

                  <Link
                    href={`/stores/${store.slug}/checkout/address`}
                    className={`w-full inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white ${FONT_HEADING} font-black uppercase tracking-wider px-6 py-3.5 shadow-md transition-colors`}
                  >
                    <ShoppingBag size={18} strokeWidth={2.5} />
                    ดำเนินการชำระเงิน
                  </Link>

                  <p className={`flex items-center justify-center gap-1.5 text-[10px] ${FONT_BODY} font-bold text-orange-600`}>
                    <ShieldCheck size={12} />
                    ชำระเงินปลอดภัย · เก็บปลายทาง (COD)
                  </p>
                </div>
              </div>

              {/* Trust strip — Talad stamps style */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-yellow-300 border-2 border-[#dc2626] p-3 text-center shadow-sm transform -rotate-1">
                  <Truck size={18} className="mx-auto mb-1 text-[#dc2626]" strokeWidth={2.5} />
                  <p className={`text-[10px] ${FONT_HEADING} font-black text-[#dc2626]`}>ส่งฟรี</p>
                  <p className="text-[9px] text-red-900 font-bold">ออเดอร์ {formatTHB(FREE_SHIPPING_THRESHOLD)}+</p>
                </div>
                <div className="bg-white border-2 border-[#fdba74] p-3 text-center shadow-sm transform rotate-1">
                  <RotateCcw size={18} className="mx-auto mb-1 text-orange-500" strokeWidth={2.5} />
                  <p className={`text-[10px] ${FONT_HEADING} font-black text-[#7f1d1d]`}>คืนสินค้า</p>
                  <p className="text-[9px] text-orange-700 font-bold">ภายใน 7 วัน</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function TaladEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="bg-white border-2 border-dashed border-[#fdba74] py-16 px-6 text-center shadow-sm">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 border-2 border-[#fdba74] mb-4 transform -rotate-3">
        <ShoppingBag size={36} className="text-orange-400" strokeWidth={2} />
      </div>
      <h2 className={`text-2xl sm:text-3xl ${FONT_HEADING} font-black text-[#7f1d1d]`}>
        ตะกร้ายังว่างอยู่
      </h2>
      <p className={`mt-2 text-sm ${FONT_BODY} text-orange-700 max-w-md mx-auto`}>
        ลองเลือกของจากหน้าร้านดูสิ — มีดีลส่งตรงโรงงานเพียบ!
      </p>
      <Link
        href={`/stores/${storeSlug}`}
        className={`inline-flex items-center gap-2 mt-5 bg-[#dc2626] hover:bg-[#b91c1c] text-white ${FONT_HEADING} font-black px-6 py-3 shadow-md uppercase tracking-wider text-sm transition-colors`}
      >
        เริ่มช้อปเลย →
      </Link>
    </div>
  );
}
