/**
 * ElectronicsTechHero — landing-page hero for the bespoke electronics-tech
 * homepage. Renders a spec-sheet "catalog index" hero with a mono "VENDOR"
 * eyebrow, Inter Tight bold display headline, mint hairline rule, DM Sans
 * body, and a paired CTA row (mint-filled "VIEW CATALOG" + outlined
 * "TECHNICAL SUPPORT" link).
 *
 * Server component — no client interactivity needed at this level. Sits
 * directly between the shared <ShopHeader /> chrome and the rest of the
 * homepage; matches the visual voice of ElectronicsTechCategoryPage and
 * ElectronicsTechCartPage so the buyer never feels a theme break across
 * pages.
 *
 * Visual language reference: docs/design + ElectronicsTechCategoryPage
 * header block. The font stacks, letter-spacing and color tokens are
 * intentionally duplicated so this file stays self-contained — no shared
 * style utility lives in the family yet.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

const TECH_BODY_FONT =
  '"DM Sans", var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

export interface ElectronicsTechHeroProps {
  storeSlug: string;
  storeName: string;
  /**
   * Optional banner imagery from the Store row. Currently unused at the
   * visual layer (the spec-sheet hero is intentionally typographic, not
   * image-led) but kept in the prop bag so a future variant can opt in
   * without changing the call-site.
   */
  bannerUrl?: string | null;
}

export function ElectronicsTechHero({
  storeSlug,
  storeName,
}: ElectronicsTechHeroProps) {
  return (
    <section
      style={{ background: 'var(--shop-bg)' }}
      className="px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          {/* Left — typographic spec-sheet hero */}
          <div>
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
              VENDOR · {storeName}
            </p>
            <h1
              className="mt-4 text-4xl sm:text-5xl md:text-6xl"
              style={{
                fontFamily: TECH_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}
            >
              Engineered for the catalog
            </h1>
            {/* Mint hairline rule — anchors the spec-sheet aesthetic. */}
            <div
              aria-hidden
              className="mt-5 h-px w-20"
              style={{ background: 'var(--shop-highlight, #34d399)' }}
            />
            <p
              className="mt-5 max-w-xl text-base leading-relaxed sm:text-[17px]"
              style={{
                fontFamily: TECH_BODY_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              Browse {storeName}&rsquo;s technical catalog with full specs and
              SKUs.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={`/stores/${storeSlug}/category`}
                data-tech-mono="true"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-6 text-[11px] uppercase text-white transition hover:opacity-90"
                style={{
                  background: 'var(--shop-highlight, #34d399)',
                  fontFamily: TECH_MONO_FONT,
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                }}
              >
                ดูสินค้าทั้งหมด
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/stores/${storeSlug}/help/faq`}
                data-tech-mono="true"
                className="inline-flex h-11 items-center justify-center rounded-md border bg-white px-5 text-[11px] uppercase transition hover:border-[var(--shop-highlight,#34d399)] hover:text-[var(--shop-highlight,#34d399)]"
                style={{
                  borderColor: 'var(--shop-border)',
                  color: 'var(--shop-ink)',
                  fontFamily: TECH_MONO_FONT,
                  letterSpacing: '0.18em',
                  fontWeight: 600,
                }}
              >
                สอบถามข้อมูล
              </Link>
            </div>
          </div>

          {/* Right — spec-card placard. Pure typography on white card,
              keeps the "spec-sheet" voice without depending on imagery. */}
          <div
            className="relative mx-auto hidden w-full max-w-md rounded-md border bg-white p-6 lg:block"
            style={{ borderColor: 'var(--shop-border)' }}
          >
            <div className="flex items-center justify-between">
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
                Catalog index
              </p>
              <span
                data-tech-stock="true"
                className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{ letterSpacing: '0.12em' }}
              >
                Live
              </span>
            </div>
            <div
              aria-hidden
              className="mt-4 mb-5 h-px w-full"
              style={{ background: 'var(--shop-border)' }}
            />
            <dl className="grid grid-cols-2 gap-y-4">
              <div>
                <dt
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Vendor
                </dt>
                <dd
                  data-tech-mono="true"
                  className="mt-1 text-sm"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_MONO_FONT,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {storeName}
                </dd>
              </div>
              <div>
                <dt
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  QC
                </dt>
                <dd
                  data-tech-mono="true"
                  className="mt-1 text-sm"
                  style={{
                    color: 'var(--shop-highlight, #34d399)',
                    fontFamily: TECH_MONO_FONT,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  Certified
                </dd>
              </div>
              <div>
                <dt
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Lead time
                </dt>
                <dd
                  data-tech-mono="true"
                  className="mt-1 text-sm"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_MONO_FONT,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  1&ndash;3 days
                </dd>
              </div>
              <div>
                <dt
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Warranty
                </dt>
                <dd
                  data-tech-mono="true"
                  className="mt-1 text-sm"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_MONO_FONT,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  12 months
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
