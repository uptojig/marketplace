/**
 * CaseStudioProductGrid — 4-card product grid, reused for both the
 * "New Arrivals" and "Bestsellers" sections.
 *
 * Server component. Queries Prisma for 4 active products in the
 * store. Two variants:
 *   - "new-arrivals" → orderBy createdAt desc, take 4, skip 0.
 *     Badge logic: first card "HOT", products within 14d "NEW",
 *     products with `compareAtPriceTHB` get the "−X%" sale badge.
 *   - "bestsellers"  → orderBy createdAt desc, take 4, skip 4.
 *     Proxy for "best-selling" until we wire real sold counts.
 *     Badges: #1 / #2 / #3 / #4 (mirrors the mockup's ranked row);
 *     sale stays the "−X%" coral badge.
 *
 * Card structure (matches design source):
 *   - Square image area with a pastel gradient BG cycled across
 *     6 colors (bg1..bg6 in the mockup). If the real product
 *     image is present we render it via next/image; otherwise the
 *     pastel BG alone fills the square.
 *   - Top-left badge (variant-specific) + top-right heart.
 *   - Below: compat tag (uppercase 10px) → name (line-clamped) →
 *     price row + (optional) star rating.
 *
 * **No fake numbers**: ratings/review counts are HIDDEN entirely
 * because we don't track them yet. The star row only shows when a
 * future Review model fills the gap. (Spec rule: hide sections /
 * widgets that lack real data.)
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Props {
  storeId: string;
  storeSlug: string;
  variant: 'new-arrivals' | 'bestsellers';
}

const CARD_BGS = [
  // bg1 — pink
  'linear-gradient(135deg, #FFE5EC 0%, #FFD3DF 100%)',
  // bg2 — blue
  'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
  // bg3 — yellow
  'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
  // bg4 — green
  'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
  // bg5 — purple
  'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
  // bg6 — orange
  'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
];

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

function thb(n: number) {
  return `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
}

/**
 * Best-effort compat string: prefer Product.materials.compatibility
 * if the vendor seeded it, else fall back to the first non-null
 * specs row (often holds "Compatible Model" / "รุ่นที่รองรับ"). Returns
 * null when nothing meaningful is on the row — caller hides the tag.
 */
function compatLabel(materials: unknown): string | null {
  if (!materials || typeof materials !== 'object') return null;
  const m = materials as Record<string, unknown>;
  const direct =
    m.compatibility ??
    m['Compatible Model'] ??
    m['Compatible Phone Model'] ??
    m['Compatible with'] ??
    m['รุ่นที่รองรับ'];
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  return null;
}

export async function CaseStudioProductGrid({ storeId, storeSlug, variant }: Props) {
  const isNewArrivals = variant === 'new-arrivals';

  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    skip: isNewArrivals ? 0 : 4,
    select: {
      id: true,
      title: true,
      titleTh: true,
      priceTHB: true,
      compareAtPriceTHB: true,
      imageUrl: true,
      materials: true,
      createdAt: true,
    },
  });

  const kicker = isNewArrivals ? '★ Just Dropped' : '★★★★★ Bestsellers';
  const heading = isNewArrivals ? 'New Arrivals' : 'ขายดีที่สุด';
  // Section padding: top-aligned for New Arrivals (sits under the
  // category grid), normal for Bestsellers (sits after the features
  // bar). New Arrivals has no top padding because the cat grid ends
  // with its own bottom whitespace.
  const sectionStyle: React.CSSProperties = isNewArrivals
    ? { background: '#FFFFFF', paddingTop: 0 }
    : { background: '#FFFFFF' };

  return (
    <section
      className="px-4 sm:px-6 pb-20"
      style={sectionStyle}
    >
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
              {kicker}
            </p>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 800,
                letterSpacing: '-1px',
                color: '#0A0A0F',
              }}
            >
              {heading}
            </h2>
          </div>
          <Link
            href={`/stores/${storeSlug}/category?sort=${isNewArrivals ? 'newest' : 'price-asc'}`}
            className="inline-flex items-center gap-1 font-semibold"
            style={{ fontSize: '13px', color: '#FF3366' }}
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <p
            className="text-center py-16"
            style={{ fontSize: '14px', color: '#6B7280' }}
          >
            ยังไม่มีสินค้าในร้านนี้
          </p>
        ) : (
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => {
              const price = Number(p.priceTHB);
              const compare = p.compareAtPriceTHB ? Number(p.compareAtPriceTHB) : null;
              const onSale = compare !== null && compare > price;
              const salePct = onSale ? Math.round(((compare - price) / compare) * 100) : 0;
              const title = p.titleTh ?? p.title;
              const isRecent = Date.now() - p.createdAt.getTime() <= FOURTEEN_DAYS_MS;
              const compat = compatLabel(p.materials);
              const bg = CARD_BGS[i % CARD_BGS.length];

              // Badge logic
              let badge: { text: string; bg: string; color: string } | null = null;
              if (onSale) {
                badge = { text: `−${salePct}%`, bg: '#DC2626', color: '#FFFFFF' };
              } else if (isNewArrivals) {
                if (i === 0) {
                  badge = { text: 'HOT', bg: '#F59E0B', color: '#FFFFFF' };
                } else if (isRecent) {
                  badge = { text: 'NEW', bg: '#FF3366', color: '#FFFFFF' };
                }
              } else {
                // Bestsellers: #1 / #2 / #3 / #4
                badge = { text: `#${i + 1}`, bg: '#0A0A0F', color: '#FFFFFF' };
              }

              return (
                <Link
                  key={p.id}
                  href={`/stores/${storeSlug}/products/${p.id}`}
                  className="group block overflow-hidden transition hover:-translate-y-1"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #F3F4F6',
                    borderRadius: '12px',
                  }}
                >
                  {/* Image area */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      aspectRatio: '1 / 1',
                      background: bg,
                      padding: '28px',
                    }}
                  >
                    {badge && (
                      <span
                        className="absolute font-bold uppercase"
                        style={{
                          top: 12,
                          left: 12,
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '10px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {badge.text}
                      </span>
                    )}
                    <span
                      aria-hidden
                      className="absolute flex items-center justify-center"
                      style={{
                        top: 12,
                        right: 12,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        color: '#6B7280',
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </span>
                    {p.imageUrl && (
                      <div className="relative w-full h-full">
                        <Image
                          src={p.imageUrl}
                          alt={title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px 18px 18px' }}>
                    {compat && (
                      <div
                        className="font-semibold uppercase mb-1.5"
                        style={{
                          fontSize: '10px',
                          color: '#6B7280',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {compat}
                      </div>
                    )}
                    <div
                      className="font-semibold overflow-hidden mb-2"
                      style={{
                        fontSize: '14px',
                        color: '#0A0A0F',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {title}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: '#0A0A0F',
                        }}
                      >
                        {thb(price)}
                      </span>
                      {onSale && compare !== null && (
                        <span
                          style={{
                            fontSize: '12px',
                            textDecoration: 'line-through',
                            color: '#6B7280',
                          }}
                        >
                          {thb(compare)}
                        </span>
                      )}
                    </div>
                    {/*
                      Rating row intentionally omitted — no Review
                      model is wired yet, and the spec mandates "no
                      fake numbers". Re-introduce once the schema
                      lands. TODO: hook up Product.avgRating /
                      Product.reviewCount when the field exists.
                    */}
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
