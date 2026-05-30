'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

interface CartProps {
  store: StoreLite;
  freeShippingThreshold?: number;
  flatShippingTHB?: number;
}

export default function Cart({
  store,
  freeShippingThreshold = 990,
  flatShippingTHB = 50,
}: CartProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const shipping = subtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const total = subtotal + shipping;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progressPct = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: 'var(--shop-bg, #FBF8F3)' }}
      />
    );
  }

  if (lines.length === 0) {
    return (
      <div
        className="font-[family:var(--font-prompt)] min-h-screen flex items-center justify-center px-4 py-20"
        style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
      >
        <div
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 20px 40px -10px rgba(0,0,0,0.08)' }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'rgba(255,90,106,0.10)', color: 'var(--shop-primary, #FF5A6A)' }}
          >
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-2xl font-semibold tracking-tight mb-2">
            ตะกร้าว่างเปล่า
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-6">
            ยังไม่มีสินค้าในตะกร้า เริ่มช้อปได้เลย
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            style={{
              background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
            }}
          >
            เลือกซื้อสินค้า <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            ตะกร้าสินค้า
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
            {itemCount} รายการในตะกร้า
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-10">
        {/* Lines */}
        <div className="space-y-3">
          {/* Free shipping progress */}
          <div
            className="rounded-2xl bg-white p-4 sm:p-5"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
          >
            {remaining > 0 ? (
              <>
                <p className="text-sm font-medium mb-2">
                  ช้อปเพิ่มอีก{' '}
                  <span className="text-[color:var(--shop-primary,#FF5A6A)] font-semibold">
                    {formatTHB(remaining)}
                  </span>{' '}
                  เพื่อรับสิทธิ์ส่งฟรี
                </p>
                <div className="h-1.5 rounded-full bg-[#F5F1EB] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressPct}%`,
                      background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-[color:var(--shop-primary,#FF5A6A)]">
                สั่งซื้อขั้นต่ำครบแล้ว — ส่งฟรีทั่วประเทศ
              </p>
            )}
          </div>

          {lines.map((l) => (
            <div
              key={l.productId}
              className="rounded-2xl bg-white p-4 flex gap-4"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-[#F5F1EB] overflow-hidden">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone className="w-7 h-7 text-[color:var(--shop-primary,#FF5A6A)]/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="font-[family:var(--font-kanit)] font-medium text-sm sm:text-base leading-snug line-clamp-2 hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                  >
                    {l.title}
                  </Link>
                  <p className="font-[family:var(--font-kanit)] font-semibold text-base text-[color:var(--shop-primary,#FF5A6A)] mt-0.5">
                    {formatTHB(l.priceTHB)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="inline-flex items-center rounded-full bg-[#F5F1EB]">
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                      aria-label="ลด"
                      className="w-8 h-8 flex items-center justify-center text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">{l.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                      aria-label="เพิ่ม"
                      className="w-8 h-8 flex items-center justify-center text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId, store.slug)}
                    aria-label="ลบสินค้านี้"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[color:var(--shop-ink-muted,#6B7280)] hover:bg-[color:var(--shop-primary,#FF5A6A)]/10 hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div
            className="rounded-2xl bg-white p-5 sm:p-6 space-y-4"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 20px 40px -10px rgba(0,0,0,0.08)' }}
          >
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-lg tracking-tight">
              สรุปคำสั่งซื้อ
            </h3>
            <div className="space-y-2 text-sm">
              <Row label="ยอดสินค้า" value={formatTHB(subtotal)} />
              <Row
                label="ค่าจัดส่ง"
                value={shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                valueClass={shipping === 0 ? 'text-[color:var(--shop-primary,#FF5A6A)] font-medium' : ''}
              />
            </div>
            <div
              className="border-t pt-3 flex items-baseline justify-between"
              style={{ borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <span className="font-[family:var(--font-kanit)] font-medium">ยอดรวม</span>
              <span className="font-[family:var(--font-kanit)] font-semibold text-2xl text-[color:var(--shop-primary,#FF5A6A)]">
                {formatTHB(total)}
              </span>
            </div>
            <Link
              href={`/stores/${store.slug}/checkout`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-[0.98]"
              style={{
                background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
              }}
            >
              ดำเนินการชำระเงิน <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/stores/${store.slug}/category`}
              className="block text-center text-xs text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)]"
            >
              ← เลือกซื้อสินค้าเพิ่ม
            </Link>
          </div>
          <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] text-center px-4">
            ชำระเงินออนไลน์ · PromptPay · บัตรเครดิต · โอนผ่านธนาคาร
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-[color:var(--shop-ink-muted,#6B7280)]">{label}</span>
      <span className={`text-[color:var(--shop-ink,#1A1A1F)] font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
