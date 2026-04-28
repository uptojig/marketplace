import { Supplier } from "@prisma/client";
import {
  NotImplementedError,
  type CatalogPage,
  type CatalogQuery,
  type FreightInput,
  type FreightOption,
  type InventoryAtWarehouse,
  type NormalizedProduct,
  type NormalizedVariant,
  type PlaceOrderInput,
  type PlaceOrderResult,
  type SupplierAdapter,
  type SupplierCategory,
  type TrackingResult,
} from "../types";

const CJ_BASE = process.env.CJ_API_BASE ?? "https://developers.cjdropshipping.com/api2.0/v1";

const CJ_CATEGORY_TH: Record<string, string> = {
  "Women's Clothing": "เสื้อผ้าผู้หญิง",
  "Men's Clothing": "เสื้อผ้าผู้ชาย",
  "Pet Supplies": "อุปกรณ์สัตว์เลี้ยง",
  "Home, Garden & Furniture": "บ้าน สวน & เฟอร์นิเจอร์",
  "Health, Beauty & Hair": "สุขภาพ ความงาม & เส้นผม",
  "Jewelry & Watches": "เครื่องประดับ & นาฬิกา",
  "Bags & Shoes": "กระเป๋า & รองเท้า",
  "Toys, Kids & Babies": "ของเล่น เด็ก & ทารก",
  "Sports & Outdoors": "กีฬา & กลางแจ้ง",
  "Consumer Electronics": "อิเล็กทรอนิกส์",
  "Computers & Office": "คอมพิวเตอร์ & สำนักงาน",
  "Computer & Office": "คอมพิวเตอร์ & สำนักงาน",
  "Phones & Accessories": "มือถือ & อุปกรณ์เสริม",
  "Automobiles & Motorcycles": "รถยนต์ & มอเตอร์ไซค์",
  "Tools & Home Improvement": "เครื่องมือ & ของแต่งบ้าน",
  "Home Improvement": "เครื่องมือ & ของแต่งบ้าน",
  "Lights & Lighting": "ไฟ & หลอดไฟ",
  "Mobile Phones & Accessories": "มือถือ & อุปกรณ์เสริม",
  Watches: "นาฬิกา",
  Apparel: "เสื้อผ้า",
  "Underwear & Sleepwears": "ชุดชั้นใน & ชุดนอน",
  "Hair Extensions & Wigs": "ผมต่อ & วิก",
};

interface CJAuth {
  accessToken: string;
  expiresAt: number;
}

let cachedAuth: CJAuth | null = null;
let inflightAuth: Promise<string> | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedAuth && cachedAuth.expiresAt > Date.now() + 60_000) {
    return cachedAuth.accessToken;
  }
  if (inflightAuth) return inflightAuth;

  inflightAuth = (async () => {
    const apiKey = process.env.CJ_API_KEY;
    if (!apiKey) {
      throw new Error("CJ_API_KEY not configured (expected format: CJxxx@api@<hexkey>)");
    }

    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const text = await res.text();
      let parsed: {
        code?: number;
        message?: string;
        data?: { accessToken: string; accessTokenExpiryDate: string };
      } = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        lastErr = new Error(`CJ auth: non-JSON response (${res.status}): ${text.slice(0, 200)}`);
        continue;
      }
      if (res.status === 429 || parsed.code === 1600200) {
        await new Promise((r) => setTimeout(r, 1100 * (attempt + 1)));
        lastErr = new Error(`CJ auth rate-limited: ${parsed.message ?? "429"}`);
        continue;
      }
      if (!res.ok || !parsed.data) {
        const detail = parsed.message ?? text.slice(0, 200);
        throw new Error(
          `CJ auth failed (status=${res.status}, code=${parsed.code ?? "?"}): ${detail}`,
        );
      }
      cachedAuth = {
        accessToken: parsed.data.accessToken,
        expiresAt: new Date(parsed.data.accessTokenExpiryDate).getTime(),
      };
      return cachedAuth.accessToken;
    }
    throw lastErr instanceof Error ? lastErr : new Error("CJ auth failed after retries");
  })().finally(() => {
    inflightAuth = null;
  });

  return inflightAuth;
}

function pickFirstImage(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const first = raw.find((x): x is string => typeof x === "string" && x.length > 0);
    return first;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          const first = arr.find((x): x is string => typeof x === "string" && x.length > 0);
          return first;
        }
      } catch {
        // fall through
      }
    }
    return trimmed || undefined;
  }
  return undefined;
}

async function cjFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${CJ_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "CJ-Access-Token": token,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CJ ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export const cjAdapter: SupplierAdapter = {
  name: Supplier.CJ,

  async fetchProductByUrl(url: string): Promise<NormalizedProduct> {
    const pid = url.split("/").filter(Boolean).pop() ?? url;
    return this.fetchProductById(pid);
  },

  async fetchProductById(externalId: string): Promise<NormalizedProduct> {
    const data = await cjFetch<{
      data?: {
        pid: string;
        productNameEn: string;
        productName?: string;
        sellPrice: string;
        productImage: string | string[];
        productImageSet?: string[] | string;
        description?: string;
        productWeight?: string;
        categoryName?: string;
      };
    }>(`/product/query?pid=${encodeURIComponent(externalId)}`);
    if (!data.data) throw new Error(`CJ product ${externalId} not found`);
    const sellPrice = String(data.data.sellPrice ?? "0");
    const usd = parseFloat(sellPrice.split("--")[0].trim()) || 0;
    const fx = parseFloat(process.env.CJ_USD_THB ?? "36");
    return {
      externalProductId: data.data.pid,
      title: data.data.productNameEn || data.data.productName || externalId,
      description: data.data.description,
      priceTHB: Math.round(usd * fx),
      imageUrl: pickFirstImage(data.data.productImage),
      raw: data.data,
    };
  },

  async fetchVariants(externalProductId: string): Promise<NormalizedVariant[]> {
    const data = await cjFetch<{
      data?: Array<{
        vid: string;
        variantSku?: string;
        variantNameEn?: string;
        variantKey?: string;
        variantImage?: string;
        variantSellPrice?: string | number;
        inventoryNum?: number;
      }>;
    }>(`/product/variant/query?pid=${encodeURIComponent(externalProductId)}`);

    const fx = parseFloat(process.env.CJ_USD_THB ?? "36");
    const list = data.data ?? [];

    return list.map((v) => {
      const usdRaw = String(v.variantSellPrice ?? "0");
      const usd = parseFloat(usdRaw.split("--")[0].trim()) || 0;

      const attributes: Record<string, string> = {};
      if (v.variantKey) {
        attributes["Variant"] = v.variantKey;
      } else if (v.variantNameEn) {
        attributes["Variant"] = v.variantNameEn;
      }

      return {
        externalVariantId: String(v.vid),
        sku: v.variantSku ?? undefined,
        attributes,
        priceTHB: Math.round(usd * fx),
        imageUrl: v.variantImage,
        inventory: typeof v.inventoryNum === "number" ? v.inventoryNum : undefined,
      };
    });
  },

  async listCatalog(query: CatalogQuery): Promise<CatalogPage> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 20));
    const params = new URLSearchParams();
    params.set("pageNum", String(page));
    params.set("pageSize", String(pageSize));
    if (query.search) params.set("productNameEn", query.search);
    if (query.category) params.set("categoryId", query.category);

    const data = await cjFetch<{
      data?: {
        list?: Array<{
          pid: string;
          productNameEn: string;
          sellPrice: string;
          productImage: string | string[];
          description?: string;
        }>;
        total?: number;
      };
    }>(`/product/list?${params.toString()}`);

    const fx = parseFloat(process.env.CJ_USD_THB ?? "36");
    const rows = data.data?.list ?? [];
    let items: NormalizedProduct[] = rows.map((r) => ({
      externalProductId: r.pid,
      title: r.productNameEn,
      description: r.description,
      priceTHB: Math.round(parseFloat(r.sellPrice) * fx),
      imageUrl: pickFirstImage(r.productImage),
      raw: r,
    }));
    if (typeof query.minPriceTHB === "number") {
      items = items.filter((p) => p.priceTHB >= query.minPriceTHB!);
    }
    if (typeof query.maxPriceTHB === "number") {
      items = items.filter((p) => p.priceTHB <= query.maxPriceTHB!);
    }
    const total = data.data?.total ?? items.length;
    return {
      items,
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total,
    };
  },

  async categories(): Promise<SupplierCategory[]> {
    const data = await cjFetch<{
      data?: Array<{
        categoryFirstId?: string;
        categoryFirstName?: string;
        categoryFirst?: string;
      }>;
    }>(`/product/getCategory`);
    const list = data.data ?? [];
    return list.map((c) => {
      const englishName = String(c.categoryFirstName ?? c.categoryFirst ?? "Unknown");
      return {
        id: String(c.categoryFirstId ?? ""),
        name: CJ_CATEGORY_TH[englishName] ?? englishName,
      };
    });
  },

  async placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    const body = {
      orderNumber: input.internalOrderId,
      shippingZip: input.address.postalCode,
      shippingCountryCode: input.address.country,
      shippingProvince: input.address.province,
      shippingCity: input.address.district ?? input.address.province,
      shippingAddress: [input.address.line1, input.address.line2].filter(Boolean).join(", "),
      shippingCustomerName: input.address.recipientName,
      shippingPhone: input.address.phone,
      remark: `Internal order ${input.internalOrderId}`,
      products: input.items.map((i) => ({ vid: i.externalProductId, quantity: i.qty })),
    };
    const data = await cjFetch<{ data?: { orderId: string; orderNum: string } }>(
      "/shopping/order/createOrder",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    if (!data.data) throw new Error("CJ createOrder returned no data");
    return {
      externalOrderId: data.data.orderId,
      status: "CREATED",
      raw: data.data,
    };
  },

  async fetchInventory(externalVariantId: string): Promise<InventoryAtWarehouse[]> {
    const data = await cjFetch<{
      data?: Array<{
        vid?: string;
        areaEn?: string;
        countryCode?: string;
        storageNum?: number;
        storageNumber?: number;
        warehouseName?: string;
        warehouseCode?: string;
      }>;
    }>(`/product/stock/queryByVid?vid=${encodeURIComponent(externalVariantId)}`);

    const list = data.data ?? [];
    return list.map((w) => ({
      warehouseCode: String(w.warehouseCode ?? w.countryCode ?? w.areaEn ?? "?"),
      warehouseName: w.warehouseName ?? w.areaEn ?? undefined,
      stock:
        typeof w.storageNum === "number"
          ? w.storageNum
          : typeof w.storageNumber === "number"
            ? w.storageNumber
            : 0,
    }));
  },

  async calculateFreight(input: FreightInput): Promise<FreightOption[]> {
    const fx = parseFloat(process.env.CJ_USD_THB ?? "36");
    const data = await cjFetch<{
      data?: Array<{
        logisticName?: string;
        logisticEnglishName?: string;
        logisticCode?: string;
        logisticPrice?: number | string;
        logisticAging?: string;
      }>;
    }>("/logistic/freightCalculate", {
      method: "POST",
      body: JSON.stringify({
        startCountryCode: "CN",
        endCountryCode: input.countryCode,
        province: input.province,
        products: input.items.map((i) => ({
          vid: i.externalVariantId,
          quantity: i.qty,
        })),
      }),
    });

    const list = data.data ?? [];
    return list.map((opt) => {
      const usd =
        typeof opt.logisticPrice === "number"
          ? opt.logisticPrice
          : parseFloat(String(opt.logisticPrice ?? "0")) || 0;
      return {
        code: String(opt.logisticCode ?? opt.logisticEnglishName ?? opt.logisticName ?? ""),
        name: String(opt.logisticEnglishName ?? opt.logisticName ?? "Standard"),
        priceTHB: Math.round(usd * fx),
        eta: opt.logisticAging,
      };
    });
  },

  async getTracking(externalOrderId: string): Promise<TrackingResult> {
    const data = await cjFetch<{ data?: { trackNumber?: string; orderStatus?: string } }>(
      `/logistic/trackingInfo?orderId=${encodeURIComponent(externalOrderId)}`,
    );
    if (!data.data) throw new NotImplementedError("CJ", "tracking-data-missing");
    return {
      externalOrderId,
      status: data.data.orderStatus ?? "UNKNOWN",
      trackingNumber: data.data.trackNumber,
      raw: data.data,
    };
  },
};
