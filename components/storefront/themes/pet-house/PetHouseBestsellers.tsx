/**
 * PetHouseBestsellers — 4-product grid of bestseller / latest products.
 *
 * Server component. Queries Prisma for the 4 newest active products in
 * the store (we don't track per-product sold counts yet, so "newest" is
 * the closest proxy to "what's trending"). Each card uses a cycling
 * pastel background (yellow / mint / peach / blue) — matches the four
 * colors in the mockup. Product image is overlaid via next/image; if no
 * image we just leave the colored area blank.
 *
 * Badge logic:
 *   - first product (newest) → "Hot" pill, filled green
 *   - product with compareAtPriceTHB > priceTHB → "Sale" pill with -X% off
 *   - any other product → "New" pill, neutral
 *
 * Grid degrades gracefully if the store has fewer than 4 products.
 */

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Props {
  storeId: string;
  storeSlug: string;
}

const CARD_BG = ['#FAEBA0', '#F0F7E5', '#FCE8DB', '#E5F0FA'];

function thb(n: number) {
  return `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
}

const MAX_DESC_CHARS = 50;

/**
 * Build the card description bullets. Tries 3 sources in order:
 *   1. `keyAttributes` (PR #63) — Json array of feature bullets,
 *      already in the right "bullet" shape. Take first 3-4, join " · ".
 *   2. `materials` (PR #63) — Json record of key/value spec pairs.
 *      Take the first 3 values, join " · ".
 *   3. `descriptionTh` / `description` — slice the first segment up
 *      to the first separator (· / , .). Word-boundary aware so we
 *      never cut mid-word.
 *
 * Result is capped at MAX_DESC_CHARS chars but trimmed back to a word
 * boundary (no mid-word truncation, no ellipsis).
 */
function buildCardDesc(p: {
  keyAttributes: unknown;
  materials: unknown;
  description: string | null;
  descriptionTh: string | null;
}): string {
  const bullets: string[] = [];

  // 1. keyAttributes — array of strings.
  if (Array.isArray(p.keyAttributes)) {
    for (const v of p.keyAttributes.slice(0, 4)) {
      if (typeof v === 'string' && v.trim()) bullets.push(v.trim());
    }
  }

  // 2. materials — record of string:string.
  if (
    bullets.length === 0 &&
    p.materials !== null &&
    typeof p.materials === 'object' &&
    !Array.isArray(p.materials)
  ) {
    const entries = Object.values(p.materials as Record<string, unknown>).slice(
      0,
      3,
    );
    for (const v of entries) {
      if (typeof v === 'string' && v.trim()) bullets.push(v.trim());
    }
  }

  let joined = bullets.length > 0 ? bullets.join(' · ') : '';

  // 3. Fall back to first segment of descriptionTh / description.
  if (!joined) {
    const raw = (p.descriptionTh ?? p.description ?? '').trim();
    if (raw) {
      // Cut at first sentence-ish separator. Skip leading separators.
      const m = raw.match(/^([^·,./\n]+)/);
      joined = (m ? m[1] : raw).trim();
    }
  }

  if (!joined) return '';
  if (joined.length <= MAX_DESC_CHARS) return joined;

  // Word-boundary truncate: cut at MAX, then back up to last space /
  // bullet separator so we never end mid-word. No ellipsis per spec.
  let cut = joined.slice(0, MAX_DESC_CHARS);
  const lastBreak = Math.max(
    cut.lastIndexOf(' '),
    cut.lastIndexOf(' · '),
    cut.lastIndexOf('·'),
  );
  if (lastBreak > 20) cut = cut.slice(0, lastBreak);
  return cut.trim();
}

export async function PetHouseBestsellers({ storeId, storeSlug }: Props) {
  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: {
      id: true,
      title: true,
      titleTh: true,
      description: true,
      descriptionTh: true,
      keyAttributes: true,
      materials: true,
      priceTHB: true,
      compareAtPriceTHB: true,
      imageUrl: true,
    },
  });

  return (
    <section
      className="px-6 sm:px-8 py-9"
      style={{ background: 'white' }}
    >
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
              ขายดี
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
              สินค้ายอดนิยมประจำสัปดาห์
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

        {products.length === 0 ? (
          <p
            className="text-center py-12"
            style={{ fontSize: '14px', color: '#8A7B6A' }}
          >
            ยังไม่มีสินค้าในร้านนี้
          </p>
        ) : (
          <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => {
              const price = Number(p.priceTHB);
              const compare = p.compareAtPriceTHB
                ? Number(p.compareAtPriceTHB)
                : null;
              const onSale = compare !== null && compare > price;
              const salePct = onSale
                ? Math.round(((compare - price) / compare) * 100)
                : 0;
              const title = p.titleTh ?? p.title;
              const desc = buildCardDesc(p);
              const cardBg = CARD_BG[i % CARD_BG.length];

              // Badge: first product = Hot, sale = Sale, others = New
              let badgeText = '';
              let badgeClass: 'hot' | 'sale' | 'new' = 'new';
              if (onSale) {
                badgeText = `−${salePct}%`;
                badgeClass = 'sale';
              } else if (i === 0) {
                badgeText = 'ฮิต';
                badgeClass = 'hot';
              } else {
                badgeText = 'ใหม่';
                badgeClass = 'new';
              }

              const badgeStyle: React.CSSProperties =
                badgeClass === 'hot'
                  ? {
                      background: '#5BA033',
                      color: 'white',
                      borderColor: '#5BA033',
                    }
                  : badgeClass === 'sale'
                    ? {
                        background: '#E07B3C',
                        color: 'white',
                        borderColor: '#E07B3C',
                      }
                    : {
                        background: 'white',
                        color: '#5C3D1F',
                        border: '0.5px solid #EDE5DF',
                      };

              return (
                <Link
                  key={p.id}
                  href={`/stores/${storeSlug}/products/${p.id}`}
                  className="block overflow-hidden transition hover:shadow"
                  style={{
                    background: 'white',
                    borderRadius: '10px',
                    border: '0.5px solid #EDE5DF',
                  }}
                >
                  {/* Image area */}
                  <div
                    className="relative"
                    style={{
                      aspectRatio: '1 / 1',
                      background: cardBg,
                      padding: '16px',
                    }}
                  >
                    {/* Badge */}
                    <span
                      className="absolute font-semibold"
                      style={{
                        top: 10,
                        left: 10,
                        fontSize: '9px',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        letterSpacing: '0.3px',
                        ...badgeStyle,
                      }}
                    >
                      {badgeText}
                    </span>
                    {/* Heart */}
                    <span
                      aria-hidden
                      className="absolute flex items-center justify-center"
                      style={{
                        top: 10,
                        right: 10,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#8A7B6A',
                      }}
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </span>
                    {/* Product image */}
                    {p.imageUrl && (
                      <div className="relative w-full h-full">
                        <Image
                          src={p.imageUrl}
                          alt={title}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-3.5 pt-3 pb-3.5">
                    <div
                      className="font-medium overflow-hidden mb-1"
                      style={{
                        fontSize: '12px',
                        lineHeight: 1.4,
                        color: '#3B2F1F',
                        height: '34px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {title}
                    </div>
                    {desc && (
                      // line-clamp-1 keeps the row at a single line; the
                      // upstream buildCardDesc has already capped at ~50
                      // chars on a word boundary so we don't get ellipsis
                      // mid-word — but line-clamp will still elide if a
                      // card is narrow on mobile, which is acceptable.
                      <div
                        className="line-clamp-1 overflow-hidden mb-2"
                        style={{
                          fontSize: '10px',
                          color: '#8A7B6A',
                          lineHeight: 1.3,
                        }}
                      >
                        {desc}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1.5">
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#5C3D1F',
                        }}
                      >
                        {thb(price)}
                      </span>
                      {compare !== null && compare > price && (
                        <span
                          style={{
                            fontSize: '11px',
                            textDecoration: 'line-through',
                            color: '#B5A899',
                          }}
                        >
                          {thb(compare)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
