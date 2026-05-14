'use client';

/**
 * TrustProductHero — PDP hero variant for the trust design family.
 * Rendered by app/stores/[slug]/products/[id]/page.tsx when
 * `isTrustStore(store)` is true (classic / official-brand /
 * premium-luxury templates, or landingThemeVariant "trust" / "C").
 *
 * Design intent (vs the default ProductDetailHero and the FB hero):
 *   - Square gallery on desktop (1/1, not 4/5) — heritage feels
 *     squared, not portrait-editorial.
 *   - Gold-rule frame around the image — `border border-[--shop-accent]`.
 *     Image bleeds edge-to-edge inside the rule (no inner white mat).
 *   - Left-aligned heritage eyebrow: "MAISON · EST. 19XX" in 0.28em
 *     caps tracking. Wider than FB's 0.22em.
 *   - Playfair serif headline at text-4xl+ via --font-trust-display.
 *   - Gold hairline rule UNDER the price block (1px gold accent line).
 *   - Charcoal-filled CTAs (rounded-sm — squared, NOT pills).
 *     Outline secondary CTA mirrors the same square radius.
 *   - Dense heritage info row: SKU + Made in + Est. badge under the
 *     CTA stack. Reads as label data, not flair.
 *   - Trust strip rendered as serif label-rule list, not italic FB list.
 *
 * Wiring matches ProductDetailHero / FashionBeautyProductHero exactly
 * so the page-level Prisma → props mapping stays identical — same
 * useCart hook, same Buy-Now → per-store cart routing.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  Check,
  Minus,
  Package,
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

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

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
 * Build a deterministic 6-char SKU from the product id so the same
 * product always shows the same "heritage" SKU even though Prisma
 * doesn't have a SKU column yet. NOT cryptographic — purely for
 * display. Looks like "BP-A19F4Z".
 *
 * TODO(schema): once Product.sku lands, prefer it over this hash.
 */
function heritageSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `BP-${hash}`;
}

/**
 * Stable pseudo-"Est." year derived from product id so the headline
 * eyebrow doesn't change on each render. Range 1948-2008 reads as
 * believable heritage without claiming pre-WWII.
 *
 * TODO(schema): once Store.foundedYear lands, prefer it over this.
 */
function heritageYear(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return 1948 + (hash % 60);
}

export function TrustProductHero({
  product,
  store,
}: {
  product: ProductDetailHeroProduct;
  store: ProductDetailHeroStore;
}) {
  return (
    <div className="lg:p-6">
      <div className="lg:grid lg:grid-cols-[50%_50%] lg:gap-16">
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
          className="rounded-sm border bg-[var(--shop-muted)]"
          style={{ borderColor: 'var(--shop-accent)' }}
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
      {/* Gold-rule frame — image bleeds edge-to-edge inside (no
          inner mat). Square aspect wrapper keeps the layout stable
          while object-contain preserves the natural ratio of the
          product photograph (luxury / artisanal goods are routinely
          shot non-square — we should not crop them). */}
      <div
        data-trust-frame="true"
        className="rounded-sm border bg-white"
        style={{ borderColor: 'var(--shop-accent)' }}
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
      {images.length > 1 && (
        <div className="mt-5 flex gap-3 overflow-x-auto px-1 pb-2 lg:px-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border-2 transition',
                i === idx
                  ? 'border-[var(--shop-accent)]'
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

  const sku = heritageSku(product.id);
  const estYear = heritageYear(product.id);

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
      {/* Heritage eyebrow — wider tracking than FB. Left-aligned per
          luxury / department-store convention. */}
      <p
        className="text-xs uppercase"
        style={{
          color: 'var(--shop-accent)',
          letterSpacing: '0.28em',
          fontWeight: 600,
        }}
      >
        {store.name.toUpperCase()} · EST. {estYear}
      </p>

      <h1
        className="text-4xl leading-[1.1] sm:text-5xl"
        style={{
          fontFamily: TRUST_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        {product.title}
      </h1>

      {/* Gold hairline below the headline — heritage signage feel. */}
      <div
        aria-hidden
        className="h-px w-16"
        style={{ background: 'var(--shop-accent)' }}
      />

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
              className="rounded-sm border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-ink)' }}
            >
              NEW ARRIVAL
            </Badge>
          )}
          {product.badges.includes('limited') && (
            <Badge
              variant="outline"
              className="rounded-sm border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-ink)' }}
            >
              LIMITED EDITION
            </Badge>
          )}
          {product.badges.includes('official') && (
            <Badge
              variant="outline"
              className="rounded-sm border-[var(--shop-accent)]"
              style={{ color: 'var(--shop-ink)' }}
            >
              OFFICIAL
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

      {/* Price block — navy ink, no rose. Gold hairline rule BELOW
          the price (heritage signage marker). */}
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span
            className="text-3xl sm:text-4xl"
            style={{
              color: 'var(--shop-ink)',
              fontFamily: TRUST_DISPLAY_FONT,
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
                className="rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  borderColor: 'var(--shop-accent)',
                  color: 'var(--shop-accent)',
                }}
              >
                Save {discount}%
              </span>
            </>
          )}
        </div>
        <div
          aria-hidden
          className="mt-4 h-px w-full"
          style={{ background: 'var(--shop-accent)' }}
        />
      </div>

      {product.variants.length > 0 && (
        <div className="space-y-3">
          <div
            className="text-xs uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.28em',
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
                    'rounded-sm border px-4 py-1.5 text-sm transition',
                    active
                      ? 'border-[var(--shop-ink)] bg-[var(--shop-ink)] text-white'
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
            letterSpacing: '0.28em',
            fontWeight: 600,
          }}
        >
          จำนวน
        </span>
        <div
          className="inline-flex h-9 items-center overflow-hidden rounded-sm border bg-white"
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
            className="h-9 w-12 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{ borderColor: 'var(--shop-border)' }}
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
        {stockLeft != null && stockLeft > 0 && stockLeft < 10 && (
          <span
            className="text-xs uppercase font-semibold"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.18em',
            }}
          >
            เหลือ {stockLeft} ชิ้น
          </span>
        )}
        {outOfStock && (
          <span className="text-xs font-medium text-[var(--shop-ink-muted)]">สินค้าหมด</span>
        )}
      </div>

      {/* CTA stack — squared rectangles. Charcoal-filled primary,
          outlined secondary (same square radius), wishlist heart in
          a square plate. NO pills here (luxury rule). */}
      <div className="flex gap-3 pt-2">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border bg-white"
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
          className="flex-1 rounded-sm border-[var(--shop-ink)] text-[var(--shop-ink)] hover:bg-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
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
          className="flex-1 rounded-sm text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--shop-primary)' }}
          onClick={handleBuyNow}
          disabled={!canAdd}
        >
          ซื้อเลย
        </Button>
      </div>

      {/* Dense heritage info row — SKU + Made in + Est. Reads as
          label data, distinct from FB which hides this entirely. */}
      <div
        data-trust-rule="true"
        className="grid grid-cols-3 gap-4 pt-5 text-xs"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        <div>
          <div
            className="uppercase"
            style={{ letterSpacing: '0.18em', fontWeight: 600 }}
          >
            SKU
          </div>
          <div
            className="mt-1 font-mono text-sm"
            style={{ color: 'var(--shop-ink)' }}
          >
            {sku}
          </div>
        </div>
        <div>
          <div
            className="uppercase"
            style={{ letterSpacing: '0.18em', fontWeight: 600 }}
          >
            MADE IN
          </div>
          <div
            className="mt-1 text-sm"
            style={{
              color: 'var(--shop-ink)',
              fontFamily: TRUST_DISPLAY_FONT,
              fontWeight: 500,
            }}
          >
            Thailand
          </div>
        </div>
        <div>
          <div
            className="uppercase"
            style={{ letterSpacing: '0.18em', fontWeight: 600 }}
          >
            HOUSE
          </div>
          <div
            className="mt-1 text-sm"
            style={{
              color: 'var(--shop-ink)',
              fontFamily: TRUST_DISPLAY_FONT,
              fontWeight: 500,
            }}
          >
            Est. {estYear}
          </div>
        </div>
      </div>

      <Separator className="bg-[var(--shop-border)]" />

      {/* Squared store card — no rounded glow. */}
      <Card
        className="rounded-sm border bg-white p-4 shadow-none"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-sm">
            {store.logoUrl && <AvatarImage src={store.logoUrl} alt={store.name} />}
            <AvatarFallback className="rounded-sm">
              {store.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-semibold"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TRUST_DISPLAY_FONT,
              }}
            >
              {store.name}
            </div>
            <div
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.22em',
                fontWeight: 600,
              }}
            >
              Maison · Heritage House
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-sm border-[var(--shop-ink)]"
          >
            <Link href={storeHref(store.slug)}>ดูร้าน</Link>
          </Button>
        </div>
      </Card>

      {/* Serif-label trust strip — heritage department-store feel.
          Two-line address card and concierge note replace FB's italic
          row. Squared icons, no pill. */}
      <ul
        data-trust-rule="true"
        className="space-y-3 pt-5 text-sm"
        style={{ color: 'var(--shop-ink)' }}
      >
        <li className="flex items-start gap-3">
          <Truck
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-accent)' }}
          />
          <div>
            <div
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.22em',
                fontWeight: 600,
              }}
            >
              Complimentary Shipping
            </div>
            <div className="text-sm">ส่งฟรีเมื่อสั่ง ฿990 ขึ้นไป</div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-accent)' }}
          />
          <div>
            <div
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.22em',
                fontWeight: 600,
              }}
            >
              Buyer Protection
            </div>
            <div className="text-sm">คุ้มครองผู้ซื้อโดย Basketplace</div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Award
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-accent)' }}
          />
          <div>
            <div
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.22em',
                fontWeight: 600,
              }}
            >
              Authenticity Guaranteed
            </div>
            <div className="text-sm">ของแท้ทุกชิ้น รับประกันโดยร้าน</div>
          </div>
        </li>
      </ul>
    </div>
  );
}
