"use client";

import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  product,
}: {
  product: {
    id: string;
    title: string;
    priceTHB: number;
    imageUrl?: string;
    storeName: string;
    storeSlug: string;
  };
}) {
  const add = useCart((s) => s.add);
  return (
    <Button
      size="lg"
      onClick={() =>
        add({
          productId: product.id,
          title: product.title,
          priceTHB: product.priceTHB,
          imageUrl: product.imageUrl,
          storeName: product.storeName,
          storeSlug: product.storeSlug,
        })
      }
    >
      Add to cart
    </Button>
  );
}
