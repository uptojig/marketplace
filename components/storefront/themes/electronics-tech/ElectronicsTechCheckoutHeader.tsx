/**
 * ElectronicsTechCheckoutHeader — bespoke spec-sheet header for the
 * two checkout step pages (address / confirm).
 *
 * Electronics-tech counterpart to TrustCheckoutHeader. Extracted into
 * a reusable component so the two checkout steps stay perfectly
 * aligned with the rest of the ET family voice.
 *
 * Renders:
 *   - "ORDER LOG · STEP {n}/2" mono caps eyebrow in a sharp-bordered
 *     muted chip (mirrors the cart "CART · NN ITEMS" eyebrow).
 *   - Inter Tight bold display title — "Shipping address" (step 1)
 *     or "Order verification" (step 2).
 *   - Hairline mint accent rule under the title (h-px w-16, mint
 *     --shop-highlight).
 *   - DM Sans descriptor line below in the muted spec-row style.
 *
 * Server-renderable — no hooks, no client state, no event handlers.
 */

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

const TECH_BODY_FONT =
  '"DM Sans", var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

export interface ElectronicsTechCheckoutHeaderProps {
  /** 1 = address (shipping), 2 = confirm (review + place order). */
  step: 1 | 2;
}

export function ElectronicsTechCheckoutHeader({
  step,
}: ElectronicsTechCheckoutHeaderProps) {
  const title = step === 1 ? 'ที่อยู่จัดส่ง' : 'ยืนยันคำสั่งซื้อ';
  const descriptor =
    step === 1
      ? 'กรอกที่อยู่สำหรับจัดส่งสินค้า'
      : 'ตรวจสอบและยืนยันรายละเอียดคำสั่งซื้อ';

  return (
    <div style={{ background: 'var(--shop-bg)' }}>
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
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
            บันทึกคำสั่งซื้อ · ขั้นตอน {step}/2
          </p>
          <h1
            className="mt-4 text-3xl sm:text-4xl"
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
          <p
            className="mt-4 max-w-md text-sm"
            style={{
              fontFamily: TECH_BODY_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            {descriptor}
          </p>
        </header>
      </div>
    </div>
  );
}
