/**
 * BusinessModelCouponStrip — replaces BusinessModelTierLadder on the BM
 * homepage. Three platform-wide bulk coupons (BULK10 / BULK15 / BULK20)
 * surfaced as click-to-copy cards. Buyer copies the code, pastes it at
 * checkout, server-side validator in lib/coupons/server.ts applies the
 * discount against the Coupon row in Postgres.
 *
 * Visual language matches the rest of the BM theme: caps eyebrow + bold
 * sans h2 header, 3-up card grid with mono code + mint % savings chip.
 * Cards are buttons so keyboard / screen-reader users get the same copy
 * affordance as a mouse click; aria-live announces the copied state.
 *
 * Client component — needs navigator.clipboard + setState for the
 * "Copied" toast. No Prisma reads, no props.
 */

'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

interface BulkCoupon {
  code: string;
  percent: number;
  minSpendBlurb: string;
}

const COUPONS: ReadonlyArray<BulkCoupon> = [
  { code: 'BULK10', percent: 10, minSpendBlurb: 'ไม่มีขั้นต่ำ' },
  { code: 'BULK15', percent: 15, minSpendBlurb: 'ขั้นต่ำ ฿5,000' },
  { code: 'BULK20', percent: 20, minSpendBlurb: 'ขั้นต่ำ ฿20,000' },
];

export function BusinessModelCouponStrip() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Clipboard blocked (insecure context / Safari old) — silently no-op;
      // the code is still rendered on screen for manual selection.
    }
  };

  return (
    <section
      className="border-b py-12 sm:py-16"
      style={{
        background: 'var(--shop-bg)',
        borderColor: 'var(--shop-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            คูปองส่วนลด · ใช้ได้ที่หน้าชำระเงิน
          </p>
          <div
            aria-hidden
            className="mt-3 h-1 w-12 rounded-md"
            style={{ background: 'var(--shop-primary)' }}
          />
          <h2
            className="mt-5 text-3xl sm:text-4xl md:text-5xl"
            style={{
              fontFamily: BM_HEADING_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            ยิ่งซื้อเยอะ ยิ่งคุ้ม
          </h2>
          <p
            className="mt-3 max-w-xl text-sm sm:text-base"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            กดที่การ์ดเพื่อคัดลอกโค้ด แล้ววางที่หน้าชำระเงิน · 1 ออเดอร์ใช้ได้ 1 โค้ด
          </p>
        </header>

        <ul className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {COUPONS.map((c) => {
            const copied = copiedCode === c.code;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => handleCopy(c.code)}
                  aria-label={`คัดลอกโค้ด ${c.code} ลด ${c.percent}%`}
                  className="group flex w-full flex-col rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-6"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      data-bm-mono="true"
                      className="text-2xl font-bold sm:text-3xl"
                      style={{
                        fontFamily: BM_MONO_FONT,
                        color: 'var(--shop-ink)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {c.code}
                    </span>
                    <span
                      data-bm-mono="true"
                      className="inline-flex h-7 shrink-0 items-center rounded-full px-3 text-xs font-bold uppercase text-white sm:h-8 sm:text-sm"
                      style={{
                        background: 'var(--shop-savings, #10b981)',
                        fontFamily: BM_MONO_FONT,
                        letterSpacing: '0.04em',
                      }}
                    >
                      -{c.percent}%
                    </span>
                  </div>

                  <p
                    className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {c.minSpendBlurb}
                  </p>

                  <p
                    aria-live="polite"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em]"
                    style={{ color: copied ? 'var(--shop-savings, #10b981)' : 'var(--shop-primary)' }}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        คัดลอกแล้ว
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        คัดลอกโค้ด
                      </>
                    )}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <p
          className="mt-5 text-xs"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          * โค้ดมีจำนวนจำกัด · ระบบจะหักส่วนลดให้อัตโนมัติเมื่อใส่โค้ดที่หน้าชำระเงิน
        </p>
      </div>
    </section>
  );
}
