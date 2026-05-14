'use client';

/**
 * ElectronicsTechProductHero — PDP hero variant for the electronics-tech
 * design family. Rendered by app/stores/[slug]/products/[id]/page.tsx
 * when `isElectronicsTechStore(store)` is true (catalog-dense /
 * tech-compare / single-product templates, or landingThemeVariant
 * "electronics-tech" / "E").
 *
 * Design intent (vs the default + FB + Trust heroes):
 *   - Square gallery on desktop (1/1) — consumer-electronics imagery
 *     reads best as a square product shot, not portrait.
 *   - Subtle blue glow underneath the gallery via `data-tech-glow`
 *     (filter: drop-shadow(...)) — Apple-store / Best-Buy product
 *     elevation.
 *   - Mono `SKU · MODEL` eyebrow in JetBrains Mono.
 *   - Sans-bold Inter Tight headline at text-4xl. NO serif anywhere.
 *   - Mono price in electric-blue with tabular numerics.
 *   - Mint "In stock — ships today" chip via `data-tech-stock`.
 *   - Compact spec preview table (Brand / Model / SKU / Stock) with
 *     alternating muted rows via `data-tech-row`.
 *   - Tabbed CTA row: outline "Add to cart" + filled-blue "Buy now",
 *     both rectangular (rounded-md, NOT pill, NOT squared like trust).
 *   - Mono warranty footer row.
 *
 * Wiring matches ProductDetailHero / TrustProductHero / FBProductHero
 * exactly so the page-level Prisma → props mapping stays identical —
 * same useCart hook, same Buy-Now → per-store cart routing.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { WishlistButton } from '@/components/storefront/Wishlist';
import type {
  ProductDetailHeroProduct,
  ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

function storeHref(slug: string): string {
  return `/stores/${slug}`;
}

function cartHref(slug: string): string {
  return `/stores/${slug}/cart`;
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

/**
 * Build a deterministic SKU from the product id so the same product
 * always shows the same display SKU even though Prisma doesn't have
 * a SKU column yet. Format: "ET-XXXXXX" (electronics-tech prefix).
 * NOT cryptographic — purely for display.
 *
 * TODO(schema): once Product.sku lands, prefer it over this hash.
 */
function techSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `ET-${hash}`;
}

/**
 * Build a fake model number from the product id — looks like "MX-1240A".
 * Stable per product. Used in the mono eyebrow next to the SKU.
 *
 * TODO(schema): once Product.modelNumber lands, prefer it over this hash.
 */
function techModel(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
  }
  const num = 1000 + (hash % 9000);
  const letter = String.fromCharCode(65 + (hash % 26));
  return `MX-${num}${letter}`;
}

export function ElectronicsTechProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="lg:p-6">
      <div className="lg:grid lg:grid-cols-[50%_50%] lg:gap-12">
        <Gallery product={product} />
        <InfoColumn product={product} store={store} />
      </div>
    </div>
  );
}

function Gallery({ product }: { product: ProductDetailHeroProduct }) {
  const [idx, setIdx] = useState(0);
  const images = useMemo(() => {
    const fromArr = product.images?.length ? product.images : [];
    const merged = [product.imageUrl, ...fromArr].filter(
      (x): x is string => !!x,
    );
    return Array.from(new Set(merged));
  }, [product.imageUrl, product.images]);

  if (images.length === 0) {
    return (
      <div className="lg:sticky lg:top-4 lg:self-start">
        <AspectRatio
          ratio={1}
          className="rounded-md border bg-[var(--shop-muted)]"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--shop-ink-muted)]">
            ไม่มีรูปภาพ
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      {/* Subtle blue glow underneath the gallery — Apple-store /
          Best-Buy product elevation. The .theme-electronics-tech
          [data-tech-glow] selector wraps this in a drop-shadow
          stack so the glow follows transparent edges. */}
      <div data-tech-glow="true">
        {/* Square aspect wrapper for catalog consistency; object-contain
            so devices / boxes / accessories of every native ratio show
            uncropped. Letterboxing fills with --shop-muted, which on
            tech themes is a near-black so the product still pops. */}
        <div
          className="overflow-hidden rounded-md border bg-white"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <AspectRatio
            ratio={1}
            className="overflow-hidden bg-[var(--shop-muted)]"
          >
            <Image
              src={images[idx]}
              alt={product.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </AspectRatio>
        </div>
      </div>

      {/* Spec callout chips under the gallery — short, mono, dense.
          Replace FB's serif italic / trust's gold hairline with three
          spec-sheet pills that read as factory-card labels. */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] uppercase"
          style={{
            borderColor: 'var(--shop-border)',
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.16em',
            fontFamily: TECH_MONO_FONT,
            fontWeight: 600,
          }}
        >
          <Zap className="h-3 w-3" style={{ color: 'var(--shop-primary)' }} />
          ประกัน 1 ปี
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] uppercase"
          style={{
            borderColor: 'var(--shop-border)',
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.16em',
            fontFamily: TECH_MONO_FONT,
            fontWeight: 600,
          }}
        >
          <Truck className="h-3 w-3" style={{ color: 'var(--shop-primary)' }} />
          จัดส่งจากไทย
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] uppercase"
          style={{
            borderColor: 'var(--shop-border)',
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.16em',
            fontFamily: TECH_MONO_FONT,
            fontWeight: 600,
          }}
        >
          <ShieldCheck
            className="h-3 w-3"
            style={{ color: 'var(--shop-primary)' }}
          />
          ของแท้
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition',
                i === idx
                  ? 'border-[var(--shop-primary)]'
                  : 'border-[var(--shop-border)] opacity-80 hover:opacity-100',
              )}
              aria-label={`รูปที่ ${i + 1}`}
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
    </div>
  );
}

function InfoColumn({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants?.[0]?.id ?? null,
  );
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? null;
  const displayPrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const original = product.originalPriceTHB;
  const discount =
    original && original > displayPrice
      ? Math.round((1 - displayPrice / original) * 100)
      : null;

  const stockLeft = selectedVariant?.inventory ?? product.stockLeft;
  const outOfStock = stockLeft != null && stockLeft <= 0;
  const requiresVariant = product.variants.length > 0;
  const canAdd = !outOfStock && (!requiresVariant || !!selectedVariant);

  const sku = techSku(product.id);
  const model = techModel(product.id);

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
    showConfirm(line.title, store.slug);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    add(buildCartLine(), qty);
    router.push(cartHref(store.slug));
  };

  return (
    <div className="space-y-5 p-4 pt-6 lg:p-0 lg:pt-0">
      {/* Mono SKU · MODEL eyebrow — replaces FB's caps eyebrow / trust's
          MAISON · EST. with spec-sheet label data. JetBrains Mono with
          tight tracking + tabular-nums via [data-tech-mono]. */}
      <p
        data-tech-mono="true"
        className="text-[11px] uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          fontFamily: TECH_MONO_FONT,
          letterSpacing: '0.12em',
          fontWeight: 600,
        }}
      >
        SKU · {sku} &nbsp;|&nbsp; MODEL · {model}
      </p>

      <h1
        className="text-3xl leading-[1.15] sm:text-4xl"
        style={{
          fontFamily: TECH_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
        }}
      >
        {product.title}
      </h1>

      {product.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {product.badges.includes('hot') && (
            <Badge className="rounded-md bg-[var(--shop-primary)] text-white hover:bg-[var(--shop-primary)]">
              BESTSELLER
            </Badge>
          )}
          {product.badges.includes('new') && (
            <Badge
              variant="outline"
              className="rounded-md border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-accent)' }}
            >
              NEW
            </Badge>
          )}
          {product.badges.includes('limited') && (
            <Badge
              variant="outline"
              className="rounded-md border-[var(--shop-primary)]"
              style={{ color: 'var(--shop-primary)' }}
            >
              LIMITED
            </Badge>
          )}
          {product.badges.includes('official') && (
            <Badge
              variant="outline"
              className="rounded-md border-[var(--shop-primary)]"
              style={{ color: 'var(--shop-primary)' }}
            >
              OFFICIAL
            </Badge>
          )}
        </div>
      )}

      {(product.rating != null ||
        product.reviewCount != null ||
        product.soldCount != null) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--shop-ink-muted)]">
          {product.rating != null && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[var(--shop-primary)] text-[var(--shop-primary)]" />
              <span
                className="font-medium"
                style={{ color: 'var(--shop-ink)' }}
              >
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
          {product.reviewCount != null && (
            <>
              <span>·</span>
              <Link href="#reviews" className="hover:underline">
                {product.reviewCount.toLocaleString()} รีวิว
              </Link>
            </>
          )}
          {product.soldCount != null && (
            <>
              <span>·</span>
              <span>ขายแล้ว {product.soldCount.toLocaleString()} ชิ้น</span>
            </>
          )}
        </div>
      )}

      {/* Mono price in electric blue. Tight letter-spacing, tabular
          numerics. Discount delta rendered as a mono chip to keep the
          spec-sheet feel. */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          data-tech-mono="true"
          className="text-3xl sm:text-4xl"
          style={{
            color: 'var(--shop-primary)',
            fontFamily: TECH_MONO_FONT,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {formatTHB(displayPrice)}
        </span>
        {original && discount != null && (
          <>
            <span
              data-tech-mono="true"
              className="text-base line-through sm:text-lg"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
              }}
            >
              {formatTHB(original)}
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-xs font-bold uppercase"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--shop-primary) 12%, transparent)',
                color: 'var(--shop-primary)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.1em',
              }}
            >
              -{discount}%
            </span>
          </>
        )}
      </div>

      {/* Mint "in stock — ships today" chip. Lives in its own row so
          it never wraps with the price. Uses the data-tech-stock
          helper from globals.css so the hue lives in one place. */}
      <div className="flex flex-wrap items-center gap-3">
        {!outOfStock ? (
          <span
            data-tech-stock="true"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold uppercase"
            style={{ letterSpacing: '0.14em' }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            มีสินค้า — จัดส่งวันนี้
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold uppercase"
            style={{
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.14em',
              fontFamily: TECH_MONO_FONT,
            }}
          >
            สินค้าหมด
          </span>
        )}
        {stockLeft != null && stockLeft > 0 && stockLeft < 10 && (
          <span
            data-tech-mono="true"
            className="text-xs uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}
          >
            เหลือ {stockLeft} ชิ้น
          </span>
        )}
      </div>

      {/* Compact spec preview table — 4 rows (Brand / Model / SKU /
          Stock). Alternating muted rows via data-tech-row. Replaces
          FB's "ตัวเลือก" copy area with hard label data — the spec
          table IS the brand identity in this family. */}
      <Card
        className="overflow-hidden rounded-md border p-0 shadow-none"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div
          className="border-b px-4 py-2 text-[11px] uppercase"
          style={{
            borderColor: 'var(--shop-border)',
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.16em',
            fontFamily: TECH_MONO_FONT,
            fontWeight: 600,
            background: 'var(--shop-muted)',
          }}
        >
          ข้อมูลจำเพาะ
        </div>
        <dl className="divide-y" style={{ borderColor: 'var(--shop-border)' }}>
          <SpecRow label="แบรนด์" value={store.name} />
          <SpecRow label="รุ่น" value={model} mono row />
          <SpecRow label="SKU" value={sku} mono />
          <SpecRow
            label="สถานะสินค้า"
            value={outOfStock ? 'สินค้าหมด' : 'มีสินค้า'}
            row
          />
        </dl>
      </Card>

      {product.variants.length > 0 && (
        <div className="space-y-2">
          <div
            data-tech-mono="true"
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            ตัวเลือก:{' '}
            <span style={{ color: 'var(--shop-ink)' }}>
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
                    'rounded-md border px-3.5 py-1.5 text-sm font-medium transition',
                    active
                      ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)] text-white'
                      : 'border-[var(--shop-border)] bg-white hover:border-[var(--shop-primary)]',
                    !available && 'cursor-not-allowed line-through opacity-50',
                  )}
                >
                  {variantLabel(v.attributes)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span
          data-tech-mono="true"
          className="text-[11px] uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            fontFamily: TECH_MONO_FONT,
            letterSpacing: '0.16em',
            fontWeight: 600,
          }}
        >
          จำนวน
        </span>
        <div
          className="inline-flex h-9 items-center overflow-hidden rounded-md border bg-white"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="h-9 w-9 rounded-none hover:bg-[var(--shop-muted)]"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <input
            type="number"
            inputMode="numeric"
            value={qty}
            data-tech-mono="true"
            onChange={(e) =>
              setQty(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            className="h-9 w-12 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{
              borderColor: 'var(--shop-border)',
              fontFamily: TECH_MONO_FONT,
              fontWeight: 600,
            }}
            aria-label="จำนวน"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(qty + 1)}
            disabled={stockLeft != null && qty >= stockLeft}
            className="h-9 w-9 rounded-none hover:bg-[var(--shop-muted)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabbed CTA row — outline "Add to cart" + filled-blue "Buy
          now". Both rectangles (rounded-md). Wishlist heart sits in
          its own square plate matching the CTA height. */}
      <div className="flex gap-2 pt-1">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-white"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <WishlistButton
            storeSlug={store.slug}
            product={{
              id: product.id,
              title: product.title,
              priceTHB: product.priceTHB,
              imageUrl: product.imageUrl,
            }}
            size="md"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 rounded-md border-[var(--shop-primary)] text-[var(--shop-primary)] hover:bg-[var(--shop-muted)] hover:text-[var(--shop-primary)]"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          {added ? (
            <>
              <Check className="mr-1 h-4 w-4" /> เพิ่มแล้ว
            </>
          ) : (
            <>
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              เพิ่มลงตะกร้า
            </>
          )}
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1 rounded-md text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--shop-primary)' }}
          onClick={handleBuyNow}
          disabled={!canAdd}
        >
          ซื้อเลย
        </Button>
      </div>

      {/* Mono warranty footer — replaces FB's italic trust strip and
          trust's serif-label list. Three-column condensed footer with
          mono labels and short values, reads as a factory packaging
          label. */}
      <div
        className="grid grid-cols-3 gap-3 rounded-md border bg-[var(--shop-muted)] px-4 py-3 text-xs"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div>
          <div
            data-tech-mono="true"
            className="uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}
          >
            การรับประกัน
          </div>
          <div
            className="mt-1 text-sm font-semibold"
            style={{ color: 'var(--shop-ink)' }}
          >
            1 ปี
          </div>
        </div>
        <div>
          <div
            data-tech-mono="true"
            className="uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}
          >
            จัดส่ง
          </div>
          <div
            className="mt-1 text-sm font-semibold"
            style={{ color: 'var(--shop-ink)' }}
          >
            จากไทย
          </div>
        </div>
        <div>
          <div
            data-tech-mono="true"
            className="uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}
          >
            คืนสินค้า
          </div>
          <div
            className="mt-1 text-sm font-semibold"
            style={{ color: 'var(--shop-ink)' }}
          >
            7 วัน
          </div>
        </div>
      </div>

      <Separator className="bg-[var(--shop-border)]" />

      {/* Rectangular store card — squared, no decorative glow. */}
      <Card
        className="rounded-md border bg-white p-4 shadow-none"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            {store.logoUrl && (
              <AvatarImage src={store.logoUrl} alt={store.name} />
            )}
            <AvatarFallback className="rounded-md">
              {store.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-bold"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TECH_DISPLAY_FONT,
              }}
            >
              {store.name}
            </div>
            <div
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.16em',
                fontWeight: 600,
              }}
            >
              ตัวแทนจำหน่าย · ของแท้
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-md border-[var(--shop-primary)] text-[var(--shop-primary)]"
          >
            <Link href={storeHref(store.slug)}>ดูร้านค้า</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Single row inside the spec preview table. Mono value on demand,
 * alternating muted row via `row` prop (translates to data-tech-row
 * which globals.css repaints).
 */
function SpecRow({
  label,
  value,
  mono = false,
  row = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  row?: boolean;
}) {
  return (
    <div
      data-tech-row={row ? 'true' : undefined}
      className="grid grid-cols-[40%_60%] items-center px-4 py-2.5"
    >
      <dt
        data-tech-mono="true"
        className="text-[11px] uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          fontFamily: TECH_MONO_FONT,
          letterSpacing: '0.16em',
          fontWeight: 600,
        }}
      >
        {label}
      </dt>
      <dd
        data-tech-mono={mono ? 'true' : undefined}
        className="text-sm"
        style={{
          color: 'var(--shop-ink)',
          fontFamily: mono ? TECH_MONO_FONT : TECH_DISPLAY_FONT,
          fontWeight: mono ? 600 : 600,
          letterSpacing: mono ? '-0.01em' : undefined,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
