/**
 * TrustBrandStory — bespoke heritage brand panel for Trust PDPs.
 *
 * Trust-family counterpart to FashionBeautyBrandStory. Renders between
 * the product hero and the specs/description tabs on Trust PDPs.
 * Surfaces the store's tagline (preferred) or description in a sober
 * department-store voice — ALL CAPS letterspaced eyebrow, oversized
 * Playfair serif title, upright (NOT italic) serif body, with a sober
 * "VISIT THE MAISON" caps link back to the boutique.
 *
 * Reads the store's `description` and `tagline` fields. If neither is
 * present, the component renders nothing (no awkward empty frame).
 *
 * Visual differences from the FB sibling:
 *   - Squared corners (rounded-sm) instead of FB's rounded-2xl pill.
 *   - Gold hairline trim under the title — no soft pink panel; the
 *     panel keeps Trust's pale-stone surface.
 *   - Body is upright Playfair (Trust voice deliberately avoids
 *     italics; italics belong to the FB editorial voice).
 *   - CTA is a squared, ALL CAPS, letterspaced sober link instead
 *     of a rounded-full pill — matches Trust CTAs everywhere.
 */

import Link from 'next/link';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustBrandStoryProps {
  storeSlug: string;
  storeName: string;
  tagline: string | null;
  description: string | null;
}

export function TrustBrandStory({
  storeSlug,
  storeName,
  tagline,
  description,
}: TrustBrandStoryProps) {
  const body = (tagline?.trim() || description?.trim() || '').trim();
  if (!body) return null;

  return (
    <section
      className="my-12 grid gap-8 rounded-sm border-2 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center md:gap-12"
      style={{
        background: 'var(--shop-muted)',
        borderColor: 'var(--shop-accent)',
      }}
    >
      <div>
        <p
          className="text-[11px] uppercase"
          style={{
            color: 'var(--shop-accent)',
            letterSpacing: '0.32em',
            fontWeight: 600,
          }}
        >
          Maison · {storeName}
        </p>
        <h2
          className="mt-3 text-3xl sm:text-4xl"
          style={{
            fontFamily: TRUST_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
          }}
        >
          From the House of {storeName}
        </h2>
        <div
          aria-hidden
          className="mt-4 h-px w-12"
          style={{ background: 'var(--shop-accent)' }}
        />
        <p
          className="mt-5 max-w-2xl text-base leading-relaxed"
          style={{
            fontFamily: TRUST_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 500,
          }}
        >
          {body}
        </p>
      </div>

      <Link
        href={`/stores/${storeSlug}`}
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-sm px-8 text-xs font-semibold uppercase text-white transition hover:opacity-90"
        style={{
          background: 'var(--shop-primary)',
          letterSpacing: '0.28em',
        }}
      >
        Visit the Maison
      </Link>
    </section>
  );
}
