'use client';
import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface CartItem {
  productId: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  qty: number;
  storeSlug: string;
}

export interface CartProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  items: CartItem[];
  freeShippingThreshold?: number;
  flatShippingTHB?: number;
}

/**
 * taobao-style — Cart page.
 *
 * Layout:
 *   - Hot banner with "ส่งฟรี" progress bar
 *   - Line item list with qty stepper + remove button
 *   - Sticky order summary on the right (lg+) with savings highlight
 *   - "เลือกซื้อเพิ่ม" upsell hint
 */
export function Cart({
  store,
  freeShippingThreshold = 990,
  flatShippingTHB = 50,
}: CartProps) {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.remove);

  // Avoid hydration mismatch — zustand persist hydrates after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <main
        className="min-h-[60vh] font-sans"
        style={{ background: 'var(--shop-bg)' }}
      />
    );
  }

  const storeLines = lines.filter((l) => l.storeSlug === store.slug);
  const subtotal = storeLines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
  const totalItems = storeLines.reduce((acc, l) => acc + l.qty, 0);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : flatShippingTHB;
  const total = subtotal + shippingFee;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const urls = {
    shop: `/stores/${store.slug}/category`,
    checkout: `/stores/${store.slug}/checkout/address`,
    home: `/stores/${store.slug}`,
  };

  if (storeLines.length === 0) {
    return (
      <main
        className="min-h-[60vh] font-sans flex flex-col items-center justify-center px-4 text-center"
        style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'var(--shop-bg-soft)', color: 'var(--shop-primary)' }}
        >
          <ShoppingCart size={36} />
        </div>
        <h1 className="font-[family:var(--font-kanit)] font-black text-2xl uppercase mb-2">
          ตะกร้าของคุณว่างอยู่
        </h1>
        <p
          className="text-sm font-[family:var(--font-prompt)] mb-6"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          ดีลร้อน ๆ รอคุณอยู่ใน {store.name} ไปช้อปกันต่อเลย!
        </p>
        <a
          href={urls.shop}
          className="px-6 py-3 rounded-md text-sm font-[family:var(--font-kanit)] font-black uppercase text-white inline-flex items-center gap-2 transition-opacity hover:opacity-90"
          style={{ background: 'var(--shop-primary-gradient)' }}
        >
          เลือกซื้อสินค้า <ArrowRight size={16} />
        </a>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen font-sans pb-12"
      style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Hot banner */}
      <section
        className="text-white"
        style={{ background: 'var(--shop-primary-gradient)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-[family:var(--font-kanit)] font-black text-xl sm:text-2xl uppercase flex items-center gap-2">
              <ShoppingCart size={22} /> ตะกร้าสินค้า ({totalItems} ชิ้น)
            </h1>
            <p className="text-xs font-[family:var(--font-prompt)] text-white/90 mt-1">
              {store.name}
            </p>
          </div>
          <div className="text-xs font-[family:var(--font-prompt)] font-bold text-white/95 max-w-xs">
            {remainingForFreeShip > 0 ? (
              <span>
                ซื้ออีก{' '}
                <span
                  className="px-1.5 py-0.5 rounded font-[family:var(--font-kanit)] font-black"
                  style={{ background: 'var(--shop-accent)', color: 'var(--shop-ink)' }}
                >
                  {formatTHB(remainingForFreeShip)}
                </span>{' '}
                เพื่อรับส่งฟรี
              </span>
            ) : (
              <span
                className="px-2 py-1 rounded text-[11px] font-[family:var(--font-kanit)] font-black"
                style={{ background: 'var(--shop-accent)', color: 'var(--shop-ink)' }}
              >
                ✓ คุณได้รับสิทธิ์ส่งฟรีแล้ว
              </span>
            )}
            <div className="mt-2 h-2 rounded-full overflow-hidden bg-white/30">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: 'var(--shop-accent)' }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Items */}
        <section className="lg:col-span-8 space-y-3">
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ border: `1px solid var(--shop-border)` }}
          >
            <div
              className="px-4 py-3 border-b font-[family:var(--font-kanit)] font-extrabold text-sm uppercase flex items-center justify-between"
              style={{ borderColor: 'var(--shop-border)', color: 'var(--shop-primary)' }}
            >
              <span>{store.name}</span>
              <span
                className="text-[11px] font-[family:var(--font-prompt)] font-bold"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {totalItems} รายการ
              </span>
            </div>

            <ul>
              {storeLines.map((line) => {
                const lineTotal = line.priceTHB * line.qty;
                return (
                  <li
                    key={line.productId}
                    className="px-4 py-4 border-b last:border-b-0 flex flex-col sm:flex-row gap-3 items-start"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    {/* Image */}
                    <a
                      href={`/stores/${store.slug}/products/${line.productId}`}
                      className="w-24 h-24 rounded-md overflow-hidden shrink-0"
                      style={{ background: 'var(--shop-muted)' }}
                    >
                      {line.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.imageUrl}
                          alt={line.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-[10px] p-2 text-center"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {line.title.slice(0, 16)}
                        </div>
                      )}
                    </a>

                    {/* Title + price */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/stores/${store.slug}/products/${line.productId}`}
                        className="font-[family:var(--font-prompt)] font-semibold text-sm line-clamp-2 leading-snug hover:text-[color:var(--shop-primary)]"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {line.title}
                      </a>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span
                          className="font-[family:var(--font-kanit)] font-black text-lg"
                          style={{ color: 'var(--shop-primary)' }}
                        >
                          {formatTHB(line.priceTHB)}
                        </span>
                        <span
                          className="text-[10px] font-[family:var(--font-prompt)]"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          /ชิ้น
                        </span>
                      </div>
                    </div>

                    {/* Qty + actions */}
                    <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start gap-2 w-full sm:w-auto">
                      <div
                        className="inline-flex items-center rounded-md overflow-hidden"
                        style={{ border: `1px solid var(--shop-border)` }}
                      >
                        <button
                          onClick={() =>
                            setQty(line.productId, Math.max(0, line.qty - 1), store.slug)
                          }
                          className="w-8 h-8 flex items-center justify-center"
                          style={{ color: 'var(--shop-ink)' }}
                          aria-label="ลดจำนวน"
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="min-w-[36px] text-center text-sm font-[family:var(--font-kanit)] font-black"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {line.qty}
                        </span>
                        <button
                          onClick={() => setQty(line.productId, line.qty + 1, store.slug)}
                          className="w-8 h-8 flex items-center justify-center"
                          style={{ color: 'var(--shop-ink)' }}
                          aria-label="เพิ่มจำนวน"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p
                          className="font-[family:var(--font-kanit)] font-black text-base"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {formatTHB(lineTotal)}
                        </p>
                        <button
                          onClick={() => removeLine(line.productId, store.slug)}
                          className="text-[11px] font-[family:var(--font-prompt)] font-bold inline-flex items-center gap-0.5 hover:underline"
                          style={{ color: 'var(--shop-primary)' }}
                        >
                          <Trash2 size={11} /> ลบ
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <a
            href={urls.shop}
            className="inline-flex items-center gap-1.5 text-xs font-[family:var(--font-prompt)] font-bold hover:underline"
            style={{ color: 'var(--shop-primary)' }}
          >
            <ArrowRight size={12} className="rotate-180" /> เลือกซื้อสินค้าเพิ่ม
          </a>
        </section>

        {/* Summary */}
        <aside className="lg:col-span-4">
          <div
            className="bg-white rounded-lg overflow-hidden sticky top-4"
            style={{ border: `1px solid var(--shop-border)` }}
          >
            <div
              className="px-4 py-3 font-[family:var(--font-kanit)] font-black uppercase text-sm text-white"
              style={{ background: 'var(--shop-primary-gradient)' }}
            >
              สรุปคำสั่งซื้อ
            </div>

            <div className="px-4 py-4 space-y-2.5 text-sm font-[family:var(--font-prompt)]">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--shop-ink-muted)' }}>ยอดสินค้า</span>
                <span style={{ color: 'var(--shop-ink)' }} className="font-bold">
                  {formatTHB(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</span>
                <span
                  className="font-bold"
                  style={{
                    color: shippingFee === 0 ? 'var(--shop-savings)' : 'var(--shop-ink)',
                  }}
                >
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </span>
              </div>

              {/* Promo line */}
              <div
                className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-bold"
                style={{
                  background: 'var(--shop-bg-soft)',
                  color: 'var(--shop-primary)',
                }}
              >
                <Tag size={14} />
                ใช้โค้ด FLASH50 ลดเพิ่ม 5%
              </div>
            </div>

            <div
              className="px-4 py-3 border-t flex items-baseline justify-between"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <span className="font-[family:var(--font-kanit)] font-extrabold text-sm uppercase">
                ยอดรวม
              </span>
              <span
                className="font-[family:var(--font-kanit)] font-black text-2xl"
                style={{ color: 'var(--shop-primary)' }}
              >
                {formatTHB(total)}
              </span>
            </div>

            <div className="px-4 pb-4 space-y-2">
              <a
                href={urls.checkout}
                className="w-full py-3 rounded-md text-sm font-[family:var(--font-kanit)] font-black uppercase text-white inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: 'var(--shop-primary-gradient)' }}
              >
                ดำเนินการสั่งซื้อ <ArrowRight size={14} />
              </a>

              <div
                className="grid grid-cols-2 gap-2 pt-3 text-[11px] font-[family:var(--font-prompt)] font-bold"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck size={12} style={{ color: 'var(--shop-primary)' }} />
                  ของแท้ 100%
                </div>
                <div className="flex items-center gap-1">
                  <Truck size={12} style={{ color: 'var(--shop-primary)' }} />
                  ส่งทั่วประเทศ
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
