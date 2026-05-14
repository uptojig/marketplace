/**
 * CaseStudioCollections — 5-card asymmetric collection grid.
 *
 * Server component. STATIC placeholder set — no `Collection` model
 * exists yet, so this is a visual scaffold that links each card to
 * `/stores/<slug>/category?cat=<collection-slug>`. Once a real
 * Collection schema lands these should swap to DB-driven cards with
 * cover image + curated product references.
 *
 * Grid layout (matches design source):
 *   - 1.5fr / 1fr / 1fr columns × 2 rows
 *   - Featured "Y2K REVIVAL" card spans both rows in column 1
 *   - 4 smaller cards fill columns 2-3 in a 2×2 sub-grid
 *
 * Visual identity per card is a saturated 135° gradient overlaid
 * with a soft dark gradient (40% → 70% opacity) so the white text
 * stays readable. Each card has a kicker, name, and arrow CTA.
 *
 * Mobile fallback: collapses to a single column of full-width cards.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  storeSlug: string;
}

const FEATURED = {
  slug: 'y2k-revival',
  kicker: '★ Featured Drop',
  name: 'Y2K REVIVAL',
  desc: 'เคสสไตล์ 2000s — กระจกฟอยล์ holographic + lettering bold ที่ปลุก nostalgia ให้กลับมาอีกครั้ง',
  gradient: 'linear-gradient(135deg, #FF3366 0%, #FF8A5C 100%)',
};

const SECONDARY = [
  {
    slug: 'mono-series',
    kicker: 'Minimal',
    name: 'Mono Series',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
  },
  {
    slug: 'urban-drop',
    kicker: 'Streetwear',
    name: 'Urban Drop',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
  },
  {
    slug: 'pop-edition',
    kicker: 'Anime',
    name: 'Pop Edition',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  },
  {
    slug: 'sage-set',
    kicker: 'Earth Tone',
    name: 'Sage Set',
    gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
  },
];

export function CaseStudioCollections({ storeSlug }: Props) {
  return (
    <section className="px-4 sm:px-6 py-20" style={{ background: '#F5F5F7' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p
              className="font-bold uppercase mb-2"
              style={{
                fontSize: '11px',
                letterSpacing: '2.5px',
                color: '#FF3366',
              }}
            >
              Curated Drops
            </p>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 800,
                letterSpacing: '-1px',
                color: '#0A0A0F',
              }}
            >
              Shop the Collections
            </h2>
          </div>
          <Link
            href={`/stores/${storeSlug}/category`}
            className="inline-flex items-center gap-1 font-semibold"
            style={{ fontSize: '13px', color: '#FF3366' }}
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/*
          Desktop: 1.5fr / 1fr / 1fr × 2 rows, with the featured card
          spanning both rows in col 1.
          Mobile: single column stack.
        */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: '1fr',
            gridAutoRows: 'minmax(200px, auto)',
          }}
        >
          <div className="cs-coll-grid">
            <Link
              href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(FEATURED.slug)}`}
              className="cs-coll-card cs-coll-featured relative overflow-hidden flex flex-col justify-end transition hover:scale-[1.01]"
              style={{
                borderRadius: '14px',
                padding: '32px',
                color: '#FFFFFF',
                background: FEATURED.gradient,
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)',
                }}
              />
              <div className="relative">
                <div
                  className="font-semibold uppercase mb-1.5"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '2px',
                    opacity: 0.9,
                  }}
                >
                  {FEATURED.kicker}
                </div>
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    marginBottom: '8px',
                  }}
                >
                  {FEATURED.name}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    opacity: 0.9,
                    marginBottom: '12px',
                    maxWidth: '280px',
                  }}
                >
                  {FEATURED.desc}
                </div>
                <div
                  className="inline-flex items-center gap-1.5 font-bold uppercase"
                  style={{ fontSize: '12px', letterSpacing: '0.5px' }}
                >
                  Shop Now <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>

            {SECONDARY.map((c) => (
              <Link
                key={c.slug}
                href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(c.slug)}`}
                className="cs-coll-card relative overflow-hidden flex flex-col justify-end transition hover:scale-[1.01]"
                style={{
                  borderRadius: '14px',
                  padding: '32px',
                  color: '#FFFFFF',
                  background: c.gradient,
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)',
                  }}
                />
                <div className="relative">
                  <div
                    className="font-semibold uppercase mb-1.5"
                    style={{ fontSize: '10px', letterSpacing: '2px', opacity: 0.9 }}
                  >
                    {c.kicker}
                  </div>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 font-bold uppercase"
                    style={{ fontSize: '12px', letterSpacing: '0.5px' }}
                  >
                    Shop <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/*
        Scoped CSS for the asymmetric grid. Tailwind can't express the
        "featured card spans 2 rows in col-1" shape without a custom
        utility, and inline-style media queries don't work — so we
        ship a tiny scoped block. Mobile collapses to a single-col
        stack; sm flips to 2-col (featured stacked above), lg jumps
        to the full 3-col mockup layout.
      */}
      <style>{`
        .cs-coll-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .cs-coll-featured { min-height: 260px; }
        .cs-coll-card { min-height: 200px; }
        @media (min-width: 640px) {
          .cs-coll-grid { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
          .cs-coll-featured { grid-column: 1 / 3; grid-row: 1 / 2; min-height: 280px; }
        }
        @media (min-width: 1024px) {
          .cs-coll-grid { grid-template-columns: 1.5fr 1fr 1fr; grid-template-rows: 1fr 1fr; height: 540px; }
          .cs-coll-featured { grid-column: 1 / 2; grid-row: 1 / 3; min-height: 0; }
          .cs-coll-card { min-height: 0; }
        }
      `}</style>
    </section>
  );
}
