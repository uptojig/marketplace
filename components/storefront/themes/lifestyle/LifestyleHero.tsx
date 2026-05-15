/**
 * LifestyleHero — warm catalog hero for the lifestyle homepage.
 *
 * Visual intent (Patagonia × West Elm catalog spread):
 *   - Warm caps eyebrow ("Welcome to {storeName} · Made for everyday")
 *     in sage to prime the catalog voice. Matches the eyebrow pattern
 *     used on LifestyleCategoryPage / LifestyleCartPage / LifestyleProductHero.
 *   - Oversized Outfit / Plus Jakarta Sans display h1
 *     ("Find what feels like home") — geometric humanist sans, NOT serif.
 *     Reads as a friendly catalog opener, not magazine letter.
 *   - Sage SVG squiggle divider directly below the h1 (data-lifestyle-squiggle).
 *   - Warm body line: "We curate pieces that fit how you live."
 *   - Rounded-full sage CTA pair: terracotta filled "Start exploring"
 *     primary, terracotta link "About us" secondary.
 *   - Right column: optional banner image rendered inside a rounded-3xl
 *     pillow frame with the data-lifestyle-frame soft drop shadow.
 *     Falls back to a soft amber abstract scene when bannerUrl is null
 *     so the hero still feels intentional on bare stores.
 *
 * Server component — pure markup, no client state.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleHeroProps {
  storeSlug: string;
  storeName: string;
  bannerUrl?: string | null;
}

export function LifestyleHero({
  storeSlug,
  storeName,
  bannerUrl,
}: LifestyleHeroProps) {
  return (
    <section
      style={{ background: 'var(--shop-bg)' }}
      className="px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Left — copy + CTAs */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            Welcome to {storeName} · Made for everyday
          </p>
          <h1
            className="mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.015em',
              lineHeight: 1.02,
            }}
          >
            Find what feels like home
          </h1>

          {/* Sage squiggle divider directly under the h1 */}
          <div
            data-lifestyle-squiggle="true"
            aria-hidden
            className="mt-5"
            style={{ maxWidth: '180px' }}
          />

          <p
            className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            We curate pieces that fit how you live — pieces that hold up,
            soften with use, and quietly become favorites.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href={`/stores/${storeSlug}/category`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{
                background: 'var(--shop-accent)',
                fontFamily: LIFESTYLE_DISPLAY_FONT,
              }}
            >
              Start exploring
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/stores/${storeSlug}/about`}
              className="inline-flex items-center gap-1 text-sm font-semibold transition hover:opacity-80"
              style={{
                color: 'var(--shop-primary)',
                fontFamily: LIFESTYLE_DISPLAY_FONT,
                borderBottom: '1.5px solid var(--shop-primary)',
                paddingBottom: '2px',
              }}
            >
              About us
            </Link>
          </div>
        </div>

        {/* Right — banner inside rounded-3xl pillow frame */}
        <div className="relative">
          <div
            data-lifestyle-frame="true"
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: 'var(--shop-muted)',
              aspectRatio: '4 / 5',
            }}
          >
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt={`${storeName} banner`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              // Soft amber abstract scene placeholder — keeps the
              // pillow frame feeling intentional on bare stores.
              <HeroPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Inline SVG placeholder — soft amber abstract scene. Reads as a
 * catalog mood-board still life rather than a "missing image" tile.
 * Pure decoration; safe to swap for any banner image.
 */
function HeroPlaceholder() {
  return (
    <svg
      viewBox="0 0 400 500"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      {/* horizon */}
      <rect x="0" y="0" width="400" height="500" fill="var(--shop-muted)" />
      <rect x="0" y="290" width="400" height="210" fill="#f5e6d3" opacity="0.6" />
      {/* sun */}
      <circle cx="305" cy="170" r="60" fill="#fbbf24" opacity="0.7" />
      {/* leaves cluster left */}
      <g stroke="var(--shop-accent)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M70 360 Q60 300 90 250" />
        <path d="M85 320 Q105 305 110 285" />
        <path d="M70 340 Q50 325 45 305" />
        <path d="M85 290 Q100 275 115 270" />
      </g>
      {/* vase */}
      <path
        d="M160 360 Q160 320 175 320 L225 320 Q240 320 240 360 L235 430 Q235 450 220 450 L180 450 Q165 450 165 430 Z"
        fill="#ffffff"
        stroke="var(--shop-ink)"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {/* basket on the right */}
      <ellipse cx="305" cy="430" rx="55" ry="18" fill="#d4a55c" opacity="0.5" />
      <path
        d="M255 430 L268 380 L342 380 L355 430 Z"
        fill="#d4a55c"
        stroke="var(--shop-ink)"
        strokeWidth="1.5"
        opacity="0.85"
      />
      {/* small plant in vase */}
      <g stroke="var(--shop-accent)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M200 320 Q195 280 185 250" />
        <path d="M200 320 Q210 285 220 260" />
        <path d="M200 320 Q195 295 200 260" />
      </g>
    </svg>
  );
}
