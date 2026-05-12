import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Product } from '@/lib/templates/types';

export function CompareBlock({ block, store }: BlockProps) {
  if (block.variant !== 'side-by-side') return null;

  const products = store.products.slice(0, 2);
  if (products.length < 2) return null;

  // Inject demo specs if products have no attributes yet
  if (!products.some((p) => p.attributes && Object.keys(p.attributes).length > 0)) {
    products.forEach((p, i) => {
      p.attributes = {
        Battery: i === 0 ? '30 hr' : '8 hr',
        Weight: i === 0 ? '250g' : '50g',
        Wireless: 'Yes',
        ANC: i === 0 ? 'Yes' : 'No',
      };
    });
  }

  const keys = new Set<string>();
  for (const p of products) {
    Object.keys(p.attributes ?? {}).forEach((k) => keys.add(k));
  }

  return (
    <div className="p-3">
      <h2 className="mb-3 text-base font-semibold">Compare top picks</h2>
      <div className="grid grid-cols-2 gap-2">
        {products.map((p) => (
          <CompareCard key={p.id} product={p} keys={Array.from(keys)} />
        ))}
      </div>
    </div>
  );
}

function CompareCard({ product, keys }: { product: Product; keys: string[] }) {
  return (
    <Card>
      <CardHeader className="p-3">
        <div className="relative mb-2 aspect-square overflow-hidden rounded">
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
        <CardTitle className="line-clamp-2 text-sm">{product.title}</CardTitle>
        <div className="text-base font-semibold text-red-600">
          ฿{product.price.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-1 border-t p-3 pt-3">
        {keys.map((k) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{k}</span>
            <span className="max-w-[60%] truncate text-right font-medium">
              {product.attributes?.[k] ?? '—'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
