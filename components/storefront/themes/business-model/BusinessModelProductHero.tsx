'use client';

/**
 * BusinessModelProductHero — PDP hero variant for the business-model
 * design family. Rendered by app/stores/[slug]/products/[id]/page.tsx
 * when `isBusinessModelStore(store)` is true (wholesale-b2b / flash-deal
 * / subscription templates).
 *
 * Design intent (vs the default ProductDetailHero, FB editorial hero,
 * and trust heritage hero):
 *   - RED countdown banner pinned at the top of the page wrapper —
 *     "Flash sale ends in 02:34:11" with JetBrains Mono numerals.
 *     Static stub for now (no real timer state).
 *   - Square (1/1) gallery — no fancy frame, no portrait crop.
 *     Flash-deal sticker overlay in the top-left corner ("-30%" or
 *     "FLASH DEAL") in amber.
 *   - Right info column packs B2B detail: SKU + MOQ chip, big mono
 *     price + slashed original + green savings chip, tier-pricing
 *     table (Qty × Price), variant selector, qty stepper with
 *     active-tier highlight.
 *   - Rectangular RED "Add to cart" + rectangular outlined "Quote
 *     request" CTAs (NOT pills — utility convention).
 *   - Dense info row: SKU / MOQ / Carton qty in mono caps. Reads as
 *     data, not flair.
 *   - Stock-low warning chip in amber.
 *
 * Wiring matches ProductDetailHero / FashionBeautyProductHero /
 * TrustProductHero exactly so the page-level Prisma → props mapping
 * stays identical — same useCart hook, same Buy-Now → per-store cart
 * routing.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Check,
  Mail,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
  Timer,
  TrendingDown,
  Truck,
} from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { WishlistButton } from '@/components/storefront/Wishlist';
import {
  BM_DEFAULT_TIERS,
  bmActiveTier,
  bmSku,
} from '@/lib/landing/business-model';
import type {
  ProductDetailHeroProduct,
  ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

function cartHref(slug: string): string {
  return `/stores/${slug}/cart`;
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

/**
 * Static deterministic countdown stub. Renders HH:MM:SS strings in mono
 * with tabular-nums but does NOT decrement — driving a real timer at
 * SSR boundary is out of scope for this design pilot. The static value
 * comes from the product id so it doesn't change on each render (no
 * hydration mismatch) but feels live.
 *
 * TODO(timer): replace with a real `useCountdownTo(date)` hook + a
 * server-rendered target_at on the Product / Sale row once flash-sale
 * scheduling lands in Prisma.
 */
function stubCountdown(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const hh = String(2 + (hash % 6)).padStart(2, '0');
  const mm = String(hash % 60).padStart(2, '0');
  const ss = String((hash >> 8) % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function BusinessModelProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="space-y-4">
      <CountdownBanner productId={product.id} />
      <div className="lg:p-4">
        <div className="lg:grid lg:grid-cols-[55%_45%] lg:gap-10">
          <Gallery product={product} />
          <InfoColumn product={product} store={store} />
        </div>
      </div>
    </div>
  );
}

/**
 * Red countdown band — pinned above the gallery / info grid. Static
 * stub (see stubCountdown comment). Mono numerals via the
 * data-bm-mono="true" hook in globals.css.
 */
function CountdownBanner({ productId }: { productId: string }) {
  const countdown = stubCountdown(productId);
  return (
    <div
      data-bm-countdown="true"
      className="flex flex-wrap items-center justify-center gap-3 rounded-md px-4 py-2.5 text-sm sm:text-base"
      style={{ background: 'var(--shop-primary)', color: '#ffffff' }}
    >
      <Timer className="h-4 w-4 shrink-0" />
      <span className="font-semibold uppercase tracking-[0.12em]">
        ดีลด่วน · เหลือเวลา
      </span>
      <span
        data-bm-mono="true"
        className="text-base font-bold sm:text-lg"
        style={{
          fontFamily: BM_MONO_FONT,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
        }}
      >
        {countdown}
      </span>
      <span className="text-xs opacity-90">ก่อนหมดโปรโมชัน</span>
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

  const original = product.originalPriceTHB;
  const discount =
    original && original > product.priceTHB
      ? Math.round((1 - product.priceTHB / original) * 100)
      : null;

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
      <div
        className="relative overflow-hidden rounded-md border bg-white"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        {/* Square aspect wrapper for layout consistency; object-contain
            so the product photo isn't cropped at its natural ratio
            (BM stores often sell mixed-aspect SKUs — kits, bundles,
            boxed goods). bg-[var(--shop-muted)] handles letterbox. */}
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
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </AspectRatio>
        {/* Deal sticker — amber FLASH DEAL or red -XX%. Sits top-left
            corner, sharp rectangle, mono savings number. */}
        {discount != null && (
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold uppercase shadow-sm"
            style={{
              background: 'var(--shop-accent)',
              color: '#0f172a',
              letterSpacing: '0.06em',
            }}
          >
            <TrendingDown className="h-3 w-3" />
            <span
              data-bm-mono="true"
              style={{ fontFamily: BM_MONO_FONT, fontVariantNumeric: 'tabular-nums' }}
            >
              -{discount}%
            </span>
          </span>
        )}
        {discount != null && (
          <span
            className="absolute right-3 top-3 inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm"
            style={{
              background: 'var(--shop-primary)',
              color: '#ffffff',
              letterSpacing: '0.12em',
            }}
          >
            FLASH DEAL
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto px-1 pb-2 lg:px-0">
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
  const basePrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const activeTier = bmActiveTier(qty);
  // Tier-discounted unit price — multiplied off the base for the
  // active qty tier. Displays in mono next to the slashed original.
  const displayPrice = Math.round(basePrice * activeTier.multiplier);
  const original = product.originalPriceTHB;
  const totalDiscount =
    original && original > displayPrice
      ? Math.round((1 - displayPrice / original) * 100)
      : activeTier.savingsPct > 0
        ? activeTier.savingsPct
        : null;
  const savedAmount =
    original && original > displayPrice ? (original - displayPrice) * qty : 0;

  const stockLeft = selectedVariant?.inventory ?? product.stockLeft;
  const outOfStock = stockLeft != null && stockLeft <= 0;
  const lowStock = stockLeft != null && stockLeft > 0 && stockLeft < 20;
  const requiresVariant = product.variants.length > 0;
  const canAdd = !outOfStock && (!requiresVariant || !!selectedVariant);

  const sku = bmSku(product.id);
  const moq = 1;
  const cartonQty = 12;

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

  const handleQuote = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/stores/${store.slug}/about`;
    }
  };

  return (
    <div className="space-y-5 p-4 pt-6 lg:p-0 lg:pt-0">
      {/* B2B eyebrow — tight tracking, mono SKU. */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            borderColor: 'var(--shop-border)',
            letterSpacing: '0.12em',
          }}
        >
          SKU
          <span
            data-bm-mono="true"
            className="font-bold"
            style={{
              color: 'var(--shop-ink)',
              fontFamily: BM_MONO_FONT,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {sku}
          </span>
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            borderColor: 'var(--shop-border)',
            letterSpacing: '0.12em',
          }}
        >
          MOQ
          <span
            data-bm-mono="true"
            className="font-bold"
            style={{
              color: 'var(--shop-ink)',
              fontFamily: BM_MONO_FONT,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {moq}
          </span>
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            borderColor: 'var(--shop-border)',
            letterSpacing: '0.12em',
          }}
        >
          CARTON
          <span
            data-bm-mono="true"
            className="font-bold"
            style={{
              color: 'var(--shop-ink)',
              fontFamily: BM_MONO_FONT,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {cartonQty}
          </span>
        </span>
      </div>

      <h1
        className="text-2xl leading-tight sm:text-3xl"
        style={{
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
            <Badge className="rounded-sm bg-[var(--shop-primary)] text-white hover:bg-[var(--shop-primary)]">
              BESTSELLER
            </Badge>
          )}
          {product.badges.includes('new') && (
            <Badge
              variant="outline"
              className="rounded-sm border-[var(--shop-border)]"
              style={{ color: 'var(--shop-ink)' }}
            >
              NEW
            </Badge>
          )}
          {product.badges.includes('limited') && (
            <Badge
              variant="outline"
              className="rounded-sm border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-accent)' }}
            >
              LIMITED STOCK
            </Badge>
          )}
        </div>
      )}

      {(product.rating != null || product.reviewCount != null || product.soldCount != null) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--shop-ink-muted)]">
          {product.rating != null && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[var(--shop-accent)] text-[var(--shop-accent)]" />
              <span className="font-bold" style={{ color: 'var(--shop-ink)' }}>
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
          {product.reviewCount != null && (
            <>
              <span>·</span>
              <Link href="#reviews" className="hover:underline">
                {product.reviewCount.toLocaleString()} reviews
              </Link>
            </>
          )}
          {product.soldCount != null && (
            <>
              <span>·</span>
              <span
                data-bm-mono="true"
                style={{ fontFamily: BM_MONO_FONT, fontVariantNumeric: 'tabular-nums' }}
              >
                {product.soldCount.toLocaleString()} sold
              </span>
            </>
          )}
        </div>
      )}

      {/* Price block — big bold mono price, slashed original next to
          it, green savings chip. Sits inside a yellow-50 deal card. */}
      <div
        className="rounded-md border p-4"
        style={{
          background: 'var(--shop-muted)',
          borderColor: 'var(--shop-border)',
        }}
      >
        <div className="flex flex-wrap items-baseline gap-3">
          <span
            data-bm-mono="true"
            className="text-3xl sm:text-4xl"
            style={{
              color: 'var(--shop-primary)',
              fontFamily: BM_MONO_FONT,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            {formatTHB(displayPrice)}
          </span>
          {original && original > displayPrice && (
            <span
              data-bm-mono="true"
              className="text-base text-[var(--shop-ink-muted)] line-through sm:text-lg"
              style={{
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTHB(original)}
            </span>
          )}
          {totalDiscount != null && totalDiscount > 0 && (
            <span
              data-bm-savings="true"
              className="rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
              style={{
                background: 'var(--shop-savings, #10b981)',
                color: '#ffffff',
              }}
            >
              SAVE {totalDiscount}%
            </span>
          )}
        </div>
        {savedAmount > 0 && (
          <p
            className="mt-2 text-xs"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ประหยัด{' '}
            <span
              data-bm-mono="true"
              style={{
                color: 'var(--shop-savings, #10b981)',
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
              }}
            >
              {formatTHB(savedAmount)}
            </span>{' '}
            ที่จำนวนนี้
          </p>
        )}
      </div>

      {/* Tier-pricing table — Qty × Price. Active tier (based on
          current qty) highlights in yellow-50 + red border. Reads
          as a spreadsheet, not a chart. */}
      <div>
        <div
          className="mb-2 text-xs font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.12em',
          }}
        >
          Volume pricing
        </div>
        <div
          className="overflow-hidden rounded-md border"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-[10px] uppercase"
                style={{
                  background: '#fafafa',
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.12em',
                }}
              >
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2 font-semibold">Unit price</th>
                <th className="px-3 py-2 text-right font-semibold">Save</th>
              </tr>
            </thead>
            <tbody>
              {BM_DEFAULT_TIERS.map((t, i) => {
                const tierPrice = Math.round(basePrice * t.multiplier);
                const isActive = activeTier.label === t.label;
                return (
                  <tr
                    key={t.label}
                    data-bm-row={i % 2 === 1 ? 'alt' : undefined}
                    className="border-t"
                    style={{
                      borderColor: 'var(--shop-border)',
                      background: isActive
                        ? 'color-mix(in srgb, var(--shop-primary) 10%, transparent)'
                        : i % 2 === 1
                          ? 'var(--shop-muted)'
                          : undefined,
                    }}
                  >
                    <td
                      data-bm-mono="true"
                      className="px-3 py-2 font-semibold"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {t.label}
                    </td>
                    <td
                      data-bm-mono="true"
                      className="px-3 py-2 font-bold"
                      style={{
                        color: isActive ? 'var(--shop-primary)' : 'var(--shop-ink)',
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatTHB(tierPrice)}
                    </td>
                    <td
                      className="px-3 py-2 text-right text-xs font-semibold"
                      style={{
                        color:
                          t.savingsPct > 0
                            ? 'var(--shop-savings, #10b981)'
                            : 'var(--shop-ink-muted)',
                      }}
                    >
                      {t.savingsPct > 0 ? `-${t.savingsPct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {product.variants.length > 0 && (
        <div className="space-y-2">
          <div
            className="text-xs font-semibold uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.12em',
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
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition',
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

      {/* Qty stepper + stock-low warning chip. */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="text-xs font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.12em',
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
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            data-bm-mono="true"
            className="h-9 w-14 border-x bg-transparent text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{
              borderColor: 'var(--shop-border)',
              fontFamily: BM_MONO_FONT,
              fontVariantNumeric: 'tabular-nums',
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
        {lowStock && (
          <span
            className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-bold uppercase"
            style={{
              background: 'var(--shop-accent)',
              color: '#0f172a',
              letterSpacing: '0.08em',
            }}
          >
            <AlertTriangle className="h-3 w-3" />
            <span
              data-bm-mono="true"
              style={{ fontFamily: BM_MONO_FONT, fontVariantNumeric: 'tabular-nums' }}
            >
              เหลือ {stockLeft}
            </span>
          </span>
        )}
        {outOfStock && (
          <span className="text-xs font-bold uppercase text-[var(--shop-ink-muted)]">
            สินค้าหมด
          </span>
        )}
      </div>

      {/* CTA stack — rectangular RED "Add to cart" + outlined slate
          "Quote request" + wishlist heart square plate. */}
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
          size="lg"
          className="flex-1 rounded-md text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--shop-primary)' }}
          onClick={handleAdd}
          disabled={!canAdd}
        >
          {added ? (
            <>
              <Check className="mr-1 h-4 w-4" /> เพิ่มแล้ว
            </>
          ) : (
            <>
              <ShoppingCart className="mr-1 h-4 w-4" /> เพิ่มลงตะกร้า
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-md border-[var(--shop-ink)] text-[var(--shop-ink)] hover:bg-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
          onClick={handleQuote}
          disabled={outOfStock}
        >
          <Mail className="mr-1 h-4 w-4" /> ติดต่อเรา
        </Button>
      </div>

      <Separator className="bg-[var(--shop-border)]" />

      {/* Utility strip — fast facts in tight caps + mono. */}
      <ul
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        style={{ color: 'var(--shop-ink)' }}
      >
        <li
          className="flex items-start gap-2 rounded-md border p-2.5"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Truck
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-primary)' }}
          />
          <div>
            <div
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              จัดส่ง
            </div>
            <div className="text-xs font-semibold">1-3 วันทำการ</div>
          </div>
        </li>
        <li
          className="flex items-start gap-2 rounded-md border p-2.5"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Package
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-primary)' }}
          />
          <div>
            <div
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              ขั้นต่ำ
            </div>
            <div className="text-xs font-semibold">
              MOQ{' '}
              <span
                data-bm-mono="true"
                style={{ fontFamily: BM_MONO_FONT, fontVariantNumeric: 'tabular-nums' }}
              >
                {moq}
              </span>{' '}
              · Carton{' '}
              <span
                data-bm-mono="true"
                style={{ fontFamily: BM_MONO_FONT, fontVariantNumeric: 'tabular-nums' }}
              >
                {cartonQty}
              </span>
            </div>
          </div>
        </li>
        <li
          className="flex items-start gap-2 rounded-md border p-2.5"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <TrendingDown
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-savings, #10b981)' }}
          />
          <div>
            <div
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              ส่วนลด
            </div>
            <div className="text-xs font-semibold">
              ซื้อ 50+ ลดสูงสุด 20%
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
