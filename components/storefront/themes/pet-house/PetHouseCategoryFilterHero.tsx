/**
 * PetHouseCategoryFilterHero — brand band at the top of the category
 * page when a pet-house store is filtered by one of the 4 type
 * pseudo-categories that the homepage Shop-by-Type cards link to.
 *
 * Carries the SAME illustrated SVG icon + Thai name + tag chip from
 * the homepage card straight into the category page hero, so the
 * brand visual continuity isn't lost the moment you click into the
 * filtered catalog. When no pet-* pseudo-slug is active (e.g. user
 * landed via a direct catalog link or via a Shop-by-Pet card),
 * renders nothing — graceful no-op.
 *
 * Renders as a server component since it's pure presentational
 * (icon + copy) with no client-side interactivity.
 */

import { CATEGORY_ICONS, type CategorySlug } from './icons';

const TYPE_HEADERS: Record<
  CategorySlug,
  { name: string; tag: string; bg: string }
> = {
  'pet-equipment': {
    name: 'สัตว์เลี้ยงและอุปกรณ์',
    tag: 'PET GEAR',
    bg: '#FAEBA0',
  },
  'pet-supplies': {
    name: 'ของใช้สัตว์เลี้ยง',
    tag: 'SUPPLIES',
    bg: '#F0F7E5',
  },
  'pet-toys': {
    name: 'ของเล่นสัตว์เลี้ยง',
    tag: 'TOYS',
    bg: '#FCE8DB',
  },
  'pet-home': {
    name: 'พรมและของใช้ในบ้าน',
    tag: 'HOME',
    bg: '#F4E1F0',
  },
};

interface Props {
  /** Currently selected category filters (from `?cat=` URL params). */
  selectedCats: string[];
  /** Total products visible after the filter is applied. Surfaces
   *  the count under the headline so the band doubles as a result
   *  summary — saves the user scrolling past it to see how many
   *  matches they got. */
  filteredCount: number;
}

/**
 * If exactly one of the 4 pet-house pseudo-slugs is active, return
 * its CategorySlug. Otherwise null (no band rendered).
 */
function activeTypeSlug(selectedCats: string[]): CategorySlug | null {
  for (const c of selectedCats) {
    if (c in TYPE_HEADERS) return c as CategorySlug;
  }
  return null;
}

export function PetHouseCategoryFilterHero({
  selectedCats,
  filteredCount,
}: Props) {
  const activeSlug = activeTypeSlug(selectedCats);
  if (!activeSlug) return null;

  const Icon = CATEGORY_ICONS[activeSlug];
  const meta = TYPE_HEADERS[activeSlug];

  return (
    <section
      className="relative overflow-hidden border-b"
      style={{
        background: '#FAF7F4',
        borderColor: '#EDE5DF',
      }}
    >
      <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-5 px-6 py-9 sm:flex-row sm:items-center sm:gap-7 sm:px-8">
        {/* Icon tile — same pastel bg used on the homepage card so
            the visual chord with Shop-by-Type carries through. */}
        <div
          className="relative flex shrink-0 items-center justify-center"
          style={{
            width: 124,
            height: 124,
            background: meta.bg,
            borderRadius: 14,
            border: '1px solid #EDE5DF',
            padding: 14,
          }}
        >
          <span
            className="absolute font-semibold tracking-wide"
            style={{
              top: 8,
              left: 8,
              background: 'rgba(255,255,255,0.85)',
              color: '#5C3D1F',
              fontSize: 9,
              padding: '3px 8px',
              borderRadius: 999,
            }}
          >
            {meta.tag}
          </span>
          <Icon className="h-full w-full" />
        </div>

        <div className="text-center sm:text-left">
          <p
            className="font-semibold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '3px',
              color: '#5BA033',
              marginBottom: 6,
            }}
          >
            Shop by Type
          </p>
          <h1
            className="m-0"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 26,
              color: '#3B2F1F',
              letterSpacing: '-0.3px',
              fontWeight: 400,
            }}
          >
            {meta.name}
          </h1>
          <p
            className="mt-2"
            style={{
              fontSize: 13,
              color: '#8A7B6A',
            }}
          >
            พบ <strong style={{ color: '#3B2F1F' }}>{filteredCount.toLocaleString()}</strong>{' '}
            สินค้าใน{meta.name}
          </p>
        </div>
      </div>
    </section>
  );
}
