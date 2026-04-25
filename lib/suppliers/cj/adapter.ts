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

const CJ_BASE = process.env.CJ_API_BASE ?? "https://developers.cjdropshipping.com/api2.0/v1";

// Best-effort Thai labels for CJ's top-level categories. Falls back to English when not mapped.
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
  "Watches": "นาฬิกา",
  "Apparel": "เสื้อผ้า",
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

    // Retry up to 3x with backoff to clear CJ's 1-req/sec auth throttle
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const text = await res.text();
      let parsed: { code?: number; message?: string; data?: { accessToken: string; accessTokenExpiryDate: string } } = {};
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
        throw new Error(`CJ auth failed (status=${res.status}, code=${parsed.code ?? "?"}): ${detail}`);
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
    // CJ exposes product detail by pid. Extract from URL if present, otherwise the caller
    // should normalize the URL to a pid first. For MVP we treat the trailing path segment as pid.
    const pid = url.split("/").filter(Boolean).pop() ?? url;
    return this.fetchProductById(pid);
  },

  async fetchProductById(externalId: string): Promise<NormalizedProduct> {
    const data = await cjFetch<{
      data?: { pid: string; productNameEn: string; sellPrice: string; productImage: string; description?: string };
    }>(`/product/query?pid=${encodeURIComponent(externalId)}`);
    if (!data.data) throw new Error(`CJ product ${externalId} not found`);
    const usd = parseFloat(data.data.sellPrice);
    // Crude USD→THB conversion fallback. Replace with a real FX source for production.
    const fx = parseFloat(process.env.CJ_USD_THB ?? "36");
    return {
      externalProductId: data.data.pid,
      title: data.data.productNameEn,
      description: data.data.description,
      priceTHB: Math.round(usd * fx),
      imageUrl: data.data.productImage,
      raw: data.data,
    };
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
          productImage: string;
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
      imageUrl: r.productImage,
      raw: r,
    }));
    // CJ list API doesn't filter by price — apply client-side as a best-effort filter
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
      data?: Array<{ categoryFirstId?: string; categoryFirstName?: string; categoryFirst?: string }>;
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
    const data = await cjFetch<{ data?: { orderId: string; orderNum: string } }>("/shopping/order/createOrder", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!data.data) throw new Error("CJ createOrder returned no data");
    return {
      externalOrderId: data.data.orderId,
      status: "CREATED",
      raw: data.data,
    };
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
