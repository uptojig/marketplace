/**
 * ElectronicsTechContactPage — bespoke ET contact layout.
 *
 * Structural difference from the generic /stores/[slug]/contact page
 * AND from FashionBeautyContactPage:
 *   - "TECHNICAL SUPPORT" mono caps eyebrow + Inter Tight display h1
 *     "Get in touch" — replaces FB's serif "Say hello" essay voice.
 *   - Two-column layout on desktop: form on the LEFT in a white
 *     sharp-bordered frame, "Service desk" info card on the RIGHT
 *     with a mono caps header — replaces FB's stacked editorial spread.
 *   - Service desk card uses mono caps row labels (HOURS / EMAIL /
 *     PHONE / LINE) — reads as a help-desk dispatch panel.
 *   - Compact mono SLA row at the top ("RESPONSE · WITHIN 1 BUSINESS
 *     DAY") sets expectations like a B2B IT support page.
 *
 * Reuses the existing client-side ContactForm (kept as drop-in child)
 * so the API + email-required + guest-allowed behaviour stays
 * identical. Only the chrome around it is bespoke.
 */

import Link from 'next/link';
import { ChevronLeft, Headset, Map } from 'lucide-react';
import {
  StoreSocialIcons,
  StoreContactRows,
} from '@/components/shop/StoreSocialIcons';
import { ContactForm } from '@/app/stores/[slug]/contact/contact-form';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export interface ElectronicsTechContactPageProps {
  slug: string;
  storeName: string;
  tagline: string | null;
  /** Store columns needed by StoreContactRows + StoreSocialIcons. */
  store: Parameters<typeof StoreContactRows>[0]['store'] &
    Parameters<typeof StoreSocialIcons>[0]['store'];
  /** Pre-formatted address lines from formatStoreAddressLines. */
  addressLines: string[];
}

export function ElectronicsTechContactPage({
  slug,
  storeName,
  tagline,
  store,
  addressLines,
}: ElectronicsTechContactPageProps) {
  const hasAnySocials =
    !!store.facebookUrl ||
    !!store.messengerUrl ||
    !!store.twitterUrl ||
    !!store.instagramUrl ||
    !!store.websiteUrl ||
    !!store.lineId;

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Spec-sheet header */}
        <header className="mb-10">
          <Link
            href={`/stores/${slug}`}
            data-tech-mono="true"
            className="inline-flex items-center gap-1 text-[11px] uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับไปยังร้านค้า
          </Link>
          <p
            data-tech-mono="true"
            className="mt-6 text-[11px] uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}
          >
            ฝ่ายสนับสนุนทางเทคนิค · ติดต่อ
          </p>
          <h1
            className="mt-2 text-3xl sm:text-4xl"
            style={{
              fontFamily: TECH_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
            }}
          >
            ติดต่อเรา
          </h1>
          <p
            className="mt-3 max-w-2xl text-base"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_DISPLAY_FONT,
            }}
          >
            {tagline ||
              `มีคำถามเกี่ยวกับสเปก การรับประกัน หรือความเข้ากันได้? ทีมสนับสนุน ${storeName} จะตอบกลับภายใน 1 วันทำการ`}
          </p>

          {/* Mono SLA strip */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              data-tech-mono="true"
              className="inline-flex items-center rounded-md border bg-[var(--shop-muted)] px-2.5 py-1 text-[10px] uppercase"
              style={{
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              ตอบกลับ · ภายใน 1 วันทำการ
            </span>
            <span
              data-tech-mono="true"
              className="inline-flex items-center rounded-md border bg-[var(--shop-muted)] px-2.5 py-1 text-[10px] uppercase"
              style={{
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              ช่องทาง · อีเมล · LINE · โทรศัพท์
            </span>
          </div>
        </header>

        {/* Two-column layout — form left, service desk right */}
        <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-8 lg:items-start">
          {/* ── Sharp-bordered form frame ─────────────── */}
          <section
            className="rounded-md border bg-white p-6 sm:p-8"
            style={{ borderColor: 'var(--shop-border)' }}
          >
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              ส่งคำขอบริการ
            </p>
            <h2
              className="mt-1 text-xl"
              style={{
                fontFamily: TECH_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              ส่งข้อความถึงเรา
            </h2>
            <div
              aria-hidden
              className="mt-3 mb-5 h-px w-full"
              style={{ background: 'var(--shop-border)' }}
            />
            <ContactForm storeSlug={slug} storeName={storeName} />
          </section>

          {/* ── Service desk card ────────────────────── */}
          <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24">
            <div
              className="rounded-md border bg-white p-6"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <Headset
                  className="h-4 w-4"
                  style={{ color: 'var(--shop-primary)' }}
                />
                <p
                  data-tech-mono="true"
                  className="text-[11px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 700,
                  }}
                >
                  ศูนย์บริการ
                </p>
              </div>
              <h2
                className="mt-1 text-lg"
                style={{
                  fontFamily: TECH_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                {storeName}
              </h2>

              <div
                aria-hidden
                className="mt-3 mb-4 h-px w-full"
                style={{ background: 'var(--shop-border)' }}
              />

              <div>
                <p
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  เวลาทำการ
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_DISPLAY_FONT,
                    fontWeight: 600,
                  }}
                >
                  จ. — ศ. · 09:00 — 18:00 น.
                </p>
              </div>

              <div className="mt-4">
                <p
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  ช่องทางติดต่อโดยตรง
                </p>
                <div className="mt-1.5">
                  <StoreContactRows store={store} />
                </div>
              </div>

              {hasAnySocials && (
                <div
                  className="mt-4 border-t pt-4"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <p
                    data-tech-mono="true"
                    className="mb-2 text-[10px] uppercase"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      fontFamily: TECH_MONO_FONT,
                      letterSpacing: '0.18em',
                      fontWeight: 600,
                    }}
                  >
                    ติดตาม
                  </p>
                  <StoreSocialIcons store={store} />
                </div>
              )}
            </div>

            {/* Address spec-card under service desk */}
            <div
              className="mt-5 rounded-md border bg-white p-6"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <Map
                  className="h-4 w-4"
                  style={{ color: 'var(--shop-primary)' }}
                />
                <p
                  data-tech-mono="true"
                  className="text-[11px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 700,
                  }}
                >
                  ที่อยู่คลังสินค้า
                </p>
              </div>
              <div
                aria-hidden
                className="mt-3 mb-4 h-px w-full"
                style={{ background: 'var(--shop-border)' }}
              />
              {addressLines.length > 0 ? (
                <div
                  className="space-y-1 text-sm"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_DISPLAY_FONT,
                    fontWeight: 500,
                  }}
                >
                  {addressLines.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>
              ) : (
                <p
                  data-tech-mono="true"
                  className="text-[11px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.16em',
                    fontWeight: 600,
                  }}
                >
                  ยังไม่ระบุที่อยู่
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
