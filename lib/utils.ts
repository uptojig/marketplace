import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Thai Baht currency: ฿1,234.50.
 * Imported from many places (admin, cart, checkout, product detail) —
 * the export was missing and pages that imported it from `@/lib/utils`
 * were silently failing to compile.
 */
export function formatTHB(n: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(n);
}
