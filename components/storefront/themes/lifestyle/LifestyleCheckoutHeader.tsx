/**
 * LifestyleCheckoutHeader — bespoke warm-catalog top header for the
 * 2-step checkout flow on lifestyle stores.
 *
 * Structural difference from the generic checkout page AND the
 * FashionBeauty editorial header used on /checkout/address +
 * /checkout/confirm:
 *   - Warm "Step {n} of 2" eyebrow in caps with sage colour and
 *     moderate tracking, instead of FB's italic-serif "Checkout · Step
 *     {n} of 2" magazine voice.
 *   - Outfit / Plus Jakarta Sans display h1 (geometric humanist sans
 *     at weight 600). Step 1 reads "Where to send it" and step 2
 *     reads "Almost there!" — friendly, conversational, not boutique.
 *   - Sage hand-drawn squiggle SVG divider below the title via
 *     `data-lifestyle-squiggle="true"`, replacing FB's hairline rule.
 *   - Sub copy is a warm one-liner in DM Sans body voice: "Tell us
 *     where to drop it off" (step 1) or "Take a peek and we'll send
 *     it on its way" (step 2). Matches the lifestyle CartPage and
 *     OrderSuccess voice.
 *
 * Pure presentational shell — server pages render this above the
 * existing client component (CheckoutAddressClient /
 * CheckoutConfirmClient) without rewiring any dispatch logic.
 */

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleCheckoutHeaderProps {
  step: 1 | 2;
}

export function LifestyleCheckoutHeader({ step }: LifestyleCheckoutHeaderProps) {
  const title = step === 1 ? 'ส่งไปที่ไหนดี' : 'ใกล้เสร็จแล้ว!';
  const sub =
    step === 1
      ? 'บอกเราหน่อยว่าจะให้ส่งไปที่ไหน'
      : 'ตรวจดูอีกครั้ง แล้วเราจะจัดส่งให้เลย';

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <header className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            ขั้นที่ {step} จาก 2
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
            className="mx-auto mt-5"
            style={{ maxWidth: '180px' }}
          />
          <p
            className="mt-5 mx-auto max-w-md text-base"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {sub}
          </p>
        </header>
      </div>
    </div>
  );
}
