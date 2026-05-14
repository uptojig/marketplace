/**
 * BusinessModelPolicyShell — bespoke BM chrome for policy/info pages
 * (faq / shipping / returns / privacy / terms / help / about).
 *
 * Structural difference from the generic policy page and the
 * FashionBeautyPolicyShell editorial spread:
 *   - Dashboard top band: tight-caps eyebrow ("DEAL DASHBOARD ·
 *     SHIPPING") + bold sans h1 (NOT serif, NOT italic — utility
 *     voice). Red rectangle accent bar (h-1 w-12) above the title
 *     instead of a hairline rule below — the BM motif used across
 *     Cart / Category / OrderSuccess.
 *   - Body sits in a single-column max-w-3xl frame with bold-sans
 *     drop styling on h2/h3 section headers via the inner-css block,
 *     so any existing fallback content automatically picks up the BM
 *     voice without rewriting. Numerics inside the policy body get
 *     promoted to JetBrains Mono with tabular-nums.
 *   - Red link color (var(--shop-primary)) — matches the dashboard's
 *     CTA palette, not the editorial gold of FB.
 *   - Footer "back to dashboard" link in tight-caps semibold sans.
 *
 * Accepts `children` which can be either the rich React fallbackBody
 * passed by the per-page server component, or a MultiPageRenderer
 * mounted in the same slot — the wrapper is voice-neutral about which.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelPolicyShellProps {
  slug: string;
  title: string;
  /** Optional small caps eyebrow above the title. Defaults to
   *  "ดีลที่กำลังจะหมดเวลา" so policy pages share a voice with the rest
   *  of the BM family. */
  eyebrow?: string;
  children: ReactNode;
}

export function BusinessModelPolicyShell({
  slug,
  title,
  eyebrow = 'ดีลที่กำลังจะหมดเวลา',
  children,
}: BusinessModelPolicyShellProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <header>
          <p
            className="text-[11px] font-semibold uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.12em',
            }}
          >
            {eyebrow}
          </p>
          <div
            aria-hidden
            className="mt-4 h-1 w-12 rounded-md"
            style={{ background: 'var(--shop-primary)' }}
          />
          <h1
            className="mt-4 text-3xl sm:text-4xl md:text-5xl"
            style={{
              fontFamily: BM_HEADING_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            {title}
          </h1>
        </header>

        {/* Inner content frame — promotes h2/h3 to bold sans + numerics
            to JetBrains Mono so the existing fallback body adopts the
            BM voice without per-page rewrites. Scoped via the
            data-bm-policy attribute so the rules never leak. */}
        <article
          data-bm-policy="true"
          className="mt-10 leading-relaxed"
          style={{ color: 'var(--shop-ink)' }}
        >
          <style>{`
            [data-bm-policy="true"] h2 {
              font-family: ${BM_HEADING_FONT};
              font-weight: 700;
              font-size: 1.5rem;
              line-height: 1.2;
              letter-spacing: -0.015em;
              color: var(--shop-ink);
              margin-top: 2.5rem;
              margin-bottom: 1rem;
            }
            [data-bm-policy="true"] h3 {
              font-family: ${BM_HEADING_FONT};
              font-weight: 700;
              font-size: 1.125rem;
              line-height: 1.25;
              letter-spacing: -0.01em;
              color: var(--shop-ink);
              margin-top: 1.75rem;
              margin-bottom: 0.625rem;
            }
            [data-bm-policy="true"] p,
            [data-bm-policy="true"] li {
              color: var(--shop-ink);
            }
            [data-bm-policy="true"] a {
              color: var(--shop-primary);
              text-decoration: underline;
              text-underline-offset: 3px;
              font-weight: 600;
            }
            [data-bm-policy="true"] strong {
              font-weight: 700;
              color: var(--shop-ink);
            }
            [data-bm-policy="true"] code,
            [data-bm-policy="true"] kbd,
            [data-bm-policy="true"] samp {
              font-family: ${BM_MONO_FONT};
              font-variant-numeric: tabular-nums;
              font-size: 0.9em;
            }
            [data-bm-policy="true"] ul,
            [data-bm-policy="true"] ol {
              padding-left: 1.25rem;
              margin-bottom: 1rem;
            }
            [data-bm-policy="true"] ul {
              list-style: disc;
            }
            [data-bm-policy="true"] ol {
              list-style: decimal;
            }
          `}</style>
          {children}
        </article>

        <div
          className="mt-14 border-t pt-6"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Link
            href={`/stores/${slug}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.12em',
            }}
          >
            ← กลับไปที่แดชบอร์ด
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * Map a policy page slug to a tuned eyebrow + title pair so each of
 * the 7 pages reads as part of the BM dashboard system instead of all
 * sharing "DEAL DASHBOARD · {English page name}".
 *
 * "DEAL DASHBOARD ·" prefixes the operational pages (shipping /
 * returns / FAQ). About uses the dedicated wholesale voice
 * ("WHOLESALE ACCOUNT" was reserved for the operator dashboard).
 */
export function businessModelPolicyHeading(
  pageSlug: string,
  fallbackTitle: string,
): { eyebrow: string; title: string } {
  switch (pageSlug) {
    case 'shipping':
      return { eyebrow: 'ดีลที่กำลังจะหมดเวลา · การจัดส่ง', title: 'การจัดส่ง' };
    case 'returns':
      return { eyebrow: 'ดีลที่กำลังจะหมดเวลา · การคืนสินค้า', title: 'การคืนสินค้าและคืนเงิน' };
    case 'faq':
      return { eyebrow: 'ดีลที่กำลังจะหมดเวลา · ความช่วยเหลือ', title: 'คำถามที่พบบ่อย' };
    case 'privacy':
      return { eyebrow: 'ความเป็นส่วนตัว', title: 'นโยบายความเป็นส่วนตัว' };
    case 'terms':
      return { eyebrow: 'ข้อกำหนด', title: 'ข้อกำหนดและเงื่อนไข' };
    case 'about':
      return { eyebrow: 'เกี่ยวกับเรา', title: 'เกี่ยวกับธุรกิจขายส่งของเรา' };
    case 'help':
      return { eyebrow: 'ศูนย์ช่วยเหลือ', title: 'เราจะช่วยคุณได้อย่างไร?' };
    default:
      return { eyebrow: 'ดีลที่กำลังจะหมดเวลา', title: fallbackTitle };
  }
}
