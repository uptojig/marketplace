/**
 * PetHouseShopByType — 4-card type grid (อาหาร / ของเล่น /
 * ที่นอน-บ้าน / สุขอนามัย). Sits between Shop by Pet (cat / dog) and
 * Bestsellers so visitors who came in to browse "I want toys" — not
 * "find something for a cat" — have a clear entry point too.
 *
 * Server component. Counts come from Prisma via substring-match on
 * Product.categoryName, mirroring how PetHouseShopByPet works. Each
 * card links to /stores/<slug>/category?cat=<pseudo> — see the
 * PET_PSEUDO map in app/stores/[slug]/category/page.tsx for the
 * corresponding regex bucket that actually filters the catalog.
 *
 * When a bucket matches 0 products we render "-" instead of "0
 * สินค้า" so the cards never look broken.
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props {
  storeId: string;
  storeSlug: string;
}

// Substring buckets mirroring the PET_PSEUDO regex extension in the
// category page (keep these in sync). Lowercase substrings — we match
// against categoryName.toLowerCase().
const TYPE_BUCKETS: Array<{
  key: string;
  name: string;
  emoji: string;
  keywords: string[];
  bg: string;
}> = [
  {
    key: 'food',
    name: 'อาหาร',
    emoji: '🥩',
    keywords: ['food', 'อาหาร', 'treats', 'ขนม', 'feed'],
    bg: '#FAEBA0',
  },
  {
    key: 'toys',
    name: 'ของเล่น',
    emoji: '🎾',
    keywords: ['toy', 'toys', 'ของเล่น', 'play'],
    bg: '#F0F7E5',
  },
  {
    key: 'beds',
    name: 'ที่นอน-บ้าน',
    emoji: '🛏️',
    keywords: ['bed', 'beds', 'house', 'houses', 'ที่นอน', 'บ้าน', 'scratcher'],
    bg: '#FCE8DB',
  },
  {
    key: 'hygiene',
    name: 'สุขอนามัย',
    emoji: '🧴',
    keywords: ['litter', 'grooming', 'ทราย', 'สบู่', 'แชมพู', 'clean'],
    bg: '#E5F0FA',
  },
];

async function fetchTypeCounts(storeId: string) {
  const rows = await prisma.product.findMany({
    where: { storeId, active: true },
    select: { categoryName: true },
  });
  const counts: Record<string, number> = {};
  for (const b of TYPE_BUCKETS) counts[b.key] = 0;
  for (const r of rows) {
    const c = (r.categoryName ?? '').toLowerCase();
    if (!c) continue;
    for (const b of TYPE_BUCKETS) {
      if (b.keywords.some((k) => c.includes(k))) {
        counts[b.key] += 1;
      }
    }
  }
  return counts;
}

export async function PetHouseShopByType({ storeId, storeSlug }: Props) {
  const counts = await fetchTypeCounts(storeId);

  return (
    <section className="px-6 sm:px-8 py-9" style={{ background: '#FAF7F4' }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="flex justify-between items-baseline mb-5">
          <div>
            <div
              className="font-semibold uppercase mb-1.5"
              style={{
                fontSize: '10px',
                letterSpacing: '3px',
                color: '#5BA033',
              }}
            >
              Shop by Type
            </div>
            <h2
              className="m-0"
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                color: '#3B2F1F',
                letterSpacing: '-0.3px',
                fontWeight: 400,
              }}
            >
              เลือกตามประเภทสินค้า
            </h2>
          </div>
          <Link
            href={`/stores/${storeSlug}/category`}
            className="font-medium"
            style={{ fontSize: '11px', color: '#5C3D1F' }}
          >
            ดูทั้งหมด <span style={{ color: '#5BA033' }}>→</span>
          </Link>
        </div>

        <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-4">
          {TYPE_BUCKETS.map((b) => {
            const count = counts[b.key] ?? 0;
            return (
              <Link
                key={b.key}
                href={`/stores/${storeSlug}/category?cat=${b.key}`}
                className="relative block overflow-hidden transition hover:shadow"
                style={{
                  background: b.bg,
                  borderRadius: '12px',
                  padding: '20px 16px',
                  textAlign: 'center',
                }}
              >
                <div
                  aria-hidden
                  className="mb-2"
                  style={{
                    fontSize: '48px',
                    lineHeight: 1,
                  }}
                >
                  {b.emoji}
                </div>
                <div
                  className="mb-1"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '17px',
                    fontWeight: 500,
                    color: '#5C3D1F',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {b.name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#5C3D1F',
                    opacity: 0.7,
                  }}
                >
                  {count > 0 ? `${count} สินค้า` : '-'}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
