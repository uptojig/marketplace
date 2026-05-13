'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart/store';

export function CartIconButton() {
  const count = useCartStore((s) => s.items.length);

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart" aria-label="Cart">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
