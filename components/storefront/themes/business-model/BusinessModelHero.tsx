/**
 * BusinessModelHero — landing-page hero for the business-model homepage.
 *
 * Visual language matches BusinessModelCategoryPage exactly (deal-dashboard /
 * wholesale-utility):
 *   - Red countdown stripe pinned at top: "FLASH DEAL · HH:MM:SS" with mono
 *     numerics, deterministic stub from the slug so SSR is stable. Same trick
 *     as stubCountdown() in BusinessModelCategoryPage.
 *   - "WHOLESALE · {storeName}" tight-caps eyebrow (0.12em tracking).
 *   - Bold sans h1 — "{storeName} bulk pricing for serious buyers".
 *     Inter-bold via --font-sans, tight letter-spacing -0.015em.
 *   - 3-stat ledger row in the spreadsheet style: each stat in a hairline
 *     bordered cell, mono-numeric value + caps unit. Matches the stat tiles
 *     on BusinessModelBrandStory.
 *   - Two CTAs in a flex row: solid red "BROWSE DEALS" rectangle (rounded-md
 *     but corners read sharp at the heading scale) + outlined slate "Request
 *     a quote" — matches the cart's checkout / quote pairing.
 *
 * Server component — no client state. Sits between the shared ShopHeader
 * (from app/stores/[slug]/layout.tsx) and the rest of the homepage; does NOT
 * render its own header / nav.
 *
 * Note: the countdown is a deterministic stub (TODO: wire to real "deals
 * reset at" timestamp once Sale rows land in Prisma). It's intentionally NOT
 * a live timer because the hero is server-rendered.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, Timer } from 'lucide-react';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

interface Props {
  storeSlug: string;
  storeName: string;
  bannerUrl?: string | null;
  tagline?: string | null;
  description?: string | null;
}

/**
 * Static deterministic countdown stub — same approach as
 * BusinessModelCategoryPage.stubCountdown(). Renders HH:MM:SS in mono with
 * tabular-nums so SSR/CSR agree. Caller is the FLASH DEAL stripe atop the
 * hero.
 */
function stubFlashCountdown(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hh = String(2 + (hash % 6)).padStart(2, '0');
  const mm = String(hash % 60).padStart(2, '0');
  const ss = String((hash >> 8) % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function BusinessModelHero({
  storeSlug,
  storeName,
  bannerUrl,
  tagline,
  description,
}: Props) {
  const countdown = stubFlashCountdown(storeSlug);
  const headline = tagline?.trim() || storeName;
  const subhead =
    description?.trim() ||
    'ส่วนลดจำนวนคำนวณอัตโนมัติ · เครดิต Net-30 สำหรับลูกค้าผ่านการตรวจสอบ · จัดส่งภายในสัปดาห์จากกรุงเทพ';

  return (
    <section
      className="border-b"
      style={{
        background: 'var(--shop-bg)',
        borderColor: 'var(--shop-border)',
      }}
    >
      {/* Red FLASH DEAL countdown stripe — mirrors the catalog stripe */}
      <div
        data-bm-countdown="true"
        className="flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-sm sm:text-base"
        style={{ background: 'var(--shop-primary)', color: '#ffffff' }}
      >
        <Timer className="h-4 w-4 shrink-0" />
        <span className="font-bold uppercase tracking-[0.12em]">
          ดีลด่วน
        </span>
        <span aria-hidden style={{ opacity: 0.6 }}>·</span>
        <span
          data-bm-mono="true"
          className="text-base font-bold sm:text-lg"
          style={{
            fontFamily: BM_MONO_FONT,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.02em',
          }}
        >
          {countdown}
        </span>
        <span className="hidden text-xs opacity-90 sm:inline">
          · สิ้นสุดเที่ยงคืนวันนี้
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
          {/* Left — copy + stat ledger + CTAs */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {storeName}
            </p>
            <div
              aria-hidden
              className="mt-3 h-1 w-12 rounded-md"
              style={{ background: 'var(--shop-primary)' }}
            />
            <h1
              className="mt-5 text-3xl sm:text-4xl md:text-5xl"
              style={{
                fontFamily: BM_HEADING_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}
            >
              {headline}
            </h1>
            <p
              className="mt-5 max-w-xl text-sm leading-relaxed sm:text-base"
              style={{
                fontFamily: BM_HEADING_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              {subhead}
            </p>

            {/* 3-stat ledger row — matches the BrandStory stat tiles */}
            <ul className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
              <BusinessModelHeroStat
                label="รายการสินค้า"
                value="500+"
                unit="SKU"
              />
              <BusinessModelHeroStat
                label="ส่วนลดยกล็อต"
                value="สูงสุด 25%"
                tone="savings"
              />
              <BusinessModelHeroStat
                label="ชำระเงิน"
                value="Net-30"
              />
            </ul>

            {/* CTAs — solid red rectangle + outlined slate */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/stores/${storeSlug}/category`}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md px-7 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
                style={{ background: 'var(--shop-primary)' }}
              >
                ดูสินค้าลดราคา
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={`mailto:sales@basketplace.local?subject=${encodeURIComponent(
                  `Quote request: ${storeName}`,
                )}`}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md border bg-white px-6 text-xs font-bold uppercase tracking-[0.08em] transition hover:bg-[var(--shop-muted)]"
                style={{
                  borderColor: 'var(--shop-ink)',
                  color: 'var(--shop-ink)',
                }}
              >
                <Mail className="h-3.5 w-3.5" />
                ติดต่อเรา
              </a>
            </div>
          </div>

          {/* Right — banner image OR dashboard mock card */}
          <div className="hidden lg:block">
            {bannerUrl ? (
              <div
                className="relative overflow-hidden rounded-md border"
                style={{
                  borderColor: 'var(--shop-border)',
                  aspectRatio: '4 / 3',
                  background: 'var(--shop-muted)',
                }}
              >
                <Image
                  src={bannerUrl}
                  alt={`แคตตาล็อกขายส่ง ${storeName}`}
                  fill
                  sizes="(max-width: 1024px) 0px, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <BusinessModelHeroDashboardMock />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One stat tile — caps label, mono numeric value, optional caps unit.
 * Mirrors BusinessModelStat in BusinessModelBrandStory so the stat row reads
 * as a single visual family across the page.
 */
function BusinessModelHeroStat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: 'savings';
}) {
  const valueColor =
    tone === 'savings' ? 'var(--shop-savings, #10b981)' : 'var(--shop-ink)';
  return (
    <li
      className="rounded-md border p-3"
      style={{
        borderColor: 'var(--shop-border)',
        background: 'var(--shop-muted)',
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
        <span
          data-bm-mono="true"
          className="text-lg sm:text-xl"
          style={{
            fontFamily: BM_MONO_FONT,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            color: valueColor,
            letterSpacing: '-0.01em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-[10px] font-semibold uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.12em',
            }}
          >
            {unit}
          </span>
        )}
      </p>
    </li>
  );
}

/**
 * Fallback right-column visual when the store has no bannerUrl yet — a tiny
 * mocked "deal dashboard" card with three rows of mono numerics so the hero
 * never renders an empty slot. Pure decorative; not interactive.
 */
function BusinessModelHeroDashboardMock() {
  const rows = [
    { sku: 'BP-A19F4Z', qty: '120', save: '-15%' },
    { sku: 'BP-Q72M0N', qty: '048', save: '-8%' },
    { sku: 'BP-X88K2P', qty: '012', save: '-5%' },
  ];
  return (
    <div
      className="rounded-md border bg-white p-4 shadow-sm"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      <div className="flex items-center justify-between border-b pb-2"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <span
          className="text-[10px] font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.12em',
          }}
        >
          แดชบอร์ดดีล
        </span>
        <span
          data-bm-mono="true"
          className="text-[10px] font-bold uppercase"
          style={{
            color: 'var(--shop-primary)',
            fontFamily: BM_MONO_FONT,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.12em',
          }}
        >
          สด
        </span>
      </div>
      <div
        className="mt-3 grid grid-cols-[1fr_4rem_3rem] gap-2 border-b pb-1.5 text-[9px] font-semibold uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          letterSpacing: '0.12em',
          borderColor: 'var(--shop-border)',
        }}
      >
        <span>SKU</span>
        <span className="text-right">จำนวน</span>
        <span className="text-right">ลด</span>
      </div>
      <ul>
        {rows.map((r, i) => (
          <li
            key={r.sku}
            className="grid grid-cols-[1fr_4rem_3rem] items-center gap-2 border-b py-2 last:border-b-0"
            style={{
              borderColor: 'var(--shop-border)',
              background: i % 2 === 1 ? 'var(--shop-muted)' : undefined,
            }}
          >
            <span
              data-bm-mono="true"
              className="text-xs font-bold"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.04em',
              }}
            >
              {r.sku}
            </span>
            <span
              data-bm-mono="true"
              className="text-right text-xs"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {r.qty}
            </span>
            <span
              data-bm-mono="true"
              className="rounded-sm px-1.5 py-0.5 text-right text-[10px] font-bold uppercase"
              style={{
                background: 'var(--shop-savings, #10b981)',
                color: '#ffffff',
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.04em',
              }}
            >
              {r.save}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
