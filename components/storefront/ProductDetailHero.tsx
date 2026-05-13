'use client';

/**
 * ProductDetailHero — scaffold-aligned PDP hero (gallery + info column).
 *
 * Ported from components/store-blocks/product-detail-block.tsx (PR #29)
 * to the canonical product detail design: 60/40 grid with sticky gallery
 * + thumbnails, badges row, title/rating/sold meta, red price block,
 * variant picker derived from Prisma ProductVariant.attributes, qty
 * stepper, Heart + Add to cart + Buy now actions, store card, trust
 * badges.
 *
 * Wiring choices vs the scaffold template:
 *  - Uses `useCart` from @/lib/store/cart (the ACTIVE storefront cart
 *    shared with ShopHeader / per-store /stores/[slug]/cart), NOT the
 *    dead `useCartStore` scaffold from lib/cart/store.ts.
 *  - Buy now navigates to `/stores/${slug}/cart` (per-store cart) so the
 *    storefront theme cascade survives — never the dead marketplace-level
 *    `/cart`.
 *  - Variants come from Prisma `ProductVariant.attributes` (a Json blob
 *    like { Size: "M", Color: "Black" }). For the picker we flatten into
 *    a label "Size: M / Color: Black" — the existing components/shop
 *    design splits this per-attribute via VariantDisclosure but the
 *    scaffold uses a single flat chip row; we follow the scaffold here.
 *  - rating / reviewCount / soldCount are NOT in Prisma yet; passed as
 *    optional props so callers can supply when the schema lands. The
 *    meta row hides gracefully when omitted.
 *
 * TODO(rating): wire real product rating/reviewCount/soldCount once
 * the Review model lands. For now they're optional + skipped.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Minus, Plus, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';
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

export interface ProductDetailHeroVariant {
  id: string;
  attributes: Record<string, string>;
  priceTHB: number;
  imageUrl: string | null;
  inventory: number | null;
}

export interface ProductDetailHeroProduct {
  id: string;
  title: string;
  description: string;
  priceTHB: number;
  /** Strikethrough "list" price. Maps from Prisma `Product.compareAtPriceTHB`. */
  originalPriceTHB: number | null;
  imageUrl: string | null;
  images: string[];
  attributes: Record<string, string>;
  badges: Array<'hot' | 'new' | 'limited' | 'official'>;
  variants: ProductDetailHeroVariant[];
  /** Total stock across the product (or selected variant). null = untracked. */
  stockLeft: number | null;
  /** Optional — none of these are in Prisma yet; skipped if missing. */
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
}

export interface ProductDetailHeroStore {
  slug: string;
  name: string;
  logoUrl: string | null;
  /** Optional — not in Prisma. Skipped if missing. */
  rating?: number;
  followers?: number;
}

function storeHref(slug: string): string {
  return `/stores/${slug}`;
}

function cartHref(slug: string): string {
  return `/stores/${slug}/cart`;
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

export function ProductDetailHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="lg:p-6">
      <div className="lg:grid lg:grid-cols-[60%_40%] lg:gap-8">
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
    // de-dupe while preserving order
    return Array.from(new Set(merged));
  }, [product.imageUrl, product.images]);

  if (images.length === 0) {
    return (
      <div className="lg:sticky lg:top-4 lg:self-start">
        <AspectRatio ratio={1} className="bg-muted">
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            ไม่มีรูปภาพ
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-4 lg:self-start">
      <AspectRatio ratio={1} className="bg-muted">
        <Image
          src={images[idx]}
          alt={product.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      </AspectRatio>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto px-3 pb-2 lg:px-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition',
                i === idx ? 'border-primary' : 'border-transparent',
              )}
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

  // Build CartLineDisplay — the active cart shape from lib/store/cart.ts.
  // No variantId field on CartLineDisplay yet; variant info is folded into
  // the title so users still see what they picked. If we add variantId to
  // CartLineDisplay later, include it here.
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
    <div className="space-y-4 p-4 lg:p-0">
      {product.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {product.badges.includes('hot') && <Badge variant="destructive">Hot</Badge>}
          {product.badges.includes('new') && <Badge>New</Badge>}
          {product.badges.includes('limited') && <Badge variant="secondary">Limited</Badge>}
          {product.badges.includes('official') && (
            <Badge className="bg-blue-600 hover:bg-blue-600">Official</Badge>
          )}
        </div>
      )}

      <h1 className="text-xl font-semibold leading-tight lg:text-2xl">{product.title}</h1>

      {(product.rating != null || product.reviewCount != null || product.soldCount != null) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {product.rating != null && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
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

      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-red-600">{formatTHB(displayPrice)}</span>
          {original && discount != null && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatTHB(original)}
              </span>
              <Badge variant="destructive">−{discount}%</Badge>
            </>
          )}
        </div>
      </div>

      {product.variants.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">
            ตัวเลือก:{' '}
            <span className="text-muted-foreground">
              {selectedVariant ? variantLabel(selectedVariant.attributes) : '—'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const available = v.inventory == null || v.inventory > 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => available && setVariantId(v.id)}
                  disabled={!available}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition',
                    variantId === v.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input hover:border-primary',
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
        <span className="text-sm font-medium">จำนวน</span>
        <div className="inline-flex items-center rounded-md border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="h-9 w-9 rounded-r-none"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="h-9 w-12 border-x text-center focus:outline-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(qty + 1)}
            disabled={stockLeft != null && qty >= stockLeft}
            className="h-9 w-9 rounded-l-none"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {stockLeft != null && stockLeft > 0 && stockLeft < 10 && (
          <span className="text-xs font-medium text-red-600">เหลือ {stockLeft} ชิ้น</span>
        )}
        {outOfStock && (
          <span className="text-xs font-medium text-muted-foreground">สินค้าหมด</span>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border">
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
          className="flex-1"
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
          className="flex-1"
          onClick={handleBuyNow}
          disabled={!canAdd}
        >
          ซื้อเลย
        </Button>
      </div>

      <Separator />

      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {store.logoUrl && <AvatarImage src={store.logoUrl} alt={store.name} />}
            <AvatarFallback>{store.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{store.name}</div>
            {(store.rating != null || store.followers != null) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {store.rating != null && (
                  <>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
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
          <Button variant="outline" size="sm" asChild>
            <Link href={storeHref(store.slug)}>ดูร้าน</Link>
          </Button>
        </div>
      </Card>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span>ส่งฟรีเมื่อสั่ง ฿990 ขึ้นไป</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span>คุ้มครองผู้ซื้อโดย Basketplace</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          <span>คืนสินค้าได้ภายใน 7 วัน</span>
        </div>
      </div>
    </div>
  );
}
