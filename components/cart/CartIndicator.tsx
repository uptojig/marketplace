"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useEffect, useState } from "react";

export function CartIndicator() {
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link href="/cart" className="relative inline-flex items-center gap-1 hover:underline">
      <ShoppingCart className="h-4 w-4" />
      <span>Cart</span>
      {mounted && count > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
