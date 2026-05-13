import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Product, Store } from '@/lib/templates/types';

export function ProductBlock({ block, store }: BlockProps) {
  const products = filterProducts(store.products, block.data);
  const showCondition = Boolean(block.data?.showCondition);
  const stockIndicators = Boolean(block.data?.stockIndicators);
  const minimal = Boolean(block.data?.minimal);

  switch (block.variant) {
    case 'grid-2':
      return (
        <GridProducts
          products={products}
          store={store}
          cols={2}
          showCondition={showCondition}
          stockIndicators={stockIndicators}
          minimal={minimal}
        />
      );
    case 'grid-3-dense':
      return <GridProducts products={products} store={store} cols={3} dense />;
    case 'grid-4-desktop':
      return <GridProducts products={products} store={store} cols={4} />;
    case 'list':
      return <ListProducts products={products} store={store} />;
    case 'list-with-specs':
      return <ListProducts products={products} store={store} showSpecs />;
    case 'editorial':
      return <EditorialProducts products={products} store={store} />;
    default:
      return <GridProducts products={products} store={store} cols={2} />;
  }
}

function filterProducts(all: Product[], data?: Record<string, unknown>): Product[] {
  // Real impl: filter by collection ID, source ('featured', 'recommended', 'from-live'), etc.
  void data;
  return all;
}

function formatNumber(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function productHref(store: Store, productId: string): string {
  return `/stores/${store.slug}/products/${productId}`;
}

function GridProducts({
  products,
  store,
  cols,
  dense = false,
  showCondition = false,
  stockIndicators = false,
  minimal = false,
}: {
  products: Product[];
  store: Store;
  cols: 2 | 3 | 4;
  dense?: boolean;
  showCondition?: boolean;
  stockIndicators?: boolean;
  minimal?: boolean;
}) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[cols];

  return (
    <div className={cn('grid gap-2 p-3', colClass)}>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          href={productHref(store, p.id)}
          dense={dense}
          showCondition={showCondition}
          stockIndicators={stockIndicators}
          minimal={minimal}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  href,
  dense = false,
  showCondition = false,
  stockIndicators = false,
  minimal = false,
}: {
  product: Product;
  href: string;
  dense?: boolean;
  showCondition?: boolean;
  stockIndicators?: boolean;
  minimal?: boolean;
}) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  return (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      <Card className="overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {discount && (
            <Badge variant="destructive" className="absolute left-1 top-1 px-1.5 py-0 text-[10px]">
              -{discount}%
            </Badge>
          )}
          {showCondition && product.conditionLabel && (
            <Badge variant="secondary" className="absolute bottom-1 right-1 text-[10px] capitalize">
              {product.conditionLabel.replace('-', ' ')}
            </Badge>
          )}
          {stockIndicators && product.stockLeft != null && product.stockLeft < 10 && (
            <Badge variant="destructive" className="absolute bottom-1 left-1 text-[10px]">
              {product.stockLeft} left
            </Badge>
          )}
        </div>
        <CardContent className={cn(dense ? 'p-1.5' : 'p-2')}>
          <h3 className={cn('line-clamp-2 font-medium', dense ? 'text-xs' : 'text-sm')}>
            {product.title}
          </h3>
          {!minimal && (
            <>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={cn('font-semibold text-red-600', dense ? 'text-sm' : 'text-base')}>
                  ฿{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ฿{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)} · {formatNumber(product.soldCount)} sold
              </div>
            </>
          )}
          {minimal && (
            <p className="mt-1 text-sm">฿{product.price.toLocaleString()}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function ListProducts({
  products,
  store,
  showSpecs = false,
}: {
  products: Product[];
  store: Store;
  showSpecs?: boolean;
}) {
  return (
    <div className="divide-y">
      {products.map((p) => (
        <Link
          key={p.id}
          href={productHref(store, p.id)}
          className="flex gap-3 p-3 hover:bg-accent"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded">
            <Image src={p.thumbnailUrl} alt={p.title} fill className="object-cover" sizes="80px" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-2 text-sm font-medium">{p.title}</h3>
            {showSpecs && p.attributes && (
              <div className="mt-1 space-x-2 text-xs text-muted-foreground">
                {Object.entries(p.attributes).slice(0, 3).map(([k, v]) => (
                  <span key={k}>
                    {k}: {v}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-semibold text-red-600">
                ฿{p.price.toLocaleString()}
              </span>
              {p.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ฿{p.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EditorialProducts({ products, store }: { products: Product[]; store: Store }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={productHref(store, p.id)}
          className="block space-y-2 transition-opacity hover:opacity-90"
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image src={p.thumbnailUrl} alt={p.title} fill className="object-cover" sizes="50vw" />
          </div>
          <div>
            <h3 className="line-clamp-2 text-sm tracking-wide">{p.title}</h3>
            <p className="mt-0.5 text-sm">฿{p.price.toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
