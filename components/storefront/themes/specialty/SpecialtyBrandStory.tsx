/**
 * SpecialtyBrandStory — bespoke artisan brand panel for specialty PDPs.
 *
 * Counterpart to FashionBeautyBrandStory — same structural role
 * (renders between product hero and the specs/description tabs) but
 * in the specialty (handmade / vintage paper) voice rather than the
 * FB editorial magazine voice.
 *
 * Surfaces the store's tagline (preferred) or description as an
 * artisan letter — kraft-textured panel, hand-script attribution,
 * Fraunces serif "A note from the maker" title, sepia-toned round
 * portrait placeholder, hand-script signature, and a "Visit the
 * studio" CTA back to the boutique.
 *
 * Reads the store's `description` and `tagline` fields. If neither is
 * present, the component renders nothing (no awkward empty frame).
 */

import Link from 'next/link';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyBrandStoryProps {
  storeSlug: string;
  storeName: string;
  tagline: string | null;
  description: string | null;
}

export function SpecialtyBrandStory({
  storeSlug,
  storeName,
  tagline,
  description,
}: SpecialtyBrandStoryProps) {
  const body = (tagline?.trim() || description?.trim() || '').trim();
  if (!body) return null;

  return (
    <section
      data-specialty-kraft="true"
      className="my-12 rounded-md border p-8 shadow-sm sm:p-12"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      <p
        className="text-2xl"
        style={{
          fontFamily: SPECIALTY_HAND_FONT,
          color: 'var(--shop-accent)',
        }}
      >
        ช่างฝีมือ · {storeName}
      </p>
      <h2
        className="mt-1 text-3xl sm:text-4xl"
        style={{
          fontFamily: SPECIALTY_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 500,
          letterSpacing: '-0.005em',
          lineHeight: 1.15,
        }}
      >
        จดหมายจากช่างฝีมือ
      </h2>
      <div
        aria-hidden
        className="mt-4 h-px w-12"
        style={{ background: 'var(--shop-accent)' }}
      />

      {/* Letter body with sepia portrait placeholder on the left.
          The portrait is intentionally an empty round panel — when a
          store hasn't uploaded a maker photo yet it still reads as a
          finished postcard rather than a broken image. */}
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div
          data-specialty-sepia="true"
          aria-hidden
          className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border"
          style={{
            background: 'var(--shop-muted)',
            borderColor: 'var(--shop-border)',
          }}
        />
        <div className="flex-1">
          <p
            className="max-w-2xl text-base leading-relaxed"
            style={{
              fontFamily: SPECIALTY_DISPLAY_FONT,
              color: 'var(--shop-ink)',
            }}
          >
            {body}
          </p>
          <p
            className="mt-5 text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            — ด้วยใจ
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={`/stores/${storeSlug}`}
          className="inline-flex h-12 items-center justify-center rounded-md border px-6 text-sm font-semibold transition hover:opacity-80"
          style={{
            borderColor: 'var(--shop-ink)',
            color: 'var(--shop-ink)',
          }}
        >
          Visit the studio
        </Link>
      </div>
    </section>
  );
}
