/**
 * FashionBeautyPolicyShell — bespoke FB chrome for policy/info pages
 * (faq / shipping / returns / privacy / terms / help / about).
 *
 * Structural difference from the generic policy page:
 *   - Editorial top spread with serif page title + italic eyebrow
 *     ("Customer care · A note from us") instead of a plain h1.
 *   - Hairline gold-accent rule below the title — magazine page-opener
 *     motif (matches Cart/Category/Contact/OrderSuccess pages).
 *   - Body sits in a single-column max-w-3xl frame with serif drop-cap
 *     styling on h2 section headers via the inner-css block, so any
 *     existing fallback content automatically picks up the FB voice
 *     without rewriting.
 *   - Footer "back to boutique" link in italic serif.
 *
 * Accepts `children` which can be either the rich React fallbackBody
 * passed by the per-page server component, or a MultiPageRenderer
 * mounted in the same slot — the wrapper is voice-neutral about which.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export interface FashionBeautyPolicyShellProps {
  slug: string;
  title: string;
  /** Optional small caps eyebrow above the title. Defaults to
   *  "Customer care" so all five policy pages share a voice. */
  eyebrow?: string;
  children: ReactNode;
}

export function FashionBeautyPolicyShell({
  slug,
  title,
  eyebrow = 'บริการลูกค้า',
  children,
}: FashionBeautyPolicyShellProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <header className="text-center">
          <p
            className="text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-3 text-5xl sm:text-6xl"
            style={{
              fontFamily: FB_DISPLAY_FONT,
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

        {/* Inner content frame — promotes h2/h3 to serif so the existing
            fallback body adopts the FB voice without per-page rewrites.
            Scoped via data-fb-policy attribute so the rule never leaks. */}
        <article
          data-fb-policy="true"
          className="mt-12 leading-relaxed"
          style={{ color: 'var(--shop-ink)' }}
        >
          <style>{`
            [data-fb-policy="true"] h2 {
              font-family: ${FB_DISPLAY_FONT};
              font-weight: 500;
              font-size: 1.75rem;
              line-height: 1.2;
              letter-spacing: -0.005em;
              color: var(--shop-ink);
              margin-top: 2.5rem;
              margin-bottom: 1rem;
            }
            [data-fb-policy="true"] h3 {
              font-family: ${FB_DISPLAY_FONT};
              font-weight: 500;
              font-size: 1.375rem;
              color: var(--shop-ink);
              margin-top: 2rem;
              margin-bottom: 0.75rem;
            }
            [data-fb-policy="true"] p,
            [data-fb-policy="true"] li {
              color: var(--shop-ink);
            }
            [data-fb-policy="true"] a {
              color: var(--shop-primary);
              text-decoration: underline;
              text-underline-offset: 3px;
            }
            [data-fb-policy="true"] ul,
            [data-fb-policy="true"] ol {
              padding-left: 1.25rem;
              margin-bottom: 1rem;
            }
            [data-fb-policy="true"] ul {
              list-style: disc;
            }
            [data-fb-policy="true"] ol {
              list-style: decimal;
            }
          `}</style>
          {children}
        </article>

        <div className="mt-14 text-center">
          <Link
            href={`/stores/${slug}`}
            className="text-sm italic hover:underline"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            ← กลับสู่บูทีค
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * Map a policy page slug to a tuned eyebrow + title pair so each of
 * the 5 pages reads as part of the editorial system instead of all
 * sharing "บริการลูกค้า · {Thai page name}".
 */
export function fashionBeautyPolicyHeading(
  pageSlug: string,
  fallbackTitle: string,
): { eyebrow: string; title: string } {
  switch (pageSlug) {
    case 'shipping':
      return { eyebrow: 'บริการลูกค้า', title: 'การจัดส่ง' };
    case 'returns':
      return { eyebrow: 'บริการลูกค้า', title: 'การคืน/เปลี่ยนสินค้า' };
    case 'faq':
      return { eyebrow: 'คำถามจากคุณ', title: 'คำถามที่พบบ่อย' };
    case 'privacy':
      return { eyebrow: 'บริการลูกค้า', title: 'นโยบายความเป็นส่วนตัว' };
    case 'terms':
      return { eyebrow: 'บริการลูกค้า', title: 'ข้อกำหนดการใช้งาน' };
    case 'about':
      return { eyebrow: 'เกี่ยวกับเรา', title: 'เรื่องราวของเรา' };
    case 'help':
      return { eyebrow: 'บริการลูกค้า', title: 'เราช่วยอะไรคุณได้บ้าง' };
    default:
      return { eyebrow: 'บริการลูกค้า', title: fallbackTitle };
  }
}
