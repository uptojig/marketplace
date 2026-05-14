import type { Supplier } from "@prisma/client";

export interface NormalizedProduct {
  externalProductId: string;
  title: string;
  description?: string;
  priceTHB: number;
  imageUrl?: string;
  /** Secondary gallery images (cover excluded). Empty for legacy callers. */
  galleryUrls?: string[];
  /** Product weight in grams (parsed from supplier-string like "150g"). */
  weightGrams?: number;
  /** Origin country — ISO-2 (`"CN"`) when extractable, else raw label. */
  originCountry?: string;
  /** Feature bullets from supplier (CJ `productKeyAttribute`). */
  keyAttributes?: string[];
  /** Spec key/value pairs (CJ `productMaterials` / `productProperties`). */
  materials?: Record<string, string>;
  /** Supplier-hosted promo video URL (CJ `videoUrl` / `productVideoUrl`). */
  videoUrl?: string;
  /** HS / customs code (CJ `hsCode` / `customsCode`). */
  hsCode?: string;
  raw: unknown;
}

export interface PlaceOrderItem {
  externalProductId: string;
  qty: number;
}

export interface PlaceOrderAddress {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  subdistrict?: string;
  district?: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface PlaceOrderInput {
  internalOrderId: string;
  items: PlaceOrderItem[];
  address: PlaceOrderAddress;
}

export interface PlaceOrderResult {
  externalOrderId: string;
  status: string;
  raw: unknown;
}

export interface TrackingResult {
  externalOrderId: string;
  status: string;
  trackingNumber?: string;
  raw: unknown;
}

export interface CatalogQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  category?: string;
  minPriceTHB?: number;
  maxPriceTHB?: number;
}

export interface CatalogPage {
  items: NormalizedProduct[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface SupplierCategory {
  id: string;
  name: string;
  count?: number;
}

export interface NormalizedVariant {
  externalVariantId: string;
  sku?: string;
  attributes: Record<string, string>;
  /**
   * Split-out attribute labels — populated when the supplier exposes
   * them as discrete fields OR when `variantKey` is parseable. The
   * picker UI uses these to render per-axis rows (Color / Size /
   * Material) instead of a single chip per variant. `attributes` still
   * carries the same data for back-compat.
   */
  colorLabel?: string;
  sizeLabel?: string;
  materialLabel?: string;
  priceTHB: number;
  imageUrl?: string;
  inventory?: number;
}

export interface InventoryAtWarehouse {
  warehouseCode: string;
  warehouseName?: string;
  stock: number;
}

export interface FreightItem {
  externalVariantId: string;
  qty: number;
}

export interface FreightInput {
  countryCode: string;
  province?: string;
  items: FreightItem[];
}

export interface FreightOption {
  code: string;
  name: string;
  priceTHB: number;
  eta?: string;
}

export interface SupplierAdapter {
  name: Supplier;
  fetchProductByUrl(url: string): Promise<NormalizedProduct>;
  fetchProductById(externalId: string): Promise<NormalizedProduct>;
  listCatalog(query: CatalogQuery): Promise<CatalogPage>;
  categories(): Promise<SupplierCategory[]>;
  placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult>;
  getTracking(externalOrderId: string): Promise<TrackingResult>;
  fetchVariants?(externalProductId: string): Promise<NormalizedVariant[]>;
  fetchInventory?(externalVariantId: string): Promise<InventoryAtWarehouse[]>;
  calculateFreight?(input: FreightInput): Promise<FreightOption[]>;
}

export class NotImplementedError extends Error {
  constructor(supplier: string, op: string) {
    super(`${supplier} adapter: ${op} is not implemented yet`);
    this.name = "NotImplementedError";
  }
}
