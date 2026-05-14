/**
 * SpecialtyCheckoutHeader — bespoke artisan / vintage-paper header
 * for the two checkout step pages (address / confirm).
 *
 * Specialty-family counterpart to TrustCheckoutHeader and the inline
 * editorial header that the FB checkout pages render directly in
 * their server components. Extracted into a reusable component so
 * the two checkout steps stay perfectly aligned in voice + chrome.
 *
 * Renders:
 *   - Kraft-textured outer wrapper (`data-specialty-kraft="true"`)
 *   - Caveat hand-script "letter · step {n} of 2" eyebrow
 *   - Fraunces serif title — "Where to send it" (step 1) or
 *     "ready to send" (step 2)
 *   - Hairline accent rule under the title
 *   - Hand-script descriptor below — workshop-letter shipping voice
 *
 * Server-renderable — no hooks, no client state, no event handlers.
 */

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyCheckoutHeaderProps {
  /** 1 = address (shipping), 2 = confirm (review + place order). */
  step: 1 | 2;
}

export function SpecialtyCheckoutHeader({ step }: SpecialtyCheckoutHeaderProps) {
  const title = step === 1 ? 'จัดส่งไปที่ไหน' : 'พร้อมส่งแล้ว';
  const descriptor =
    step === 1
      ? 'เราจะห่ออย่างใส่ใจและจัดส่งภายใน 5-7 วัน'
      : "เรียบร้อย — เราจะส่งข้อความเมื่อจัดส่งให้";

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div
          data-specialty-kraft="true"
          className="rounded-md border px-6 py-8 shadow-sm sm:px-10 sm:py-10"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <header className="text-center">
            <p
              className="text-xl"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-accent)',
              }}
            >
              จดหมาย · ขั้น {step} จาก 2
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
            <p
              className="mx-auto mt-5 max-w-md text-xl leading-snug"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              {descriptor}
            </p>
          </header>
        </div>
      </div>
    </div>
  );
}
