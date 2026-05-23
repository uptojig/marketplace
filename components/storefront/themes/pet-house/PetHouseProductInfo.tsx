'use client';

/**
 * PetHouseProductInfo — right-column info panel for the pet-house PDP.
 *
 * Composes (top to bottom):
 *   • Fluffy House Collection kicker (green tracking-[3px])
 *   • Georgia serif title (titleTh fallback to title)
 *   • Rating row — HIDDEN until we have a real Review model. We don't
 *     fake the 4.9 / 256 รีวิว numbers from the mockup.
 *   • Price row — green save badge when compareAtPriceTHB > priceTHB
 *   • Stock dot — green pill with stockTotal (or "พร้อมส่ง" fallback
 *     when stockTotal is 0/null, since dropshipping treats 0 as unknown)
 *   • Quick specs 2x2 — Size / Material / Weight / Max-Load pulled
 *     from Product.materials + Product.weightGrams. The whole panel is
 *     hidden if zero entries resolve.
 *   • Variant blocks — Size pills, Color swatches, Material pills.
 *     One block per axis using the split-axis CJ labels (colorLabel /
 *     sizeLabel / materialLabel). Hidden when no variant carries it.
 *   • Qty stepper + "สูงสุด X ชิ้น" hint (only when stock is known)
 *   • CTAs — Outline "เพิ่มในตะกร้า" (white + green) and filled
 *     "ซื้อเลย" (green + white). Uses the shared `useCart` from
 *     @/lib/store/cart so cart state survives across pages.
 *   • Trust mini — 3-col mint card (free shipping / warranty / returns).
 *
 * Compromises documented:
 *   - rating / soldCount: hidden (no Review model yet)
 *   - featured: hidden (no Product.featured field yet)
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';

// ── Type definitions ──────────────────────────────────────────────
export interface PetHouseInfoVariant {
  id: string;
  attributes: Record<string, string>;
  colorLabel?: string | null;
  sizeLabel?: string | null;
  materialLabel?: string | null;
  priceTHB: number;
  imageUrl: string | null;
  inventory: number | null;
}

export interface PetHouseInfoProduct {
  id: string;
  title: string;
  priceTHB: number;
  /** Strikethrough "list" price. Maps from `Product.compareAtPriceTHB`. */
  originalPriceTHB: number | null;
  imageUrl: string | null;
  /** Total stock across the product (or the selected variant). null = untracked. */
  stockLeft: number | null;
  variants: PetHouseInfoVariant[];
  /** Spec values — already coerced from `Product.materials` Json. */
  quickSpecs: PetHouseQuickSpecs;
  /** Rating + soldCount intentionally omitted today — not in schema yet. */
}

export interface PetHouseQuickSpecs {
  size?: string;
  material?: string;
  weight?: string;
  maxLoad?: string;
}

export interface PetHouseInfoStore {
  slug: string;
  name: string;
}

// ── Color swatch palette ──────────────────────────────────────────
// CJ's colorLabel often arrives as a free-form English word like "Black"
// / "Natural Wood" / "ขาว". We map the common terms to hex codes so the
// circular swatch shows the real colour. Unknown labels fall back to a
// neutral grey ring with the label text inside the tooltip.
const COLOR_PALETTE: Record<string, string> = {
  // English
  black: '#3B2F1F',
  white: '#FFFFFF',
  red: '#D4537E',
  pink: '#F4B8C8',
  brown: '#5C3D1F',
  natural: '#D4A55C',
  'natural wood': '#D4A55C',
  beige: '#D4A55C',
  walnut: '#5C3D1F',
  'walnut brown': '#5C3D1F',
  cream: '#FAEBA0',
  yellow: '#FAEBA0',
  green: '#5BA033',
  blue: '#5C7AAA',
  navy: '#1F2F4B',
  grey: '#8A7B6A',
  gray: '#8A7B6A',
  // Thai
  ดำ: '#3B2F1F',
  ขาว: '#FFFFFF',
  แดง: '#D4537E',
  ชมพู: '#F4B8C8',
  น้ำตาล: '#5C3D1F',
  เหลือง: '#FAEBA0',
  เขียว: '#5BA033',
  ฟ้า: '#5C7AAA',
  น้ำเงิน: '#1F2F4B',
  เทา: '#8A7B6A',
};

function swatchHexForLabel(label: string): string {
  const normalized = label.trim().toLowerCase();
  return COLOR_PALETTE[normalized] ?? '#D4A55C';
}

function uniqueValues(
  variants: PetHouseInfoVariant[],
  axis: 'colorLabel' | 'sizeLabel' | 'materialLabel',
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    const value = v[axis];
    if (value && !seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

function thb(n: number) {
  return `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

// ──────────────────────────────────────────────────────────────────
export function PetHouseProductInfo({
  product,
  store,
}: {
  product: PetHouseInfoProduct;
  store: PetHouseInfoStore;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? null;

  const displayPrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const originalPrice = product.originalPriceTHB;
  const discount =
    originalPrice && originalPrice > displayPrice
      ? Math.round((1 - displayPrice / originalPrice) * 100)
      : null;

  const effectiveStock = selectedVariant?.inventory ?? product.stockLeft;
  const outOfStock = effectiveStock != null && effectiveStock <= 0;
  const requiresVariant = product.variants.length > 0;
  const canAdd = !outOfStock && (!requiresVariant || !!selectedVariant);

  // Split-axis pickers — render each axis only when every variant
  // carries that label. A partial set would leave some variants
  // un-pickable so we treat partial coverage as "no axis".
  const sizeValues = useMemo(() => uniqueValues(product.variants, 'sizeLabel'), [product.variants]);
  const colorValues = useMemo(() => uniqueValues(product.variants, 'colorLabel'), [product.variants]);
  const materialValues = useMemo(() => uniqueValues(product.variants, 'materialLabel'), [product.variants]);

  const allHaveSize = product.variants.length > 0 && product.variants.every((v) => !!v.sizeLabel);
  const allHaveColor = product.variants.length > 0 && product.variants.every((v) => !!v.colorLabel);
  const allHaveMaterial = product.variants.length > 0 && product.variants.every((v) => !!v.materialLabel);

  const selectedSize = selectedVariant?.sizeLabel ?? null;
  const selectedColor = selectedVariant?.colorLabel ?? null;
  const selectedMaterial = selectedVariant?.materialLabel ?? null;

  // Snap to the first variant matching the picked axis value. Mirrors
  // the default ProductDetailHero's VariantPicker behaviour.
  const handlePickAxis = (
    axis: 'sizeLabel' | 'colorLabel' | 'materialLabel',
    value: string,
  ) => {
    const match = product.variants.find((v) => v[axis] === value);
    if (match) setVariantId(match.id);
  };

  // Quick specs panel — show only the cells we actually have data for.
  // Hide the panel entirely when zero entries.
  const specEntries: { label: string; value: string }[] = [];
  if (product.quickSpecs.size) specEntries.push({ label: 'ขนาด', value: product.quickSpecs.size });
  if (product.quickSpecs.material) specEntries.push({ label: 'วัสดุ', value: product.quickSpecs.material });
  if (product.quickSpecs.weight) specEntries.push({ label: 'น้ำหนัก', value: product.quickSpecs.weight });
  if (product.quickSpecs.maxLoad) specEntries.push({ label: 'รับน้ำหนัก', value: product.quickSpecs.maxLoad });

  const buildCartLine = () => ({
    productId: product.id,
    title: selectedVariant
      ? `${product.title} (${variantLabel(selectedVariant.attributes)})`
      : product.title,
    imageUrl: selectedVariant?.imageUrl ?? product.imageUrl ?? undefined,
    priceTHB: displayPrice,
    storeSlug: store.slug,
    storeName: store.name,
  });

  const handleAdd = () => {
    if (!canAdd) return;
    const line = buildCartLine();
    add(line, qty);
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    add(buildCartLine(), qty);
    router.push(`/stores/${store.slug}/cart`);
  };

  // Stock line copy — green dot + numbers when we know the count,
  // otherwise the generic "พร้อมส่ง" message (dropshipping treats 0
  // as unknown rather than out-of-stock).
  const stockKnown = effectiveStock != null && effectiveStock > 0;

  return (
    <div className="pt-1">
      {/* Kicker */}
      <p
        className="font-semibold uppercase mb-2.5"
        style={{
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#5BA033',
        }}
      >
        Fluffy House Collection
      </p>

      {/* Title */}
      <h1
        className="mb-3.5"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(22px, 2.6vw, 26px)',
          lineHeight: 1.25,
          color: '#3B2F1F',
          fontWeight: 500,
          letterSpacing: '-0.2px',
        }}
      >
        {product.title}
      </h1>

      {/*
        Rating row — intentionally hidden until a real Review model lands.
        Don't fake the 4.9 / 256 รีวิว numbers from the mockup. When we
        wire `product.rating` later, surface the row here.
      */}

      {/* Price row */}
      <div className="flex items-baseline gap-3 mb-2">
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 600,
            color: '#5C3D1F',
            lineHeight: 1,
          }}
        >
          {thb(displayPrice)}
        </span>
        {originalPrice && originalPrice > displayPrice && (
          <>
            <span
              style={{
                fontSize: '16px',
                textDecoration: 'line-through',
                color: '#B5A899',
              }}
            >
              {thb(originalPrice)}
            </span>
            {discount !== null && (
              <span
                className="font-semibold"
                style={{
                  background: '#5BA033',
                  color: 'white',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                ประหยัด {discount}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Stock pill */}
      <div
        className="flex items-center gap-2 mb-5"
        style={{ fontSize: '12px', color: '#5BA033' }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#5BA033',
            display: 'inline-block',
          }}
        />
        {stockKnown
          ? `มีสินค้าพร้อมส่ง (เหลือ ${effectiveStock} ชิ้น)`
          : outOfStock
            ? 'สินค้าหมดชั่วคราว'
            : 'พร้อมส่ง'}
      </div>

      {/* Quick specs 2x2 — hidden when zero entries */}
      {specEntries.length > 0 && (
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5"
          style={{
            padding: '14px 16px',
            background: '#FAF7F4',
            borderRadius: '10px',
            border: '0.5px solid #EDE5DF',
          }}
        >
          {specEntries.map((entry) => (
            <div
              key={entry.label}
              className="flex items-baseline gap-2"
              style={{ fontSize: '12px', color: '#5C3D1F' }}
            >
              <span
                style={{
                  color: '#5BA033',
                  fontSize: '14px',
                  lineHeight: 1,
                  display: 'inline-block',
                  width: 14,
                }}
                aria-hidden
              >
                ●
              </span>
              <span>
                <b style={{ fontWeight: 600 }}>{entry.label}</b> {entry.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Size variant block (pills) */}
      {allHaveSize && sizeValues.length > 0 && (
        <div className="mb-4">
          <p
            className="mb-2.5"
            style={{ fontSize: '12px', color: '#3B2F1F' }}
          >
            ขนาด{' '}
            {selectedSize && (
              <span style={{ color: '#8A7B6A' }}>— {selectedSize}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {sizeValues.map((size) => {
              const isActive = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePickAxis('sizeLabel', size)}
                  className="transition"
                  style={{
                    padding: '8px 14px',
                    background: isActive ? '#F0F7E5' : 'white',
                    border: `1px solid ${isActive ? '#5BA033' : '#EDE5DF'}`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: isActive ? '#5BA033' : '#5C3D1F',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                  }}
                  aria-pressed={isActive}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color variant block (swatches) */}
      {allHaveColor && colorValues.length > 0 && (
        <div className="mb-4">
          <p
            className="mb-2.5"
            style={{ fontSize: '12px', color: '#3B2F1F' }}
          >
            สี{' '}
            {selectedColor && (
              <span style={{ color: '#8A7B6A' }}>— {selectedColor}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {colorValues.map((color) => {
              const isActive = selectedColor === color;
              const hex = swatchHexForLabel(color);
              const isWhite = hex.toUpperCase() === '#FFFFFF';
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePickAxis('colorLabel', color)}
                  aria-pressed={isActive}
                  aria-label={color}
                  title={color}
                  className="transition flex-shrink-0"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: `2px solid ${isActive ? '#5BA033' : 'transparent'}`,
                    padding: 3,
                    background: 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: hex,
                      border: isWhite ? '0.5px solid #EDE5DF' : undefined,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Material variant block (pills) */}
      {allHaveMaterial && materialValues.length > 0 && (
        <div className="mb-4">
          <p
            className="mb-2.5"
            style={{ fontSize: '12px', color: '#3B2F1F' }}
          >
            วัสดุ{' '}
            {selectedMaterial && (
              <span style={{ color: '#8A7B6A' }}>— {selectedMaterial}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {materialValues.map((mat) => {
              const isActive = selectedMaterial === mat;
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => handlePickAxis('materialLabel', mat)}
                  className="transition"
                  style={{
                    padding: '8px 14px',
                    background: isActive ? '#F0F7E5' : 'white',
                    border: `1px solid ${isActive ? '#5BA033' : '#EDE5DF'}`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: isActive ? '#5BA033' : '#5C3D1F',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                  }}
                  aria-pressed={isActive}
                >
                  {mat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Qty stepper */}
      <div className="flex items-center gap-4 mb-5">
        <span style={{ fontSize: '12px', color: '#3B2F1F' }}>จำนวน</span>
        <div
          className="flex items-center"
          style={{
            border: '1px solid #EDE5DF',
            borderRadius: '8px',
            background: 'white',
          }}
        >
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            aria-label="ลดจำนวน"
            className="flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: 36,
              height: 36,
              color: '#5C3D1F',
              fontSize: '16px',
              cursor: 'pointer',
              background: 'transparent',
              border: 0,
            }}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:outline-none"
            style={{
              width: 48,
              height: 36,
              fontSize: '13px',
              fontWeight: 600,
              borderTop: 0,
              borderBottom: 0,
              borderLeft: '0.5px solid #EDE5DF',
              borderRight: '0.5px solid #EDE5DF',
              background: 'transparent',
              color: '#3B2F1F',
            }}
            aria-label="จำนวน"
          />
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            disabled={stockKnown && qty >= (effectiveStock ?? Infinity)}
            aria-label="เพิ่มจำนวน"
            className="flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: 36,
              height: 36,
              color: '#5C3D1F',
              fontSize: '16px',
              cursor: 'pointer',
              background: 'transparent',
              border: 0,
            }}
          >
            +
          </button>
        </div>
        {stockKnown && (
          <span style={{ fontSize: '11px', color: '#8A7B6A' }}>
            สูงสุด {effectiveStock} ชิ้น
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="inline-flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            padding: '13px 14px',
            border: '1.5px solid #5BA033',
            background: 'white',
            color: '#5BA033',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: canAdd ? 'pointer' : 'not-allowed',
          }}
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.2} />
          เพิ่มในตะกร้า
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canAdd}
          className="inline-flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            padding: '13px 14px',
            background: '#5BA033',
            color: 'white',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: canAdd ? 'pointer' : 'not-allowed',
          }}
        >
          <Zap className="h-[18px] w-[18px]" strokeWidth={2.2} />
          ซื้อเลย
        </button>
      </div>

      {/* Trust mini card */}
      <div
        className="grid grid-cols-3 gap-2.5"
        style={{
          padding: '14px 14px',
          background: '#F0F7E5',
          borderRadius: '10px',
        }}
      >
        <TrustMini
          Icon={Truck}
          title="ส่งฟรี ฿1,500+"
          sub="ทั่วประเทศ"
        />
        <TrustMini
          Icon={ShieldCheck}
          title="รับประกัน 1 ปี"
          sub="โครงสร้าง"
        />
        <TrustMini
          Icon={RefreshCcw}
          title="คืนได้ 7 วัน"
          sub="ฟรีค่าส่ง"
        />
      </div>
    </div>
  );
}

function TrustMini({
  Icon,
  title,
  sub,
}: {
  Icon: typeof Truck;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2.5" style={{ lineHeight: 1.3 }}>
      <Icon
        className="h-[18px] w-[18px] flex-shrink-0"
        style={{ color: '#5BA033', marginTop: 1 }}
        strokeWidth={2}
      />
      <div>
        <div
          className="font-semibold"
          style={{ fontSize: '11px', color: '#3B2F1F', marginBottom: 2 }}
        >
          {title}
        </div>
        <div style={{ fontSize: '10px', color: '#8A7B6A' }}>{sub}</div>
      </div>
    </div>
  );
}
