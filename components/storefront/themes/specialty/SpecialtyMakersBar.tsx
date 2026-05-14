/**
 * SpecialtyMakersBar — 3-pillar maker-credentials trust strip that sits
 * directly under the SpecialtyHero on the artisan / vintage homepage.
 *
 * Counterpart to PetHouseTrustBar in structural role (a static row of
 * credentials between the hero and the merchandised grid), but speaks
 * to the artisan voice instead of pet-supplies free-shipping copy.
 *
 * Pillars (intentionally three — odd number reads as "carved into the
 * page", four would read as a tile grid):
 *   1. Made by hand · 5-7 days production
 *   2. Small batch · limited each season
 *   3. Each piece signed · maker attribution
 *
 * Each pillar pairs a hand-script Caveat title (curator's pen mark)
 * with a Fraunces serif descriptor (workshop-letter voice). The
 * wrapper carries `data-specialty-kraft="true"` so the kraft-paper
 * texture from globals.css lifts onto the strip — it matches the
 * SpecialtyCategoryPage card treatment and reads as one continuous
 * paper-on-paper document with the hero above it.
 *
 * Static — no props, no data fetch, no client state.
 */

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

interface Pillar {
  title: string;
  descriptor: string;
}

const PILLARS: Pillar[] = [
  {
    title: 'made by hand',
    descriptor: '5-7 days production from the studio bench',
  },
  {
    title: 'small batch',
    descriptor: 'limited each season — never restocked the same way',
  },
  {
    title: 'each piece signed',
    descriptor: 'maker attribution on every finished work',
  },
];

export function SpecialtyMakersBar() {
  return (
    <section
      data-specialty-kraft="true"
      aria-label="Maker credentials"
      className="border-b"
      style={{
        background: 'var(--shop-card)',
        borderColor: 'var(--shop-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {PILLARS.map((pillar, idx) => (
            <li
              key={pillar.title}
              className={
                idx > 0
                  ? 'sm:border-l sm:border-dashed sm:pl-8'
                  : ''
              }
              style={
                idx > 0
                  ? { borderColor: 'var(--shop-accent)' }
                  : undefined
              }
            >
              <p
                className="text-3xl leading-tight"
                style={{
                  fontFamily: SPECIALTY_HAND_FONT,
                  color: 'var(--shop-accent)',
                }}
              >
                {pillar.title}
              </p>
              <p
                className="mt-2 text-base leading-relaxed"
                style={{
                  fontFamily: SPECIALTY_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                  fontWeight: 500,
                }}
              >
                {pillar.descriptor}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
