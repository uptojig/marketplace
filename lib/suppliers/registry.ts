import { Supplier } from "@prisma/client";
import { cjAdapter } from "./cj/adapter";
import { aliexpressAdapter } from "./aliexpress/adapter";
import { mockAdapter } from "./mock/adapter";
import type { SupplierAdapter } from "./types";

const adapters: Record<Supplier, SupplierAdapter> = {
  [Supplier.CJ]: cjAdapter,
  [Supplier.ALIEXPRESS]: aliexpressAdapter,
  [Supplier.MOCK]: mockAdapter,
};

export function getSupplier(name: Supplier): SupplierAdapter {
  return adapters[name];
}

export function getDefaultSupplier(): SupplierAdapter {
  const def = (process.env.DEFAULT_SUPPLIER ?? "MOCK").toUpperCase() as Supplier;
  return adapters[def] ?? mockAdapter;
}

export function detectSupplierFromUrl(url: string): Supplier {
  const u = url.toLowerCase();
  if (u.includes("aliexpress.")) return Supplier.ALIEXPRESS;
  if (u.includes("cjdropshipping.")) return Supplier.CJ;
  return Supplier.MOCK;
}
