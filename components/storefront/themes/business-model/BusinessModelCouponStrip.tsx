/**
 * BusinessModelCouponStrip — replaces BusinessModelTierLadder on the BM
 * homepage. Three platform-wide bulk coupons (BULK10 / BULK15 / BULK20)
 * surfaced as ticket-style click-to-copy cards. Buyer copies the code,
 * pastes it at checkout, server-side validator in lib/coupons/server.ts
 * applies the discount against the Coupon row in Postgres.
 *
 * Visual: real-coupon ticket aesthetic — left half is the big white "-N%"
 * sitting on the BM red, perforated dashed divider with two cut-out notches
 * (top + bottom) faking the tear-line, right half holds the mono code +
 * min-spend blurb + a white copy-pill that flips to "คัดลอกแล้ว" on click.
 * Background red escalates (10 → 20%) so the eye reads the savings ladder
 * even before parsing the numbers.
 *
 * Client component — needs navigator.clipboard + setState for the
 * copied-state flip. No Prisma reads, no props.
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
  // Tailwind-free hex pair so the gradient renders inside an inline
  // style — keeps the file untouched if the operator later swaps the
  // base brand red.
  gradient: [string, string];
}

const COUPONS: ReadonlyArray<BulkCoupon> = [
  {
    code: 'BULK10',
    percent: 10,
    minSpendBlurb: 'ไม่มีขั้นต่ำ',
    gradient: ['#ef4444', '#dc2626'], // red-500 → red-600
  },
  {
    code: 'BULK15',
    percent: 15,
    minSpendBlurb: 'ขั้นต่ำ ฿5,000',
    gradient: ['#dc2626', '#b91c1c'], // red-600 → red-700
  },
  {
    code: 'BULK20',
    percent: 20,
    minSpendBlurb: 'ขั้นต่ำ ฿20,000',
    gradient: ['#b91c1c', '#7f1d1d'], // red-700 → red-900
  },
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

        <ul className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {COUPONS.map((c) => {
            const copied = copiedCode === c.code;
            const gradient = `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})`;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => handleCopy(c.code)}
                  aria-label={`คัดลอกโค้ด ${c.code} ลด ${c.percent}%`}
                  className="group relative flex w-full overflow-hidden rounded-2xl text-left shadow-md ring-1 transition hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background: gradient,
                    // ring color matches the deeper end of the gradient at
                    // low alpha so the card sits on the page like a stamped
                    // foil, not a flat block.
                    boxShadow:
                      '0 4px 14px -4px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                >
                  {/* LEFT: big -N% hero */}
                  <div className="flex flex-[1.1] flex-col items-center justify-center px-3 py-7 sm:py-8">
                    <span
                      data-bm-mono="true"
                      className="text-[2.75rem] leading-none font-black text-white sm:text-5xl"
                      style={{
                        fontFamily: BM_MONO_FONT,
                        letterSpacing: '-0.04em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                      }}
                    >
                      -{c.percent}%
                    </span>
                    <span
                      className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85"
                    >
                      ส่วนลดทันที
                    </span>
                  </div>

                  {/* PERFORATED DIVIDER + cut-out notches */}
                  <div className="relative w-px shrink-0">
                    <span
                      aria-hidden
                      className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
                      style={{ background: 'var(--shop-bg)' }}
                    />
                    <span
                      aria-hidden
                      className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
                      style={{ background: 'var(--shop-bg)' }}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-y-3 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-white/45"
                    />
                  </div>

                  {/* RIGHT: code + min-spend + copy CTA */}
                  <div className="flex flex-[1.4] flex-col justify-between gap-3 px-5 py-6 sm:py-7">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
                        โค้ด
                      </p>
                      <p
                        data-bm-mono="true"
                        className="mt-1 text-xl font-bold text-white sm:text-2xl"
                        style={{
                          fontFamily: BM_MONO_FONT,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {c.code}
                      </p>
                      <p className="mt-2 text-xs font-medium text-white/90">
                        {c.minSpendBlurb}
                      </p>
                    </div>

                    <span
                      aria-live="polite"
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] shadow-sm transition group-hover:shadow-md"
                      style={{ color: copied ? '#059669' : c.gradient[1] }}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          คัดลอกแล้ว
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
                          คัดลอกโค้ด
                        </>
                      )}
                    </span>
                  </div>
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
