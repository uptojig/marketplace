/**
 * ElectronicsTechBrandStory — bespoke spec-sheet brand panel for ET PDPs.
 *
 * Renders between the product hero and the specs/description tabs on
 * electronics-tech PDPs. Surfaces the store's tagline (preferred) or
 * description in a consumer-electronics manual voice — JetBrains Mono
 * "VENDOR · {storeName}" eyebrow, Inter Tight bold display title, DM
 * Sans body (no italic), then a 3-column mono spec strip carrying the
 * "Warranty / Stock / Lead time" placeholders that mirror the PDP
 * spec table further down the page.
 *
 * Reads the store's `description` and `tagline` fields. If neither is
 * present, the component renders nothing (no awkward empty frame).
 */

import Link from 'next/link';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

const TECH_BODY_FONT =
  '"DM Sans", var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

export interface ElectronicsTechBrandStoryProps {
  storeSlug: string;
  storeName: string;
  tagline: string | null;
  description: string | null;
}

export function ElectronicsTechBrandStory({
  storeSlug,
  storeName,
  tagline,
  description,
}: ElectronicsTechBrandStoryProps) {
  const body = (tagline?.trim() || description?.trim() || '').trim();
  if (!body) return null;

  return (
    <section
      className="my-12 rounded-md border bg-white p-8 sm:p-10"
      style={{ borderColor: 'var(--shop-highlight, #34d399)' }}
    >
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end md:gap-12">
        <div>
          <p
            data-tech-mono="true"
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            VENDOR · {storeName}
          </p>
          <h2
            className="mt-3 text-2xl sm:text-3xl"
            style={{
              fontFamily: TECH_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.15,
            }}
          >
            Engineered for {storeName}
          </h2>
          <div
            aria-hidden
            className="mt-4 h-px w-16"
            style={{ background: 'var(--shop-highlight, #34d399)' }}
          />
          <p
            className="mt-5 max-w-2xl text-base leading-relaxed"
            style={{
              fontFamily: TECH_BODY_FONT,
              color: 'var(--shop-ink)',
            }}
          >
            {body}
          </p>
        </div>

        <Link
          href={`/stores/${storeSlug}`}
          data-tech-mono="true"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-md border bg-white px-5 text-[11px] uppercase transition hover:border-[var(--shop-highlight,#34d399)] hover:text-[var(--shop-highlight,#34d399)]"
          style={{
            borderColor: 'var(--shop-border)',
            color: 'var(--shop-ink)',
            fontFamily: TECH_MONO_FONT,
            letterSpacing: '0.16em',
            fontWeight: 600,
          }}
        >
          View catalog →
        </Link>
      </div>

      {/* 3-column mono spec strip — mirrors the PDP spec table voice. */}
      <dl
        className="mt-8 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-3"
        style={{ borderColor: 'var(--shop-border)' }}
      >
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
            Stock
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
            In stock
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
            1–3 days
          </dd>
        </div>
      </dl>
    </section>
  );
}
