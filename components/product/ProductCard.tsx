"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatTHB } from "@/lib/utils";

export interface ProductCardProduct {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl?: string;
  storeName: string;
  storeSlug: string;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const add = useCart((s) => s.add);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border">
      <Link href={`/stores/${product.storeSlug}/products/${product.id}`} className="aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/stores/${product.storeSlug}`} className="text-xs text-muted-foreground hover:underline">
          {product.storeName}
        </Link>
        <Link href={`/stores/${product.storeSlug}/products/${product.id}`} className="line-clamp-2 text-sm font-medium hover:underline">
          {product.title}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold">{formatTHB(product.priceTHB)}</span>
          <Button
            size="sm"
            onClick={() =>
              add({
                productId: product.id,
                title: product.title,
                imageUrl: product.imageUrl,
                priceTHB: product.priceTHB,
                storeSlug: product.storeSlug,
                storeName: product.storeName,
              })
            }
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
