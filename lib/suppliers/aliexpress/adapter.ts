import { Supplier } from "@prisma/client";
import {
  NotImplementedError,
  type CatalogPage,
  type CatalogQuery,
  type NormalizedProduct,
  type PlaceOrderInput,
  type PlaceOrderResult,
  type SupplierAdapter,
  type SupplierCategory,
  type TrackingResult,
} from "../types";

// AliExpress uses Alibaba's TOP SDK with HMAC-SHA256 signing and approved app credentials.
// Stub adapter: shape is real, calls are gated behind a clear NotImplementedError until creds land.

export const aliexpressAdapter: SupplierAdapter = {
  name: Supplier.ALIEXPRESS,

  async fetchProductByUrl(_url: string): Promise<NormalizedProduct> {
    throw new NotImplementedError("ALIEXPRESS", "fetchProductByUrl");
  },
  async fetchProductById(_id: string): Promise<NormalizedProduct> {
    throw new NotImplementedError("ALIEXPRESS", "fetchProductById");
  },
  async listCatalog(_query: CatalogQuery): Promise<CatalogPage> {
    throw new NotImplementedError(
      "ALIEXPRESS",
      "listCatalog (requires ALIEXPRESS_ACCESS_TOKEN — complete the OAuth flow first)",
    );
  },
  async categories(): Promise<SupplierCategory[]> {
    throw new NotImplementedError(
      "ALIEXPRESS",
      "categories (requires ALIEXPRESS_ACCESS_TOKEN — complete the OAuth flow first)",
    );
  },
  async placeOrder(_input: PlaceOrderInput): Promise<PlaceOrderResult> {
    throw new NotImplementedError("ALIEXPRESS", "placeOrder");
  },
  async getTracking(_externalOrderId: string): Promise<TrackingResult> {
    throw new NotImplementedError("ALIEXPRESS", "getTracking");
  },
};
