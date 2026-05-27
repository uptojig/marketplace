'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Code2,
  Tag,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface CartProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  items?: unknown;
  freeShippingThreshold?: number;
  flatShippingTHB?: number;
}

export default function Cart({ store }: CartProps) {
  const lines = useCart((s) => s.lines.filter((l) => l.storeSlug === store.slug));
  const updateQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.remove);

  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = lines.reduce((sum, l) => sum + l.priceTHB * l.qty, 0);
  const discount = appliedCoupon
    ? Math.round(subtotal * 0.1) // 10% off mock — server validates anyway
    : 0;
  // Digital templates — no shipping fee
  const shipping = 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponError('กรุณากรอกรหัสคูปอง');
      return;
    }
    if (code === 'SAVE10' || code === 'FIRSTBUY') {
      setAppliedCoupon(code);
    } else {
      setCouponError('รหัสคูปองไม่ถูกต้องหรือหมดอายุ');
    }
  };

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] mb-4">
            <Link
              href={`/stores/${store.slug}`}
              className="hover:text-[color:var(--shop-primary,#82B440)]"
            >
              {store.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[color:var(--shop-ink,#0D1421)]">ตะกร้าสินค้า</span>
          </nav>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)]">
            ตะกร้าสินค้า
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-2">
            {lines.length} เทมเพลตในตะกร้า · ดาวน์โหลดได้ทันทีหลังชำระเงิน
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lines.length === 0 ? (
          <EmptyCart slug={store.slug} />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
            {/* Line items */}
            <div className="space-y-3">
              {lines.map((line) => (
                <div
                  key={line.productId}
                  className="rounded-lg p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
                  style={{
                    background: 'var(--shop-bg-soft, #FFFFFF)',
                    border: '1px solid var(--shop-border, #E5E7EB)',
                  }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${line.productId}`}
                    className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden relative"
                    style={{ background: 'var(--shop-muted, #F3F4F6)' }}
                  >
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Code2 className="w-7 h-7 text-[color:var(--shop-primary,#82B440)]/40" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/stores/${store.slug}/products/${line.productId}`}
                      className="block"
                    >
                      <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm sm:text-base line-clamp-2 text-[color:var(--shop-ink,#0D1421)] hover:text-[color:var(--shop-primary,#82B440)]">
                        {line.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] mt-0.5">
                      ดิจิทัล · ดาวน์โหลดทันที
                    </p>
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <div
                        className="inline-flex items-center rounded-md border"
                        style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(line.productId, Math.max(1, line.qty - 1))
                          }
                          aria-label="ลดจำนวน"
                          className="w-8 h-8 inline-flex items-center justify-center text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#82B440)]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(line.productId, line.qty + 1)}
                          aria-label="เพิ่มจำนวน"
                          className="w-8 h-8 inline-flex items-center justify-center text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#82B440)]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-[family:var(--font-kanit)] font-bold text-base text-[color:var(--shop-primary,#82B440)]">
                          {formatTHB(line.priceTHB * line.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLine(line.productId)}
                          aria-label="ลบ"
                          className="text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-savings,#FF6B35)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--shop-primary,#82B440)] hover:underline mt-3"
              >
                ← ดูเทมเพลตเพิ่มเติม
              </Link>
            </div>

            {/* Summary sticky */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
              {/* Coupon */}
              <div
                className="rounded-lg p-5"
                style={{
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                  border: '1px solid var(--shop-border, #E5E7EB)',
                }}
              >
                <label
                  htmlFor="coupon"
                  className="font-[family:var(--font-kanit)] text-sm font-bold flex items-center gap-2 mb-3 text-[color:var(--shop-ink,#0D1421)]"
                >
                  <Tag className="w-4 h-4 text-[color:var(--shop-primary,#82B440)]" />
                  รหัสคูปอง
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="เช่น SAVE10"
                    className="flex-1 rounded-md border px-3 h-10 text-sm bg-white focus:border-[color:var(--shop-primary,#82B440)] outline-none"
                    style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-md px-4 h-10 text-sm font-semibold text-white"
                    style={{ background: 'var(--shop-ink, #0D1421)' }}
                  >
                    ใช้
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-[color:var(--shop-savings,#FF6B35)] mt-2">
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <p className="text-xs text-[color:var(--shop-primary,#82B440)] mt-2 font-medium">
                    ใช้คูปอง {appliedCoupon} แล้ว — ลด 10%
                  </p>
                )}
              </div>

              {/* Order summary */}
              <div
                className="rounded-lg p-5 space-y-3"
                style={{
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                  border: '1px solid var(--shop-border, #E5E7EB)',
                }}
              >
                <h2 className="font-[family:var(--font-kanit)] text-base font-bold text-[color:var(--shop-ink,#0D1421)]">
                  สรุปคำสั่งซื้อ
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-[color:var(--shop-ink-muted,#6B7280)]">
                      ราคารวม ({lines.length} รายการ)
                    </dt>
                    <dd className="text-[color:var(--shop-ink,#0D1421)] tabular-nums">
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-[color:var(--shop-savings,#FF6B35)]">
                        ส่วนลดคูปอง
                      </dt>
                      <dd className="text-[color:var(--shop-savings,#FF6B35)] tabular-nums">
                        -{formatTHB(discount)}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-[color:var(--shop-ink-muted,#6B7280)]">
                      ค่าจัดส่ง
                    </dt>
                    <dd className="text-[color:var(--shop-primary,#82B440)] tabular-nums font-medium">
                      ฟรี (ดิจิทัล)
                    </dd>
                  </div>
                  <div
                    className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                  >
                    <dt className="font-[family:var(--font-kanit)] font-bold text-base text-[color:var(--shop-ink,#0D1421)]">
                      รวมทั้งสิ้น
                    </dt>
                    <dd className="font-[family:var(--font-kanit)] font-bold text-xl text-[color:var(--shop-primary,#82B440)] tabular-nums">
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md h-12 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
                  style={{
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
                  }}
                >
                  ไปชำระเงิน
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <ul className="space-y-2 pt-3 text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
                  <li className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                    ดาวน์โหลดทันทีหลังชำระเงิน
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                    การชำระเงินปลอดภัย SSL
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyCart({ slug }: { slug: string }) {
  return (
    <div
      className="rounded-lg p-12 text-center max-w-xl mx-auto"
      style={{
        background: 'var(--shop-bg-soft, #FFFFFF)',
        border: '1px dashed var(--shop-border, #E5E7EB)',
      }}
    >
      <ShoppingCart className="w-16 h-16 mx-auto mb-5 text-[color:var(--shop-ink-muted,#6B7280)]/40" />
      <h2 className="font-[family:var(--font-kanit)] text-2xl font-bold mb-3 text-[color:var(--shop-ink,#0D1421)]">
        ตะกร้าว่าง
      </h2>
      <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-6">
        ยังไม่มีเทมเพลตในตะกร้า — เริ่มจากการพรีวิวเทมเพลตที่คุณสนใจ
      </p>
      <Link
        href={`/stores/${slug}/category`}
        className="inline-flex items-center gap-2 rounded-md px-6 h-11 text-sm font-bold text-white"
        style={{
          background:
            'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
        }}
      >
        เริ่มเลือกเทมเพลต
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
