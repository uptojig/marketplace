/**
 * LifestylePolicyShell — bespoke lifestyle chrome for policy/info pages
 * (faq / shipping / returns / privacy / terms / help / about).
 *
 * Structural difference from the generic policy page AND the
 * FashionBeautyPolicyShell:
 *   - Warm conversational eyebrow ("Good to know" / "Curious?" /
 *     "Heads up" / "We're here") in caps with moderate tracking,
 *     instead of FB's italic "Customer care" magazine voice.
 *   - Outfit / Plus Jakarta Sans display h1 (geometric humanist sans
 *     at weight 600), NOT serif. Reads as a friendly note rather than
 *     a magazine page-opener.
 *   - Sage hand-drawn squiggle SVG divider below the title via
 *     `data-lifestyle-squiggle="true"`, replacing FB's hairline rule.
 *   - Body sits in a single-column max-w-3xl frame, with h2/h3 lifted
 *     into the same Outfit display via the inner-css block scoped by
 *     `data-lifestyle-policy="true"` so any existing fallback content
 *     adopts the lifestyle voice without per-page rewrites.
 *   - Footer "back to the catalog" link is a friendly rounded-full
 *     pill, not an italic serif line — matches the lifestyle CTA
 *     vocabulary used on cart / order success.
 *
 * Accepts `children` which can be either the rich React fallbackBody
 * passed by the per-page server component, or a MultiPageRenderer
 * mounted in the same slot — the wrapper is voice-neutral about which.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestylePolicyShellProps {
  slug: string;
  title: string;
  /** Optional warm caps eyebrow above the title. Defaults to
   *  "Good to know" so the policy/info pages share a friendly voice. */
  eyebrow?: string;
  children: ReactNode;
}

export function LifestylePolicyShell({
  slug,
  title,
  eyebrow = 'ดีที่ต้องรู้',
  children,
}: LifestylePolicyShellProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <header className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-3 text-4xl sm:text-5xl md:text-6xl"
            style={{
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.05,
            }}
          >
            {title}
          </h1>
          {/* Sage squiggle divider — warm hand-drawn flourish in place
              of FB's hairline rule. */}
          <div
            data-lifestyle-squiggle="true"
            aria-hidden
            className="mx-auto mt-6"
            style={{ maxWidth: '180px' }}
          />
        </header>

        {/* Inner content frame — promotes h2/h3 to the Outfit display
            so the existing fallback body adopts the lifestyle voice
            without per-page rewrites. Scoped via data-lifestyle-policy
            so the rule never leaks. Links lift to sage. */}
        <article
          data-lifestyle-policy="true"
          className="mt-12 leading-relaxed"
          style={{ color: 'var(--shop-ink)' }}
        >
          <style>{`
            [data-lifestyle-policy="true"] h2 {
              font-family: ${LIFESTYLE_DISPLAY_FONT};
              font-weight: 600;
              font-size: 1.75rem;
              line-height: 1.2;
              letter-spacing: -0.01em;
              color: var(--shop-ink);
              margin-top: 2.5rem;
              margin-bottom: 1rem;
            }
            [data-lifestyle-policy="true"] h3 {
              font-family: ${LIFESTYLE_DISPLAY_FONT};
              font-weight: 600;
              font-size: 1.375rem;
              letter-spacing: -0.01em;
              color: var(--shop-ink);
              margin-top: 2rem;
              margin-bottom: 0.75rem;
            }
            [data-lifestyle-policy="true"] p,
            [data-lifestyle-policy="true"] li {
              color: var(--shop-ink);
            }
            [data-lifestyle-policy="true"] a {
              color: var(--shop-accent);
              text-decoration: underline;
              text-underline-offset: 3px;
            }
            [data-lifestyle-policy="true"] ul,
            [data-lifestyle-policy="true"] ol {
              padding-left: 1.25rem;
              margin-bottom: 1rem;
            }
            [data-lifestyle-policy="true"] ul {
              list-style: disc;
            }
            [data-lifestyle-policy="true"] ol {
              list-style: decimal;
            }
          `}</style>
          {children}
        </article>

        <div className="mt-14 text-center">
          <Link
            href={`/stores/${slug}`}
            className="inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: 'var(--shop-ink)',
              color: 'var(--shop-ink)',
            }}
          >
            กลับไปที่แคตตาล็อก
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * Map a policy page slug to a tuned warm eyebrow + title pair so each
 * of the policy/info pages reads as part of the lifestyle voice
 * instead of all sharing "Good to know · {English page name}".
 */
export function lifestylePolicyHeading(
  pageSlug: string,
  fallbackTitle: string,
): { eyebrow: string; title: string } {
  switch (pageSlug) {
    case 'shipping':
      return { eyebrow: 'ดีที่ต้องรู้', title: 'วิธีการจัดส่ง' };
    case 'returns':
      return { eyebrow: 'ดีที่ต้องรู้', title: 'คืนสินค้าง่ายๆ' };
    case 'faq':
      return { eyebrow: 'อยากรู้?', title: 'คำถามที่พบบ่อย' };
    case 'privacy':
      return { eyebrow: 'แจ้งให้ทราบ', title: 'ความเป็นส่วนตัว' };
    case 'terms':
      return { eyebrow: 'แจ้งให้ทราบ', title: 'เงื่อนไขการใช้งาน' };
    case 'about':
      return { eyebrow: 'เกี่ยวกับเรา', title: 'เรื่องของเรา' };
    case 'help':
      return { eyebrow: 'เราพร้อมช่วย', title: 'ศูนย์ช่วยเหลือ' };
    default:
      return { eyebrow: 'ดีที่ต้องรู้', title: fallbackTitle };
  }
}
