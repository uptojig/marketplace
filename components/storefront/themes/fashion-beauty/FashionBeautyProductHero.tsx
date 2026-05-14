'use client';

/**
 * FashionBeautyProductHero — PDP hero variant for the fashion-beauty
 * design family. Rendered by app/stores/[slug]/products/[id]/page.tsx
 * when `isFashionBeautyStore(store)` is true.
 *
 * Design intent (vs the default ProductDetailHero):
 *   - 4/5 portrait gallery on desktop (instead of square) — magazine
 *     proportions; product hero feels like a fashion editorial spread.
 *   - White outer border + cream backdrop on the gallery — gives the
 *     image breathing room and reads as gallery paper.
 *   - Serif display headline at text-4xl+ — leans on Cormorant via
 *     the --font-fashion-display CSS var (loaded in app/layout.tsx).
 *   - Rose-500 price (instead of red-600) so it sits in the palette.
 *   - Fully rounded primary CTA + outlined "Add to bag" — soft,
 *     boutique pairing instead of the default twin-fill buttons.
 *   - Trust strip rendered in italic serif with hairline dividers
 *     instead of the icon-row treatment.
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
import { Separator } from '@/components/ui/separator';
import { cn, formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { WishlistButton } from '@/components/storefront/Wishlist';
import type {
  ProductDetailHeroProduct,
  ProductDetailHeroStore,
} from '@/components/storefront/ProductDetailHero';

function storeHref(slug: string): string {
  return `/stores/${slug}`;
}

function cartHref(slug: string): string {
  return `/stores/${slug}/cart`;
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

export function FashionBeautyProductHero({
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
        <AspectRatio ratio={4 / 5} className="rounded-2xl bg-[var(--shop-muted)]">
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--shop-ink-muted)]">
            ไม่มีรูปภาพ
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      {/* Outer cream frame — gives the hero image a magazine-mat feel. */}
      <div
        className="rounded-2xl border bg-white p-3 sm:p-4 shadow-sm"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-xl bg-[var(--shop-muted)]">
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
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto px-3 pb-2 lg:px-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
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
      {/* Tiny brand-eyebrow above the headline — editorial signal. */}
      <p
        className="text-xs uppercase tracking-[0.22em] text-[var(--shop-ink-muted)]"
      >
        {store.name}
      </p>

      <h1
        className="text-4xl leading-[1.05] sm:text-5xl"
        style={{
          fontFamily:
            'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif',
          color: 'var(--shop-ink)',
          fontWeight: 500,
          letterSpacing: '-0.005em',
        }}
      >
        {product.title}
      </h1>

      {product.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {product.badges.includes('hot') && (
            <Badge className="rounded-full bg-[var(--shop-primary)] hover:bg-[var(--shop-primary)]">
              Bestseller
            </Badge>
          )}
          {product.badges.includes('new') && (
            <Badge variant="outline" className="rounded-full">
              New In
            </Badge>
          )}
          {product.badges.includes('limited') && (
            <Badge variant="outline" className="rounded-full">
              Limited
            </Badge>
          )}
          {product.badges.includes('official') && (
            <Badge variant="outline" className="rounded-full">
              Official
            </Badge>
          )}
        </div>
      )}

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

      {/* Price block — rose ink on cream, no red panel. */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className="text-3xl font-semibold sm:text-4xl"
          style={{ color: 'var(--shop-primary)' }}
        >
          {formatTHB(displayPrice)}
        </span>
        {original && discount != null && (
          <>
            <span className="text-base text-[var(--shop-ink-muted)] line-through sm:text-lg">
              {formatTHB(original)}
            </span>
            <span
              className="rounded-full bg-[var(--shop-muted)] px-2.5 py-0.5 text-xs font-medium"
              style={{ color: 'var(--shop-primary)' }}
            >
              −{discount}%
            </span>
          </>
        )}
      </div>

      {product.variants.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--shop-ink-muted)]">
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
                    'rounded-full border px-4 py-1.5 text-sm transition',
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
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--shop-ink-muted)]">
          จำนวน
        </span>
        <div
          className="inline-flex items-center rounded-full border bg-white"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="h-9 w-9 rounded-l-full rounded-r-none hover:bg-[var(--shop-muted)]"
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
            className="h-9 w-9 rounded-r-full rounded-l-none hover:bg-[var(--shop-muted)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {stockLeft != null && stockLeft > 0 && stockLeft < 10 && (
          <span className="text-xs font-medium" style={{ color: 'var(--shop-primary)' }}>
            เหลือ {stockLeft} ชิ้น
          </span>
        )}
        {outOfStock && (
          <span className="text-xs font-medium text-[var(--shop-ink-muted)]">สินค้าหมด</span>
        )}
      </div>

      {/* CTA row — wishlist heart, outlined "add to bag", filled "buy now". */}
      <div className="flex gap-3 pt-2">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white"
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
          className="flex-1 rounded-full border-[var(--shop-ink)] text-[var(--shop-ink)] hover:bg-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
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
          className="flex-1 rounded-full text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--shop-primary)' }}
          onClick={handleBuyNow}
          disabled={!canAdd}
        >
          ซื้อเลย
        </Button>
      </div>

      <Separator className="bg-[var(--shop-border)]" />

      {/* Boutique store card */}
      <Card
        className="rounded-2xl border bg-white p-4 shadow-none"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {store.logoUrl && <AvatarImage src={store.logoUrl} alt={store.name} />}
            <AvatarFallback>{store.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-medium"
              style={{ color: 'var(--shop-ink)' }}
            >
              {store.name}
            </div>
            {(store.rating != null || store.followers != null) && (
              <div className="flex items-center gap-1 text-xs text-[var(--shop-ink-muted)]">
                {store.rating != null && (
                  <>
                    <Star className="h-3 w-3 fill-[var(--shop-primary)] text-[var(--shop-primary)]" />
                    {store.rating.toFixed(1)}
                  </>
                )}
                {store.rating != null && store.followers != null && <span>·</span>}
                {store.followers != null && (
                  <span>{(store.followers / 1000).toFixed(1)}k followers</span>
                )}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href={storeHref(store.slug)}>ดูร้าน</Link>
          </Button>
        </div>
      </Card>

      {/* Italic-serif trust strip — softer than icon row. */}
      <ul
        className="space-y-2 border-t border-b py-4 text-sm italic"
        style={{
          borderColor: 'var(--shop-border)',
          color: 'var(--shop-ink-muted)',
        }}
      >
        <li className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span>ส่งฟรีเมื่อสั่ง ฿990 ขึ้นไป</span>
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span>คุ้มครองผู้ซื้อโดย Basketplace</span>
        </li>
      </ul>
    </div>
  );
}
