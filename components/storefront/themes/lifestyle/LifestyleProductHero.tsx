'use client';

/**
 * LifestyleProductHero — PDP hero variant for the lifestyle design
 * family. Rendered by app/stores/[slug]/products/[id]/page.tsx when
 * `isLifestyleStore(store)` is true (home-living / sport-active /
 * kids-toys templates, or landingThemeVariant "lifestyle" / "A" / "G").
 *
 * Design intent (vs the default ProductDetailHero, FB hero, trust hero):
 *   - Stacked gallery on desktop — 1/1 square primary, 16/9 lifestyle
 *     "in-use" scene below. Both with soft natural drop shadow.
 *   - Optimistic warm tagline above the headline (not a heritage caps
 *     eyebrow). Reads as friendly catalog copy.
 *   - Geometric humanist sans headline at text-4xl+ via
 *     --font-lifestyle-display. NOT serif — lifestyle is sans warmth.
 *   - Terracotta price (var(--shop-primary)) — pops on the cream bg.
 *   - "Why you'll love it" 3-bullet benefits block with sage check
 *     icons. Cards have peach-muted backgrounds + rounded-3xl edges.
 *   - Rectangular pill CTAs (rounded-full) — terracotta primary,
 *     outlined secondary. Friendly but grown-up, not over-soft.
 *   - Sage hairline rule under the headline — outdoorsy accent.
 *
 * Wiring matches ProductDetailHero / FashionBeautyProductHero / Trust
 * exactly so the page-level Prisma → props mapping stays identical —
 * same useCart hook, same Buy-Now → per-store cart routing.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Heart,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
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

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

function storeHref(slug: string): string {
  return `/stores/${slug}`;
}

function cartHref(slug: string): string {
  return `/stores/${slug}/cart`;
}

function variantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs).join(' / ');
}

export function LifestyleProductHero({
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
          className="rounded-3xl bg-[var(--shop-muted)]"
        >
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--shop-ink-muted)]">
            ไม่มีรูปภาพ
          </div>
        </AspectRatio>
      </div>
    );
  }

  // Lifestyle "in-use" image — fall back to a second image when only
  // one exists. The 16/9 ratio reads as catalog editorial photo.
  const lifestyleSrc = images[1] ?? images[0];

  return (
    <div className="lg:sticky lg:top-6 lg:self-start space-y-5">
      {/* Primary 1/1 square — soft natural drop shadow via the
          lifestyle frame helper. Generous rounded-3xl. Image fits
          naturally inside (object-contain) so non-square products
          aren't cropped; secondary 16/9 scene shot below stays
          object-cover because that's the editorial framing. */}
      <div
        data-lifestyle-frame="true"
        className="overflow-hidden rounded-3xl bg-white"
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
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </AspectRatio>
      </div>

      {/* Secondary 16/9 lifestyle "in-use" — slightly recessed peach
          backdrop, same shadow treatment. Acts as the scene shot. */}
      <div
        data-lifestyle-frame="true"
        className="overflow-hidden rounded-3xl bg-[var(--shop-muted)]"
      >
        <AspectRatio
          ratio={16 / 9}
          className="overflow-hidden"
        >
          <Image
            src={lifestyleSrc}
            alt={`${product.title} in use`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </AspectRatio>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto px-1 pb-2 lg:px-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition',
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
    <div className="space-y-7 p-4 pt-8 lg:p-0 lg:pt-0">
      {/* Optimistic tagline — friendly catalog copy, not a heritage caps
          eyebrow. Sage color so it pairs with the natural palette. */}
      <p
        className="text-xs uppercase"
        style={{
          color: 'var(--shop-accent)',
          letterSpacing: '0.18em',
          fontWeight: 600,
        }}
      >
        Built for everyday adventures
      </p>

      <h1
        className="text-4xl leading-[1.1] sm:text-5xl"
        style={{
          fontFamily: LIFESTYLE_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        {product.title}
      </h1>

      {/* Sage hairline below the headline — outdoorsy accent. */}
      <div
        aria-hidden
        className="h-px w-16"
        style={{ background: 'var(--shop-accent)' }}
      />

      {product.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {product.badges.includes('hot') && (
            <Badge className="rounded-full bg-[var(--shop-primary)] text-white hover:bg-[var(--shop-primary)]">
              Favorite
            </Badge>
          )}
          {product.badges.includes('new') && (
            <Badge
              variant="outline"
              className="rounded-full border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-ink)' }}
            >
              Just landed
            </Badge>
          )}
          {product.badges.includes('limited') && (
            <Badge
              variant="outline"
              className="rounded-full border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-ink)' }}
            >
              Limited stock
            </Badge>
          )}
          {product.badges.includes('official') && (
            <Badge
              variant="outline"
              className="rounded-full border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-ink)' }}
            >
              Verified store
            </Badge>
          )}
        </div>
      )}

      {(product.rating != null || product.reviewCount != null || product.soldCount != null) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--shop-ink-muted)]">
          {product.rating != null && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[var(--shop-accent)] text-[var(--shop-accent)]" />
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

      {/* Price — terracotta primary, optimistic. Display font for
          the large amount, sans body for the strikethrough. */}
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span
            className="text-3xl sm:text-4xl"
            style={{
              color: 'var(--shop-primary)',
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              fontWeight: 600,
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
                className="rounded-full bg-[var(--shop-muted)] px-3 py-0.5 text-xs font-semibold"
                style={{ color: 'var(--shop-ink)' }}
              >
                Save {discount}%
              </span>
            </>
          )}
        </div>
      </div>

      {product.variants.length > 0 && (
        <div className="space-y-3">
          <div
            className="text-xs uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.18em',
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
                    'rounded-full border px-4 py-1.5 text-sm transition',
                    active
                      ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)] text-white'
                      : 'border-[var(--shop-border)] bg-white hover:border-[var(--shop-accent)]',
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
          className="text-xs uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.18em',
            fontWeight: 600,
          }}
        >
          จำนวน
        </span>
        <div
          className="inline-flex h-10 items-center overflow-hidden rounded-full border bg-white"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="h-10 w-10 rounded-none hover:bg-[var(--shop-muted)]"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <input
            type="number"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="h-10 w-12 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{ borderColor: 'var(--shop-border)' }}
            aria-label="จำนวน"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(qty + 1)}
            disabled={stockLeft != null && qty >= stockLeft}
            className="h-10 w-10 rounded-none hover:bg-[var(--shop-muted)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {stockLeft != null && stockLeft > 0 && stockLeft < 10 && (
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--shop-primary)' }}
          >
            เหลือ {stockLeft} ชิ้น
          </span>
        )}
        {outOfStock && (
          <span className="text-xs font-medium text-[var(--shop-ink-muted)]">สินค้าหมด</span>
        )}
      </div>

      {/* CTA stack — rectangular pill rounded-full. Terracotta filled
          primary, outlined secondary. Wishlist heart in a circle plate. */}
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

      {/* "Why you'll love it" — 3-bullet benefits block. Sage check
          icons + peach-muted card backgrounds + airy rounded-3xl. */}
      <div className="pt-3">
        <p
          className="mb-3 text-xs uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.18em',
            fontWeight: 600,
          }}
        >
          Why you&apos;ll love it
        </p>
        <ul className="space-y-2.5">
          <BenefitRow
            icon={<Leaf className="h-4 w-4" />}
            title="Built to last"
            tagline="ออกแบบมาให้ใช้งานได้ทนนาน"
          />
          <BenefitRow
            icon={<Heart className="h-4 w-4" />}
            title="Loved by families"
            tagline="แบบที่ครอบครัวเลือกใช้จริง"
          />
          <BenefitRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Trusted quality"
            tagline="คุณภาพที่เราการันตี"
          />
        </ul>
      </div>

      <Separator className="bg-[var(--shop-border)]" />

      {/* Store card — rounded-3xl with peach muted backdrop. */}
      <Card
        className="rounded-3xl border bg-white p-4 shadow-none"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-2xl">
            {store.logoUrl && <AvatarImage src={store.logoUrl} alt={store.name} />}
            <AvatarFallback className="rounded-2xl">
              {store.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-semibold"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: LIFESTYLE_DISPLAY_FONT,
              }}
            >
              {store.name}
            </div>
            <div
              className="text-xs"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Trusted by our community
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full border-[var(--shop-ink)]"
          >
            <Link href={storeHref(store.slug)}>ดูร้าน</Link>
          </Button>
        </div>
      </Card>

      {/* Soft trust strip — icon row with sage pictograms. */}
      <ul
        className="grid grid-cols-1 gap-3 pt-2 text-sm sm:grid-cols-3"
        style={{ color: 'var(--shop-ink)' }}
      >
        <li className="flex items-start gap-2.5">
          <Truck
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-accent)' }}
          />
          <div className="text-xs leading-snug">
            <div className="font-semibold" style={{ color: 'var(--shop-ink)' }}>
              ส่งฟรี ฿990+
            </div>
            <div style={{ color: 'var(--shop-ink-muted)' }}>1-3 วันทำการ</div>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-accent)' }}
          />
          <div className="text-xs leading-snug">
            <div className="font-semibold" style={{ color: 'var(--shop-ink)' }}>
              คืนได้ 7 วัน
            </div>
            <div style={{ color: 'var(--shop-ink-muted)' }}>ไม่พอใจ คืนเงิน</div>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <Leaf
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-accent)' }}
          />
          <div className="text-xs leading-snug">
            <div className="font-semibold" style={{ color: 'var(--shop-ink)' }}>
              คุณภาพรับประกัน
            </div>
            <div style={{ color: 'var(--shop-ink-muted)' }}>โดย Basketplace</div>
          </div>
        </li>
      </ul>
    </div>
  );
}

function BenefitRow({
  icon,
  title,
  tagline,
}: {
  icon: React.ReactNode;
  title: string;
  tagline: string;
}) {
  return (
    <li
      className="flex items-start gap-3 rounded-2xl border bg-[var(--shop-muted)] px-4 py-3"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      <div
        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: 'var(--shop-accent)' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div
          className="text-sm font-semibold"
          style={{
            color: 'var(--shop-ink)',
            fontFamily: LIFESTYLE_DISPLAY_FONT,
          }}
        >
          {title}
        </div>
        <div
          className="mt-0.5 text-xs"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          {tagline}
        </div>
      </div>
    </li>
  );
}
