"use client";

import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { useCartConfirmation } from "@/lib/store/cartConfirm";

export function AddToCartModal() {
  const open = useCartConfirmation((s) => s.open);
  const productTitle = useCartConfirmation((s) => s.productTitle);
  const hide = useCartConfirmation((s) => s.hide);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white">
            <Check className="h-4 w-4" strokeWidth={3} />
          </div>
        </div>
        <h3 className="text-base font-semibold">เพิ่มสินค้าลงตะกร้าแล้ว</h3>
        {productTitle && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{productTitle}</p>}
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/cart"
            onClick={hide}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#dc2626" }}
          >
            สั่งซื้อสินค้าในตะกร้า
          </Link>
          <button
            type="button"
            onClick={hide}
            className="rounded-full border px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            ดูสินค้าเพิ่มเติม
          </button>
        </div>
      </div>
    </div>
  );
}
