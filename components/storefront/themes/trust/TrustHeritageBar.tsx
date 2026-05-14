/**
 * TrustHeritageBar — sober 3-pillar trust strip rendered between the
 * homepage hero and the product showcase in the trust family.
 *
 * Visual difference from the pet-house TrustBar:
 *   - Cream/ivory bg (var(--shop-muted)) sandwiched between gold
 *     hairlines — heritage signage strip rather than a card row.
 *   - No icons in mint-circle badges; each pillar is a typographic
 *     unit (caps title + Playfair descriptor + gold underline-rule).
 *   - Pillars are separated by a vertical gold rule on md+ instead of
 *     stacked cards. Visual silence + serif voice.
 *   - Entirely static. Server component (no client hooks needed).
 */
const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

interface Pillar {
  caps: string;
  descriptor: string;
}

const PILLARS: Pillar[] = [
  { caps: 'ของแท้', descriptor: 'รับประกันของแท้ 100%' },
  { caps: 'อาตเลียร์', descriptor: 'งานหัตถกรรมพิถีพิถัน' },
  { caps: 'คลาสสิก', descriptor: 'คอลเลกชันตามฤดูกาล' },
];

export function TrustHeritageBar() {
  return (
    <section
      aria-label="Maison heritage pillars"
      className="border-y"
      style={{
        background: 'var(--shop-muted)',
        borderColor: 'var(--shop-accent)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <ul className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {PILLARS.map((p, i) => (
            <li
              key={p.caps}
              className="px-2 py-7 text-center md:py-2"
              style={{
                borderColor: 'var(--shop-accent)',
                // Tailwind's divide utilities apply via the parent's
                // border-color, but our parent uses a custom class so
                // we explicitly set border-color on each item too in
                // case the cascade is overridden by globals.
              }}
            >
              <p
                className="text-[11px] uppercase"
                style={{
                  color: 'var(--shop-accent)',
                  letterSpacing: '0.32em',
                  fontWeight: 600,
                }}
              >
                {p.caps}
              </p>
              <div
                aria-hidden
                className="mx-auto mt-3 h-px w-10"
                style={{ background: 'var(--shop-accent)' }}
              />
              <p
                className="mt-3 text-base sm:text-lg"
                style={{
                  fontFamily: TRUST_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                  fontWeight: 500,
                  letterSpacing: '-0.005em',
                }}
              >
                {p.descriptor}
              </p>
              {/* Numeric pillar index in tabular caps — heritage
                  ledger feel. Hidden on mobile to avoid clutter. */}
              <p
                className="mt-2 hidden font-mono text-[10px] uppercase md:block"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.22em',
                }}
              >
                {`ลำดับ 0${i + 1}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
