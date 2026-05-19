/**
 * CaseStudioCategoryGrid — "Shop by Type" 6-card grid.
 *
 * Server component. Each card represents a case-type bucket
 * (เคสใส / MagSafe / กันกระแทก / เคสหนัง / เคสกระเป๋า / ลายดีไซน์)
 * and shows a real product count derived from a substring match on
 * `Product.categoryName`. We pull the categoryName column once and
 * bucket in-memory — the catalog is small enough (<200 items
 * typically) that this is cheaper than 6 separate `count` queries.
 *
 * Each card links to `/stores/<slug>/category?cat=<query>` where
 * `<query>` is the bucket's primary keyword. The category page's
 * strict-equal filter will match exact `Product.categoryName` rows
 * (e.g. operator-tagged "MagSafe" products); buckets whose products
 * use generic names like "Phone Cases" instead won't auto-match yet
 * — operators can re-tag once they decide the canonical taxonomy.
 * Count display still works because we filter client-side from
 * categoryName via regex.
 *
 * If a bucket has zero matches we still render the card (shows
 * "0 ลาย") — never hide a category just because the catalog hasn't
 * been seeded yet.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Props {
  storeId: string;
  storeSlug: string;
}

/**
 * Case-type buckets. `query` is the canonical category-name string
 * we put on the URL (?cat=...). `match` is the regex bundle we use
 * to bucket existing products by substring against `categoryName`.
 * Tints map to the .accent-* tokens from the design source.
 */
const TYPES: {
  key: string;
  emoji: string;
  label: string;
  query: string;
  match: RegExp;
  blob: string;
}[] = [
  {
    key: 'clear',
    emoji: '💎',
    label: 'เคสใส',
    query: 'เคสใส',
    match: /clear|crystal|ใส|transparent/i,
    blob: '#E0F2FE',
  },
  {
    key: 'magsafe',
    emoji: '🧲',
    label: 'MagSafe',
    query: 'MagSafe',
    match: /magsafe|magnetic|แม่เหล็ก/i,
    blob: '#FFE5EC',
  },
  {
    key: 'rugged',
    emoji: '🛡️',
    label: 'กันกระแทก',
    query: 'กันกระแทก',
    match: /rugged|tough|shock|กันกระแทก|defender|armor/i,
    blob: '#FEF3C7',
  },
  {
    key: 'leather',
    emoji: '📒',
    label: 'เคสหนัง',
    query: 'เคสหนัง',
    match: /leather|หนัง/i,
    blob: '#FFEDD5',
  },
  {
    key: 'wallet',
    emoji: '💳',
    label: 'เคสกระเป๋า',
    query: 'เคสกระเป๋า',
    match: /wallet|card|กระเป๋า|folio/i,
    blob: '#DCFCE7',
  },
  {
    key: 'designer',
    emoji: '🎨',
    label: 'ลายดีไซน์',
    query: 'ลายดีไซน์',
    match: /design|pattern|ลาย|art|graphic/i,
    blob: '#F3E8FF',
  },
];

async function bucketCounts(storeId: string): Promise<Record<string, number>> {
  const rows = await prisma.product.findMany({
    where: { storeId, active: true },
    select: { categoryName: true },
  });
  const out: Record<string, number> = {};
  for (const t of TYPES) out[t.key] = 0;
  for (const r of rows) {
    const name = r.categoryName ?? '';
    if (!name) continue;
    for (const t of TYPES) {
      if (t.match.test(name)) out[t.key] += 1;
    }
  }
  return out;
}

export async function CaseStudioCategoryGrid({ storeId, storeSlug }: Props) {
  const counts = await bucketCounts(storeId);

  return (
    <section className="px-4 sm:px-6 py-20" style={{ background: '#FFFFFF' }}>
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
              Shop by Type
            </p>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 800,
                letterSpacing: '-1px',
                color: '#0A0A0F',
              }}
            >
              เลือกตามประเภท
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

        {/* 6-col grid (degrades to 2/3 col on smaller screens) */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {TYPES.map((t) => (
            <Link
              key={t.key}
              href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(t.query)}`}
              className="relative overflow-hidden text-center transition hover:-translate-y-1"
              style={{
                background: '#F5F5F7',
                padding: '28px 16px',
                borderRadius: '12px',
              }}
            >
              {/* Pastel BG blob in top-right */}
              <span
                aria-hidden
                className="absolute"
                style={{
                  right: -30,
                  top: -30,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: t.blob,
                  opacity: 0.5,
                }}
              />
              <div
                className="relative"
                style={{ fontSize: '44px', marginBottom: '14px', lineHeight: 1 }}
              >
                {t.emoji}
              </div>
              <div
                className="relative"
                style={{ fontSize: '13px', fontWeight: 700, color: '#0A0A0F', marginBottom: '4px' }}
              >
                {t.label}
              </div>
              <div
                className="relative"
                style={{ fontSize: '11px', color: '#6B7280' }}
              >
                {counts[t.key]} ลาย
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
