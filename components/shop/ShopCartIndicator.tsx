"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/store/cart";

export function ShopCartIndicator({ storeSlug }: { storeSlug?: string } = {}) {
  const lines = useCart((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = storeSlug
    ? lines.filter((l) => l.storeSlug === storeSlug).reduce((n, l) => n + l.qty, 0)
    : lines.reduce((n, l) => n + l.qty, 0);

  if (!mounted || count === 0) return null;
  return (
    <span
      className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
      style={{ backgroundColor: "var(--shop-primary, #2563eb)" }}
    >
      {count}
    </span>
  );
}
