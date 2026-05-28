'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Wallet,
  Check,
  Sparkles,
  Coins,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

/**
 * MysticMu Checkout — level99 is a digital-only store. There is no
 * shipping address; buyers fund a per-store wallet on the topup page and
 * pay for products with STORE CREDIT (mirrors the `sheetlab-formula`
 * digital store via `_shared/thai-checkout-adapter-view.tsx`).
 *
 * Flow on this single screen:
 *   1. Fetch the buyer's per-store balance from
 *      `/api/credit/balance?storeSlug=…` on mount (401 ⇒ guest, CREDIT
 *      unavailable).
 *   2. Show cart lines + a Mario-styled CREDIT pay button.
 *   3. On pay, POST `/api/checkout` with `paymentMethod: "CREDIT"`, no
 *      `address` (all-digital) and `guestContact: { name }`.
 *   4. `{ paid: true }` ⇒ redirect to `/stores/<slug>/account/downloads`.
 *      Short balance / guest ⇒ disable + link to the topup page.
 */
export default function Checkout({ store }: { store: StoreLite }) {
  const allLines = useCart((s) => s.lines);
  const clearStore = useCart((s) => s.clearStore);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  // Digital-only: no shipping fee, total === subtotal.
  const total = subtotal;

  // Avoid SSR/client hydration mismatch on the persisted cart.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Live per-store credit balance + auth state. 401 ⇒ guest (CREDIT
  // unavailable). Signed-in buyers with balance < total see the pay
  // button disabled + a topup link.
  const [balanceTHB, setBalanceTHB] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  useEffect(() => {
    if (!store.slug) return;
    fetch(`/api/credit/balance?storeSlug=${encodeURIComponent(store.slug)}`)
      .then((r) => {
        if (r.status === 401) {
          setIsGuest(true);
          setBalanceTHB(null);
          return null;
        }
        setIsGuest(false);
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then((data: { balanceTHB?: number } | null) => {
        if (data && typeof data.balanceTHB === 'number') {
          setBalanceTHB(data.balanceTHB);
        }
      })
      .catch(() => {
        // Treat as unauthenticated; CREDIT stays disabled.
      });
  }, [store.slug]);

  const creditEnough = !isGuest && balanceTHB !== null && balanceTHB >= total;
  const shortBy =
    !isGuest && balanceTHB !== null ? Math.max(0, total - balanceTHB) : 0;
  const canPay = creditEnough && lines.length > 0 && !!name.trim() && !submitting;

  async function handleSubmit() {
    if (!canPay) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          // All-digital order: omit `address`; the API treats its absence
          // as the signal to skip shipping. Snapshot the buyer name only.
          guestContact: { name: name.trim() || 'Customer' },
          // CREDIT debits the per-store wallet. Enum: "ANYPAY" | "CREDIT".
          paymentMethod: 'CREDIT',
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `ชำระเงินไม่สำเร็จ (${res.status})`);
      }
      const data = (await res.json()) as { paid?: boolean };
      if (data.paid) {
        clearStore(store.slug);
        // CREDIT + all-digital → downloads page.
        window.location.href = `/stores/${store.slug}/account/downloads`;
        return;
      }
      // CREDIT should always come back paid; defensive fallback.
      setError('ไม่สามารถตัดเครดิตได้ ลองอีกครั้ง');
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เครือข่ายไม่ตอบสนอง ลองอีกครั้ง');
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return <div className="bg-[#5C94FC] min-h-screen" />;
  }

  if (lines.length === 0) {
    return (
      <div className="bg-[#5C94FC] min-h-screen text-[#1A1A2E] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-10 max-w-md w-full">
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black uppercase tracking-tight mb-3">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-[#4A4A6E] mb-4">
            มูได้ที่ไหนเอ่ย?
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex h-12 px-6 mt-2 items-center justify-center bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ช้อปเลย
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-12">
      {/* Header */}
      <section className="bg-[#009A4E] border-b-4 border-[#1A1A2E] px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-3 font-[family:var(--font-kanit)]">
            <Coins className="w-3.5 h-3.5 text-[#E52521]" />
            Coin Block · จ่ายด้วยเครดิตร้าน
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#1A1A2E]">
            ชำระเงิน
          </h1>
          <p className="mt-2 text-xs font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-white/90">
            ⭐ สินค้าดิจิทัล · ไม่ต้องกรอกที่อยู่ · ดาวน์โหลดได้ทันทีหลังตัดเครดิต
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        <main className="space-y-6">
          {/* Cart review */}
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5">
            <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight mb-4 border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#E52521]" />
              ตรวจสอบสินค้า
            </h2>
            <div className="space-y-3">
              {lines.map((l) => (
                <div
                  key={l.productId}
                  className="flex gap-3 items-center border-4 border-[#1A1A2E] bg-[#FFF8DC] p-3"
                >
                  <div className="w-16 h-16 shrink-0 border-4 border-[#1A1A2E] bg-[#E8E8F0] overflow-hidden relative">
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#FFD700]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family:var(--font-kanit)] font-black uppercase tracking-tight text-sm line-clamp-2">
                      {l.title}
                    </p>
                    <p className="text-xs font-bold text-[#4A4A6E] mt-1">x{l.qty}</p>
                  </div>
                  <p className="font-[family:var(--font-kanit)] font-black text-[#E52521] shrink-0">
                    {formatTHB(l.priceTHB * l.qty)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Buyer name */}
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5 space-y-3">
            <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E52521]" />
              ชื่อผู้ซื้อ
            </h2>
            <label className="block font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest mb-1">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="พิมพ์ชื่อของคุณ"
              className="w-full border-4 border-[#1A1A2E] px-3 py-2 text-sm font-bold focus:outline-none focus:bg-[#FFF8DC]"
            />
          </div>

          {/* Payment — store credit */}
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5 space-y-4">
            <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#E52521]" />
              ชำระด้วยเครดิตร้าน
            </h2>

            {isGuest ? (
              <div className="border-4 border-[#1A1A2E] bg-[#FFF8DC] p-4 space-y-3">
                <p className="font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#E52521]" />
                  เข้าสู่ระบบเพื่อใช้เครดิต
                </p>
                <p className="text-xs font-bold text-[#4A4A6E]">
                  ร้านนี้รับชำระด้วยเครดิตร้านเท่านั้น เข้าสู่ระบบและเติมเครดิตก่อนสั่งซื้อ
                </p>
              </div>
            ) : (
              <>
                {/* Balance block — Mario coin pickup */}
                <div className="border-4 border-[#1A1A2E] bg-[#FFD700] shadow-[3px_3px_0_0_#1A1A2E] p-4 flex items-center justify-between">
                  <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#E52521]" />
                    เครดิตคงเหลือ
                  </span>
                  <span className="font-[family:var(--font-kanit)] font-black text-2xl">
                    {balanceTHB === null ? '…' : formatTHB(balanceTHB)}
                  </span>
                </div>

                {!creditEnough && (
                  <div className="border-4 border-[#E52521] bg-[#FFF0F0] p-4 space-y-3">
                    <p className="font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-[#E52521] flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      เครดิตไม่พอ
                    </p>
                    <p className="text-xs font-bold text-[#4A4A6E]">
                      ต้องเติมอีก{' '}
                      <span className="text-[#E52521] font-[family:var(--font-kanit)] font-black">
                        {formatTHB(shortBy)}
                      </span>{' '}
                      จึงจะสั่งซื้อได้
                    </p>
                    <Link
                      href={`/stores/${store.slug}/account/credit/topup`}
                      className="inline-flex h-11 px-5 items-center justify-center gap-2 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    >
                      <Coins className="w-4 h-4" />
                      เติมเครดิต
                    </Link>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="border-4 border-[#E52521] bg-[#FFF0F0] text-[#E52521] p-3 font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest">
                {error}
              </div>
            )}
          </div>

          {/* Pay button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canPay}
            className="w-full h-14 px-6 bg-[#009A4E] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-5 h-5" />
            {submitting ? 'กำลังตัดเครดิต…' : `จ่ายด้วยเครดิต · ${formatTHB(total)}`}
          </button>
        </main>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-32 self-start">
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-5 space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FFD700]" />
              สรุป
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E]">
                  ยอดสินค้า
                </span>
                <span className="font-bold">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E]">
                  จัดส่ง
                </span>
                <span className="font-bold text-[#009A4E]">ดิจิทัล · ฟรี</span>
              </div>
            </div>
            <div className="border-t-4 border-[#1A1A2E] pt-3 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-black uppercase">รวม</span>
              <span className="font-[family:var(--font-kanit)] font-black text-2xl text-[#E52521]">
                {formatTHB(total)}
              </span>
            </div>
            {!isGuest && balanceTHB !== null && (
              <div className="border-t-4 border-[#1A1A2E] pt-3 flex items-baseline justify-between">
                <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E]">
                  เครดิตคงเหลือ
                </span>
                <span
                  className={`font-[family:var(--font-kanit)] font-black ${
                    creditEnough ? 'text-[#009A4E]' : 'text-[#E52521]'
                  }`}
                >
                  {formatTHB(balanceTHB)}
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
