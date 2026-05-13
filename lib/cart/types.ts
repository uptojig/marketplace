// Cart item shape — client + server agree on this. The denormalized
// display fields (title, thumbnailUrl, price, storeName) mean the cart
// can render without round-tripping to the DB. They're also re-validated
// server-side at order placement so a stale/edited client cart can't
// game prices.

export interface CartItem {
  /** Client-generated UUID for this cart line */
  id: string;
  productId: string;
  variantId?: string;
  qty: number;
  storeId: string;
  /** Slug used to build /stores/[slug] URLs. Optional for back-compat
   *  with serialized localStorage carts from before this field landed —
   *  new items added through addItem should always set it. */
  storeSlug?: string;
  // Denormalized for display
  title: string;
  thumbnailUrl: string;
  price: number;
  originalPrice?: number;
  stockLeft?: number;
  variantName?: string;
  storeName: string;
  storeLogo?: string;
}
