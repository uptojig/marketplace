/**
 * BusinessModelContactPage — bespoke deal-dashboard / wholesale-utility
 * contact layout.
 *
 * Structural difference from the generic /stores/[slug]/contact page
 * and from FashionBeautyContactPage / TrustContactPage:
 *   - "TALK TO SALES" hero in caps eyebrow + bold sans h1 — B2B
 *     account voice, NOT magazine-letter italic. Sub-copy reads as
 *     a ledger note ("Avg. response time · 4 business hrs"), not a
 *     curator essay.
 *   - Form sits IMMEDIATELY below the hero in a single-column max-w-2xl
 *     framed white card with rounded-md corners + hairline border —
 *     reads as a B2B inquiry form, not a stationery card.
 *   - Store info renders as a "WHOLESALE ACCOUNT" panel: rectangular
 *     bordered card with a tier-benefits checklist (Volume discount /
 *     MOQ / Lead time / Net-30 terms) in mono-tabular caps — looks
 *     like a B2B account benefits sheet pinned to the page.
 *   - Address + direct contact rows render as a 2-col data grid
 *     under the panel, captioned with caps tracking + mono SKU-style
 *     labels. Social icons row pinned at the bottom in a hairline
 *     band, NOT a soft-pink stationery footer.
 *
 * Reuses ContactForm so the API + email-required + guest-allowed
 * behaviour is unchanged. Only the chrome around it is bespoke.
 *
 * Props shape mirrors FashionBeautyContactPageProps exactly so the
 * page.tsx dispatch can swap variants without remapping.
 */

import Link from 'next/link';
import { Briefcase, CheckCircle2, ChevronLeft, MapPin, Package, Timer, TrendingDown } from 'lucide-react';
import {
  StoreSocialIcons,
  StoreContactRows,
} from '@/components/shop/StoreSocialIcons';
import { ContactForm } from '@/app/stores/[slug]/contact/contact-form';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelContactPageProps {
  slug: string;
  storeName: string;
  tagline: string | null;
  /** Store columns needed by StoreContactRows + StoreSocialIcons. */
  store: Parameters<typeof StoreContactRows>[0]['store'] &
    Parameters<typeof StoreSocialIcons>[0]['store'];
  /** Pre-formatted address lines from formatStoreAddressLines. */
  addressLines: string[];
}

const TIER_BENEFITS: Array<{ icon: typeof TrendingDown; label: string; value: string }> = [
  { icon: TrendingDown, label: 'ส่วนลดจากปริมาณ', value: 'สูงสุด -20%' },
  { icon: Package, label: 'MOQ', value: '1 ชิ้น' },
  { icon: Timer, label: 'ระยะเวลาผลิต', value: '1-3 วันทำการ' },
  { icon: Briefcase, label: 'เงื่อนไขการชำระเงิน', value: 'เครดิต 30 วัน (รอการอนุมัติ)' },
];

export function BusinessModelContactPage({
  slug,
  storeName,
  tagline,
  store,
  addressLines,
}: BusinessModelContactPageProps) {
  const hasAnySocials =
    !!store.facebookUrl ||
    !!store.messengerUrl ||
    !!store.twitterUrl ||
    !!store.instagramUrl ||
    !!store.websiteUrl ||
    !!store.lineId;

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* Back link */}
        <Link
          href={`/stores/${slug}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:underline"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          กลับไปที่ {storeName}
        </Link>

        {/* B2B hero — caps eyebrow + bold sans h1 + ledger sub-copy */}
        <header className="mt-5">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            บัญชีขายส่ง · B2B
          </p>
          <h1
            className="mt-1 text-3xl sm:text-4xl"
            style={{
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.05,
            }}
          >
            ติดต่อฝ่ายขาย
          </h1>
          <p
            className="mt-3 max-w-xl text-sm sm:text-base"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {tagline ||
              `ส่งคำขอใบเสนอราคา สอบถามระยะเวลาผลิต หรือเปิดบัญชีขายส่งกับ ${storeName} เราตอบกลับภายใน 4 ชั่วโมงทำการ`}
          </p>

          {/* Status chip strip — feels like a dashboard SLA badge */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold"
              style={{
                background: 'var(--shop-muted)',
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink)',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: 'var(--shop-savings, #10b981)' }}
                aria-hidden
              />
              <span className="uppercase tracking-[0.12em]">สถานะ</span>
              <span style={{ color: 'var(--shop-savings, #10b981)' }}>
                ออนไลน์
              </span>
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold"
              style={{
                background: 'var(--shop-muted)',
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink)',
              }}
            >
              <Timer
                className="h-3.5 w-3.5"
                style={{ color: 'var(--shop-primary)' }}
              />
              <span className="uppercase tracking-[0.12em]">SLA</span>
              <span
                data-bm-mono="true"
                style={{
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                4h
              </span>
            </span>
          </div>
        </header>

        {/* Form — framed B2B inquiry card */}
        <section
          className="mt-8 rounded-md border bg-white p-5 shadow-sm sm:p-6"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--shop-border)' }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              คำถามใหม่
            </p>
            <p
              data-bm-mono="true"
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              FORM-{slug.slice(0, 6).toUpperCase()}
            </p>
          </div>
          <ContactForm storeSlug={slug} storeName={storeName} />
        </section>

        {/* Wholesale Account panel — tier benefits */}
        <section
          className="mt-6 rounded-md border bg-white"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div
            className="flex items-center justify-between gap-3 border-b px-5 py-3"
            style={{ borderColor: 'var(--shop-border)', background: 'var(--shop-muted)' }}
          >
            <div className="flex items-center gap-2">
              <Briefcase
                className="h-4 w-4"
                style={{ color: 'var(--shop-primary)' }}
              />
              <h2
                className="text-sm font-bold uppercase"
                style={{
                  color: 'var(--shop-ink)',
                  letterSpacing: '0.12em',
                }}
              >
                บัญชีขายส่ง
              </h2>
            </div>
            <span
              data-bm-savings="true"
              className="rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{
                background: 'var(--shop-savings, #10b981)',
                color: '#ffffff',
                letterSpacing: '0.06em',
              }}
            >
              สมัครฟรี
            </span>
          </div>

          <ul className="divide-y" style={{ borderColor: 'var(--shop-border)' }}>
            {TIER_BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <li
                  key={b.label}
                  data-bm-row={i % 2 === 1 ? 'alt' : undefined}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t px-5 py-3 first:border-t-0"
                  style={{
                    borderColor: 'var(--shop-border)',
                    background: i % 2 === 1 ? 'var(--shop-muted)' : undefined,
                  }}
                >
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: 'var(--shop-savings, #10b981)' }}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    />
                    <span
                      className="text-[11px] font-semibold uppercase truncate"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {b.label}
                    </span>
                  </div>
                  <span
                    data-bm-mono="true"
                    className="text-sm font-bold"
                    style={{
                      color: 'var(--shop-ink)',
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {b.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Address + Direct contact — 2-col data grid */}
        <section
          className="mt-6 rounded-md border bg-white p-5"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div className="mb-4 flex items-center gap-2">
            <MapPin
              className="h-4 w-4"
              style={{ color: 'var(--shop-primary)' }}
            />
            <h2
              className="text-sm font-bold uppercase"
              style={{
                color: 'var(--shop-ink)',
                letterSpacing: '0.12em',
              }}
            >
              สำนักงาน · ติดต่อโดยตรง
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p
                data-bm-mono="true"
                className="text-[10px] font-semibold uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.12em',
                  fontFamily: BM_MONO_FONT,
                }}
              >
                ADDR
              </p>
              {addressLines.length > 0 ? (
                <div
                  className="mt-1.5 space-y-0.5 text-sm"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {addressLines.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>
              ) : (
                <p
                  className="mt-1.5 text-sm"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  ยังไม่ระบุที่อยู่
                </p>
              )}
            </div>

            <div>
              <p
                data-bm-mono="true"
                className="text-[10px] font-semibold uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.12em',
                  fontFamily: BM_MONO_FONT,
                }}
              >
                DIRECT
              </p>
              <div className="mt-1.5">
                <StoreContactRows store={store} />
              </div>
            </div>
          </div>

          {hasAnySocials && (
            <div
              className="mt-5 border-t pt-4"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <p
                data-bm-mono="true"
                className="mb-2.5 text-[10px] font-semibold uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.12em',
                  fontFamily: BM_MONO_FONT,
                }}
              >
                CHANNELS
              </p>
              <StoreSocialIcons store={store} />
            </div>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link
            href={`/stores/${slug}`}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ← กลับไปที่แคตตาล็อก
          </Link>
        </div>
      </main>
    </div>
  );
}
