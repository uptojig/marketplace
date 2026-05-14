'use client';

/**
 * SpecialtyProductHero — PDP hero variant for the specialty (artisan
 * / vintage) design family. Rendered by
 * app/stores/[slug]/products/[id]/page.tsx when isSpecialtyStore(store)
 * is true (and isFashionBeautyStore is NOT).
 *
 * Design intent (vs the default ProductDetailHero and the
 * fashion-beauty hero):
 *   - 1/1 SQUARE gallery (not portrait 4/5) — artisan product card,
 *     wrapped in a kraft-paper outer frame with a subtle sepia tint.
 *   - Fraunces slab-serif headline at weight 500 — softer slab feel,
 *     distinct from Cormorant's editorial swoosh.
 *   - Italic-handwritten eyebrow above the headline (Caveat, ochre)
 *     reads as "handmade by [maker]" — different from FB's uppercase
 *     letterspaced label.
 *   - Ochre price (var --shop-primary = #ca8a04) instead of rose.
 *   - Stamp-style "One-of-a-kind" badge rotated 3deg with dashed
 *     border via the SpecialtyStamp component.
 *   - Rectangular rounded-md CTAs (not pills) — artisan rather than
 *     boutique.
 *   - Hand-drawn dashed wavy divider between sections (SpecialtyDivider).
 *
 * Wiring matches ProductDetailHero exactly so the page-level shape
 * stays identical — same Prisma → props mapping, same useCart hook,
 * same Buy-Now → per-store cart routing.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Minus, Plus, ShieldCheck, Star, Truck } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { WishlistButton } from '@/components/storefront/Wishlist';
import type {
  ProductDetailHeroProduct,
  ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';
import {
  SpecialtyDivider,
  SpecialtyHandLabel,
  SpecialtyStamp,
} from './SpecialtyDivider';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

function storeHref(slug: string): string {
  return `/stores/${slug}`;
}

function cartHref(slug: string): string {
  return `/stores/${slug}/cart`;
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

export function SpecialtyProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="lg:p-6">
      <div className="lg:grid lg:grid-cols-[55%_45%] lg:gap-12">
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
          className="rounded-md bg-[var(--shop-muted)]"
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
      {/* Kraft-paper outer frame — gives the hero image a vintage-mat
          feel. data-specialty-kraft turns on the warm gradient stripe;
          data-specialty-sepia applies the soft tint via globals.css. */}
      <div
        data-specialty-kraft="true"
        className="rounded-md border p-3 sm:p-4 shadow-sm"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div
          data-specialty-sepia="true"
          className="overflow-hidden rounded-md"
        >
          <AspectRatio
            ratio={1}
            className="overflow-hidden bg-[var(--shop-muted)]"
          >
            <Image
              src={images[idx]}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </AspectRatio>
        </div>
        {/* Handwritten "lot of N" tag, sits inside the kraft frame
            so it reads as a museum-style index tag. */}
        <div className="mt-2 flex items-center justify-between px-1">
          <SpecialtyHandLabel size="xs">
            {`Lot of ${product.stockLeft != null ? Math.max(1, product.stockLeft) : 1}`}
          </SpecialtyHandLabel>
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            archive · {String(product.id).slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto px-3 pb-2 lg:px-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition',
                i === idx
                  ? 'border-[var(--shop-primary)]'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
              aria-label={`รูปที่ ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${product.title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
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
  const oneOfAKind = stockLeft != null && stockLeft <= 1 && stockLeft >= 1;

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
    <div className="space-y-6 p-4 pt-8 lg:p-0 lg:pt-0">
      {/* Italic-handwritten eyebrow — reads as "handmade by [maker]".
          Distinct from FB's uppercase letter-spaced caption. */}
      <SpecialtyHandLabel size="md">
        handmade by {store.name}
      </SpecialtyHandLabel>

      <h1
        className="text-4xl leading-[1.05] sm:text-5xl"
        style={{
          fontFamily: SPECIALTY_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 500,
          letterSpacing: '-0.005em',
        }}
      >
        {product.title}
      </h1>

      {/* Stamp row — One-of-a-kind / new / official ribbons. The
          rotation + dashed border comes from the data-attribute in
          globals.css so we don't fight the Badge primitive. */}
      <div className="flex flex-wrap items-center gap-3">
        {oneOfAKind && <SpecialtyStamp tone="primary">One-of-a-kind</SpecialtyStamp>}
        {product.badges.includes('limited') && (
          <SpecialtyStamp tone="accent">Limited Edition</SpecialtyStamp>
        )}
        {product.badges.includes('new') && (
          <SpecialtyStamp tone="ink">New In</SpecialtyStamp>
        )}
        {product.badges.includes('official') && (
          <Badge variant="outline" className="rounded-md">
            Official Maker
          </Badge>
        )}
      </div>

      {(product.rating != null || product.reviewCount != null || product.soldCount != null) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--shop-ink-muted)]">
          {product.rating != null && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[var(--shop-primary)] text-[var(--shop-primary)]" />
              <span className="font-medium" style={{ color: 'var(--shop-ink)' }}>
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
              <span>{product.soldCount.toLocaleString()} sold</span>
            </>
          )}
        </div>
      )}

      <SpecialtyDivider />

      {/* Price block — ochre ink on kraft, no red panel. */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className="text-3xl font-semibold sm:text-4xl"
          style={{
            color: 'var(--shop-primary)',
            fontFamily: SPECIALTY_DISPLAY_FONT,
            fontWeight: 500,
          }}
        >
          {formatTHB(displayPrice)}
        </span>
        {original && discount != null && (
          <>
            <span className="text-base text-[var(--shop-ink-muted)] line-through sm:text-lg">
              {formatTHB(original)}
            </span>
            <span
              className="rounded-md bg-[var(--shop-muted)] px-2.5 py-0.5 text-xs font-medium"
              style={{ color: 'var(--shop-accent)' }}
            >
              −{discount}%
            </span>
          </>
        )}
      </div>

      {product.variants.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.16em] text-[var(--shop-ink-muted)]">
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
                    'rounded-md border px-4 py-1.5 text-sm transition',
                    active
                      ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)] text-white'
                      : 'border-[var(--shop-border)] bg-[var(--shop-card)] hover:border-[var(--shop-primary)]',
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
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--shop-ink-muted)]">
          จำนวน
        </span>
        <div
          className="inline-flex items-center rounded-md border bg-[var(--shop-card)]"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="h-9 w-9 rounded-l-md rounded-r-none hover:bg-[var(--shop-muted)]"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="h-9 w-12 border-x bg-transparent text-center focus:outline-none"
            style={{ borderColor: 'var(--shop-border)' }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(qty + 1)}
            disabled={stockLeft != null && qty >= stockLeft}
            className="h-9 w-9 rounded-r-md rounded-l-none hover:bg-[var(--shop-muted)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {stockLeft != null && stockLeft > 0 && stockLeft < 10 && (
          <span className="text-xs font-medium" style={{ color: 'var(--shop-accent)' }}>
            เหลือ {stockLeft} ชิ้น
          </span>
        )}
        {outOfStock && (
          <span className="text-xs font-medium text-[var(--shop-ink-muted)]">สินค้าหมด</span>
        )}
      </div>

      {/* CTA row — wishlist heart, outlined "add to bag", filled
          ochre "buy now". Rounded-md throughout (rectangular). */}
      <div className="flex gap-3 pt-2">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-[var(--shop-card)]"
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
          className="flex-1 rounded-md border-[var(--shop-ink)] text-[var(--shop-ink)] hover:bg-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          {added ? (
            <>
              <Check className="mr-1 h-4 w-4" /> เพิ่มแล้ว
            </>
          ) : (
            'เพิ่มลงตะกร้า'
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

      <SpecialtyDivider />

      {/* Maker / shop card. Kraft-tinted, rounded-md, with a tiny
          italic "Est. 19xx" handwritten subtitle. */}
      <Card
        data-specialty-kraft="true"
        className="rounded-md border p-4 shadow-none"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            {store.logoUrl && <AvatarImage src={store.logoUrl} alt={store.name} />}
            <AvatarFallback className="rounded-md">{store.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-medium"
              style={{ color: 'var(--shop-ink)' }}
            >
              {store.name}
            </div>
            <SpecialtyHandLabel size="xs" className="block">
              Est. crafted-to-order
            </SpecialtyHandLabel>
          </div>
          <Button variant="outline" size="sm" asChild className="rounded-md">
            <Link href={storeHref(store.slug)}>ดูร้าน</Link>
          </Button>
        </div>
      </Card>

      {/* Italic-serif trust strip — softer than the icon row, paired
          with a handwritten footnote. */}
      <ul
        className="space-y-2 border-t border-b py-4 text-sm italic"
        style={{
          borderColor: 'var(--shop-border)',
          color: 'var(--shop-ink-muted)',
        }}
      >
        <li className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span>ส่งภายใน 5-7 วัน (made-to-order)</span>
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span>คุ้มครองผู้ซื้อโดย Basketplace</span>
        </li>
      </ul>
      <SpecialtyHandLabel size="xs" className="block text-center">
        each piece is made by hand · thank you for supporting makers
      </SpecialtyHandLabel>
    </div>
  );
}
