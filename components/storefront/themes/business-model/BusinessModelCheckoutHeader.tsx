/**
 * BusinessModelCheckoutHeader — bespoke "ORDER LEDGER" header band
 * mounted above the generic checkout client (address + confirm steps).
 *
 * Structural difference from the FashionBeautyCheckoutHeader inline
 * editorial header inside `app/stores/[slug]/checkout/{address,confirm}/
 * page.tsx`:
 *   - Tight-caps eyebrow with the step counter rendered as a JetBrains
 *     Mono numeric ("ORDER LEDGER · STEP 1/2") instead of an italic
 *     editorial line. Mono numbers reinforce the dashboard voice
 *     established by the Cart's "LINES 4 · QTY 12" chip.
 *   - Bold sans h1 — "Shipping Details" (step 1) or "Confirm Bulk
 *     Order" (step 2). NO serif, NO italic — utility, not romance.
 *   - Red rectangle accent bar above the title (h-1 w-12) — matches
 *     the BM motif used in PolicyShell, BrandStory, OrderSuccess.
 *   - Sober one-line subtitle in DM Sans muted ink. Step 1 reads
 *     "Provide delivery address for the order." Step 2 reads "Review
 *     the order before submission." No emotional language.
 *
 * Renders nothing dispatch-related — purely chrome. The per-page
 * server wrapper is responsible for mounting this above the existing
 * client component.
 */

import type { JSX } from 'react';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelCheckoutHeaderProps {
  step: 1 | 2;
}

export function BusinessModelCheckoutHeader({
  step,
}: BusinessModelCheckoutHeaderProps): JSX.Element {
  const title = step === 1 ? 'Shipping Details' : 'Confirm Bulk Order';
  const subtitle =
    step === 1
      ? 'Provide delivery address for the order.'
      : 'Review the order before submission.';

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <header>
          <p
            className="text-[11px] font-semibold uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.12em',
            }}
          >
            <span>ORDER LEDGER</span>
            <span aria-hidden style={{ color: 'var(--shop-border)' }}>
              {' · '}
            </span>
            <span>STEP </span>
            <span
              data-bm-mono="true"
              style={{
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                color: 'var(--shop-ink)',
                letterSpacing: '0.04em',
              }}
            >
              {step}/2
            </span>
          </p>
          <div
            aria-hidden
            className="mt-4 h-1 w-12 rounded-md"
            style={{ background: 'var(--shop-primary)' }}
          />
          <h1
            className="mt-4 text-3xl sm:text-4xl"
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
          <p
            className="mt-3 max-w-md text-sm"
            style={{
              fontFamily: BM_HEADING_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            {subtitle}
          </p>
        </header>
      </div>
    </div>
  );
}
