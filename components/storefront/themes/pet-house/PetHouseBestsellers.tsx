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
              Bestsellers
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
              const desc = p.descriptionTh ?? p.description ?? '';
              const cardBg = CARD_BG[i % CARD_BG.length];

              // Badge: first product = Hot, sale = Sale, others = New
              let badgeText = '';
              let badgeClass: 'hot' | 'sale' | 'new' = 'new';
              if (onSale) {
                badgeText = `−${salePct}%`;
                badgeClass = 'sale';
              } else if (i === 0) {
                badgeText = 'Hot';
                badgeClass = 'hot';
              } else {
                badgeText = 'New';
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
                      <div
                        className="overflow-hidden mb-2"
                        style={{
                          fontSize: '10px',
                          color: '#8A7B6A',
                          lineHeight: 1.3,
                          height: '13px',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
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
