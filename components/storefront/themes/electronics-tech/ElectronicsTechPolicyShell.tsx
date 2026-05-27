/**
 * ElectronicsTechPolicyShell — bespoke ET chrome for policy/info pages
 * (faq / shipping / returns / privacy / terms / help / about).
 *
 * Structural difference from the generic policy page:
 *   - Spec-sheet top spread: JetBrains Mono caps eyebrow carries a
 *     "DOC.XXX-001" doc-id (mirrors the SKU eyebrows on the cart /
 *     PDP / category pages) instead of the FB italic "Customer care".
 *   - Inter Tight bold display h1 — no serif lift.
 *   - Sharp mint hairline rule below the title (h-px w-16, mint
 *     --shop-highlight) instead of FB's gold rule.
 *   - Body sits in a single-column max-w-3xl frame. The inner-CSS
 *     block scoped via `data-tech-policy="true"` promotes h2 to
 *     Inter Tight bold and h3 to JetBrains Mono caps tracking-wider,
 *     so any existing fallback content automatically picks up the ET
 *     spec-sheet voice without rewriting.
 *   - Inline numerics inside policy bodies are forced to JetBrains
 *     Mono so order-id / SKU / phone references match the rest of
 *     the family.
 *   - Footer "back to product index" link in mono caps with the
 *     ChevronLeft glyph from the cart header.
 *
 * Server-renderable — no hooks, no client state.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export interface ElectronicsTechPolicyShellProps {
  slug: string;
  title: string;
  /** Optional mono caps eyebrow above the title. Defaults to
   *  "TECHNICAL SUPPORT" so all policy pages share a voice; the
   *  helper below feeds a more specific doc-id eyebrow per slug. */
  eyebrow?: string;
  children: ReactNode;
}

export function ElectronicsTechPolicyShell({
  slug,
  title,
  eyebrow = 'TECHNICAL SUPPORT',
  children,
}: ElectronicsTechPolicyShellProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <header>
          <p
            data-tech-mono="true"
            className="inline-block rounded-md border bg-[var(--shop-muted)] px-2.5 py-1 text-[11px] uppercase"
            style={{
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-4 text-4xl sm:text-5xl"
            style={{
              fontFamily: TECH_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          <div
            aria-hidden
            className="mt-5 h-px w-16"
            style={{ background: 'var(--shop-highlight, #34d399)' }}
          />
        </header>

        {/* Inner content frame — promotes h2/h3 to spec-sheet voice and
            forces inline numerics into JetBrains Mono so the existing
            fallback body adopts the ET voice without per-page rewrites.
            Scoped via data-tech-policy attribute so the rules never leak. */}
        <article
          data-tech-policy="true"
          className="mt-12 leading-relaxed"
          style={{ color: 'var(--shop-ink)', fontFamily: TECH_DISPLAY_FONT }}
        >
          <style>{`
            [data-tech-policy="true"] h2 {
              font-family: ${TECH_DISPLAY_FONT};
              font-weight: 700;
              font-size: 1.625rem;
              line-height: 1.2;
              letter-spacing: -0.01em;
              color: var(--shop-ink);
              margin-top: 2.5rem;
              margin-bottom: 0.875rem;
            }
            [data-tech-policy="true"] h3 {
              font-family: ${TECH_MONO_FONT};
              font-weight: 600;
              font-size: 0.8125rem;
              text-transform: uppercase;
              letter-spacing: 0.16em;
              color: var(--shop-ink);
              margin-top: 1.875rem;
              margin-bottom: 0.625rem;
            }
            [data-tech-policy="true"] p,
            [data-tech-policy="true"] li {
              color: var(--shop-ink);
            }
            [data-tech-policy="true"] code,
            [data-tech-policy="true"] kbd,
            [data-tech-policy="true"] samp {
              font-family: ${TECH_MONO_FONT};
              font-size: 0.875em;
              padding: 0.05em 0.35em;
              border-radius: 0.25rem;
              background: var(--shop-muted);
              color: var(--shop-ink);
            }
            [data-tech-policy="true"] a {
              color: var(--shop-highlight, #34d399);
              text-decoration: underline;
              text-underline-offset: 3px;
            }
            [data-tech-policy="true"] a:hover {
              opacity: 0.8;
            }
            [data-tech-policy="true"] ul,
            [data-tech-policy="true"] ol {
              padding-left: 1.25rem;
              margin-bottom: 1rem;
            }
            [data-tech-policy="true"] ul {
              list-style: disc;
            }
            [data-tech-policy="true"] ol {
              list-style: decimal;
            }
            [data-tech-policy="true"] strong {
              font-weight: 700;
              color: var(--shop-ink);
            }
          `}</style>
          {children}
        </article>

        <div className="mt-14">
          <Link
            href={`/stores/${slug}`}
            data-tech-mono="true"
            className="inline-flex items-center gap-1 text-[11px] uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            ← Back to product index
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * Map a policy page slug to a tuned mono caps doc-id eyebrow + title
 * pair so each of the seven supported pages reads as part of the
 * spec-sheet documentation system instead of all sharing a single
 * generic header.
 *
 * Doc-id format mirrors the consumer-electronics manual convention:
 *   "DOC.{CAT}-001" — short uppercase category code + sequence.
 */
export function electronicsTechPolicyHeading(
  pageSlug: string,
  fallbackTitle: string,
): { eyebrow: string; title: string } {
  switch (pageSlug) {
    case 'shipping':
      return { eyebrow: 'DOC.SHIP-001', title: 'นโยบายการจัดส่ง' };
    case 'returns':
      return { eyebrow: 'DOC.RTN-001', title: 'การคืนสินค้า' };
    case 'faq':
      return { eyebrow: 'DOC.FAQ-001', title: 'FAQ — Frequently Asked' };
    case 'privacy':
      return { eyebrow: 'DOC.PRV-001', title: 'Privacy policy' };
    case 'terms':
      return { eyebrow: 'DOC.TOS-001', title: 'Terms of service' };
    case 'about':
      return { eyebrow: 'ABOUT', title: 'About us' };
    case 'help':
      return { eyebrow: 'DOC.HLP-001', title: 'Help center' };
    default:
      return { eyebrow: 'TECHNICAL SUPPORT', title: fallbackTitle };
  }
}
