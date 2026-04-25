"use client";

import { useCart } from "@/lib/store/cart";
import { useCartConfirmation } from "@/lib/store/cartConfirm";

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl?: string;
  storeName: string;
  storeSlug: string;
}

export function ShopAddButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add({
          productId: product.id,
          title: product.title,
          imageUrl: product.imageUrl,
          priceTHB: product.priceTHB,
          storeSlug: product.storeSlug,
          storeName: product.storeName,
        });
        showConfirm(product.title);
      }}
      className="rounded-full px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
      style={{ backgroundColor: "var(--shop-primary, #2563eb)" }}
    >
      + ใส่ตะกร้า
    </button>
  );
}
