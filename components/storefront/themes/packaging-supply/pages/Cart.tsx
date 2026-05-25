'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface InitialCartLine {
  productId: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  qty: number;
  storeSlug: string;
}

export interface PackagingSupplyCartProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  /** SSR seed — actual lines read from useCart on the client. */
  items: InitialCartLine[];
  freeShippingThreshold?: number;
  flatShippingTHB?: number;
}

export function Cart({
  store,
  freeShippingThreshold = 990,
  flatShippingTHB = 50,
}: PackagingSupplyCartProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : flatShippingTHB;
  const total = subtotal + shipping;
  const remainingFree = Math.max(0, freeShippingThreshold - subtotal);
  const freeProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const totalItems = lines.reduce((n, l) => n + l.qty, 0);

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  const shopUrl = `/stores/${store.slug}/category`;
  const checkoutUrl = `/stores/${store.slug}/checkout`;

  if (lines.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[var(--shop-bg)] font-[family:var(--font-prompt)] text-[var(--shop-ink)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-24 h-24 rounded-full bg-[var(--shop-bg-soft)] flex items-center justify-center mb-6">
            <ShoppingBag size={42} className="text-[var(--shop-primary)]" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] font-extrabold text-3xl">ตะกร้าว่าง</h1>
          <p className="text-sm text-[var(--shop-ink-muted)] mt-2">
            ยังไม่มีสินค้าในตะกร้าของคุณ — เริ่มเลือกบรรจุภัณฑ์ราคาส่งได้เลย
          </p>
          <Link
            href={shopUrl}
            className="mt-6 inline-flex items-center gap-2 bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            ดูสินค้าทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--shop-bg)] font-[family:var(--font-prompt)] text-[var(--shop-ink)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <nav className="text-xs text-[var(--shop-ink-muted)] mb-4" aria-label="breadcrumb">
          <Link href={`/stores/${store.slug}`} className="hover:text-[var(--shop-primary)]">
            {store.name}
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-[var(--shop-ink)] font-semibold">ตะกร้า</span>
        </nav>

        <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="font-[family:var(--font-kanit)] font-extrabold text-3xl sm:text-4xl tracking-tight">
              ตะกร้าของคุณ
            </h1>
            <p className="text-sm text-[var(--shop-ink-muted)] mt-1">
              {lines.length} รายการ · รวม {totalItems.toLocaleString('th-TH')} ชิ้น
            </p>
          </div>
          <Link
            href={shopUrl}
            className="text-sm font-bold text-[var(--shop-primary)] hover:underline"
          >
            ← เลือกสินค้าต่อ
          </Link>
        </header>

        {/* Free shipping progress */}
        <div className="rounded-2xl bg-[var(--shop-bg-soft)] border border-[var(--shop-border)] p-4 mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Truck size={18} className="text-[var(--shop-primary)]" />
              {remainingFree > 0 ? (
                <span>
                  เพิ่มอีก{' '}
                  <span className="text-[var(--shop-primary)]">{formatTHB(remainingFree)}</span>{' '}
                  เพื่อรับส่งฟรี
                </span>
              ) : (
                <span className="text-[var(--shop-savings)] flex items-center gap-1">
                  <Sparkles size={14} /> คุณได้รับส่งฟรีแล้ว!
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-[var(--shop-ink-muted)]">
              {formatTHB(subtotal)} / {formatTHB(freeShippingThreshold)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--shop-muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--shop-primary)] to-[var(--shop-accent)] transition-all"
              style={{ width: `${freeProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Line items */}
          <section className="lg:col-span-8 space-y-3">
            {lines.map((l) => (
              <article
                key={l.productId}
                className="bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] p-3 sm:p-4 flex gap-3 sm:gap-4"
              >
                <Link
                  href={`/stores/${store.slug}/products/${l.productId}`}
                  className="shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-[var(--shop-muted)] overflow-hidden border border-[var(--shop-border)]"
                >
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--pks-ink-dim)]">
                      <Package size={28} />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="font-bold text-sm sm:text-base line-clamp-2 hover:text-[var(--shop-primary)] transition-colors"
                  >
                    {l.title}
                  </Link>
                  <div className="text-xs text-[var(--shop-ink-muted)] mt-1">
                    SKU: PKS-{l.productId.substring(0, 6).toUpperCase()}
                  </div>
                  <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                    <div className="flex items-center bg-[var(--shop-muted)] rounded-full border border-[var(--shop-border)]">
                      <button
                        type="button"
                        onClick={() =>
                          setQty(l.productId, Math.max(50, l.qty - 50), store.slug)
                        }
                        className="p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] disabled:opacity-40"
                        aria-label="ลด"
                        disabled={l.qty <= 50}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={50}
                        step={50}
                        value={l.qty}
                        onChange={(e) => {
                          const n = Math.max(50, Number(e.target.value) || 50);
                          setQty(l.productId, n, store.slug);
                        }}
                        className="w-14 bg-transparent text-center font-bold focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(l.productId, l.qty + 50, store.slug)}
                        className="p-2 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)]"
                        aria-label="เพิ่ม"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[var(--shop-ink-muted)]">
                        {formatTHB(l.priceTHB)} / ชิ้น
                      </div>
                      <div className="font-[family:var(--font-kanit)] font-extrabold text-lg text-[var(--shop-primary)]">
                        {formatTHB(l.priceTHB * l.qty)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(l.productId, store.slug)}
                      className="p-2 text-[var(--shop-ink-muted)] hover:text-red-500 transition-colors"
                      aria-label="ลบรายการ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Order summary */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] p-5 space-y-4">
                <h2 className="font-[family:var(--font-kanit)] font-bold text-lg">สรุปคำสั่งซื้อ</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--shop-ink-muted)]">รวมสินค้า ({totalItems} ชิ้น)</dt>
                    <dd className="font-semibold">{formatTHB(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--shop-ink-muted)]">ค่าจัดส่ง</dt>
                    <dd className={`font-semibold ${shipping === 0 ? 'text-[var(--shop-savings)]' : ''}`}>
                      {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                    </dd>
                  </div>
                </dl>
                <div className="pt-3 border-t border-dashed border-[var(--shop-border)] flex items-baseline justify-between">
                  <span className="text-sm font-bold">รวมทั้งสิ้น</span>
                  <span className="font-[family:var(--font-kanit)] font-extrabold text-2xl text-[var(--shop-primary)]">
                    {formatTHB(total)}
                  </span>
                </div>
                <Link
                  href={checkoutUrl}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white font-bold py-3.5 rounded-full transition-colors"
                >
                  ไปยังการชำระเงิน <ArrowRight size={18} />
                </Link>
                <p className="text-[11px] text-center text-[var(--shop-ink-muted)]">
                  ราคารวมภาษีมูลค่าเพิ่มแล้ว
                </p>
              </div>

              <ul className="grid grid-cols-3 gap-2 text-[11px] text-center">
                {[
                  { icon: ShieldCheck, label: 'ชำระเงินปลอดภัย' },
                  { icon: Truck, label: 'ส่งเร็ว 1-2 วัน' },
                  { icon: TrendingDown, label: 'ราคาส่งจริง' },
                ].map(({ icon: I, label }) => (
                  <li
                    key={label}
                    className="rounded-xl bg-[var(--shop-muted)] py-3 px-2 flex flex-col items-center gap-1 text-[var(--shop-ink-muted)] font-semibold"
                  >
                    <I size={16} className="text-[var(--shop-primary)]" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
