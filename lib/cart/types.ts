export interface CartItem {
  /** Client-generated UUID for this cart line */
  id: string;
  productId: string;
  variantId?: string;
  qty: number;
  /** Store ownership — drives multi-store grouping */
  storeId: string;
  // ---- Denormalized for display ----
  title: string;
  thumbnailUrl: string;
  price: number;
  originalPrice?: number;
  stockLeft?: number;
  variantName?: string;
  storeName: string;
  storeLogo?: string;
}
