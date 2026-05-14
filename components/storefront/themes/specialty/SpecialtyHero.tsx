/**
 * SpecialtyHero — atelier hero band for the specialty (artisan / vintage)
 * homepage. Renders the workshop-letter top spread that opens every
 * specialty store landing page.
 *
 * Design role:
 *   - Hand-script Caveat eyebrow ("the studio · {storeName}") sets the
 *     curator's-pen voice before the slab-serif Fraunces h1.
 *   - Inline "STAMPED" SpecialtyStamp badge floats next to the title to
 *     evoke the 3deg dashed-border curator stamp from the divider lib.
 *   - Body copy is rendered in the hand-script font as a deliberate
 *     decorative line — not body prose, never long-form.
 *   - Two CTAs follow the SpecialtyCategoryPage convention: a sober
 *     rounded-md primary ("Visit the studio") + a Caveat hand-script
 *     ghost link ("read our story").
 *
 * The wrapper carries `data-specialty-kraft="true"` so the kraft-paper
 * texture from globals.css (.theme-specialty [data-specialty-kraft])
 * lifts onto the hero. Inherits --shop-* CSS vars so the layout palette
 * stays consistent with the rest of the specialty pages.
 *
 * Server component — no client state. Server-renders with the optional
 * banner image when one is supplied; otherwise renders a sepia-toned
 * placeholder block so the layout never collapses.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { SpecialtyStamp } from './SpecialtyDivider';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyHeroProps {
  storeSlug: string;
  storeName: string;
  bannerUrl?: string | null;
}

export function SpecialtyHero({
  storeSlug,
  storeName,
  bannerUrl,
}: SpecialtyHeroProps) {
  return (
    <section
      data-specialty-kraft="true"
      className="border-b"
      style={{
        background: 'var(--shop-bg)',
        borderColor: 'var(--shop-border)',
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:px-8">
        {/* Left — workshop-letter copy block */}
        <div>
          <p
            className="text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            สตูดิโอ · {storeName}
          </p>
          <h1
            className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-3 text-4xl sm:text-5xl lg:text-6xl"
            style={{
              fontFamily: SPECIALTY_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.05,
            }}
          >
            <span>ทำด้วยมือ ส่งด้วยใจ</span>
            <SpecialtyStamp tone="primary" className="translate-y-[-2px]">
              ประทับแล้ว
            </SpecialtyStamp>
          </h1>
          <p
            className="mt-5 max-w-xl text-2xl leading-snug"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            ทุกชิ้นเล่าเรื่องของช่างฝีมือผู้สร้างสรรค์
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href={`/stores/${storeSlug}/category`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md px-7 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'var(--shop-primary)' }}
            >
              เยี่ยมชมสตูดิโอ
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/stores/${storeSlug}/about`}
              className="text-2xl leading-none transition hover:underline"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-accent)',
              }}
            >
              อ่านเรื่องราวของเรา
            </Link>
          </div>
        </div>

        {/* Right — sepia banner panel (graceful placeholder when none) */}
        <div
          data-specialty-kraft="true"
          className="relative overflow-hidden rounded-md border p-3 shadow-sm"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div
            data-specialty-sepia="true"
            className="relative overflow-hidden rounded-md"
            style={{
              aspectRatio: '4 / 5',
              backgroundColor: 'var(--shop-muted)',
            }}
          >
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt={`สตูดิโอ ${storeName}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-full w-full items-center justify-center"
              >
                <span
                  className="text-3xl"
                  style={{
                    fontFamily: SPECIALTY_HAND_FONT,
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  จากโต๊ะงาน
                </span>
              </div>
            )}
          </div>
          <p
            className="mt-3 text-center text-lg"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            สร้างด้วยใจ · {storeName}
          </p>
        </div>
      </div>
    </section>
  );
}
