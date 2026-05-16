/**
 * BusinessModelBrandStory — bespoke B2B "wholesale partner" panel for
 * BM PDPs.
 *
 * Renders between the product hero and the specs/description tabs on
 * business-model PDPs. Surfaces the store's tagline (preferred) or
 * description in a wholesale-utility voice — caps eyebrow, bold sans
 * title, sober DM Sans body (NO italic — BM doesn't romanticize) — with
 * a 3-stat ledger row (years in business / SKUs / max bulk discount)
 * and a rectangular "REQUEST A QUOTE" red CTA.
 *
 * Reads the store's `description` and `tagline` fields. If neither is
 * present, the component renders nothing (no awkward empty frame).
 *
 * The 3 stat tiles use placeholder values (10+ yr / 500+ SKU / up to
 * 25%) until real Store fields land — they exist to communicate the
 * shape of the panel, not the actual data. The CTA prefers a mailto
 * fallback with the operator's name in the subject; it intentionally
 * does not link to /contact yet because that route sits inside the
 * generic shop chrome on most templates.
 *
 * TODO(schema): swap the placeholders for Store.foundedAt /
 * Store.skuCount / Store.maxVolumeDiscountPct once those fields ship.
 */

import Link from 'next/link';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelBrandStoryProps {
  storeSlug: string;
  storeName: string;
  tagline: string | null;
  description: string | null;
}

export function BusinessModelBrandStory({
  storeSlug,
  storeName,
  tagline,
  description,
}: BusinessModelBrandStoryProps) {
  const body = (tagline?.trim() || description?.trim() || '').trim();
  if (!body) return null;

  const quoteHref = `/stores/${storeSlug}/about`;

  return (
    <section
      className="my-12 rounded-md border p-6 sm:p-10"
      style={{
        background: '#dc2626',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      }}
    >
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start md:gap-12">
        <div>
          <p
            className="text-[11px] font-semibold uppercase"
            style={{
              color: 'rgba(255, 255, 255, 0.85)',
              letterSpacing: '0.12em',
            }}
          >
            พาร์ทเนอร์ขายส่ง · {storeName.toUpperCase()}
          </p>
          <div
            aria-hidden
            className="mt-3 h-1 w-12 rounded-md"
            style={{ background: '#ffffff' }}
          />
          <h2
            className="mt-4 text-2xl sm:text-3xl"
            style={{
              fontFamily: BM_HEADING_FONT,
              color: '#ffffff',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            ทำไมต้องเลือก {storeName}?
          </h2>
          <p
            className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base"
            style={{
              fontFamily: BM_HEADING_FONT,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {body}
          </p>
        </div>

        <Link
          href={quoteHref}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md px-6 text-xs font-bold uppercase tracking-[0.08em] shadow-sm transition hover:opacity-90"
          style={{ background: '#ffffff', color: '#dc2626' }}
        >
          ติดต่อเรา
        </Link>
      </div>

      {/* Wholesale stat ledger — 3 mono numerics in a B2B trust strip */}
      <ul
        className="mt-8 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-3 sm:gap-4"
        style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <BusinessModelStat label="ดำเนินธุรกิจมา" value="10+" unit="ปี" />
        <BusinessModelStat label="ความหลากหลายสินค้า" value="500+" unit="SKU" />
        <BusinessModelStat label="ส่วนลดยกล็อต" value="สูงสุด 25%" />
      </ul>

      {/* Hidden link back to the wholesale catalog — keeps the panel
          self-contained for users who want to keep browsing rather
          than open the email client. */}
      <p
        className="mt-5 text-[11px] font-semibold uppercase"
        style={{
          color: 'rgba(255, 255, 255, 0.85)',
          letterSpacing: '0.12em',
        }}
      >
        <Link
          href={`/stores/${storeSlug}`}
          className="hover:underline"
          style={{ color: 'rgba(255, 255, 255, 0.85)' }}
        >
          ← กลับสู่แคตตาล็อกขายส่ง
        </Link>
      </p>
    </section>
  );

  function BusinessModelStat({
    label,
    value,
    unit,
  }: {
    label: string;
    value: string;
    unit?: string;
  }) {
    return (
      <li
        className="rounded-md border p-3"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          background: 'rgba(0, 0, 0, 0.15)',
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase"
          style={{
            color: 'rgba(255, 255, 255, 0.75)',
            letterSpacing: '0.12em',
          }}
        >
          {label}
        </p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span
            data-bm-mono="true"
            className="text-xl"
            style={{
              fontFamily: BM_MONO_FONT,
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              className="text-[10px] font-semibold uppercase"
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                letterSpacing: '0.12em',
              }}
            >
              {unit}
            </span>
          )}
        </p>
      </li>
    );
  }
}
