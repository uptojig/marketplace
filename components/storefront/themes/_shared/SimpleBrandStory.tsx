/**
 * Shared brand-story panel — used by the slim themes (everyday /
 * taobao / packaging / community) below their PDP hero. Card-style
 * with theme-tinted accent bar + eyebrow + h2 + tagline body + CTA
 * back to the catalog. Renders nothing when both tagline and
 * description are empty.
 */

import Link from 'next/link';

interface Props {
  storeSlug: string;
  storeName: string;
  tagline: string | null;
  description: string | null;
  /** Eyebrow color + accent bar color (theme primary). */
  accentColor: string;
  /** Background for the whole panel. Pick a soft theme tint. */
  panelBg?: string;
  /** Eyebrow label text. */
  eyebrow?: string;
  /** Override the CTA label. Default: "← กลับสู่แคตตาล็อก". */
  ctaLabel?: string;
}

export function SimpleBrandStory({
  storeSlug,
  storeName,
  tagline,
  description,
  accentColor,
  panelBg = '#ffffff',
  eyebrow = '★ เกี่ยวกับร้านนี้',
  ctaLabel = '← กลับสู่แคตตาล็อก',
}: Props) {
  const body = (description?.trim() || tagline?.trim() || '').trim();
  if (!body) return null;

  return (
    <section
      className="my-12 rounded-2xl border p-6 sm:p-10"
      style={{ background: panelBg, borderColor: 'var(--shop-border, #E5E5E5)' }}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end md:gap-10">
        <div>
          <p
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: accentColor }}
          >
            {eyebrow}
          </p>
          <div
            aria-hidden
            className="mb-3 h-1 w-12 rounded-md"
            style={{ background: accentColor }}
          />
          <h2
            className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ color: 'var(--shop-ink, #0A0A0A)' }}
          >
            ทำไมต้องเลือก {storeName}?
          </h2>
          <p
            className="max-w-2xl text-sm leading-relaxed sm:text-base"
            style={{ color: 'var(--shop-ink-muted, #525252)' }}
          >
            {body}
          </p>
        </div>
        <Link
          href={`/stores/${storeSlug}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:opacity-90"
          style={{ background: accentColor }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
