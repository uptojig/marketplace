/**
 * CaseStudioCollections — 5-card asymmetric collection grid.
 *
 * Server component. Fetches 5 real products from the database and
 * displays them. The first product is featured (spanning 2 rows),
 * and the remaining 4 populate the smaller grid.
 * Links direct the user to the actual product pages.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Props {
  storeSlug: string;
}

export async function CaseStudioCollections({ storeSlug }: Props) {
  // Fetch the top 5 newest active products for this store
  const products = await prisma.product.findMany({
    where: { 
      store: { slug: storeSlug },
      active: true 
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  if (!products || products.length === 0) {
    return null; // Return nothing if no products exist
  }

  const featuredProduct = products[0];
  const secondaryProducts = products.slice(1, 5);


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
              คอลเลกชันมาใหม่
            </p>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 800,
                letterSpacing: '-1px',
                color: '#0A0A0F',
              }}
            >
              สินค้าแนะนำ
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
            {featuredProduct && (
              <Link
                href={`/stores/${storeSlug}/product/${featuredProduct.id}`}
                className="cs-coll-card cs-coll-featured relative overflow-hidden flex flex-col justify-end transition hover:scale-[1.01]"
                style={{
                  borderRadius: '14px',
                  padding: '32px',
                  color: '#FFFFFF',
                  backgroundImage: featuredProduct.imageUrl ? `url("${featuredProduct.imageUrl}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.8) 100%)',
                  }}
                />
                <div className="relative">
                  <div
                    className="font-semibold uppercase mb-1.5"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '2px',
                      opacity: 0.9,
                      color: '#FF3366'
                    }}
                  >
                    ★ {featuredProduct.categoryName || 'Featured'}
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                      marginBottom: '12px',
                      lineHeight: 1.2
                    }}
                  >
                    {featuredProduct.title}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 font-bold uppercase"
                    style={{ fontSize: '12px', letterSpacing: '0.5px' }}
                  >
                    Shop Now <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            )}

            {secondaryProducts.map((p: any) => (
              <Link
                key={p.id}
                href={`/stores/${storeSlug}/product/${p.id}`}
                className="cs-coll-card relative overflow-hidden flex flex-col justify-end transition hover:scale-[1.01]"
                style={{
                  borderRadius: '14px',
                  padding: '24px',
                  color: '#FFFFFF',
                  backgroundImage: p.imageUrl ? `url("${p.imageUrl}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)',
                  }}
                />
                <div className="relative">
                  <div
                    className="font-semibold uppercase mb-1.5"
                    style={{ fontSize: '10px', letterSpacing: '2px', opacity: 0.9 }}
                  >
                    {p.categoryName || 'Product'}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                      marginBottom: '8px',
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 font-bold uppercase"
                    style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                  >
                    Shop <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .cs-coll-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .cs-coll-featured { min-height: 300px; }
        .cs-coll-card { min-height: 200px; }
        @media (min-width: 640px) {
          .cs-coll-grid { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
          .cs-coll-featured { grid-column: 1 / 3; grid-row: 1 / 2; min-height: 300px; }
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
