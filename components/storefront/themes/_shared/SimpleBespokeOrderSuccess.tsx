/**
 * Shared bespoke order-success scaffold for the slim themes
 * (everyday / taobao / packaging / community). Renders a fully
 * theme-styled confirmation page: hero band + check icon + order
 * summary card + next-steps strip + continue-shopping CTA.
 *
 * Caller in /app/stores/[slug]/checkout/success/page.tsx passes the
 * same shared sharedSuccessProps used by other family pages.
 */

import Link from 'next/link';
import { CheckCircle, ShoppingBag, Truck, Phone } from 'lucide-react';

export interface SimpleBespokeOrderSuccessTokens {
  /** Solid color or CSS gradient — used for the hero band. */
  heroBg: string;
  /** Foreground color on the hero. */
  heroFg: string;
  /** Accent (chip backgrounds, dividers). */
  accent: string;
  /** Primary CTA color. */
  primary: string;
  /** Eyebrow line above the heading. */
  eyebrow: string;
  /** Main confirmation heading. */
  heading: string;
  /** Secondary line. */
  subheading: string;
}

export interface SimpleBespokeOrderSuccessLine {
  productId: string;
  title: string;
  imageUrl?: string;
  priceTHB: number;
  qty: number;
}

export interface SimpleBespokeOrderSuccessProps {
  storeSlug: string;
  storeName: string;
  orderId: string;
  orderNumber?: string | null;
  totalTHB: number;
  lines: SimpleBespokeOrderSuccessLine[];
  tokens: SimpleBespokeOrderSuccessTokens;
}

export function SimpleBespokeOrderSuccess({
  storeSlug,
  storeName,
  orderId,
  orderNumber,
  totalTHB,
  lines,
  tokens,
}: SimpleBespokeOrderSuccessProps) {
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <div style={{ background: 'var(--shop-bg, #FAFAFA)', minHeight: '100vh' }}>
      {/* Hero — big theme banner with check icon */}
      <section
        className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        style={{ background: tokens.heroBg, color: tokens.heroFg }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="mx-auto mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            <CheckCircle className="h-12 w-12" strokeWidth={2.5} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] opacity-90">
            {tokens.eyebrow}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {tokens.heading}
          </h1>
          <p className="mt-3 text-sm sm:text-base" style={{ opacity: 0.92 }}>
            {tokens.subheading}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] backdrop-blur-sm">
            ออเดอร์ #{orderNumber ?? orderId.slice(-8).toUpperCase()}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Order summary card */}
        <section
          className="rounded-2xl border bg-white p-6 sm:p-8"
          style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
        >
          <header className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold sm:text-xl" style={{ color: 'var(--shop-ink, #0A0A0A)' }}>
              สรุปคำสั่งซื้อ
            </h2>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: tokens.accent, color: '#0A0A0A' }}
            >
              {itemCount} ชิ้น
            </span>
          </header>

          <ul className="space-y-3 border-b border-t py-4" style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}>
            {lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.imageUrl && (
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="h-12 w-12 rounded-md object-cover"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold" style={{ color: 'var(--shop-ink, #0A0A0A)' }}>
                    {l.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--shop-ink-muted, #525252)' }}>
                    × {l.qty}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color: tokens.primary }}>
                  ฿{(l.priceTHB * l.qty).toLocaleString('th-TH')}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shop-ink-muted, #525252)' }}>
              รวมทั้งหมด
            </span>
            <span className="text-2xl font-extrabold tabular-nums" style={{ color: tokens.primary }}>
              ฿{totalTHB.toLocaleString('th-TH')}
            </span>
          </div>
        </section>

        {/* Next steps strip — 3 cards */}
        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: <ShoppingBag className="h-5 w-5" />, title: 'ตรวจสอบอีเมล', desc: 'รายละเอียดคำสั่งซื้อส่งให้ทางอีเมล' },
            { icon: <Truck className="h-5 w-5" />, title: 'จัดส่งใน 1-3 วัน', desc: 'ติดตามสถานะได้ที่หน้าออเดอร์' },
            { icon: <Phone className="h-5 w-5" />, title: 'มีคำถาม?', desc: 'ติดต่อร้านได้ทันที' },
          ].map((step, i) => (
            <div
              key={i}
              className="rounded-xl border bg-white p-4"
              style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
            >
              <div className="mb-2" style={{ color: tokens.primary }}>
                {step.icon}
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--shop-ink, #0A0A0A)' }}>
                {step.title}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--shop-ink-muted, #525252)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </section>

        {/* CTA — continue shopping */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/stores/${storeSlug}`}
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:opacity-90"
            style={{ background: tokens.primary }}
          >
            ช้อปต่อที่ {storeName} →
          </Link>
          <Link
            href={`/stores/${storeSlug}/account/orders`}
            className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] transition hover:opacity-80"
            style={{ borderColor: tokens.primary, color: tokens.primary }}
          >
            ดูออเดอร์ทั้งหมด
          </Link>
        </div>
      </main>
    </div>
  );
}
