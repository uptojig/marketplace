import Image from 'next/image';
import { Play, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import type { BlockProps } from '@/lib/templates/renderer';
import type { Product } from '@/lib/templates/types';

export function VideoFeedBlock({ block, store }: BlockProps) {
  // For demo, treat products as video tiles. Real impl: separate `videos` array on Store.
  const items = store.products;

  switch (block.variant) {
    case 'grid-2-portrait':
      return <Grid items={items} cols={2} />;
    case 'grid-3-portrait-desktop':
      return <Grid items={items} cols={3} />;
    default:
      return <Grid items={items} cols={2} />;
  }
}

function Grid({ items, cols }: { items: Product[]; cols: 2 | 3 }) {
  const colClass = cols === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div className={cn('grid gap-1 p-1', colClass)}>
      {items.map((p) => (
        <VideoTile key={p.id} product={p} />
      ))}
    </div>
  );
}

function VideoTile({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden rounded-none">
      <AspectRatio ratio={9 / 16} className="relative">
        <Image
          src={product.thumbnailUrl}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
        <Play className="absolute right-2 top-2 h-5 w-5 fill-white/80 text-white/80" />
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <h3 className="mb-1 line-clamp-2 text-xs font-medium">{product.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">฿{product.price.toLocaleString()}</span>
            <ShoppingBag className="h-3.5 w-3.5" />
          </div>
        </div>
      </AspectRatio>
    </Card>
  );
}
