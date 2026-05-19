/**
 * LifestyleMoodSelector — static 3-card mood-board chooser that links
 * into the catalog. Reads as a friendly mood selector rather than a
 * heavy collection grid: each card carries its own warm tinted backdrop
 * (sage / terracotta / soft mauve), an Outfit display title, a tiny
 * inline SVG mood-scene placeholder, and a sage caps "Shop the mood"
 * link out to the category page.
 *
 * Visual language matches LifestyleCategoryGrid + LifestyleCartPage:
 *   - rounded-3xl pillow cards
 *   - data-lifestyle-frame for soft natural drop shadow
 *   - Outfit / Plus Jakarta Sans display titles
 *   - sage caps "Shop the mood" call-out
 *   - sage SVG squiggle divider above the section header
 *
 * All three cards link to the catalog. We don't dispatch / store the
 * "mood" — it's a soft entry point into the shared category page.
 *
 * Server component — pure markup, no client state.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleMoodSelectorProps {
  storeSlug: string;
}

interface MoodCard {
  key: 'home' | 'self' | 'gift';
  eyebrow: string;
  title: string;
  body: string;
  /** Tinted backdrop fill — soft, never saturated. */
  background: string;
  /** Mood scene SVG — inline so we don't ship extra assets. */
  scene: 'home' | 'self' | 'gift';
}

const MOODS: MoodCard[] = [
  {
    key: 'home',
    eyebrow: 'For your home',
    title: 'Soft, slow living',
    body: 'Pieces that warm a room and quiet the day.',
    // Soft sage tinted card — uses --shop-accent at low opacity layered
    // over white so it stays readable in any palette remap.
    background:
      'linear-gradient(135deg, rgba(132, 204, 22, 0.16) 0%, rgba(132, 204, 22, 0.05) 100%), #ffffff',
    scene: 'home',
  },
  {
    key: 'self',
    eyebrow: 'For yourself',
    title: 'Everyday rituals',
    body: 'Small comforts that fit how you live now.',
    // Soft terracotta tinted card.
    background:
      'linear-gradient(135deg, rgba(234, 88, 12, 0.14) 0%, rgba(234, 88, 12, 0.04) 100%), #ffffff',
    scene: 'self',
  },
  {
    key: 'gift',
    eyebrow: 'For a gift',
    title: 'Easy to love',
    body: 'Hand-picked finds that always land well.',
    // Soft mauve tinted card — sits between sage + terracotta visually
    // without competing with either accent.
    background:
      'linear-gradient(135deg, rgba(212, 132, 169, 0.18) 0%, rgba(212, 132, 169, 0.05) 100%), #ffffff',
    scene: 'gift',
  },
];

export function LifestyleMoodSelector({ storeSlug }: LifestyleMoodSelectorProps) {
  return (
    <section
      style={{ background: 'var(--shop-bg)' }}
      className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Sage squiggle above the section header — adds rhythm */}
        <div
          data-lifestyle-squiggle="true"
          aria-hidden
          className="mx-auto mb-8 w-2/3 max-w-md"
        />

        <div className="mb-10 text-center sm:mb-14">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            Pick a mood · Browse by feeling
          </p>
          <h2
            className="mx-auto mt-3 max-w-2xl text-3xl sm:text-4xl md:text-5xl"
            style={{
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}
          >
            Shop the way you live
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {MOODS.map((mood) => (
            <MoodCardLink
              key={mood.key}
              storeSlug={storeSlug}
              mood={mood}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MoodCardLink({
  storeSlug,
  mood,
}: {
  storeSlug: string;
  mood: MoodCard;
}) {
  return (
    <Link
      href={`/stores/${storeSlug}/category`}
      className="group block"
    >
      <article
        data-lifestyle-frame="true"
        className="relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition duration-300 sm:p-8"
        style={{ background: mood.background }}
      >
        {/* Mood scene placeholder — square inline SVG inside a soft
            rounded-2xl panel so each card feels like a catalog still
            life rather than a flat tile. */}
        <div
          className="mb-6 overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            aspectRatio: '4 / 3',
          }}
        >
          <MoodScene scene={mood.scene} />
        </div>

        <p
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: 'var(--shop-accent)' }}
        >
          {mood.eyebrow}
        </p>
        <h3
          className="mt-2 text-2xl sm:text-3xl"
          style={{
            fontFamily: LIFESTYLE_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
          }}
        >
          {mood.title}
        </h3>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          {mood.body}
        </p>

        {/* Sage caps "Shop the mood" call-out — sits at the bottom so
            every card feels balanced even with varying body lengths. */}
        <span
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition group-hover:gap-2.5"
          style={{ color: 'var(--shop-accent)' }}
        >
          Shop the mood
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </article>
    </Link>
  );
}

/**
 * Inline mood-scene SVGs. One per mood — each is a quiet still-life
 * sketch that reinforces the mood word without leaning on stock photos.
 * Sage strokes pair with the warm catalog palette.
 */
function MoodScene({ scene }: { scene: MoodCard['scene'] }) {
  if (scene === 'home') {
    return (
      <svg
        viewBox="0 0 240 180"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ display: 'block' }}
      >
        {/* horizon line */}
        <line
          x1="0"
          y1="135"
          x2="240"
          y2="135"
          stroke="var(--shop-border)"
          strokeWidth="1.5"
        />
        {/* candle / vase trio */}
        <rect x="40" y="80" width="22" height="55" fill="#ffffff" stroke="var(--shop-ink)" strokeWidth="1.2" />
        <ellipse cx="51" cy="80" rx="11" ry="3" fill="#ffffff" stroke="var(--shop-ink)" strokeWidth="1.2" />
        <line x1="51" y1="80" x2="51" y2="65" stroke="var(--shop-ink)" strokeWidth="1.2" />
        <ellipse cx="51" cy="63" rx="3" ry="4" fill="#fbbf24" />
        {/* round vase */}
        <ellipse cx="120" cy="115" rx="28" ry="22" fill="#ffffff" stroke="var(--shop-ink)" strokeWidth="1.2" />
        <ellipse cx="120" cy="93" rx="9" ry="3" fill="#ffffff" stroke="var(--shop-ink)" strokeWidth="1.2" />
        {/* eucalyptus stems */}
        <g stroke="var(--shop-accent)" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M120 93 Q115 60 100 40" />
          <path d="M120 93 Q125 65 140 50" />
          <ellipse cx="103" cy="54" rx="3.5" ry="2" transform="rotate(-30 103 54)" fill="var(--shop-accent)" opacity="0.55" />
          <ellipse cx="111" cy="68" rx="3.5" ry="2" transform="rotate(-25 111 68)" fill="var(--shop-accent)" opacity="0.55" />
          <ellipse cx="135" cy="65" rx="3.5" ry="2" transform="rotate(25 135 65)" fill="var(--shop-accent)" opacity="0.55" />
          <ellipse cx="128" cy="78" rx="3.5" ry="2" transform="rotate(20 128 78)" fill="var(--shop-accent)" opacity="0.55" />
        </g>
        {/* book stack right */}
        <rect x="170" y="115" width="50" height="8" fill="#d4a55c" />
        <rect x="174" y="107" width="42" height="8" fill="#fbbf24" opacity="0.7" />
        <rect x="172" y="99" width="46" height="8" fill="#ffffff" stroke="var(--shop-ink)" strokeWidth="1.2" />
      </svg>
    );
  }
  if (scene === 'self') {
    return (
      <svg
        viewBox="0 0 240 180"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ display: 'block' }}
      >
        {/* table line */}
        <line
          x1="0"
          y1="140"
          x2="240"
          y2="140"
          stroke="var(--shop-border)"
          strokeWidth="1.5"
        />
        {/* mug with steam */}
        <path
          d="M70 100 L70 130 Q70 140 80 140 L120 140 Q130 140 130 130 L130 100 Z"
          fill="#ffffff"
          stroke="var(--shop-ink)"
          strokeWidth="1.4"
        />
        <path
          d="M130 108 Q145 110 145 120 Q145 130 130 130"
          fill="none"
          stroke="var(--shop-ink)"
          strokeWidth="1.4"
        />
        <ellipse cx="100" cy="100" rx="30" ry="6" fill="var(--shop-primary)" opacity="0.7" />
        {/* steam */}
        <g stroke="var(--shop-accent)" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.6">
          <path d="M85 90 Q90 78 85 65 Q80 55 88 45" />
          <path d="M100 92 Q105 80 100 68 Q95 58 103 48" />
          <path d="M115 90 Q120 78 115 66 Q110 56 118 46" />
        </g>
        {/* folded sweater right */}
        <rect x="160" y="115" width="55" height="25" rx="3" fill="#fef3c7" stroke="var(--shop-ink)" strokeWidth="1.2" />
        <rect x="160" y="105" width="55" height="12" rx="3" fill="#fbbf24" opacity="0.5" stroke="var(--shop-ink)" strokeWidth="1.2" />
        <line x1="187" y1="105" x2="187" y2="140" stroke="var(--shop-ink)" strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }
  // gift
  return (
    <svg
      viewBox="0 0 240 180"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      {/* table line */}
      <line
        x1="0"
        y1="140"
        x2="240"
        y2="140"
        stroke="var(--shop-border)"
        strokeWidth="1.5"
      />
      {/* large wrapped gift */}
      <rect x="70" y="80" width="100" height="60" fill="#ffffff" stroke="var(--shop-ink)" strokeWidth="1.4" />
      <rect x="115" y="80" width="10" height="60" fill="var(--shop-accent)" opacity="0.85" />
      <rect x="70" y="105" width="100" height="10" fill="var(--shop-accent)" opacity="0.85" />
      {/* bow */}
      <ellipse cx="105" cy="78" rx="14" ry="7" fill="var(--shop-primary)" opacity="0.85" />
      <ellipse cx="135" cy="78" rx="14" ry="7" fill="var(--shop-primary)" opacity="0.85" />
      <circle cx="120" cy="78" r="5" fill="var(--shop-primary)" />
      {/* small tag */}
      <path
        d="M180 95 L210 95 L215 102 L210 109 L180 109 Z"
        fill="#fef3c7"
        stroke="var(--shop-ink)"
        strokeWidth="1.2"
      />
      <circle cx="184" cy="102" r="1.6" fill="var(--shop-ink)" />
      {/* sprig */}
      <g stroke="var(--shop-accent)" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M195 102 Q195 90 205 85" />
        <ellipse cx="200" cy="93" rx="2.5" ry="1.5" transform="rotate(-30 200 93)" fill="var(--shop-accent)" opacity="0.55" />
      </g>
    </svg>
  );
}
