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
import { Check, Minus, PlayCircle, Plus, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';
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
  /**
   * Split-out attribute labels (CJ rich-product fields). When all
   * variants for a product carry colorLabel + sizeLabel, the picker
   * renders Color and Size as separate UI rows. Else it falls back to
   * the legacy flat-chip layout that reads `attributes`.
   */
  colorLabel?: string | null;
  sizeLabel?: string | null;
  materialLabel?: string | null;
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
  /**
   * Supplier-hosted promo video URL (CJ `videoUrl` / `productVideoUrl`).
   * Surfaced as a small "ดูวิดีโอ" link under the gallery. We deliberately
   * do NOT auto-embed — many CJ video URLs are hosted on third-party
   * domains we'd need a frame-src CSP allowlist for.
   */
  videoUrl?: string | null;
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

// True iff every variant carries the same split-axis labels — that's
// the gating condition for rendering a per-axis picker. We require it
// to hold for *all* variants because a partial set would leave some
// rows un-pickable.
function variantsHaveSplitAxes(
  variants: ProductDetailHeroVariant[],
  axis: 'colorLabel' | 'sizeLabel' | 'materialLabel',
): boolean {
  return variants.length > 0 && variants.every((v) => !!v[axis]);
}

function uniqueAxisValues(
  variants: ProductDetailHeroVariant[],
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

import type { BehaviorFlags } from "@/lib/templates/types";

export function ProductDetailHero({
  product,
  store,
  templateBehavior,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
  /** When set, drives template-specific visual toggles (hideRatingsCount,
   *  showTabs, productCardStyle, etc.). Wired up by app/stores/[slug]/
   *  products/[id]/page.tsx from getTemplate(effectiveTemplateId).behavior. */
  templateBehavior?: BehaviorFlags;
}) {
  return (
    <div className="lg:p-6">
      <div className="lg:grid lg:grid-cols-[60%_40%] lg:gap-8">
        <Gallery product={product} />
        <InfoColumn product={product} store={store} templateBehavior={templateBehavior} />
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
      {/* Aspect-ratio wrapper keeps the layout stable across products
          while object-contain lets the image breathe at its natural
          ratio (no crop). Letterboxed area falls back to bg-muted so
          the empty space reads as deliberate. */}
      <AspectRatio ratio={1} className="bg-muted">
        <Image
          src={images[idx]}
          alt={product.title}
          fill
          className="object-contain"
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
      {product.videoUrl && (
        // Deliberately just a link — see ProductDetailHeroProduct.videoUrl
        // comment for the no-embed rationale (CSP). Opens in a new tab.
        <a
          href={product.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <PlayCircle className="h-4 w-4" />
          ดูวิดีโอ
        </a>
      )}
    </div>
  );
}

function InfoColumn({
  product,
  store,
  templateBehavior,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
  templateBehavior?: BehaviorFlags;
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

      {!templateBehavior?.hideRatingsCount &&
        (product.rating != null || product.reviewCount != null || product.soldCount != null) && (
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
        <VariantPicker
          variants={product.variants}
          selectedVariantId={variantId}
          onSelect={setVariantId}
          selectedVariant={selectedVariant}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">จำนวน</span>
        <div className="inline-flex h-9 items-center overflow-hidden rounded-md border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="h-9 w-9 rounded-none"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <input
            type="number"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="h-9 w-12 border-x text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="จำนวน"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(qty + 1)}
            disabled={stockLeft != null && qty >= stockLeft}
            className="h-9 w-9 rounded-none"
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

/**
 * VariantPicker — renders either a per-axis (Color + Size + Material)
 * picker when every variant carries the split-out labels, or falls
 * back to the legacy flat-chip layout that reads `attributes`.
 *
 * When split-axis is active, picking e.g. "Red" auto-snaps to the
 * first variant matching the current Size selection (or the first
 * Red variant if no size is selected yet). This is good-enough UX
 * for CJ's typical Color×Size matrix without over-engineering a full
 * matrix-aware picker.
 */
function VariantPicker({
  variants,
  selectedVariantId,
  selectedVariant,
  onSelect,
}: {
  variants: ProductDetailHeroVariant[];
  selectedVariantId: string | null;
  selectedVariant: ProductDetailHeroVariant | null;
  onSelect: (id: string) => void;
}) {
  const hasColor = variantsHaveSplitAxes(variants, 'colorLabel');
  const hasSize = variantsHaveSplitAxes(variants, 'sizeLabel');
  const hasMaterial = variantsHaveSplitAxes(variants, 'materialLabel');
  // Need at least two real axes to justify the split layout — a
  // single Color row would just be cosmetically identical to the
  // flat chip row but with an extra eyebrow label.
  const useSplit = [hasColor, hasSize, hasMaterial].filter(Boolean).length >= 2;

  if (!useSplit) {
    return (
      <div>
        <div className="mb-2 text-sm font-medium">
          ตัวเลือก:{' '}
          <span className="text-muted-foreground">
            {selectedVariant ? variantLabel(selectedVariant.attributes) : '—'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const available = v.inventory == null || v.inventory > 0;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => available && onSelect(v.id)}
                disabled={!available}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm transition',
                  selectedVariantId === v.id
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
    );
  }

  const colors = hasColor ? uniqueAxisValues(variants, 'colorLabel') : [];
  const sizes = hasSize ? uniqueAxisValues(variants, 'sizeLabel') : [];
  const materials = hasMaterial ? uniqueAxisValues(variants, 'materialLabel') : [];

  function pickAxis(axis: 'colorLabel' | 'sizeLabel' | 'materialLabel', value: string) {
    // Build a partial preference set from the currently-selected
    // variant + the new axis click, then find the closest variant.
    const preferred: Partial<Record<typeof axis, string>> & Record<string, string | undefined> = {
      colorLabel: selectedVariant?.colorLabel ?? undefined,
      sizeLabel: selectedVariant?.sizeLabel ?? undefined,
      materialLabel: selectedVariant?.materialLabel ?? undefined,
    };
    preferred[axis] = value;

    // Score each variant by how many preferred axes it matches; pick
    // the highest-scoring (and prefer in-stock when tied).
    let best: ProductDetailHeroVariant | null = null;
    let bestScore = -1;
    for (const v of variants) {
      let score = 0;
      if (preferred.colorLabel && v.colorLabel === preferred.colorLabel) score += 1;
      if (preferred.sizeLabel && v.sizeLabel === preferred.sizeLabel) score += 1;
      if (preferred.materialLabel && v.materialLabel === preferred.materialLabel) score += 1;
      // Required: the axis the user just clicked must match.
      if (v[axis] !== value) continue;
      const inStock = v.inventory == null || v.inventory > 0;
      const adjScore = score + (inStock ? 0.1 : 0);
      if (adjScore > bestScore) {
        best = v;
        bestScore = adjScore;
      }
    }
    if (best) onSelect(best.id);
  }

  return (
    <div className="space-y-4">
      {hasColor && (
        <AxisRow
          label="สี"
          values={colors}
          selected={selectedVariant?.colorLabel ?? null}
          onPick={(v) => pickAxis('colorLabel', v)}
        />
      )}
      {hasSize && (
        <AxisRow
          label="ขนาด"
          values={sizes}
          selected={selectedVariant?.sizeLabel ?? null}
          onPick={(v) => pickAxis('sizeLabel', v)}
        />
      )}
      {hasMaterial && (
        <AxisRow
          label="วัสดุ"
          values={materials}
          selected={selectedVariant?.materialLabel ?? null}
          onPick={(v) => pickAxis('materialLabel', v)}
        />
      )}
    </div>
  );
}

function AxisRow({
  label,
  values,
  selected,
  onPick,
}: {
  label: string;
  values: string[];
  selected: string | null;
  onPick: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">
        {label}:{' '}
        <span className="text-muted-foreground">{selected ?? '—'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm transition',
              selected === v
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input hover:border-primary',
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
