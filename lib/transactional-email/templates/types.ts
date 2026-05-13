// Shared prop shapes for transactional-email templates.
//
// Why minimal-shape DTOs instead of importing Prisma rows?
//   - Decouples templates from schema churn.
//   - Lets hooks shape and trim sensitive fields (no payment_method_id,
//     no raw shipping JSON beyond what's needed).
//   - Lets us preview templates without a live DB.

export interface EmailStoreDTO {
  slug: string;
  name: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  contactEmail?: string | null;
  customDomain?: string | null;
}

export interface EmailBuyerDTO {
  email: string;
  name?: string | null;
}

export interface EmailOrderItemDTO {
  title: string;
  qty: number;
  unitPriceTHB: number;
  thumbnailUrl?: string | null;
  variantName?: string | null;
}

export interface EmailOrderDTO {
  id: string;
  orderRef: string;
  totalTHB: number;
  subtotalTHB: number;
  shippingTHB: number;
  discountTHB: number;
  items: EmailOrderItemDTO[];
  estimatedDelivery?: Date | null;
}

export interface EmailCartItemDTO {
  title: string;
  qty: number;
  unitPriceTHB: number;
  thumbnailUrl?: string | null;
  productSlug?: string | null;
}

/** Resolves the public base url used for CTAs in emails. */
export function getEmailBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    "https://basketplace.co"
  ).replace(/\/$/, "");
}

/** Formats a THB amount in Thai locale, e.g. "฿1,234.50". */
export function formatTHB(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(n);
}
