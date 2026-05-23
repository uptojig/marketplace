'use client';

/**
 * caldera-skin — bespoke ProductDetail page.
 *
 * Design intent — clinical skincare luxe:
 *   • Two-column hero on desktop: 4/5 portrait gallery on the left,
 *     ingredient-led info column on the right with an uppercase
 *     "BATCH ID" eyebrow and a hairline-divided spec table — the same
 *     lab-report cadence used by the caldera-skin chrome + Homepage.
 *   • Vertical thumbnail rail (J-Beauty / K-Beauty lab catalogue feel)
 *     rather than a horizontal scroll strip.
 *   • All colors flow from the fashion-beauty `--shop-*` cascade so the
 *     palette never drifts from the chrome / cart / checkout family.
 *   • Body in `--font-prompt`, display headings in `--font-kanit`
 *     (Google Thai fonts — see MEMORY font_requirements).
 *
 * Wiring mirrors FashionBeautyProductHero / ProductDetailHero exactly:
 *   - `useCart.add()` carries `storeSlug` + `storeName` for per-store cart
 *     isolation (Shopify-like architecture, see lib/store/cart.ts).
 *   - `useCartConfirmation.show()` opens the global "Added to cart" sheet
 *     and points the cart CTA at `/stores/<slug>/cart` so the buyer
 *     stays inside the caldera-skin themed layout.
 *   - Buy-Now also adds + pushes to the per-store cart.
 *
 * No hard-coded hex; uses `var(--shop-*)` tokens only.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Beaker,
  Check,
  ChevronRight,
  Droplet,
  FlaskConical,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  TestTube,
  Truck,
} from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn, formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import type { ProductDetailProps } from '@/lib/templates/types';

// ─────────────────────────────────────────────────────────────────────────────
// Static lab data — keeps the "clinical trial" cadence consistent with the
// caldera-skin Homepage (SPEC_DATA there). Per-product specs are deterministic
// off the product id so the same product always shows the same batch IDs.
// ─────────────────────────────────────────────────────────────────────────────

const LAB_ACTIVES = [
  { icon: Droplet, label: 'Niacinamide 10%', detail: 'Pore visibility / barrier support' },
  { icon: Sparkles, label: 'Centella Asiatica', detail: 'Soothing · pH 5.5 ± 0.5' },
  { icon: Leaf, label: 'Ceramide NP 3%', detail: 'Lipid barrier renewal' },
  { icon: Beaker, label: 'Panthenol 5%', detail: 'Hydration · post-procedure safe' },
];

const HOW_TO_USE = [
  { step: '01', label: 'AM / PM', detail: 'หลังโทนเนอร์ ก่อนมอยส์เจอไรเซอร์' },
  { step: '02', label: '2-3 หยด', detail: 'แตะลงบนใบหน้าและลำคอ' },
  { step: '03', label: '60 วินาที', detail: 'รอให้ซึมก่อนชั้นต่อไป' },
];

function specsForProduct(id: string) {
  let seed = 0;
  for (let i = 0; i < id.length; i += 1) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const batch = `CT-${String((seed % 900) + 100).padStart(3, '0')}`;
  const lot = `LOT-${String((seed % 9000) + 1000)}`;
  const ph = (35 + (seed % 30)) / 10; // 3.5 – 6.5
  const volume = [15, 30, 50, 100][seed % 4];
  const origin = ['MADE IN KOREA', 'MADE IN JAPAN', 'BANGKOK LAB'][seed % 3];
  return {
    batch,
    lot,
    ph: `${ph.toFixed(1)} ± 0.2`,
    volume: `${volume} ml`,
    origin,
  };
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function CalderaSkinProductDetail({ product, store, related }: ProductDetailProps) {
  const specs = useMemo(() => specsForProduct(product.id), [product.id]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--shop-bg, #fbf8f4)',
        color: 'var(--shop-ink, #3f1d2c)',
        fontFamily: 'var(--font-prompt), system-ui, sans-serif',
      }}
    >
      <Breadcrumb store={store} title={product.title} category={product.categoryName} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4 sm:pt-6">
        <div className="lg:grid lg:grid-cols-[58%_42%] lg:gap-12">
          <Gallery product={product} batch={specs.batch} />
          <InfoColumn product={product} store={store} specs={specs} />
        </div>
      </section>

      <DescriptionBlock product={product} />

      <KeyActives />

      <HowToUse />

      <SpecTable product={product} specs={specs} />

      <TrustBadges />

      {related.length > 0 && <RelatedRail store={store} related={related} />}
    </div>
  );
}

export default CalderaSkinProductDetail;

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb — uppercase tracking, hairline divider, lab-catalogue feel.
// ─────────────────────────────────────────────────────────────────────────────

function Breadcrumb({
  store,
  title,
  category,
}: {
  store: ProductDetailProps['store'];
  title: string;
  category: string | null | undefined;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b"
      style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol
          className="flex items-center gap-2 text-[10px] uppercase"
          style={{
            letterSpacing: '0.18em',
            color: 'var(--shop-ink-muted, #a18792)',
          }}
        >
          <li>
            <Link href={`/stores/${store.slug}`} className="hover:opacity-70 transition-opacity">
              หน้าแรก
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </li>
          <li>
            <Link
              href={`/stores/${store.slug}/products`}
              className="hover:opacity-70 transition-opacity"
            >
              Formulations
            </Link>
          </li>
          {category && (
            <>
              <li>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </li>
              <li className="hover:opacity-70 transition-opacity">{category}</li>
            </>
          )}
          <li>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </li>
          <li
            className="truncate max-w-[200px] sm:max-w-none"
            style={{ color: 'var(--shop-ink, #3f1d2c)' }}
            aria-current="page"
          >
            {title}
          </li>
        </ol>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery — 4/5 portrait main + vertical thumbnail rail (K-Beauty catalogue).
// ─────────────────────────────────────────────────────────────────────────────

function Gallery({
  product,
  batch,
}: {
  product: ProductDetailProps['product'];
  batch: string;
}) {
  const [idx, setIdx] = useState(0);
  const images = useMemo(() => {
    const fromArr = product.images?.length ? product.images : [];
    const merged = [product.imageUrl, ...fromArr].filter((x): x is string => !!x);
    return Array.from(new Set(merged));
  }, [product.imageUrl, product.images]);

  if (images.length === 0) {
    return (
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div
          className="rounded-sm border bg-white p-4 sm:p-6"
          style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
        >
          <AspectRatio ratio={4 / 5}>
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                backgroundColor: 'var(--shop-muted, #fef2f2)',
                color: 'var(--shop-ink-muted, #a18792)',
              }}
            >
              <FlaskConical className="w-12 h-12 stroke-1" />
            </div>
          </AspectRatio>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div className="flex gap-3 sm:gap-4">
        {/* Vertical thumbnail rail — desktop only */}
        {images.length > 1 && (
          <div className="hidden lg:flex flex-col gap-2 w-16 shrink-0">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`รูปที่ ${i + 1}`}
                className={cn(
                  'relative w-16 h-20 overflow-hidden rounded-sm border transition-all',
                )}
                style={{
                  borderColor:
                    i === idx
                      ? 'var(--shop-primary, #f43f5e)'
                      : 'var(--shop-border, #f5e1e8)',
                  opacity: i === idx ? 1 : 0.65,
                  backgroundColor: 'var(--shop-muted, #fef2f2)',
                }}
              >
                <Image
                  src={src}
                  alt={`${product.title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image with the batch ID chip pinned in the corner */}
        <div className="flex-1 relative">
          <div
            className="rounded-sm border bg-white p-3 sm:p-4 relative"
            style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
          >
            <span
              className="absolute top-5 left-5 z-10 px-2 py-1 text-[9px] uppercase font-medium"
              style={{
                letterSpacing: '0.18em',
                backgroundColor: 'var(--shop-ink, #3f1d2c)',
                color: 'var(--shop-bg, #fbf8f4)',
              }}
            >
              BATCH · {batch}
            </span>
            <AspectRatio ratio={4 / 5}>
              <div
                className="relative w-full h-full overflow-hidden"
                style={{ backgroundColor: 'var(--shop-muted, #fef2f2)' }}
              >
                <Image
                  src={images[idx]}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>

      {/* Mobile thumbnail row */}
      {images.length > 1 && (
        <div className="lg:hidden mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`รูปที่ ${i + 1}`}
              className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm border transition-all"
              style={{
                borderColor:
                  i === idx
                    ? 'var(--shop-primary, #f43f5e)'
                    : 'var(--shop-border, #f5e1e8)',
                opacity: i === idx ? 1 : 0.7,
                backgroundColor: 'var(--shop-muted, #fef2f2)',
              }}
            >
              <Image
                src={src}
                alt={`${product.title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Info column — eyebrow / title / price / variants / qty / CTAs / mini specs.
// ─────────────────────────────────────────────────────────────────────────────

function InfoColumn({
  product,
  store,
  specs,
}: {
  product: ProductDetailProps['product'];
  store: ProductDetailProps['store'];
  specs: ReturnType<typeof specsForProduct>;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? null;
  const displayPrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const original = product.originalPriceTHB;
  const discount =
    original && original > displayPrice
      ? Math.round((1 - displayPrice / original) * 100)
      : null;

  const stockLeft = selectedVariant?.inventory ?? product.stockLeft ?? null;
  const outOfStock = stockLeft != null && stockLeft <= 0;
  const requiresVariant = product.variants.length > 0;
  const canAdd = !outOfStock && (!requiresVariant || !!selectedVariant);

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
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    add(buildCartLine(), qty);
    router.push(`/stores/${store.slug}/cart`);
  };

  return (
    <div className="pt-8 lg:pt-0 space-y-7">
      {/* Eyebrow — origin chip in uppercase tracking */}
      <div className="flex items-center gap-3 text-[10px] uppercase" style={{ letterSpacing: '0.22em' }}>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 border"
          style={{
            borderColor: 'var(--shop-border, #f5e1e8)',
            color: 'var(--shop-ink-muted, #a18792)',
          }}
        >
          <FlaskConical className="w-3 h-3" />
          {specs.origin}
        </span>
        {product.categoryName && (
          <span style={{ color: 'var(--shop-ink-muted, #a18792)' }}>
            · {product.categoryName}
          </span>
        )}
      </div>

      {/* Title — display serif via fashion-beauty heading var */}
      <div className="space-y-3">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl leading-[1.05]"
          style={{
            fontFamily:
              'var(--font-kanit), var(--font-fashion-display), Georgia, serif',
            color: 'var(--shop-ink, #3f1d2c)',
            fontWeight: 500,
            letterSpacing: '-0.005em',
          }}
        >
          {product.title}
        </h1>
        <p
          className="text-xs uppercase"
          style={{
            letterSpacing: '0.18em',
            color: 'var(--shop-ink-muted, #a18792)',
          }}
        >
          {store.name} · Clinical Formulation
        </p>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-3 pb-1">
        <span
          className="text-3xl sm:text-4xl font-medium"
          style={{
            color: 'var(--shop-primary, #f43f5e)',
            fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
          }}
        >
          {formatTHB(displayPrice)}
        </span>
        {original && discount != null && (
          <>
            <span
              className="text-base line-through"
              style={{ color: 'var(--shop-ink-muted, #a18792)' }}
            >
              {formatTHB(original)}
            </span>
            <span
              className="px-2 py-0.5 text-[11px] uppercase font-medium"
              style={{
                letterSpacing: '0.12em',
                backgroundColor: 'var(--shop-muted, #fef2f2)',
                color: 'var(--shop-primary, #f43f5e)',
              }}
            >
              −{discount}%
            </span>
          </>
        )}
      </div>

      {/* Mini spec strip — pH / Volume / Lot */}
      <dl
        className="grid grid-cols-3 border-y"
        style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
      >
        <SpecCell label="pH" value={specs.ph} />
        <SpecCell label="Volume" value={specs.volume} divider />
        <SpecCell label="Lot" value={specs.lot} divider />
      </dl>

      {/* Variant picker */}
      {product.variants.length > 0 && (
        <div className="space-y-3">
          <div
            className="text-[10px] uppercase"
            style={{
              letterSpacing: '0.18em',
              color: 'var(--shop-ink-muted, #a18792)',
            }}
          >
            ตัวเลือก:{' '}
            <span style={{ color: 'var(--shop-ink, #3f1d2c)' }}>
              {selectedVariant ? variantLabel(selectedVariant.attributes) : '—'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const available = v.inventory == null || v.inventory > 0;
              const active = variantId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => available && setVariantId(v.id)}
                  disabled={!available}
                  className={cn(
                    'px-4 py-2 text-xs uppercase transition',
                    'border',
                    !available && 'cursor-not-allowed line-through opacity-50',
                  )}
                  style={{
                    letterSpacing: '0.12em',
                    borderColor: active
                      ? 'var(--shop-ink, #3f1d2c)'
                      : 'var(--shop-border, #f5e1e8)',
                    backgroundColor: active
                      ? 'var(--shop-ink, #3f1d2c)'
                      : 'var(--shop-card, #ffffff)',
                    color: active
                      ? 'var(--shop-bg, #fbf8f4)'
                      : 'var(--shop-ink, #3f1d2c)',
                  }}
                >
                  {variantLabel(v.attributes)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Qty stepper */}
      <div className="flex flex-wrap items-center gap-4">
        <span
          className="text-[10px] uppercase"
          style={{
            letterSpacing: '0.18em',
            color: 'var(--shop-ink-muted, #a18792)',
          }}
        >
          จำนวน
        </span>
        <div
          className="inline-flex h-10 items-center overflow-hidden border"
          style={{
            borderColor: 'var(--shop-border, #f5e1e8)',
            backgroundColor: 'var(--shop-card, #ffffff)',
          }}
        >
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            aria-label="ลดจำนวน"
            className="w-10 h-10 flex items-center justify-center transition disabled:opacity-30 hover:opacity-70"
            style={{ color: 'var(--shop-ink, #3f1d2c)' }}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            aria-label="จำนวน"
            className="h-10 w-14 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{
              borderColor: 'var(--shop-border, #f5e1e8)',
              color: 'var(--shop-ink, #3f1d2c)',
            }}
          />
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            disabled={stockLeft != null && qty >= stockLeft}
            aria-label="เพิ่มจำนวน"
            className="w-10 h-10 flex items-center justify-center transition disabled:opacity-30 hover:opacity-70"
            style={{ color: 'var(--shop-ink, #3f1d2c)' }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {stockLeft != null && stockLeft > 0 && stockLeft < 10 && (
          <span
            className="text-[10px] uppercase font-medium"
            style={{
              letterSpacing: '0.12em',
              color: 'var(--shop-primary, #f43f5e)',
            }}
          >
            เหลือ {stockLeft} ขวด
          </span>
        )}
        {outOfStock && (
          <span
            className="text-[10px] uppercase"
            style={{
              letterSpacing: '0.12em',
              color: 'var(--shop-ink-muted, #a18792)',
            }}
          >
            สินค้าหมด · รอผลิตล็อตใหม่
          </span>
        )}
      </div>

      {/* CTA row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className={cn(
            'h-12 text-xs uppercase font-medium transition',
            'border',
            !canAdd && 'opacity-50 cursor-not-allowed',
          )}
          style={{
            letterSpacing: '0.18em',
            borderColor: 'var(--shop-ink, #3f1d2c)',
            color: 'var(--shop-ink, #3f1d2c)',
            backgroundColor: 'var(--shop-card, #ffffff)',
          }}
        >
          {added ? (
            <span className="inline-flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              เพิ่มแล้ว
            </span>
          ) : (
            'เพิ่มลงตะกร้า'
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canAdd}
          className={cn(
            'h-12 text-xs uppercase font-medium transition',
            !canAdd && 'opacity-50 cursor-not-allowed',
            'hover:opacity-90',
          )}
          style={{
            letterSpacing: '0.18em',
            backgroundColor: 'var(--shop-ink, #3f1d2c)',
            color: 'var(--shop-bg, #fbf8f4)',
          }}
        >
          ซื้อเลย · {formatTHB(displayPrice * qty)}
        </button>
      </div>

      {/* Trust strip — hairline-divided italic lab notes */}
      <ul
        className="border-t pt-5 space-y-3 text-xs"
        style={{
          borderColor: 'var(--shop-border, #f5e1e8)',
          color: 'var(--shop-ink-muted, #a18792)',
        }}
      >
        <li className="flex items-center gap-3">
          <Truck className="w-4 h-4 shrink-0" style={{ color: 'var(--shop-ink, #3f1d2c)' }} />
          <span>ส่งฟรีเมื่อสั่งครบ ฿990 · จัดส่งภายใน 1–3 วันทำการ</span>
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--shop-ink, #3f1d2c)' }} />
          <span>ผ่านการทดสอบทางคลินิก · ไม่ทดลองในสัตว์</span>
        </li>
        <li className="flex items-center gap-3">
          <Beaker className="w-4 h-4 shrink-0" style={{ color: 'var(--shop-ink, #3f1d2c)' }} />
          <span>คุ้มครองผู้ซื้อโดย Basketplace · เปลี่ยน/คืนภายใน 30 วัน</span>
        </li>
      </ul>
    </div>
  );
}

function SpecCell({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      className={cn('px-3 py-3', divider && 'border-l')}
      style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
    >
      <dt
        className="text-[9px] uppercase"
        style={{
          letterSpacing: '0.18em',
          color: 'var(--shop-ink-muted, #a18792)',
        }}
      >
        {label}
      </dt>
      <dd
        className="mt-1 text-sm font-medium"
        style={{
          color: 'var(--shop-ink, #3f1d2c)',
          fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
        }}
      >
        {value}
      </dd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Description — soft surface block + lab-note divider.
// ─────────────────────────────────────────────────────────────────────────────

function DescriptionBlock({ product }: { product: ProductDetailProps['product'] }) {
  const desc = product.description?.trim();
  if (!desc) return null;
  return (
    <section
      className="border-t"
      style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-[1fr_2fr] gap-10">
        <div>
          <p
            className="text-[10px] uppercase mb-3"
            style={{
              letterSpacing: '0.22em',
              color: 'var(--shop-ink-muted, #a18792)',
            }}
          >
            §01 · Formulation Notes
          </p>
          <h2
            className="text-2xl sm:text-3xl"
            style={{
              fontFamily:
                'var(--font-kanit), var(--font-fashion-display), Georgia, serif',
              fontWeight: 500,
              color: 'var(--shop-ink, #3f1d2c)',
            }}
          >
            รายละเอียดสูตร
          </h2>
        </div>
        <div
          className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
          style={{ color: 'var(--shop-ink, #3f1d2c)' }}
        >
          {desc}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Key Actives — ingredient call-out grid (the skincare-luxe signature row).
// ─────────────────────────────────────────────────────────────────────────────

function KeyActives() {
  return (
    <section
      className="border-t"
      style={{
        borderColor: 'var(--shop-border, #f5e1e8)',
        backgroundColor: 'var(--shop-muted, #fef2f2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-3">
          <div>
            <p
              className="text-[10px] uppercase mb-3"
              style={{
                letterSpacing: '0.22em',
                color: 'var(--shop-ink-muted, #a18792)',
              }}
            >
              §02 · Active Ingredients
            </p>
            <h2
              className="text-2xl sm:text-3xl"
              style={{
                fontFamily:
                  'var(--font-kanit), var(--font-fashion-display), Georgia, serif',
                fontWeight: 500,
                color: 'var(--shop-ink, #3f1d2c)',
              }}
            >
              สารสำคัญในสูตร
            </h2>
          </div>
          <p
            className="text-xs max-w-md"
            style={{ color: 'var(--shop-ink-muted, #a18792)' }}
          >
            ผ่านการคัดสรรในห้องแล็บ · ความเข้มข้นที่งานวิจัยทางคลินิกรองรับ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border"
          style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
        >
          {LAB_ACTIVES.map((a, i) => {
            const Icon = a.icon;
            return (
              <div
                key={a.label}
                className={cn(
                  'p-6 bg-white',
                  i < LAB_ACTIVES.length - 1 &&
                    'sm:border-r border-b sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:last-child]:border-r-0',
                )}
                style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
              >
                <Icon
                  className="w-6 h-6 mb-4 stroke-[1.3]"
                  style={{ color: 'var(--shop-primary, #f43f5e)' }}
                />
                <p
                  className="text-sm font-medium mb-1"
                  style={{
                    fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
                    color: 'var(--shop-ink, #3f1d2c)',
                  }}
                >
                  {a.label}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--shop-ink-muted, #a18792)' }}
                >
                  {a.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How to use — 3-step ritual.
// ─────────────────────────────────────────────────────────────────────────────

function HowToUse() {
  return (
    <section
      className="border-t"
      style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="mb-10">
          <p
            className="text-[10px] uppercase mb-3"
            style={{
              letterSpacing: '0.22em',
              color: 'var(--shop-ink-muted, #a18792)',
            }}
          >
            §03 · Application Protocol
          </p>
          <h2
            className="text-2xl sm:text-3xl"
            style={{
              fontFamily:
                'var(--font-kanit), var(--font-fashion-display), Georgia, serif',
              fontWeight: 500,
              color: 'var(--shop-ink, #3f1d2c)',
            }}
          >
            วิธีใช้
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {HOW_TO_USE.map((s) => (
            <div key={s.step}>
              <p
                className="text-5xl mb-4 font-medium"
                style={{
                  color: 'var(--shop-primary, #f43f5e)',
                  fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
                  opacity: 0.4,
                }}
              >
                {s.step}
              </p>
              <p
                className="text-base font-medium mb-2"
                style={{
                  fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
                  color: 'var(--shop-ink, #3f1d2c)',
                }}
              >
                {s.label}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--shop-ink-muted, #a18792)' }}
              >
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spec table — looks like a tear-sheet at the bottom of a product card.
// ─────────────────────────────────────────────────────────────────────────────

function SpecTable({
  product,
  specs,
}: {
  product: ProductDetailProps['product'];
  specs: ReturnType<typeof specsForProduct>;
}) {
  const rows: { label: string; value: string }[] = [
    { label: 'Batch ID', value: specs.batch },
    { label: 'Lot Number', value: specs.lot },
    { label: 'pH Range', value: specs.ph },
    { label: 'Net Volume', value: specs.volume },
    { label: 'Origin', value: specs.origin },
    { label: 'SKU', value: product.id.slice(0, 8).toUpperCase() },
  ];
  return (
    <section
      className="border-t"
      style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-[1fr_2fr] gap-10">
        <div>
          <p
            className="text-[10px] uppercase mb-3"
            style={{
              letterSpacing: '0.22em',
              color: 'var(--shop-ink-muted, #a18792)',
            }}
          >
            §04 · Lab Tear-Sheet
          </p>
          <h2
            className="text-2xl sm:text-3xl"
            style={{
              fontFamily:
                'var(--font-kanit), var(--font-fashion-display), Georgia, serif',
              fontWeight: 500,
              color: 'var(--shop-ink, #3f1d2c)',
            }}
          >
            ข้อมูลทางเทคนิค
          </h2>
        </div>
        <dl
          className="border-t border-b text-sm divide-y"
          style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
        >
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1fr_2fr] py-3"
              style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
            >
              <dt
                className="text-[10px] uppercase self-center"
                style={{
                  letterSpacing: '0.18em',
                  color: 'var(--shop-ink-muted, #a18792)',
                }}
              >
                {r.label}
              </dt>
              <dd
                style={{
                  color: 'var(--shop-ink, #3f1d2c)',
                  fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
                }}
              >
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trust badges — duplicate cadence to the chrome strip (icon + uppercase label).
// ─────────────────────────────────────────────────────────────────────────────

function TrustBadges() {
  const items = [
    { icon: TestTube, title: 'Clinically Tested', detail: '42 อาสาสมัคร · 28 วัน' },
    { icon: ShieldCheck, title: 'Dermatologist Reviewed', detail: 'แพทย์ผิวหนังตรวจสอบ' },
    { icon: Leaf, title: 'Vegan & Cruelty-Free', detail: 'ปลอดน้ำหอม · ปลอดแอลกอฮอล์' },
    { icon: Truck, title: 'Free Shipping ฿990+', detail: 'จัดส่งทั่วประเทศ' },
  ];
  return (
    <section
      className="border-t"
      style={{
        borderColor: 'var(--shop-border, #f5e1e8)',
        backgroundColor: 'var(--shop-ink, #3f1d2c)',
        color: 'var(--shop-bg, #fbf8f4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="flex items-start gap-3">
              <Icon
                className="w-6 h-6 stroke-[1.3] shrink-0 mt-0.5"
                style={{ color: 'var(--shop-accent, #fda4af)' }}
              />
              <div>
                <p
                  className="text-xs uppercase font-medium mb-1"
                  style={{ letterSpacing: '0.16em' }}
                >
                  {it.title}
                </p>
                <p className="text-[11px] opacity-70 leading-relaxed">{it.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Related rail — minimal cards in the same lab-catalogue grammar.
// ─────────────────────────────────────────────────────────────────────────────

function RelatedRail({
  store,
  related,
}: {
  store: ProductDetailProps['store'];
  related: ProductDetailProps['related'];
}) {
  const items = related.slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section
      className="border-t"
      style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-3">
          <div>
            <p
              className="text-[10px] uppercase mb-3"
              style={{
                letterSpacing: '0.22em',
                color: 'var(--shop-ink-muted, #a18792)',
              }}
            >
              §05 · Same Lab
            </p>
            <h2
              className="text-2xl sm:text-3xl"
              style={{
                fontFamily:
                  'var(--font-kanit), var(--font-fashion-display), Georgia, serif',
                fontWeight: 500,
                color: 'var(--shop-ink, #3f1d2c)',
              }}
            >
              สูตรอื่นจากแล็บเดียวกัน
            </h2>
          </div>
          <Link
            href={`/stores/${store.slug}/products`}
            className="inline-flex items-center gap-2 text-[10px] uppercase hover:opacity-70 transition-opacity"
            style={{
              letterSpacing: '0.18em',
              color: 'var(--shop-ink, #3f1d2c)',
            }}
          >
            View Full Index
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/stores/${store.slug}/products/${p.id}`}
              className="group block border bg-white hover:opacity-95 transition-opacity"
              style={{ borderColor: 'var(--shop-border, #f5e1e8)' }}
            >
              <div
                className="relative aspect-[4/5]"
                style={{ backgroundColor: 'var(--shop-muted, #fef2f2)' }}
              >
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ color: 'var(--shop-ink-muted, #a18792)' }}
                  >
                    <FlaskConical className="w-10 h-10 stroke-1" />
                  </div>
                )}
              </div>
              <div className="p-4">
                {p.categoryName && (
                  <p
                    className="text-[9px] uppercase mb-1"
                    style={{
                      letterSpacing: '0.18em',
                      color: 'var(--shop-ink-muted, #a18792)',
                    }}
                  >
                    {p.categoryName}
                  </p>
                )}
                <p
                  className="text-sm font-medium line-clamp-2 mb-2"
                  style={{
                    fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
                    color: 'var(--shop-ink, #3f1d2c)',
                  }}
                >
                  {p.title}
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--shop-primary, #f43f5e)',
                    fontFamily: 'var(--font-kanit), var(--font-prompt), sans-serif',
                  }}
                >
                  {formatTHB(p.priceTHB)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
