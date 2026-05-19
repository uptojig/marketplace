/**
 * PetHouseProductPage — root server component that composes the bespoke
 * pet-house PDP. Rendered by `app/stores/[slug]/products/[id]/page.tsx`
 * BEFORE the existing HeroComponent ternary chain when
 * `isPetHouseStore(store)` is true.
 *
 * Section order (top → bottom):
 *   1. Breadcrumb (เห็นเฉพาะ sm+, matches the rest of the storefront)
 *   2. Main 2-col grid (gallery left, info right)
 *   3. Detail cards (Description / Specifications / Reviews-stub / FAQ)
 *   4. คุณอาจชอบ — 4-col related grid
 *   5. ดูล่าสุด — reused RecentlyViewedRail
 *
 * Compromises documented inline:
 *   • Featured badge: hidden (no Product.featured field yet — `featured`
 *     prop always passed as `false`).
 *   • Rating row: hidden inside PetHouseProductInfo (no Review model).
 *   • Sold count: hidden inside PetHouseProductInfo (not tracked).
 *   • Assembly steps section ("วิธีประกอบ"): NOT rendered. The mockup's
 *     3-step accordion would require a `Product.assemblySteps Json?`
 *     column we don't have. Operators can later add the column and
 *     surface a section here.
 *   • Reviews section ("รีวิวจากลูกค้า"): renders a small empty-state
 *     card matching the section shell rather than skipping entirely —
 *     so visitors see we plan to ship reviews. Replace the placeholder
 *     once the Review model lands.
 *   • FAQ: generic store-level questions from a constant. Per-product
 *     FAQs would need a `Product.faqs Json?` column; deferred.
 *
 * The whole page is wrapped by `app/stores/[slug]/layout.tsx`'s
 * ShopHeader + ShopFooter chrome — we render ONLY the body. No
 * additional header / nav / footer is rendered here.
 */

import type { Product, ProductVariant, Store } from '@prisma/client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { cleanDescription } from '@/lib/format/cleanDescription';
import {
  RecentlyViewedRail,
  RecentlyViewedTracker,
} from '@/components/storefront/RecentlyViewed';
import { PetHouseProductGallery } from './PetHouseProductGallery';
import { PetHouseProductInfo } from './PetHouseProductInfo';
import type { PetHouseQuickSpecs } from './PetHouseProductInfo';
import { PetHouseProductDetailCard } from './PetHouseProductDetailCard';
import { PetHouseRelatedGrid } from './PetHouseRelatedGrid';
import { PetHouseFaqAccordion } from './PetHouseFaqAccordion';

interface Props {
  product: Product & { store: Store; variants: ProductVariant[] };
  /** Deduped image list (cover + galleryUrls) computed by the page route. */
  images: string[];
}

/**
 * Coerce a Prisma JSON column to a string→string record, dropping any
 * non-string values. Same pattern used in the default PDP page.
 */
function coerceMaterials(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string' && v.trim().length > 0) out[k] = v.trim();
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = String(v);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Format a weight expressed in grams as the natural Thai label. */
function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    // 1 decimal when fractional, otherwise integer (12 กก. not 12.0 กก.).
    const rounded = Number.isInteger(kg) ? kg : Math.round(kg * 10) / 10;
    return `${rounded} กก.`;
  }
  return `${grams} ก.`;
}

/**
 * Pull quick-spec entries from the Prisma fields. Reads:
 *   - materials.size / 'ขนาด' → size
 *   - materials.material / 'วัสดุ' → material
 *   - weightGrams → weight (formatted)
 *   - materials.maxLoad / 'น้ำหนักรับ' / 'รับน้ำหนัก' → maxLoad
 *
 * Returns an object with only the cells we have data for; the info
 * column hides the whole panel when zero cells resolve.
 */
function pickQuickSpecs(
  materials: Record<string, string> | undefined,
  weightGrams: number | null,
): PetHouseQuickSpecs {
  const out: PetHouseQuickSpecs = {};
  if (materials) {
    const size = materials.size ?? materials['ขนาด'];
    if (size) out.size = size;
    const material =
      materials.material ?? materials['วัสดุ'] ?? materials.materials;
    if (material) out.material = material;
    const maxLoad =
      materials.maxLoad ??
      materials['น้ำหนักรับ'] ??
      materials['รับน้ำหนัก'] ??
      materials['maxload'];
    if (maxLoad) out.maxLoad = maxLoad;
  }
  if (weightGrams != null && weightGrams > 0) {
    out.weight = formatWeight(weightGrams);
  }
  return out;
}

export async function PetHouseProductPage({ product, images }: Props) {
  const storeSlug = product.store.slug;
  const title = product.titleTh ?? product.title;

  // Related — 4 newest active products in the same store, excluding the
  // currently viewed one. Matches the spec's spec'd query.
  const related = await prisma.product.findMany({
    where: { storeId: product.storeId, active: true, NOT: { id: product.id } },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  // Coerce Json columns once.
  const materials = product.materials
    ? coerceMaterials(product.materials)
    : undefined;
  const keyAttributes = Array.isArray(product.keyAttributes)
    ? (product.keyAttributes as unknown[]).filter(
        (x): x is string => typeof x === 'string' && x.trim().length > 0,
      )
    : [];
  const quickSpecs = pickQuickSpecs(materials, product.weightGrams);

  // Stock — see the default page for the dropshipping rationale.
  // hasVariants → null (let the picked variant decide). For non-variant
  // products we expose the count when known, else null so the info
  // panel renders the "พร้อมส่ง" generic copy.
  const stockLeft = product.hasVariants
    ? null
    : product.stockTotal > 0
      ? product.stockTotal
      : null;

  const cleanedDescription = cleanDescription(
    product.descriptionTh ?? product.description,
  );
  const hasDescriptionSection =
    cleanedDescription.length > 0 || keyAttributes.length > 0;
  const specEntries = materials ? Object.entries(materials) : [];
  const hasSpecSection = specEntries.length > 0;

  return (
    <div style={{ background: '#FAF7F4' }}>
      {/* Breadcrumb — wrapped in a container matching the rest of the page */}
      <div
        className="px-4 sm:px-9 pt-3 sm:pt-4 pb-4"
        style={{ background: '#FAF7F4' }}
      >
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-[1200px] hidden sm:block"
          style={{ fontSize: '12px', color: '#8A7B6A' }}
        >
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li className="flex items-center gap-1.5">
              <Link
                href={`/stores/${storeSlug}`}
                style={{ color: '#5C3D1F' }}
                className="hover:underline"
              >
                หน้าแรก
              </Link>
              <ChevronRight
                className="h-3 w-3"
                style={{ color: '#B5A899' }}
                aria-hidden
              />
            </li>
            <li className="flex items-center gap-1.5">
              <Link
                href={`/stores/${storeSlug}/category`}
                style={{ color: '#5C3D1F' }}
                className="hover:underline"
              >
                สินค้าทั้งหมด
              </Link>
              {product.categoryName && (
                <ChevronRight
                  className="h-3 w-3"
                  style={{ color: '#B5A899' }}
                  aria-hidden
                />
              )}
            </li>
            {product.categoryName && (
              <li className="flex items-center gap-1.5">
                <Link
                  href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                  style={{ color: '#5C3D1F' }}
                  className="hover:underline"
                >
                  {product.categoryName}
                </Link>
                <ChevronRight
                  className="h-3 w-3"
                  style={{ color: '#B5A899' }}
                  aria-hidden
                />
              </li>
            )}
            <li
              aria-current="page"
              className="font-medium truncate max-w-[20rem]"
              style={{ color: '#5BA033' }}
            >
              {title}
            </li>
          </ol>
        </nav>
        {/* Mobile back link (matches the default PDP) */}
        <Link
          href={`/stores/${storeSlug}`}
          className="sm:hidden inline-flex items-center gap-1"
          style={{ fontSize: '13px', color: '#5C3D1F' }}
        >
          ← กลับ
        </Link>
      </div>

      {/* Main 2-col grid */}
      <div
        className="px-4 sm:px-9 pb-12"
        style={{ background: '#FAF7F4' }}
      >
        <div className="mx-auto max-w-[1200px] grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <PetHouseProductGallery
            images={images}
            alt={title}
            videoUrl={product.videoUrl}
            // featured: hardcoded false until Product.featured ships
            featured={false}
          />
          <PetHouseProductInfo
            product={{
              id: product.id,
              title,
              priceTHB: Number(product.priceTHB),
              originalPriceTHB: product.compareAtPriceTHB
                ? Number(product.compareAtPriceTHB)
                : null,
              imageUrl: product.imageUrl,
              stockLeft,
              variants: product.variants.map((v) => ({
                id: v.id,
                attributes: v.attributes as Record<string, string>,
                colorLabel: v.colorLabel,
                sizeLabel: v.sizeLabel,
                materialLabel: v.materialLabel,
                priceTHB: Number(v.priceTHB),
                imageUrl: v.imageUrl,
                inventory: v.inventory,
              })),
              quickSpecs,
            }}
            store={{ slug: storeSlug, name: product.store.name }}
          />
        </div>
      </div>

      {/* Detail cards — each section skipped if data is empty */}
      <div className="px-4 sm:px-9">
        <div className="mx-auto max-w-[1200px]">
          {hasDescriptionSection && (
            <PetHouseProductDetailCard
              kicker="Product Detail"
              title="รายละเอียดสินค้า"
            >
              {cleanedDescription && (
                <p
                  className="whitespace-pre-line mb-4"
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.8,
                    color: '#5C3D1F',
                  }}
                >
                  {cleanedDescription}
                </p>
              )}
              {keyAttributes.length > 0 && (
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5"
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {keyAttributes.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-2"
                      style={{
                        fontSize: '13px',
                        color: '#3B2F1F',
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          color: '#5BA033',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PetHouseProductDetailCard>
          )}

          {hasSpecSection && (
            <PetHouseProductDetailCard
              kicker="Specifications"
              title="สเปคสินค้า"
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <tbody>
                  {specEntries.map(([k, v], idx) => (
                    <tr
                      key={k}
                      style={{
                        borderBottom:
                          idx < specEntries.length - 1
                            ? '0.5px solid #EDE5DF'
                            : 'none',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 0',
                          width: '40%',
                          color: '#8A7B6A',
                          verticalAlign: 'top',
                        }}
                      >
                        {k}
                      </td>
                      <td
                        style={{
                          padding: '12px 0',
                          color: '#3B2F1F',
                          fontWeight: 500,
                          verticalAlign: 'top',
                        }}
                      >
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PetHouseProductDetailCard>
          )}

          {/*
            TODO(assembly): wire `Product.assemblySteps Json?` when the
            schema lands, then render a 3-card "วิธีประกอบ" section here.
            For now we skip the section entirely because the mockup's
            3-step copy isn't realistic to fake — operators can later
            add a Json array of { num, title, description } per product.
          */}

          {/* Reviews section — placeholder card. We render the shell so
              visitors see we plan reviews; once the Review model lands
              swap in the rating breakdown + cards from the mockup. */}
          <PetHouseProductDetailCard kicker="Reviews" title="รีวิวจากลูกค้า">
            <p
              className="text-center"
              style={{
                fontSize: '13px',
                color: '#8A7B6A',
                padding: '18px 14px',
                background: '#FAF7F4',
                borderRadius: '10px',
                lineHeight: 1.7,
              }}
            >
              ยังไม่มีรีวิวจากลูกค้า — เป็นคนแรกที่รีวิวสินค้านี้หลังการสั่งซื้อ
            </p>
          </PetHouseProductDetailCard>

          {/* FAQ — generic store-level questions (5). Per-product FAQs
              would need a new schema column — deferred. */}
          <PetHouseProductDetailCard kicker="FAQ" title="คำถามที่พบบ่อย">
            <PetHouseFaqAccordion />
          </PetHouseProductDetailCard>

          {/* คุณอาจชอบ */}
          {related.length > 0 && (
            <PetHouseProductDetailCard
              kicker="You May Also Like"
              title="คุณอาจชอบ"
            >
              <PetHouseRelatedGrid
                storeSlug={storeSlug}
                products={related}
              />
            </PetHouseProductDetailCard>
          )}
        </div>
      </div>

      {/* Recently viewed — reuse the existing client component. Wrap in
          a container styled to the pet-house palette. */}
      <div className="px-4 sm:px-9 pb-12">
        <div className="mx-auto max-w-[1200px]">
          <RecentlyViewedTracker
            storeSlug={storeSlug}
            product={{
              id: product.id,
              title,
              priceTHB: Number(product.priceTHB),
              imageUrl: product.imageUrl ?? null,
            }}
          />
          <RecentlyViewedRail
            storeSlug={storeSlug}
            excludeIds={[product.id]}
          />
        </div>
      </div>
    </div>
  );
}
