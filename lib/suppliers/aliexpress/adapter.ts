import crypto from "crypto";
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

const AE_GATEWAY =
  process.env.ALIEXPRESS_API_BASE ?? "https://api-sg.aliexpress.com/sync";

const AE_USD_THB = () => parseFloat(process.env.ALIEXPRESS_USD_THB ?? process.env.CJ_USD_THB ?? "36");

const AE_CATEGORY_TH: Record<string, string> = {
  "Women's Clothing & Accessories": "เสื้อผ้าผู้หญิง",
  "Men's Clothing & Accessories": "เสื้อผ้าผู้ชาย",
  "Phones & Telecommunications": "โทรศัพท์ & โทรคมนาคม",
  "Computer & Office": "คอมพิวเตอร์ & สำนักงาน",
  "Consumer Electronics": "อิเล็กทรอนิกส์",
  "Jewelry & Accessories": "เครื่องประดับ",
  "Home & Garden": "บ้าน & สวน",
  "Bags & Shoes": "กระเป๋า & รองเท้า",
  "Toys & Hobbies": "ของเล่น & งานอดิเรก",
  "Outdoor Fun & Sports": "กีฬา & กลางแจ้ง",
  "Automobiles & Motorcycles": "รถยนต์ & มอเตอร์ไซค์",
  "Tools": "เครื่องมือ",
  "Beauty & Health": "ความงาม & สุขภาพ",
  "Mother & Kids": "แม่ & เด็ก",
  "Home Improvement": "ของแต่งบ้าน",
  "Lights & Lighting": "ไฟ & หลอดไฟ",
  "Watches": "นาฬิกา",
  "Apparel Accessories": "อุปกรณ์เสริมเสื้อผ้า",
  "Home Appliances": "เครื่องใช้ไฟฟ้า",
  "Hair Extensions & Wigs": "ผมต่อ & วิก",
  "Pet Products": "อุปกรณ์สัตว์เลี้ยง",
  "Furniture": "เฟอร์นิเจอร์",
  "Office & School Supplies": "อุปกรณ์สำนักงาน & โรงเรียน",
  "Security & Protection": "ระบบรักษาความปลอดภัย",
  "Sports & Entertainment": "กีฬา & บันเทิง",
  "Education & Office Supplies": "การศึกษา & อุปกรณ์สำนักงาน",
};

// ---------------------------------------------------------------------------
// HMAC-SHA256 request signing (Alibaba TOP SDK protocol)
// ---------------------------------------------------------------------------

function signRequest(
  params: Record<string, string>,
  appSecret: string,
): string {
  const sorted = Object.keys(params).sort();
  let baseStr = "";
  for (const k of sorted) {
    baseStr += k + params[k];
  }
  return crypto
    .createHmac("sha256", appSecret)
    .update(baseStr, "utf8")
    .digest("hex")
    .toUpperCase();
}

function getTimestamp(): string {
  // AliExpress expects GMT+8 formatted timestamp
  const now = new Date();
  const gmt8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const y = gmt8.getUTCFullYear();
  const M = String(gmt8.getUTCMonth() + 1).padStart(2, "0");
  const d = String(gmt8.getUTCDate()).padStart(2, "0");
  const h = String(gmt8.getUTCHours()).padStart(2, "0");
  const m = String(gmt8.getUTCMinutes()).padStart(2, "0");
  const s = String(gmt8.getUTCSeconds()).padStart(2, "0");
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
}

function getCredentials() {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  const accessToken = process.env.ALIEXPRESS_ACCESS_TOKEN;
  if (!appKey || !appSecret) {
    throw new Error("ALIEXPRESS_APP_KEY and ALIEXPRESS_APP_SECRET are required");
  }
  return { appKey, appSecret, accessToken };
}

// ---------------------------------------------------------------------------
// Generic AliExpress API caller
// ---------------------------------------------------------------------------

async function aeFetch<T>(
  method: string,
  serviceParams: Record<string, string> = {},
  opts: { needsSession?: boolean } = {},
): Promise<T> {
  const { appKey, appSecret, accessToken } = getCredentials();

  const publicParams: Record<string, string> = {
    app_key: appKey,
    method,
    timestamp: getTimestamp(),
    sign_method: "sha256",
    v: "2.0",
    format: "json",
  };
  if (opts.needsSession !== false && accessToken) {
    publicParams.session = accessToken;
  }

  const allParams = { ...publicParams, ...serviceParams };
  allParams.sign = signRequest(allParams, appSecret);

  const body = new URLSearchParams(allParams).toString();

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(AE_GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body,
    });
    const text = await res.text();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      lastErr = new Error(`AliExpress ${method}: non-JSON (${res.status}): ${text.slice(0, 300)}`);
      continue;
    }
    // Check for error_response
    if (parsed.error_response) {
      const err = parsed.error_response as Record<string, unknown>;
      const code = String(err.code ?? "");
      const msg = String(err.msg ?? err.sub_msg ?? "");
      // Rate limit: retry
      if (code === "7" || code === "11" || res.status === 429) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        lastErr = new Error(`AliExpress rate-limited (${code}): ${msg}`);
        continue;
      }
      throw new Error(`AliExpress ${method} error (${code}): ${msg}`);
    }
    return parsed as T;
  }
  throw lastErr instanceof Error ? lastErr : new Error(`AliExpress ${method} failed after retries`);
}

// ---------------------------------------------------------------------------
// Response type helpers
// ---------------------------------------------------------------------------

interface AEProductDetail {
  aliexpress_ds_product_get_response?: {
    result?: {
      ae_item_base_info_dto?: {
        product_id?: number;
        subject?: string;
        currency_code?: string;
        product_status_type?: string;
        detail?: string;
        mobile_detail?: string;
      };
      ae_item_sku_info_dtos?: {
        ae_item_sku_info_d_t_o?: Array<{
          id?: string;
          sku_price?: string;
          offer_sale_price?: string;
          sku_stock?: boolean;
          sku_attr?: string;
          ae_sku_property_dtos?: {
            ae_sku_property_d_t_o?: Array<{
              sku_property_id?: number;
              sku_property_name?: string;
              sku_property_value?: string;
              property_value_definition_name?: string;
              sku_image?: string;
            }>;
          };
        }>;
      };
      ae_multimedia_info_dto?: {
        ae_video_dtos?: unknown;
        image_urls?: string;
      };
    };
    rsp_code?: number;
    rsp_msg?: string;
  };
}

interface AECategoryList {
  aliexpress_ds_category_get_response?: {
    resp_result?: {
      result?: {
        total_result_count?: number;
        categories?: {
          category?: Array<{
            category_id?: number;
            category_name?: string;
            parent_category_id?: number;
          }>;
        };
      };
      resp_code?: number;
      resp_msg?: string;
    };
  };
}

interface AEFeedProducts {
  aliexpress_ds_recommend_feed_get_response?: {
    result?: {
      products?: {
        traffic_product_d_t_o?: Array<{
          product_id?: number;
          product_title?: string;
          product_main_image_url?: string;
          target_sale_price?: string;
          target_original_price?: string;
          sale_price?: string;
          original_price?: string;
          target_sale_price_currency?: string;
          second_level_category_id?: number;
          first_level_category_id?: number;
        }>;
      };
      current_page_no?: number;
      total_page_no?: number;
      current_record_count?: number;
      total_record_count?: number;
    };
  };
}

interface AEOrderCreate {
  aliexpress_ds_order_create_response?: {
    result?: {
      is_success?: boolean;
      order_list?: {
        number?: number[];
      };
    };
  };
}

interface AEOrderGet {
  aliexpress_ds_order_get_response?: {
    result?: {
      gmt_create?: string;
      order_status?: string;
      logistics_status?: string;
      logistics_info_list?: {
        ae_order_logistics_info?: Array<{
          logistics_no?: string;
          logistics_type?: string;
          logistics_service?: string;
        }>;
      };
    };
  };
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

function parseUsdPrice(raw: string | number | undefined): number {
  if (raw === undefined || raw === null) return 0;
  const s = String(raw).replace(/[^0-9.]/g, "");
  return parseFloat(s) || 0;
}

export const aliexpressAdapter: SupplierAdapter = {
  name: Supplier.ALIEXPRESS,

  async fetchProductByUrl(url: string): Promise<NormalizedProduct> {
    // Extract product ID from URL patterns like:
    //   https://www.aliexpress.com/item/123456789.html
    //   https://aliexpress.com/item/123456789.html
    //   https://www.aliexpress.us/item/123456789.html
    const match = url.match(/item\/(\d+)/);
    const pid = match ? match[1] : url.replace(/\D/g, "");
    if (!pid) throw new Error("Could not extract product ID from AliExpress URL");
    return this.fetchProductById(pid);
  },

  async fetchProductById(externalId: string): Promise<NormalizedProduct> {
    const data = await aeFetch<AEProductDetail>("aliexpress.ds.product.get", {
      product_id: externalId,
      target_currency: "USD",
      target_language: "en",
      ship_to_country: "TH",
    });

    const resp = data.aliexpress_ds_product_get_response;
    if (!resp?.result) {
      throw new Error(
        `AliExpress product ${externalId} not found (${resp?.rsp_code}: ${resp?.rsp_msg ?? "no result"})`,
      );
    }

    const base = resp.result.ae_item_base_info_dto;
    const skus = resp.result.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o ?? [];
    const images = resp.result.ae_multimedia_info_dto?.image_urls;

    // Find lowest price from SKUs
    let lowestUsd = Infinity;
    for (const sku of skus) {
      const p = parseUsdPrice(sku.offer_sale_price ?? sku.sku_price);
      if (p > 0 && p < lowestUsd) lowestUsd = p;
    }
    if (!isFinite(lowestUsd)) lowestUsd = 0;

    const imageUrl = typeof images === "string"
      ? images.split(";")[0]?.trim() || undefined
      : undefined;

    const fx = AE_USD_THB();
    return {
      externalProductId: String(base?.product_id ?? externalId),
      title: base?.subject ?? externalId,
      description: base?.detail ?? base?.mobile_detail ?? undefined,
      priceTHB: Math.round(lowestUsd * fx),
      imageUrl,
      raw: resp.result,
    };
  },

  async fetchVariants(externalProductId: string): Promise<NormalizedVariant[]> {
    const data = await aeFetch<AEProductDetail>("aliexpress.ds.product.get", {
      product_id: externalProductId,
      target_currency: "USD",
      target_language: "en",
      ship_to_country: "TH",
    });

    const skus =
      data.aliexpress_ds_product_get_response?.result?.ae_item_sku_info_dtos
        ?.ae_item_sku_info_d_t_o ?? [];

    const fx = AE_USD_THB();
    return skus.map((sku) => {
      const usd = parseUsdPrice(sku.offer_sale_price ?? sku.sku_price);
      const attributes: Record<string, string> = {};
      let imageUrl: string | undefined;

      const props = sku.ae_sku_property_dtos?.ae_sku_property_d_t_o ?? [];
      for (const prop of props) {
        const name = prop.sku_property_name ?? `Prop${prop.sku_property_id}`;
        attributes[name] =
          prop.property_value_definition_name ?? prop.sku_property_value ?? "";
        if (prop.sku_image && !imageUrl) imageUrl = prop.sku_image;
      }

      // Fallback: parse sku_attr string (e.g. "Color:Blue;Size:M")
      if (Object.keys(attributes).length === 0 && sku.sku_attr) {
        for (const pair of sku.sku_attr.split(";")) {
          const [k, v] = pair.split(":");
          if (k && v) attributes[k.trim()] = v.trim();
        }
      }

      return {
        externalVariantId: String(sku.id ?? ""),
        sku: undefined,
        attributes,
        priceTHB: Math.round(usd * fx),
        imageUrl,
        inventory: sku.sku_stock === false ? 0 : undefined,
      };
    });
  },

  async listCatalog(query: CatalogQuery): Promise<CatalogPage> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 20));

    const params: Record<string, string> = {
      page_no: String(page),
      page_size: String(pageSize),
      target_currency: "USD",
      target_language: "en",
      ship_to_country: "TH",
      sort: "SALE_PRICE_ASC",
      feed_name: process.env.ALIEXPRESS_FEED_NAME ?? "DS_NewArrivals",
    };
    if (query.search) params.search = query.search;
    if (query.category) params.category_id = query.category;
    if (query.search) params.feed_name = "DS_Home&Kitchen_bestsellers";

    const data = await aeFetch<AEFeedProducts>(
      "aliexpress.ds.recommend.feed.get",
      params,
    );

    const resp = data.aliexpress_ds_recommend_feed_get_response?.result;
    const rows = resp?.products?.traffic_product_d_t_o ?? [];

    const fx = AE_USD_THB();
    let items: NormalizedProduct[] = rows.map((r) => {
      const usd = parseUsdPrice(r.target_sale_price ?? r.sale_price);
      return {
        externalProductId: String(r.product_id ?? ""),
        title: r.product_title ?? "",
        priceTHB: Math.round(usd * fx),
        imageUrl: r.product_main_image_url,
        raw: r,
      };
    });

    if (typeof query.minPriceTHB === "number") {
      items = items.filter((p) => p.priceTHB >= query.minPriceTHB!);
    }
    if (typeof query.maxPriceTHB === "number") {
      items = items.filter((p) => p.priceTHB <= query.maxPriceTHB!);
    }

    const total = resp?.total_record_count ?? items.length;
    return {
      items,
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total,
    };
  },

  async categories(): Promise<SupplierCategory[]> {
    const data = await aeFetch<AECategoryList>(
      "aliexpress.ds.category.get",
      {},
      { needsSession: false },
    );

    const list =
      data.aliexpress_ds_category_get_response?.resp_result?.result?.categories?.category ?? [];

    // Return only top-level categories (no parent_category_id)
    return list
      .filter((c) => !c.parent_category_id)
      .map((c) => {
        const name = c.category_name ?? "Unknown";
        return {
          id: String(c.category_id ?? ""),
          name: AE_CATEGORY_TH[name] ?? name,
        };
      });
  },

  async placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    const logisticsAddress = JSON.stringify({
      contact_person: input.address.recipientName,
      mobile_no: input.address.phone,
      country: input.address.country,
      province: input.address.province,
      city: input.address.district ?? input.address.province,
      address: [input.address.line1, input.address.line2].filter(Boolean).join(", "),
      zip: input.address.postalCode,
    });

    const productItems = JSON.stringify(
      input.items.map((i) => ({
        product_id: i.externalProductId,
        product_count: i.qty,
      })),
    );

    const data = await aeFetch<AEOrderCreate>(
      "aliexpress.ds.order.create",
      {
        logistics_address: logisticsAddress,
        product_items: productItems,
        ds_remark: `Order ${input.internalOrderId}`,
      },
      { needsSession: true },
    );

    const resp = data.aliexpress_ds_order_create_response?.result;
    if (!resp?.is_success) {
      throw new Error("AliExpress order creation failed");
    }

    const orderId = resp.order_list?.number?.[0];
    return {
      externalOrderId: String(orderId ?? ""),
      status: "CREATED",
      raw: resp,
    };
  },

  async getTracking(externalOrderId: string): Promise<TrackingResult> {
    const data = await aeFetch<AEOrderGet>(
      "aliexpress.ds.order.get",
      { order_id: externalOrderId },
      { needsSession: true },
    );

    const resp = data.aliexpress_ds_order_get_response?.result;
    if (!resp) {
      throw new NotImplementedError("ALIEXPRESS", "tracking-data-missing");
    }

    const logisticsInfo =
      resp.logistics_info_list?.ae_order_logistics_info?.[0];

    return {
      externalOrderId,
      status: resp.order_status ?? resp.logistics_status ?? "UNKNOWN",
      trackingNumber: logisticsInfo?.logistics_no,
      raw: resp,
    };
  },

  async fetchInventory(externalVariantId: string): Promise<InventoryAtWarehouse[]> {
    // AliExpress doesn't expose per-warehouse inventory via the DS API.
    // We return stock status from the SKU data instead.
    // The variant ID here is the SKU id from ae_item_sku_info; to look it up
    // we'd need the product_id. Return a single "AliExpress" warehouse entry.
    return [
      {
        warehouseCode: "AE",
        warehouseName: "AliExpress",
        stock: -1, // -1 = unknown, check sku_stock boolean
      },
    ];
  },

  async calculateFreight(input: FreightInput): Promise<FreightOption[]> {
    // aliexpress.ds.freight.query — not available on all app tiers.
    // If the method exists on the account, use it; otherwise fall back gracefully.
    try {
      const params: Record<string, string> = {
        country_code: input.countryCode,
        send_goods_country_code: "CN",
        product_id: input.items[0]?.externalVariantId ?? "",
        product_num: String(input.items[0]?.qty ?? 1),
      };

      const data = await aeFetch<{
        aliexpress_ds_freight_query_response?: {
          result?: {
            freight_list?: {
              freight?: Array<{
                service_name?: string;
                freight_amount?: { amount?: string; currency_code?: string };
                estimated_delivery_time?: string;
              }>;
            };
          };
        };
      }>("aliexpress.logistics.ds.trackinginfo.query", params, { needsSession: true });

      const list =
        data.aliexpress_ds_freight_query_response?.result?.freight_list?.freight ?? [];
      const fx = AE_USD_THB();

      return list.map((f) => ({
        code: f.service_name ?? "standard",
        name: f.service_name ?? "Standard Shipping",
        priceTHB: Math.round(parseUsdPrice(f.freight_amount?.amount) * fx),
        eta: f.estimated_delivery_time,
      }));
    } catch {
      // Method not available — return empty
      return [];
    }
  },
};
