/**
 * TrustPolicyShell — bespoke heritage-maison chrome for policy/info
 * pages (faq / shipping / returns / privacy / terms / about / help).
 *
 * Trust-family counterpart to FashionBeautyPolicyShell. Structural
 * difference from the generic policy page:
 *   - Heritage top spread: ALL CAPS letterspaced eyebrow
 *     ("MAISON · DELIVERY") above a centered Playfair serif title.
 *     NO italics — Trust voice is sober, not editorial.
 *   - Hairline gold-accent rule below the title — department-store
 *     page-opener motif (matches TrustCartPage / TrustCategoryPage /
 *     TrustOrderSuccessPage).
 *   - Body sits in a single-column max-w-3xl frame. Inner h2 / h3
 *     headings are promoted to Playfair serif via a scoped
 *     `data-trust-policy="true"` style block, so the existing
 *     fallbackBody markup adopts the heritage voice without per-page
 *     rewrites.
 *   - Footer "back to maison" link is a sober ALL CAPS letterspaced
 *     row (no italics) to keep the heritage register intact.
 *
 * Accepts `children` which can be either the rich React fallbackBody
 * passed by the per-page server component, or a MultiPageRenderer
 * mounted in the same slot — the wrapper is voice-neutral about which.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustPolicyShellProps {
  slug: string;
  title: string;
  /** Optional small caps eyebrow above the title. Defaults to
   *  "MAISON · CUSTOMER CARE" so unmapped policy pages still read
   *  as part of the heritage system. */
  eyebrow?: string;
  children: ReactNode;
}

export function TrustPolicyShell({
  slug,
  title,
  eyebrow = 'เมซอน · ศูนย์ดูแลลูกค้า',
  children,
}: TrustPolicyShellProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <header className="text-center">
          <p
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-4 text-4xl sm:text-5xl"
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
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

        {/* Inner content frame — promotes h2/h3 to serif so the
            existing fallback body adopts the heritage voice without
            per-page rewrites. Scoped via data-trust-policy attribute
            so the rule never leaks. */}
        <article
          data-trust-policy="true"
          className="mt-12 leading-relaxed"
          style={{ color: 'var(--shop-ink)' }}
        >
          <style>{`
            [data-trust-policy="true"] h2 {
              font-family: ${TRUST_DISPLAY_FONT};
              font-weight: 600;
              font-size: 1.75rem;
              line-height: 1.2;
              letter-spacing: -0.01em;
              color: var(--shop-ink);
              margin-top: 2.5rem;
              margin-bottom: 1rem;
            }
            [data-trust-policy="true"] h3 {
              font-family: ${TRUST_DISPLAY_FONT};
              font-weight: 600;
              font-size: 1.375rem;
              color: var(--shop-ink);
              margin-top: 2rem;
              margin-bottom: 0.75rem;
            }
            [data-trust-policy="true"] p,
            [data-trust-policy="true"] li {
              color: var(--shop-ink);
            }
            [data-trust-policy="true"] a {
              color: var(--shop-primary);
              text-decoration: underline;
              text-underline-offset: 3px;
            }
            [data-trust-policy="true"] ul,
            [data-trust-policy="true"] ol {
              padding-left: 1.25rem;
              margin-bottom: 1rem;
            }
            [data-trust-policy="true"] ul {
              list-style: disc;
            }
            [data-trust-policy="true"] ol {
              list-style: decimal;
            }
          `}</style>
          {children}
        </article>

        <div className="mt-14 text-center">
          <Link
            href={`/stores/${slug}`}
            className="text-[11px] uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.28em',
              fontWeight: 600,
            }}
          >
            กลับสู่เมซอน
          </Link>
        </div>
      </main>
    </div>
  );
}

/**
 * Map a policy page slug to a tuned Trust-voice eyebrow + title pair
 * so each of the seven supported pages reads as part of the heritage
 * system instead of all sharing the generic default. All values are
 * uppercase to match the Trust ALL-CAPS letterspaced eyebrow rule.
 */
export function trustPolicyHeading(
  pageSlug: string,
  fallbackTitle: string,
): { eyebrow: string; title: string } {
  switch (pageSlug) {
    case 'shipping':
      return { eyebrow: 'เมซอน · การจัดส่ง', title: 'นโยบายการจัดส่ง' };
    case 'returns':
      return { eyebrow: 'เมซอน · นโยบาย', title: 'การคืน/เปลี่ยนสินค้า' };
    case 'faq':
      return { eyebrow: 'เมซอน · คำถาม', title: 'คำถามที่พบบ่อย' };
    case 'privacy':
      return { eyebrow: 'เมซอน · นโยบาย', title: 'นโยบายความเป็นส่วนตัว' };
    case 'terms':
      return { eyebrow: 'เมซอน · นโยบาย', title: 'ข้อกำหนดการใช้บริการ' };
    case 'about':
      return { eyebrow: 'เมซอน · เกี่ยวกับเรา', title: 'เกี่ยวกับเรา' };
    case 'help':
      return { eyebrow: 'เมซอน · ศูนย์ช่วยเหลือ', title: 'ศูนย์ช่วยเหลือ' };
    default:
      return {
        eyebrow: 'เมซอน · ศูนย์ดูแลลูกค้า',
        title: fallbackTitle,
      };
  }
}
