/**
 * SpecialtyPolicyShell — bespoke artisan / vintage chrome for the
 * policy + info pages (faq / shipping / returns / privacy / terms /
 * help / about).
 *
 * Counterpart to FashionBeautyPolicyShell — same structural role
 * (shell wrapper + per-slug heading map), but in the specialty
 * (handmade / vintage paper) voice rather than the FB editorial voice.
 *
 * Visual differences vs the generic policy page:
 *   - Outer container carries `data-specialty-kraft="true"` so the
 *     kraft-paper texture in globals.css fills the article frame.
 *   - SpecialtyStamp "STAMPED" badge sits at the top — reads as a
 *     curator's mark on a workshop letter.
 *   - Caveat hand-script eyebrow ("from the studio" / "ask the makers"
 *     / etc.) above the Fraunces serif title — workshop-letter feel.
 *   - Body h2/h3 are promoted to Fraunces serif via the inner-css
 *     block scoped with `data-specialty-policy="true"` so the existing
 *     fallback content adopts the artisan voice without per-page
 *     rewrites. Caption-style elements lift into Caveat hand-script.
 *   - Footer "back to the studio" link in hand-script.
 *
 * Accepts `children` which can be either the rich React fallbackBody
 * passed by the per-page server component, or a MultiPageRenderer
 * mounted in the same slot — the wrapper is voice-neutral about which.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { SpecialtyStamp } from './SpecialtyDivider';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyPolicyShellProps {
  slug: string;
  title: string;
  /** Optional hand-script eyebrow above the title. Defaults to the
   *  "from the studio" workshop-letter voice. */
  eyebrow?: string;
  children: ReactNode;
}

export function SpecialtyPolicyShell({
  slug,
  title,
  eyebrow = 'จากสตูดิโอ',
  children,
}: SpecialtyPolicyShellProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        {/* Kraft-paper article frame — promotes the artisan voice. */}
        <article
          data-specialty-kraft="true"
          className="rounded-md border p-8 shadow-sm sm:p-12"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          {/* Stamped curator badge at the top */}
          <div className="flex justify-center">
            <SpecialtyStamp tone="primary">ประทับแล้ว</SpecialtyStamp>
          </div>

          <header className="mt-6 text-center">
            <p
              className="text-2xl"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-accent)',
              }}
            >
              {eyebrow}
            </p>
            <h1
              className="mt-1 text-4xl sm:text-5xl"
              style={{
                fontFamily: SPECIALTY_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                lineHeight: 1.05,
              }}
            >
              {title}
            </h1>
            <div
              aria-hidden
              className="mx-auto mt-5 h-px w-12"
              style={{ background: 'var(--shop-accent)' }}
            />
          </header>

          {/* Inner content frame — promotes h2/h3 to Fraunces serif so
              the existing fallback body adopts the specialty voice
              without per-page rewrites. Scoped via data-specialty-policy
              attribute so the rule never leaks. Caption-style classes
              (`.caption`, `.note`) lift into Caveat hand-script for
              decorative footnotes. */}
          <div
            data-specialty-policy="true"
            className="mt-10 leading-relaxed"
            style={{ color: 'var(--shop-ink)' }}
          >
            <style>{`
              [data-specialty-policy="true"] h2 {
                font-family: ${SPECIALTY_DISPLAY_FONT};
                font-weight: 500;
                font-size: 1.75rem;
                line-height: 1.2;
                letter-spacing: -0.005em;
                color: var(--shop-ink);
                margin-top: 2.5rem;
                margin-bottom: 1rem;
              }
              [data-specialty-policy="true"] h3 {
                font-family: ${SPECIALTY_DISPLAY_FONT};
                font-weight: 500;
                font-size: 1.375rem;
                color: var(--shop-ink);
                margin-top: 2rem;
                margin-bottom: 0.75rem;
              }
              [data-specialty-policy="true"] p,
              [data-specialty-policy="true"] li {
                color: var(--shop-ink);
              }
              [data-specialty-policy="true"] a {
                color: var(--shop-primary);
                text-decoration: underline;
                text-underline-offset: 3px;
              }
              [data-specialty-policy="true"] ul,
              [data-specialty-policy="true"] ol {
                padding-left: 1.25rem;
                margin-bottom: 1rem;
              }
              [data-specialty-policy="true"] ul {
                list-style: disc;
              }
              [data-specialty-policy="true"] ol {
                list-style: decimal;
              }
              [data-specialty-policy="true"] .caption,
              [data-specialty-policy="true"] .note,
              [data-specialty-policy="true"] figcaption {
                font-family: ${SPECIALTY_HAND_FONT};
                color: var(--shop-accent);
                font-size: 1.125rem;
                font-style: italic;
              }
            `}</style>
            {children}
          </div>
        </article>

        <div className="mt-10 text-center">
          <Link
            href={`/stores/${slug}`}
            className="text-xl hover:underline"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            ← กลับสตูดิโอ
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * Map a policy page slug to a tuned hand-script eyebrow + Fraunces
 * title pair so each of the policy/info pages reads as part of the
 * artisan workshop-letter system rather than all sharing a single
 * generic "Customer care" eyebrow.
 */
export function specialtyPolicyHeading(
  pageSlug: string,
  fallbackTitle: string,
): { eyebrow: string; title: string } {
  switch (pageSlug) {
    case 'shipping':
      return { eyebrow: 'จากสตูดิโอ', title: 'วิธีจัดส่ง' };
    case 'returns':
      return { eyebrow: 'ซ่อมแซมได้', title: 'การคืนสินค้าและซ่อมแซม' };
    case 'faq':
      return { eyebrow: 'ถามช่างฝีมือ', title: 'คำถามที่พบบ่อย' };
    case 'privacy':
      return { eyebrow: 'สัญญากับคุณ', title: 'ความเป็นส่วนตัว' };
    case 'terms':
      return { eyebrow: 'ข้อตกลง', title: 'เงื่อนไข' };
    case 'about':
      return { eyebrow: 'สตูดิโอ', title: 'เกี่ยวกับช่างฝีมือของเรา' };
    case 'help':
      return { eyebrow: 'เราพร้อมช่วย', title: 'ศูนย์ช่วยเหลือ' };
    default:
      return { eyebrow: 'จากสตูดิโอ', title: fallbackTitle };
  }
}
