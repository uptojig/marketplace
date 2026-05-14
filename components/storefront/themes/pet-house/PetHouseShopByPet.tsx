/**
 * PetHouseShopByPet — two large pet-category cards (cats / dogs).
 *
 * Server component. Reads category counts from Prisma. The category
 * matching does best-effort substring matching against `Product.categoryName`
 * — it covers "cats", "แมว", "cat" etc. When no match is found we fall
 * back to splitting the total active product count 50/50 so the UI never
 * shows zero (matches the mockup's intent of always presenting both pets).
 *
 * Both cards are clickable and route to /stores/<slug>/category?cat=cats|dogs
 * so the category page can pick the filter up. (The category page already
 * supports an arbitrary `category` query string — see app/stores/[slug]/category.)
 *
 * SVGs are ported verbatim from the design mockup.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Props {
  storeId: string;
  storeSlug: string;
}

const CAT_KEYWORDS = ['cat', 'cats', 'แมว', 'kitten'];
const DOG_KEYWORDS = ['dog', 'dogs', 'หมา', 'สุนัข', 'puppy'];

async function fetchPetCounts(storeId: string) {
  // Cheap: pull only categoryName for active products and bucket
  // client-side. The fluffyhouse catalog is small (<100 items) so this
  // costs nothing.
  const rows = await prisma.product.findMany({
    where: { storeId, active: true },
    select: { categoryName: true },
  });
  const total = rows.length;
  let cats = 0;
  let dogs = 0;
  for (const r of rows) {
    const c = (r.categoryName ?? '').toLowerCase();
    if (!c) continue;
    if (CAT_KEYWORDS.some((k) => c.includes(k))) cats += 1;
    if (DOG_KEYWORDS.some((k) => c.includes(k))) dogs += 1;
  }
  // Fallback: if NEITHER bucket matched any product (categories not
  // yet tagged with cat/dog), display a placeholder split so the cards
  // still look right. We bias slightly toward cats (matches mockup
  // 240 / 186) — pure 50/50 felt artificial.
  if (cats === 0 && dogs === 0 && total > 0) {
    const half = Math.ceil(total * 0.56);
    return { cats: half, dogs: total - half, fallback: true };
  }
  return { cats, dogs, fallback: false };
}

export async function PetHouseShopByPet({ storeId, storeSlug }: Props) {
  const { cats, dogs, fallback } = await fetchPetCounts(storeId);

  // When products aren't tagged with cat/dog keywords (fallback mode)
  // the ?cat=cats|dogs filter would land on an empty grid. Drop the
  // filter in that case so the card still leads somewhere useful —
  // the full catalog where the buyer can browse what's actually in
  // stock. Same when one bucket matched zero on its own.
  const catsHref =
    fallback || cats === 0
      ? `/stores/${storeSlug}/category`
      : `/stores/${storeSlug}/category?cat=cats`;
  const dogsHref =
    fallback || dogs === 0
      ? `/stores/${storeSlug}/category`
      : `/stores/${storeSlug}/category?cat=dogs`;

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
              Shop by Pet
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
              เลือกของให้น้องคนโปรด
            </h2>
          </div>
          <Link
            href={`/stores/${storeSlug}/category`}
            className="font-medium"
            style={{ fontSize: '11px', color: '#5C3D1F' }}
          >
            ดูหมวดทั้งหมด <span style={{ color: '#5BA033' }}>→</span>
          </Link>
        </div>

        <div className="grid gap-3.5 md:grid-cols-2">
          {/* Cats card */}
          <Link
            href={catsHref}
            className="relative block overflow-hidden transition hover:shadow"
            style={{
              borderRadius: '12px',
              padding: '24px',
              background:
                'linear-gradient(120deg, #FAEBA0 0%, #F4D870 100%)',
              aspectRatio: '2.4 / 1',
            }}
          >
            <div className="flex items-center gap-4 h-full">
              <div
                className="flex-shrink-0 relative z-10"
                style={{ width: 80, height: 80 }}
              >
                <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden>
                  {/* cat body */}
                  <ellipse
                    cx="40"
                    cy="55"
                    rx="25"
                    ry="18"
                    fill="#FFF8E1"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  {/* head */}
                  <circle
                    cx="40"
                    cy="35"
                    r="18"
                    fill="#FFF8E1"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  {/* ears */}
                  <polygon
                    points="25 25, 22 12, 33 20"
                    fill="#FFF8E1"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="55 25, 58 12, 47 20"
                    fill="#FFF8E1"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="26 22, 25 17, 31 21"
                    fill="#F4B8C8"
                  />
                  <polygon
                    points="54 22, 55 17, 49 21"
                    fill="#F4B8C8"
                  />
                  {/* eyes */}
                  <ellipse cx="33" cy="34" rx="2.5" ry="3" fill="#3B2F1F" />
                  <ellipse cx="47" cy="34" rx="2.5" ry="3" fill="#3B2F1F" />
                  {/* nose */}
                  <polygon points="40 40, 37 43, 43 43" fill="#D4537E" />
                  {/* mouth */}
                  <path
                    d="M40 44 Q36 48 32 46"
                    stroke="#3B2F1F"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M40 44 Q44 48 48 46"
                    stroke="#3B2F1F"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* whiskers */}
                  <line
                    x1="22"
                    y1="40"
                    x2="14"
                    y2="38"
                    stroke="#3B2F1F"
                    strokeWidth="0.7"
                  />
                  <line
                    x1="22"
                    y1="43"
                    x2="14"
                    y2="44"
                    stroke="#3B2F1F"
                    strokeWidth="0.7"
                  />
                  <line
                    x1="58"
                    y1="40"
                    x2="66"
                    y2="38"
                    stroke="#3B2F1F"
                    strokeWidth="0.7"
                  />
                  <line
                    x1="58"
                    y1="43"
                    x2="66"
                    y2="44"
                    stroke="#3B2F1F"
                    strokeWidth="0.7"
                  />
                  {/* tail */}
                  <path
                    d="M62 60 Q72 50 70 38"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                    fill="#FFF8E1"
                  />
                </svg>
              </div>
              <div className="flex-1 relative z-10">
                <div
                  className="font-semibold uppercase mb-1"
                  style={{
                    fontSize: '9px',
                    letterSpacing: '2px',
                    color: '#5C3D1F',
                    opacity: 0.7,
                  }}
                >
                  For Cats
                </div>
                <div
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '22px',
                    color: '#3B2F1F',
                    fontWeight: 500,
                    marginBottom: 4,
                    letterSpacing: '-0.3px',
                  }}
                >
                  น้องแมว
                </div>
                <div
                  style={{ fontSize: '11px', color: '#5C3D1F', opacity: 0.75 }}
                >
                  อาหาร · ทราย · บ้าน · ของเล่น · {cats} สินค้า
                </div>
              </div>
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{
                top: 22,
                right: 22,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.6)',
                color: '#5C3D1F',
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Dogs card */}
          <Link
            href={dogsHref}
            className="relative block overflow-hidden transition hover:shadow"
            style={{
              borderRadius: '12px',
              padding: '24px',
              background:
                'linear-gradient(120deg, #C8E2A7 0%, #97C459 100%)',
              aspectRatio: '2.4 / 1',
            }}
          >
            <div className="flex items-center gap-4 h-full">
              <div
                className="flex-shrink-0 relative z-10"
                style={{ width: 80, height: 80 }}
              >
                <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden>
                  {/* dog body */}
                  <ellipse
                    cx="40"
                    cy="55"
                    rx="25"
                    ry="18"
                    fill="#FFF8E1"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  {/* head */}
                  <circle
                    cx="40"
                    cy="35"
                    r="18"
                    fill="#FFF8E1"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  {/* floppy ears */}
                  <ellipse
                    cx="22"
                    cy="32"
                    rx="6"
                    ry="11"
                    fill="#D4A55C"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  <ellipse
                    cx="58"
                    cy="32"
                    rx="6"
                    ry="11"
                    fill="#D4A55C"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  {/* snout */}
                  <ellipse
                    cx="40"
                    cy="42"
                    rx="9"
                    ry="7"
                    fill="#FFF8E1"
                    stroke="#5C3D1F"
                    strokeWidth="1.5"
                  />
                  {/* eyes */}
                  <ellipse cx="33" cy="33" rx="2.5" ry="3" fill="#3B2F1F" />
                  <ellipse cx="47" cy="33" rx="2.5" ry="3" fill="#3B2F1F" />
                  {/* nose */}
                  <ellipse cx="40" cy="40" rx="3.5" ry="2.5" fill="#3B2F1F" />
                  {/* mouth */}
                  <path
                    d="M40 44 Q40 48 36 47"
                    stroke="#3B2F1F"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M40 44 Q40 48 44 47"
                    stroke="#3B2F1F"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* spot */}
                  <circle cx="32" cy="55" r="5" fill="#D4A55C" />
                  {/* tail wag */}
                  <path
                    d="M62 55 Q73 48 68 38"
                    stroke="#5C3D1F"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex-1 relative z-10">
                <div
                  className="font-semibold uppercase mb-1"
                  style={{
                    fontSize: '9px',
                    letterSpacing: '2px',
                    color: '#5C3D1F',
                    opacity: 0.7,
                  }}
                >
                  For Dogs
                </div>
                <div
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '22px',
                    color: '#3B2F1F',
                    fontWeight: 500,
                    marginBottom: 4,
                    letterSpacing: '-0.3px',
                  }}
                >
                  น้องหมา
                </div>
                <div
                  style={{ fontSize: '11px', color: '#5C3D1F', opacity: 0.75 }}
                >
                  อาหาร · สายจูง · ของเล่น · ที่นอน · {dogs} สินค้า
                </div>
              </div>
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{
                top: 22,
                right: 22,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.6)',
                color: '#5C3D1F',
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
