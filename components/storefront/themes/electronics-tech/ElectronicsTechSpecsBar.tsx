/**
 * ElectronicsTechSpecsBar — three-pillar trust strip rendered directly
 * below the homepage hero. Each pillar is a mono UPPERCASE label paired
 * with a DM Sans descriptor and a short mint underline — visual rhythm
 * that mirrors the spec-sheet eyebrow voice on every other ET page.
 *
 * Static / server component. Copy is intentionally hard-coded so the
 * homepage doesn't depend on any operator-editable trust copy yet.
 */

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

const TECH_BODY_FONT =
  '"DM Sans", var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

interface SpecPillar {
  label: string;
  descriptor: string;
}

const PILLARS: SpecPillar[] = [
  { label: 'QC · มาตรฐาน ISO', descriptor: 'ผ่านการทดสอบก่อนจัดส่ง' },
  { label: 'สต็อก · อัปเดตเรียลไทม์', descriptor: 'จำนวนสินค้าจากคลังแบบสด' },
  { label: 'การรับประกัน · 12 เดือน', descriptor: 'ซ่อมหรือเปลี่ยน ไม่มีคำถาม' },
];

export function ElectronicsTechSpecsBar() {
  return (
    <section
      className="px-4 pb-12 sm:px-6 lg:px-8"
      style={{ background: 'var(--shop-bg)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="grid grid-cols-1 gap-px overflow-hidden rounded-md border bg-[var(--shop-border)] sm:grid-cols-3"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          {PILLARS.map((pillar) => (
            <div
              key={pillar.label}
              className="bg-white p-5 sm:p-6"
            >
              <p
                data-tech-mono="true"
                className="text-[11px] uppercase"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: TECH_MONO_FONT,
                  letterSpacing: '0.16em',
                  fontWeight: 700,
                }}
              >
                {pillar.label}
              </p>
              <div
                aria-hidden
                className="mt-3 h-px w-10"
                style={{ background: 'var(--shop-highlight, #34d399)' }}
              />
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{
                  fontFamily: TECH_BODY_FONT,
                  color: 'var(--shop-ink-muted)',
                }}
              >
                {pillar.descriptor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
