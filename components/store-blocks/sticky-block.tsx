'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlockProps } from '@/lib/templates/renderer';

export function StickyBlock({ block, store }: BlockProps) {
  if (block.variant !== 'buy-now') return null;

  const product = store.products[0];
  if (!product) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-red-600">
            ฿{product.price.toLocaleString()}
          </div>
          {product.originalPrice && (
            <div className="text-xs text-muted-foreground line-through">
              ฿{product.originalPrice.toLocaleString()}
            </div>
          )}
        </div>
        <Button variant="outline" size="lg" className="px-4">
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          Cart
        </Button>
        <Button size="lg" className="px-6">
          Buy now
        </Button>
      </div>
    </div>
  );
}
