/**
 * BusinessModelTierLadder — static 3-tier savings explainer for the BM
 * homepage.
 *
 * Visual language matches the deal-dashboard family: caps eyebrow + bold
 * sans h2 header ("DEAL TIERS · Volume discount applied automatically"),
 * then a bordered spreadsheet-card with three tier rows. Each row reads as
 * a ledger line:
 *   [Tier label]  [Qty range]  [Unit-price multiplier]  [Mint savings chip]
 *
 * Mirrors the BM_DEFAULT_TIERS data shape used by BusinessModelCartPage's
 * tier banner, but the multipliers/percentages here are slightly more
 * aggressive than the cart's defaults to match the homepage spec
 * (8% / 15% off vs 10% / 20%) — the homepage is a marketing surface, not
 * the live cart calculator. Spec-locked values:
 *   - Tier 1 (1-9 units)   — base price, no chip
 *   - Tier 2 (10-49 units) — 8% off, mint chip
 *   - Tier 3 (50+ units)   — 15% off, mint chip
 *
 * Pure server component. No Prisma reads, no client state.
 */

import { TrendingDown } from 'lucide-react';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

interface BusinessModelTierRow {
  tier: number;
  qtyRange: string;
  multiplier: string;
  savingsPct: number;
  blurb: string;
}

const TIERS: ReadonlyArray<BusinessModelTierRow> = [
  {
    tier: 1,
    qtyRange: '1-9',
    multiplier: '1.00×',
    savingsPct: 0,
    blurb: 'ราคาตั้งต้น',
  },
  {
    tier: 2,
    qtyRange: '10-49',
    multiplier: '0.92×',
    savingsPct: 8,
    blurb: 'คำนวณอัตโนมัติเมื่อชำระเงิน',
  },
  {
    tier: 3,
    qtyRange: '50+',
    multiplier: '0.85×',
    savingsPct: 15,
    blurb: 'ราคาต่อหน่วยดีที่สุด',
  },
];

export function BusinessModelTierLadder() {
  return (
    <section
      className="border-b py-12 sm:py-16"
      style={{
        background: 'var(--shop-bg)',
        borderColor: 'var(--shop-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header — caps eyebrow + bold sans h2 */}
        <header className="mb-6 sm:mb-8">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ระดับดีล · ส่วนลดจากปริมาณคำนวณอัตโนมัติ
          </p>
          <div
            aria-hidden
            className="mt-3 h-1 w-12 rounded-md"
            style={{ background: 'var(--shop-primary)' }}
          />
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2
              className="text-2xl sm:text-3xl"
              style={{
                fontFamily: BM_HEADING_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.015em',
                lineHeight: 1.1,
              }}
            >
              สั่งซื้อมากขึ้น ประหยัดมากขึ้น
            </h2>
            <p
              className="text-sm"
              style={{
                fontFamily: BM_HEADING_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              ไม่ต้องใช้คูปอง ไม่ต้องต่อรอง ระบบคำนวณส่วนลดทุกรายการอัตโนมัติ
            </p>
          </div>
        </header>

        {/* Spreadsheet-style ledger — header strip + 3 ledger rows */}
        <div
          className="overflow-hidden rounded-md border bg-white"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          {/* Header strip */}
          <div
            className="hidden grid-cols-[5rem_minmax(0,1fr)_8rem_8rem_minmax(0,1fr)] gap-3 border-b px-5 py-3 text-[10px] font-semibold uppercase sm:grid"
            style={{
              background: '#fafafa',
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.12em',
            }}
          >
            <span>ระดับ</span>
            <span>ช่วงจำนวน</span>
            <span>คูณ</span>
            <span>ประหยัด</span>
            <span>หมายเหตุ</span>
          </div>

          <ul>
            {TIERS.map((t, idx) => {
              const isAlt = idx % 2 === 1;
              return (
                <li
                  key={t.tier}
                  className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-3 border-t px-5 py-4 sm:grid-cols-[5rem_minmax(0,1fr)_8rem_8rem_minmax(0,1fr)] sm:py-5"
                  style={{
                    borderColor: 'var(--shop-border)',
                    background: isAlt ? 'var(--shop-muted)' : undefined,
                  }}
                >
                  {/* Tier badge — caps + mono numeral */}
                  <div className="flex items-center">
                    <span
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold uppercase"
                      style={{
                        borderColor:
                          t.savingsPct > 0
                            ? 'var(--shop-primary)'
                            : 'var(--shop-border)',
                        background:
                          t.savingsPct > 0
                            ? 'var(--shop-primary)'
                            : '#ffffff',
                        color:
                          t.savingsPct > 0 ? '#ffffff' : 'var(--shop-ink)',
                        letterSpacing: '0.12em',
                      }}
                    >
                      ระดับ
                      <span
                        data-bm-mono="true"
                        style={{
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {t.tier}
                      </span>
                    </span>
                  </div>

                  {/* Qty range — mono caps caption */}
                  <div className="min-w-0">
                    <p
                      data-bm-mono="true"
                      className="text-base font-bold sm:text-lg"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {t.qtyRange}{' '}
                      <span
                        className="text-[10px] font-semibold uppercase"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          letterSpacing: '0.12em',
                          fontFamily: BM_HEADING_FONT,
                        }}
                      >
                        ชิ้น
                      </span>
                    </p>
                    {/* Mobile-only: bunch the multiplier + chip under qty */}
                    <p className="mt-1 flex flex-wrap items-baseline gap-2 sm:hidden">
                      <span
                        data-bm-mono="true"
                        className="text-sm font-bold"
                        style={{
                          color: 'var(--shop-ink)',
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {t.multiplier}
                      </span>
                      {t.savingsPct > 0 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            background: 'var(--shop-savings, #10b981)',
                            color: '#ffffff',
                            letterSpacing: '0.06em',
                          }}
                        >
                          <TrendingDown className="h-2.5 w-2.5" />
                          <span
                            data-bm-mono="true"
                            style={{
                              fontFamily: BM_MONO_FONT,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            -{t.savingsPct}%
                          </span>
                        </span>
                      )}
                    </p>
                    <p
                      className="mt-1 text-xs sm:hidden"
                      style={{
                        fontFamily: BM_HEADING_FONT,
                        color: 'var(--shop-ink-muted)',
                      }}
                    >
                      {t.blurb}
                    </p>
                  </div>

                  {/* Unit multiplier (desktop) */}
                  <div className="hidden sm:block">
                    <span
                      data-bm-mono="true"
                      className="text-base font-bold"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {t.multiplier}
                    </span>
                  </div>

                  {/* Mint savings chip (desktop) */}
                  <div className="hidden sm:block">
                    {t.savingsPct > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-bold uppercase shadow-sm"
                        style={{
                          background: 'var(--shop-savings, #10b981)',
                          color: '#ffffff',
                          letterSpacing: '0.06em',
                        }}
                      >
                        <TrendingDown className="h-3 w-3" />
                        <span
                          data-bm-mono="true"
                          style={{
                            fontFamily: BM_MONO_FONT,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          -{t.savingsPct}%
                        </span>
                      </span>
                    ) : (
                      <span
                        className="text-[11px] font-semibold uppercase"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          letterSpacing: '0.12em',
                          fontFamily: BM_HEADING_FONT,
                        }}
                      >
                        — ไม่มีส่วนลด
                      </span>
                    )}
                  </div>

                  {/* Notes (desktop) */}
                  <div className="hidden sm:block">
                    <p
                      className="text-xs"
                      style={{
                        fontFamily: BM_HEADING_FONT,
                        color: 'var(--shop-ink-muted)',
                      }}
                    >
                      {t.blurb}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer note — sober dashboard line */}
        <p
          className="mt-4 text-[11px] font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.12em',
          }}
        >
          ระดับส่วนลดคำนวณแยกต่อ SKU เมื่อชำระเงิน · ไม่ต้องใช้รหัส
        </p>
      </div>
    </section>
  );
}
