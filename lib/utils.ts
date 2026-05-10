import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Thai Baht currency: ฿1,234.50.
 * Imported from many places (admin, cart, checkout, product detail).
 * Kept in @/lib/utils so the shadcn-studio installer's overwrites
 * of this file have to merge — not silently drop — the marketplace
 * helper. Re-add here if you ever see "formatTHB is not exported".
 */
export function formatTHB(n: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(n);
}
