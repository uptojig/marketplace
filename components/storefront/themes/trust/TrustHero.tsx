/**
 * TrustHero — heritage-maison hero band for the trust homepage.
 *
 * Visual language matches TrustCategoryPage's centered serif cartouche
 * exactly so the homepage and catalog read as the same maison:
 *   - "MAISON · {storeName}" gold caps eyebrow (letter-spacing 0.32em).
 *   - Oversized Playfair Display title — semibold, tight tracking.
 *   - Gold hairline rule under the title (var(--shop-accent)).
 *   - Sober upright Playfair body — NO italics (italics belong to FB).
 *   - Charcoal "BROWSE THE COLLECTION" CTA: rounded-sm fill, uppercase
 *     letterspaced text. Same shape as the catalog "Clear Filters" CTA.
 *   - Optional banner image renders in a sharp ivory frame on the
 *     right column at lg+. Square 1/1 aspect with thin gold-rule trim
 *     to match TrustCategoryGrid card frames.
 *
 * Server component. Layout chrome (header / nav / footer) is supplied
 * by app/stores/[slug]/layout.tsx — we don't render it here.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

/**
 * Stable pseudo "Est." year derived from the store slug so the hero
 * subline ("An atelier of considered objects since 19XX") doesn't
 * change between renders. Range 1948-2008 reads as believable
 * heritage without claiming pre-WWII. Mirrors the heritageYear helper
 * in TrustProductHero.
 *
 * TODO(schema): once Store.foundedYear lands, prefer it over this.
 */
function heritageYear(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return 1948 + (hash % 60);
}

export interface TrustHeroProps {
  storeSlug: string;
  storeName: string;
  bannerUrl?: string | null;
}

export function TrustHero({ storeSlug, storeName, bannerUrl }: TrustHeroProps) {
  const year = heritageYear(storeSlug);
  const hasBanner = Boolean(bannerUrl);

  return (
    <section
      aria-label="Maison hero"
      style={{ background: 'var(--shop-bg)' }}
    >
      <div
        className={`mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8 lg:pt-20 lg:pb-24 ${
          hasBanner
            ? 'lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16'
            : ''
        }`}
      >
        {/* ── Copy column — centered cartouche when no banner, left
            aligned when there is one so the eye flows into the
            image plate. ─────────────────────────────────────────── */}
        <div className={hasBanner ? 'text-left' : 'mx-auto max-w-3xl text-center'}>
          {/* Caps eyebrow — gold, wide tracking. */}
          <p
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            เมซอน · {storeName}
          </p>

          {/* Title cartouche — gold-hairline framed when centered to
              echo the catalog title; left-aligned variant uses just
              an underline rule so the banner column can breathe. */}
          {hasBanner ? (
            <h1
              className="mt-5 text-4xl sm:text-5xl md:text-6xl"
              style={{
                fontFamily: TRUST_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              {storeName}
            </h1>
          ) : (
            <div
              className="mx-auto mt-3 inline-block border-y py-3"
              style={{ borderColor: 'var(--shop-accent)' }}
            >
              <h1
                className="text-4xl sm:text-5xl md:text-6xl"
                style={{
                  fontFamily: TRUST_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.05,
                }}
              >
                {storeName}
              </h1>
            </div>
          )}

          {/* Gold hairline rule under the title — 12 units wide,
              centered when the layout is centered, left-aligned
              otherwise. Same rule treatment used across catalog. */}
          <div
            aria-hidden
            className={`mt-5 h-px w-12 ${hasBanner ? '' : 'mx-auto'}`}
            style={{ background: 'var(--shop-accent)' }}
          />

          {/* Body — upright Playfair, deliberately NOT italic. */}
          <p
            className={`mt-6 text-base sm:text-lg ${
              hasBanner ? 'max-w-xl' : 'mx-auto max-w-xl'
            }`}
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
              fontWeight: 500,
              lineHeight: 1.55,
            }}
          >
            อาตเลียร์ที่คัดสรรสินค้าด้วยความพิถีพิถัน ตั้งแต่ปี {year}
          </p>

          {/* CTA row — charcoal fill, rounded-sm, caps letterspaced.
              Matches TrustCartPage's "Proceed to Checkout" exactly. */}
          <div
            className={`mt-8 flex flex-wrap items-center gap-4 sm:mt-10 ${
              hasBanner ? '' : 'justify-center'
            }`}
          >
            <Link
              href={`/stores/${storeSlug}/category`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-sm px-8 text-xs font-semibold uppercase text-white transition hover:opacity-90"
              style={{
                background: 'var(--shop-primary)',
                letterSpacing: '0.28em',
              }}
            >
              ดูคอลเลกชัน
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            {/* Discreet secondary link — caps text on a hairline.
                Same treatment as catalog sort options. */}
            <Link
              href={`/stores/${storeSlug}/category?sort=newest`}
              className="text-[11px] uppercase transition hover:underline"
              style={{
                color: 'var(--shop-ink)',
                letterSpacing: '0.28em',
                fontWeight: 600,
                paddingBottom: '2px',
                borderBottom: '1px solid var(--shop-accent)',
              }}
            >
              ชมสินค้ามาใหม่
            </Link>
          </div>
        </div>

        {/* ── Right column — optional banner image in a sharp ivory
            frame. Only renders at lg+ when bannerUrl is present;
            collapses to nothing on mobile so the copy gets the full
            width without forcing layout shift. ──────────────────── */}
        {hasBanner && bannerUrl && (
          <div className="mt-12 hidden lg:mt-0 lg:block">
            {/* Outer ivory mat — pale stone with thick gold rule, then
                a thin inner gold-rule border around the image itself.
                Mirrors the gallery-frame look from TrustCategoryGrid
                cards but at hero scale. */}
            <div
              className="rounded-sm border-2 p-3"
              style={{
                background: 'var(--shop-muted)',
                borderColor: 'var(--shop-accent)',
              }}
            >
              <div
                className="relative overflow-hidden rounded-sm border bg-white"
                style={{
                  aspectRatio: '1 / 1',
                  borderColor: 'var(--shop-accent)',
                }}
              >
                <Image
                  src={bannerUrl}
                  alt={`${storeName} maison banner`}
                  fill
                  sizes="(max-width: 1024px) 0vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
              {/* Heritage caption strip under the plate — caps year
                  + maison label, ledger feel. */}
              <p
                className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.22em',
                }}
              >
                <span>ก่อตั้ง {year}</span>
                <span>เมซอน</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
