/**
 * PetHouseShopByType — 4-card type grid using the Fluffy House
 * brand-illustrated SVG icons (`./icons/`) instead of emojis.
 *
 * Categories (slug · Thai name · icon):
 *   pet-equipment · สัตว์เลี้ยงและอุปกรณ์ · PetGearIcon (collar + MAX tag)
 *   pet-supplies  · ของใช้สัตว์เลี้ยง   · BowlsIcon   (2 bowls)
 *   pet-toys      · ของเล่นสัตว์เลี้ยง  · ToysIcon    (ball + rope + bone)
 *   pet-home      · พรมและของใช้ในบ้าน  · BedRugIcon  (cat bed + rug)
 *
 * Server component. Counts come from Prisma via substring-match on
 * Product.categoryName + Product.category.name fallback, mirroring how
 * PetHouseShopByPet works. The keyword buckets here must stay in sync
 * with PET_PSEUDO in app/stores/[slug]/category/page.tsx (same slug
 * keys, same regex semantics) so clicking a card actually filters the
 * catalog page.
 *
 * When a bucket matches 0 products we render "-" instead of "0 สินค้า"
 * so the cards never look broken.
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  PetGearIcon,
  BowlsIcon,
  ToysIcon,
  BedRugIcon,
} from './icons';

interface Props {
  storeId: string;
  storeSlug: string;
}

const TYPE_BUCKETS: Array<{
  key: 'pet-equipment' | 'pet-supplies' | 'pet-toys' | 'pet-home';
  name: string;
  tag: string;
  Icon: React.ComponentType<{ className?: string; size?: number | string }>;
  keywords: string[];
  bg: string;
}> = [
  {
    key: 'pet-equipment',
    name: 'สัตว์เลี้ยงและอุปกรณ์',
    tag: 'PET GEAR',
    Icon: PetGearIcon,
    keywords: [
      'collar', 'leash', 'harness', 'ปลอกคอ', 'สายจูง',
      'accessor', 'อุปกรณ์', 'gear', 'tag',
    ],
    bg: '#FAEBA0',
  },
  {
    key: 'pet-supplies',
    name: 'ของใช้สัตว์เลี้ยง',
    tag: 'SUPPLIES',
    Icon: BowlsIcon,
    keywords: [
      'bowl', 'bowls', 'ชาม', 'feeder', 'feeding',
      'water', 'น้ำ', 'food', 'อาหาร', 'treats', 'ขนม',
    ],
    bg: '#F0F7E5',
  },
  {
    key: 'pet-toys',
    name: 'ของเล่นสัตว์เลี้ยง',
    tag: 'TOYS',
    Icon: ToysIcon,
    keywords: ['toy', 'toys', 'ของเล่น', 'play', 'ball', 'rope', 'bone'],
    bg: '#FCE8DB',
  },
  {
    key: 'pet-home',
    name: 'พรมและของใช้ในบ้าน',
    tag: 'HOME',
    Icon: BedRugIcon,
    keywords: [
      'bed', 'beds', 'rug', 'mat', 'house', 'scratcher',
      'ที่นอน', 'บ้าน', 'พรม',
    ],
    bg: '#F4E1F0',
  },
];

async function fetchTypeCounts(storeId: string) {
  const rows = await prisma.product.findMany({
    where: { storeId, active: true },
    select: {
      categoryName: true,
      category: { select: { name: true } },
    },
  });
  const counts: Record<string, number> = {};
  for (const b of TYPE_BUCKETS) counts[b.key] = 0;
  for (const r of rows) {
    const c = (r.categoryName ?? r.category?.name ?? '').toLowerCase();
    if (!c) continue;
    for (const b of TYPE_BUCKETS) {
      if (b.keywords.some((k) => c.includes(k.toLowerCase()))) {
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
            const Icon = b.Icon;
            return (
              <Link
                key={b.key}
                href={`/stores/${storeSlug}/category?cat=${b.key}`}
                className="group relative block overflow-hidden border bg-white transition-all"
                style={{
                  borderRadius: '12px',
                  borderColor: '#EDE5DF',
                }}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    aspectRatio: '1',
                    background: b.bg,
                    padding: '14px',
                  }}
                >
                  <span
                    className="absolute top-2.5 left-2.5 font-semibold tracking-wide"
                    style={{
                      background: 'rgba(255,255,255,0.85)',
                      color: '#5C3D1F',
                      fontSize: '9px',
                      padding: '3px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {b.tag}
                  </span>
                  <Icon className="w-full h-full" />
                </div>
                <div className="px-3 py-3 text-center">
                  <div
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#3B2F1F',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {b.name}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#8A7B6A',
                      marginTop: '2px',
                    }}
                  >
                    {count > 0 ? `${count} สินค้า` : '-'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
