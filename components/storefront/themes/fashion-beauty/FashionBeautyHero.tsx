/**
 * FashionBeautyHero — magazine cover-style landing hero for the
 * fashion-beauty homepage.
 *
 * Visual language matches FashionBeautyCategoryPage / FashionBeautyCartPage:
 *   - cream `var(--shop-bg)` ground
 *   - oversized Cormorant Garamond serif title (var(--font-fashion-display))
 *   - italic-serif eyebrow + tagline (magazine-letter voice)
 *   - hairline gold rule (h-px w-12, var(--shop-accent))
 *   - rose-500 rounded-full primary CTA + italic-serif underline secondary
 *   - optional 4/5 portrait banner image — falls back to a soft-pink
 *     rounded-2xl placeholder so the layout reads at full width even
 *     when the operator hasn't uploaded artwork yet.
 *
 * Server component. Renders the editorial top spread of the FB
 * homepage; the layout already provides ShopHeader + ShopFooter so
 * we never render those here.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

/** Pick a season label by month — keeps the eyebrow editorial. */
function currentSeasonLabel(): string {
  const m = new Date().getMonth() + 1; // 1..12
  if (m === 12 || m <= 2) return 'Winter';
  if (m <= 5) return 'Spring';
  if (m <= 8) return 'Summer';
  return 'Autumn';
}

export interface FashionBeautyHeroProps {
  storeSlug: string;
  storeName: string;
  bannerUrl?: string | null;
}

export function FashionBeautyHero({
  storeSlug,
  storeName,
  bannerUrl,
}: FashionBeautyHeroProps) {
  const season = currentSeasonLabel();

  return (
    <section
      style={{ background: 'var(--shop-bg)' }}
      className="relative"
    >
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_1fr] md:gap-14 lg:gap-20">
          {/* ── Left column: editorial copy ─────────────────────── */}
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.28em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              The {season} Edit · Curated for you
            </p>

            <h1
              className="mt-5 text-5xl sm:text-6xl lg:text-7xl"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                lineHeight: 1.02,
              }}
            >
              {storeName}
            </h1>

            <div
              aria-hidden
              className="mt-6 h-px w-12"
              style={{ background: 'var(--shop-accent)' }}
            />

            <p
              className="mt-6 max-w-md text-lg italic leading-relaxed sm:text-xl"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              Discover pieces selected by our team — every season,
              hand-picked with intention.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href={`/stores/${storeSlug}/category`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{ background: 'var(--shop-primary)' }}
              >
                Shop the edit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/stores/${storeSlug}/about`}
                className="text-base italic transition hover:opacity-80"
                style={{
                  fontFamily: FB_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                  borderBottom: '1px solid var(--shop-ink)',
                  paddingBottom: '2px',
                }}
              >
                Read our story
              </Link>
            </div>
          </div>

          {/* ── Right column: 4/5 portrait banner / placeholder ─── */}
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div
              className="relative overflow-hidden rounded-2xl border shadow-sm"
              style={{
                aspectRatio: '4 / 5',
                background: 'var(--shop-muted)',
                borderColor: 'var(--shop-accent)',
              }}
            >
              {bannerUrl ? (
                <Image
                  src={bannerUrl}
                  alt={`${storeName} — editorial cover`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              ) : (
                /* Soft-pink editorial placeholder — keeps the gallery
                 * proportion intact when no banner has been uploaded. */
                <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
                  <p
                    className="text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    Cover · {season} {new Date().getFullYear()}
                  </p>
                  <p
                    className="mt-4 text-3xl italic sm:text-4xl"
                    style={{
                      fontFamily: FB_DISPLAY_FONT,
                      color: 'var(--shop-ink)',
                      fontWeight: 500,
                      lineHeight: 1.1,
                    }}
                  >
                    {storeName}
                  </p>
                  <div
                    aria-hidden
                    className="mt-5 h-px w-10"
                    style={{ background: 'var(--shop-accent)' }}
                  />
                  <p
                    className="mt-4 text-sm italic"
                    style={{
                      fontFamily: FB_DISPLAY_FONT,
                      color: 'var(--shop-ink-muted)',
                    }}
                  >
                    The {season} lookbook
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
