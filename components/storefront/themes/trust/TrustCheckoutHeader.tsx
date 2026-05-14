/**
 * TrustCheckoutHeader — bespoke heritage-maison header for the two
 * checkout step pages (address / confirm).
 *
 * Trust-family counterpart to the inline editorial header that the
 * FB checkout pages render directly in their server components.
 * Extracted into a reusable component (rather than inlined per page)
 * because the Trust voice carries more chrome than FB's two-line
 * header — it's worth keeping the markup in one place so the two
 * checkout steps stay perfectly aligned.
 *
 * Renders:
 *   - "MAISON · CHECKOUT · STEP {n} OF 2" caps eyebrow in gold accent
 *   - Playfair serif title — "Order Details" (step 1) or
 *     "Confirm Your Order" (step 2)
 *   - Hairline gold rule under the title
 *   - A sober (italic-free) Trust descriptor line below
 *
 * Server-renderable — no hooks, no client state, no event handlers.
 */

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustCheckoutHeaderProps {
  /** 1 = address (shipping), 2 = confirm (review + place order). */
  step: 1 | 2;
}

export function TrustCheckoutHeader({ step }: TrustCheckoutHeaderProps) {
  const title = step === 1 ? 'ที่อยู่จัดส่ง' : 'ยืนยันคำสั่งซื้อ';
  const descriptor =
    step === 1
      ? 'กรุณาระบุที่อยู่จัดส่ง — เราจะจัดส่งให้คุณอย่างพิถีพิถัน'
      : 'ตรวจสอบรายละเอียดและยืนยันคำสั่งซื้อของคุณ';

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <header className="text-center">
          <p
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            เมซอน · ชำระเงิน · ขั้นตอนที่ {step} จาก 2
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
          <p
            className="mx-auto mt-5 max-w-md text-sm"
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
              fontWeight: 500,
            }}
          >
            {descriptor}
          </p>
        </header>
      </div>
    </div>
  );
}
