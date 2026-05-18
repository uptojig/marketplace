/**
 * PetHouseRelatedGrid — "คุณอาจชอบ" 4-column grid of related products.
 *
 * Server component — accepts the already-fetched `Product[]` list from the
 * parent. Style matches the mockup `.related-grid` rule (square image with
 * a pastel pillow color, 2-line name clamp, brown ink price). Pastel
 * backgrounds cycle through 4 colors to match the homepage Bestsellers
 * card so the visual rhythm is consistent.
 */

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@prisma/client';

interface Props {
  storeSlug: string;
  products: Product[];
}

const CARD_BG = ['#FAEBA0', '#F0F7E5', '#FCE8DB', '#E5F0FA'];

function thb(n: number) {
  return `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
}

export function PetHouseRelatedGrid({ storeSlug, products }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {products.map((p, i) => {
        const title = p.titleTh ?? p.title;
        const price = Number(p.priceTHB);
        const cardBg = CARD_BG[i % CARD_BG.length];

        return (
          <Link
            key={p.id}
            href={`/stores/${storeSlug}/products/${p.id}`}
            className="block overflow-hidden transition hover:shadow"
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '0.5px solid #EDE5DF',
            }}
          >
            <div
              className="relative"
              style={{
                aspectRatio: '1 / 1',
                background: cardBg,
                padding: '14px',
              }}
            >
              {p.imageUrl ? (
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
              ) : null}
            </div>
            <div className="px-3.5 pt-2.5 pb-3">
              <div
                className="overflow-hidden mb-1"
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
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#5C3D1F',
                }}
              >
                {thb(price)}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
