'use client';

// product-detail-block — block-level rendering of a single product.
// Used by templates that route product detail through the block system
// rather than the dedicated /stores/[slug]/products/[id]/page.tsx.
//
// Caller injects the product via block.data:
//   { type: 'product-detail', variant: 'default', data: { product } }
//
// Cart wiring: uses lib/store/cart.ts useCart (the active storefront
// cart that ShopHeader / ShopAddButton / per-store /stores/[slug]/cart
// all share). Not lib/cart/store.ts useCartStore — that's the dead
// scaffold cart from the marketplace-templates port.

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Heart, Minus, Plus, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Product, Store } from '@/lib/templates/types';

function storeHref(slug: string): string {
  return `/stores/${slug}`;
}

function cartHref(slug: string): string {
  return `/stores/${slug}/cart`;
}

export function ProductDetailBlock({ block, store }: BlockProps) {
  const product = block.data?.product as Product | undefined;
  if (!product) return null;

  return (
    <div className="lg:p-6">
      <div className="lg:grid lg:grid-cols-[60%_40%] lg:gap-8">
        <Gallery product={product} />
        <InfoColumn product={product} store={store} />
      </div>
    </div>
  );
}

function Gallery({ product }: { product: Product }) {
  const [idx, setIdx] = useState(0);
  const images = product.images?.length ? product.images : [product.thumbnailUrl];

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
              key={i}
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

function InfoColumn({ product, store }: { product: Product; store: Store }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants?.[0]?.id ?? null,
  );
  const [added, setAdded] = useState(false);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const selectedVariant = product.variants?.find((v) => v.id === variantId);

  // CartLineDisplay shape from lib/store/cart.ts. The current type doesn't
  // carry variantId — variants share a productId in the cart and merge by
  // qty. Variant name is appended to title so the user still sees which
  // they picked. If we add variantId support to CartLineDisplay later,
  // include it here and switch the merge key in useCart.add accordingly.
  const buildCartLine = () => ({
    productId: product.id,
    title: selectedVariant ? `${product.title} (${selectedVariant.name})` : product.title,
    imageUrl: product.thumbnailUrl,
    priceTHB: product.price,
    storeSlug: store.slug,
    storeName: store.name,
  });

  const handleAdd = () => {
    add(buildCartLine(), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    add(buildCartLine(), qty);
    router.push(cartHref(store.slug));
  };

  return (
    <div className="space-y-4 p-4 lg:p-0">
      {product.badges && product.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {product.badges.includes('hot') && <Badge variant="destructive">🔥 Hot</Badge>}
          {product.badges.includes('new') && <Badge>New</Badge>}
          {product.badges.includes('limited') && <Badge variant="secondary">Limited</Badge>}
          {product.badges.includes('official') && (
            <Badge className="bg-blue-600 hover:bg-blue-600">Official</Badge>
          )}
        </div>
      )}

      <h1 className="text-xl font-semibold leading-tight lg:text-2xl">{product.title}</h1>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
        </div>
        <span>·</span>
        <Link href="#reviews" className="hover:underline">
          {product.reviewCount.toLocaleString()} reviews
        </Link>
        <span>·</span>
        <span>{product.soldCount.toLocaleString()} sold</span>
      </div>

      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-red-600">
            ฿{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                ฿{product.originalPrice.toLocaleString()}
              </span>
              <Badge variant="destructive">−{discount}%</Badge>
            </>
          )}
        </div>
      </div>

      {product.variants && product.variants.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">
            Variant:{' '}
            <span className="text-muted-foreground">{selectedVariant?.name ?? '—'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => v.available && setVariantId(v.id)}
                disabled={!v.available}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm transition',
                  variantId === v.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:border-primary',
                  !v.available && 'cursor-not-allowed line-through opacity-50',
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Qty</span>
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
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-9 w-12 border-x text-center focus:outline-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQty(qty + 1)}
            disabled={!!product.stockLeft && qty >= product.stockLeft}
            className="h-9 w-9 rounded-l-none"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {product.stockLeft != null && product.stockLeft < 10 && (
          <span className="text-xs font-medium text-red-600">
            Only {product.stockLeft} left!
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="lg" className="flex-1" onClick={handleAdd}>
          {added ? (
            <>
              <Check className="mr-1 h-4 w-4" /> เพิ่มแล้ว
            </>
          ) : (
            'Add to cart'
          )}
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow}>
          Buy now
        </Button>
      </div>

      <Separator />

      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={store.branding.logoUrl} alt={store.name} />
            <AvatarFallback>{store.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{store.name}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {store.rating.toFixed(1)} · {(store.followers / 1000).toFixed(1)}k followers
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={storeHref(store.slug)}>View shop</Link>
          </Button>
        </div>
      </Card>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span>Free shipping over ฿500</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span>Anypay buyer protection</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          <span>7-day return guarantee</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 font-semibold">Description</h3>
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {product.description ?? 'No description provided.'}
        </p>
      </div>

      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Specifications</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {Object.entries(product.attributes).map(([k, v]) => (
                <tr key={k}>
                  <td className="py-2 text-muted-foreground">{k}</td>
                  <td className="py-2 text-right font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
