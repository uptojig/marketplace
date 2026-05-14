/**
 * FashionBeautyBrandStory — bespoke editorial brand panel for FB PDPs.
 *
 * Renders between the product hero and the specs/description tabs on
 * fashion-beauty PDPs. Surfaces the store's tagline (preferred) or
 * description in a magazine-letter voice — italic eyebrow, oversized
 * serif title, italic body — with a soft-pink panel left of an italic
 * "Discover more" link back to the boutique.
 *
 * Reads the store's `description` and `tagline` fields. If neither is
 * present, the component renders nothing (no awkward empty frame).
 */

import Link from 'next/link';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export interface FashionBeautyBrandStoryProps {
  storeSlug: string;
  storeName: string;
  tagline: string | null;
  description: string | null;
}

export function FashionBeautyBrandStory({
  storeSlug,
  storeName,
  tagline,
  description,
}: FashionBeautyBrandStoryProps) {
  const body = (tagline?.trim() || description?.trim() || '').trim();
  if (!body) return null;

  return (
    <section
      className="my-12 grid gap-8 rounded-2xl border p-8 shadow-sm sm:p-12 md:grid-cols-[1fr_auto] md:items-center md:gap-12"
      style={{
        background: 'var(--shop-muted)',
        borderColor: 'var(--shop-accent)',
      }}
    >
      <div>
        <p
          className="text-[11px] uppercase tracking-[0.28em]"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          From the boutique
        </p>
        <h2
          className="mt-2 text-3xl sm:text-4xl"
          style={{
            fontFamily: FB_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 500,
            letterSpacing: '-0.005em',
            lineHeight: 1.15,
          }}
        >
          A note from {storeName}
        </h2>
        <div
          aria-hidden
          className="mt-4 h-px w-12"
          style={{ background: 'var(--shop-accent)' }}
        />
        <p
          className="mt-5 max-w-2xl text-base italic leading-relaxed"
          style={{
            fontFamily: FB_DISPLAY_FONT,
            color: 'var(--shop-ink-muted)',
          }}
        >
          {body}
        </p>
      </div>

      <Link
        href={`/stores/${storeSlug}`}
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border px-6 text-sm font-semibold transition hover:opacity-80"
        style={{
          borderColor: 'var(--shop-ink)',
          color: 'var(--shop-ink)',
        }}
      >
        Discover the boutique
      </Link>
    </section>
  );
}
