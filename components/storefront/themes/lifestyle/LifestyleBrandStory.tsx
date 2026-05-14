/**
 * LifestyleBrandStory — bespoke warm-catalog brand panel for lifestyle PDPs.
 *
 * Renders between the product hero and the specs/description tabs on
 * lifestyle stores. Surfaces the store's tagline (preferred) or
 * description in a friendly catalog voice — sage caps eyebrow,
 * Outfit / Plus Jakarta Sans display headline, DM Sans warm body —
 * with a soft-amber muted card and a rounded-full "Discover our world"
 * CTA back to the catalog.
 *
 * Reads the store's `description` and `tagline` fields. If neither is
 * present, the component renders nothing (no awkward empty frame).
 */

import Link from 'next/link';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleBrandStoryProps {
  storeSlug: string;
  storeName: string;
  tagline: string | null;
  description: string | null;
}

export function LifestyleBrandStory({
  storeSlug,
  storeName,
  tagline,
  description,
}: LifestyleBrandStoryProps) {
  const body = (tagline?.trim() || description?.trim() || '').trim();
  if (!body) return null;

  return (
    <section
      data-lifestyle-frame="true"
      className="my-12 grid gap-8 rounded-3xl border p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center md:gap-12"
      style={{
        background: 'var(--shop-muted)',
        borderColor: 'var(--shop-accent)',
      }}
    >
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: 'var(--shop-accent)' }}
        >
          เรื่องของเรา · {storeName}
        </p>
        <h2
          className="mt-2 text-3xl sm:text-4xl"
          style={{
            fontFamily: LIFESTYLE_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
          }}
        >
          ของใช้ทุกวัน
        </h2>
        {/* Sage squiggle flourish in place of a hairline rule */}
        <div
          data-lifestyle-squiggle="true"
          aria-hidden
          className="mt-4"
          style={{ maxWidth: '120px' }}
        />
        <p
          className="mt-5 max-w-2xl text-base leading-relaxed"
          style={{ color: 'var(--shop-ink)' }}
        >
          {body}
        </p>
      </div>

      <Link
        href={`/stores/${storeSlug}`}
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-full px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        style={{ background: 'var(--shop-primary)' }}
      >
        ดูร้านทั้งหมด
      </Link>
    </section>
  );
}
