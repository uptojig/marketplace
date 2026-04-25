import { Supplier } from "@prisma/client";
import type {
  CatalogPage,
  CatalogQuery,
  NormalizedProduct,
  PlaceOrderInput,
  PlaceOrderResult,
  SupplierAdapter,
  SupplierCategory,
  TrackingResult,
} from "../types";

interface MockCatalogEntry extends NormalizedProduct {
  categoryId: string;
}

const CATEGORY_LIST: SupplierCategory[] = [
  { id: "audio", name: "เครื่องเสียง & หูฟัง" },
  { id: "charging", name: "ที่ชาร์จ & สายชาร์จ" },
  { id: "wearables", name: "นาฬิกาอัจฉริยะ" },
  { id: "phone-accessories", name: "อุปกรณ์เสริมมือถือ" },
  { id: "home-living", name: "บ้าน & ของใช้ในบ้าน" },
  { id: "kitchen", name: "ของใช้ในครัว" },
  { id: "bags", name: "กระเป๋า" },
  { id: "fashion", name: "เสื้อผ้าแฟชั่น" },
  { id: "shoes", name: "รองเท้า" },
  { id: "pet", name: "อุปกรณ์สัตว์เลี้ยง" },
  { id: "fitness", name: "ออกกำลังกาย" },
  { id: "beauty", name: "ความงาม" },
];

const RAW: Array<[string, string, number, string]> = [
  ["MOCK-EAR-001", "หูฟังไร้สาย Pro (TWS, ตัดเสียงรบกวน)", 590, "audio"],
  ["MOCK-EAR-002", "หูฟังบลูทูธแบบเปิดหู", 690, "audio"],
  ["MOCK-EAR-003", "หูฟังครอบหูสไตล์สตูดิโอ", 1290, "audio"],
  ["MOCK-EAR-004", "หูฟังไร้สายมินิ True Wireless", 290, "audio"],
  ["MOCK-CHG-001", "ที่ชาร์จเร็ว 65W USB-C GaN", 390, "charging"],
  ["MOCK-CHG-002", "พาวเวอร์แบงก์ 20000mAh PD", 690, "charging"],
  ["MOCK-CHG-003", "ที่ชาร์จไร้สาย MagSafe 15W", 490, "charging"],
  ["MOCK-CBL-001", "สาย USB-C to Lightning 1 เมตร", 190, "charging"],
  ["MOCK-CBL-002", "สายชาร์จแม่เหล็ก 3-in-1", 220, "charging"],
  ["MOCK-WCH-001", "นาฬิกาอัจฉริยะ Lite วัดหัวใจ", 990, "wearables"],
  ["MOCK-WCH-002", "นาฬิกาอัจฉริยะ Outdoor GPS", 1490, "wearables"],
  ["MOCK-WCH-003", "นาฬิกาเด็ก GPS Tracker", 790, "wearables"],
  ["MOCK-PHN-001", "ฟิล์มกันแอบมองสำหรับมือถือ", 120, "phone-accessories"],
  ["MOCK-PHN-002", "กระเป๋าสตางค์ตั้งโทรศัพท์ MagSafe", 290, "phone-accessories"],
  ["MOCK-PHN-003", "ขาตั้งกล้องมือถือ + รีโมท", 250, "phone-accessories"],
  ["MOCK-PHN-004", "ไม้เซลฟี่บลูทูธ Pro", 380, "phone-accessories"],
  ["MOCK-LMP-001", "โคมไฟ Aurora Sunset Projector", 490, "home-living"],
  ["MOCK-LMP-002", "โคมไฟแคมป์ปิ้ง LED พกพา", 380, "home-living"],
  ["MOCK-HOM-001", "ออดประตูอัจฉริยะไร้สาย", 890, "home-living"],
  ["MOCK-HOM-002", "เครื่องดูดฝุ่นไร้สายมินิ", 1290, "home-living"],
  ["MOCK-HOM-003", "เครื่องกระจายน้ำมันหอมระเหย", 490, "home-living"],
  ["MOCK-HOM-004", "ปลั๊กอัจฉริยะ WiFi (แพ็ค 2)", 290, "home-living"],
  ["MOCK-KIT-001", "ชุดที่ลับมีดสแตนเลส", 290, "kitchen"],
  ["MOCK-KIT-002", "ชุดอุปกรณ์ทำอาหารซิลิโคน 8 ชิ้น", 350, "kitchen"],
  ["MOCK-KIT-003", "ที่บดเกลือพริกไทยไฟฟ้า", 590, "kitchen"],
  ["MOCK-BAG-001", "เป้กันขโมยเดินทาง 25L", 990, "bags"],
  ["MOCK-BAG-002", "กระเป๋าผ้าใบ Tote (สีเบจ)", 290, "bags"],
  ["MOCK-BAG-003", "กระเป๋าสะพายข้าง (สีดำ)", 490, "bags"],
  ["MOCK-BAG-004", "กระเป๋า Duffel พับได้ 40L", 690, "bags"],
  ["MOCK-FAS-001", "เสื้อผ้าลินินทรงโอเวอร์ไซส์", 490, "fashion"],
  ["MOCK-FAS-002", "เสื้อกั๊กถักสไตล์เกาหลี", 390, "fashion"],
  ["MOCK-FAS-003", "กางเกงขาบาน (สีครีม)", 690, "fashion"],
  ["MOCK-FAS-004", "เสื้อฮู้ดดี้ Fleece", 890, "fashion"],
  ["MOCK-SHO-001", "รองเท้าผ้าใบสีขาวมินิมอล", 1290, "shoes"],
  ["MOCK-SHO-002", "รองเท้าแตะ EVA", 290, "shoes"],
  ["MOCK-SHO-003", "รองเท้าวิ่งเมช", 1490, "shoes"],
  ["MOCK-PET-001", "ถ้วยอาหารสุนัขแบบสโลว์ฟีด", 250, "pet"],
  ["MOCK-PET-002", "แปรงทำความสะอาดแมวอัตโนมัติ", 320, "pet"],
  ["MOCK-PET-003", "สายจูงสุนัขแบบดึงเก็บได้ 5 เมตร", 390, "pet"],
  ["MOCK-FIT-001", "ชุดยางยืดออกกำลังกาย 5 เส้น", 290, "fitness"],
  ["MOCK-FIT-002", "เสื่อโยคะกันลื่น 6มม", 590, "fitness"],
  ["MOCK-FIT-003", "ดัมเบลปรับน้ำหนัก 2x5กก", 1490, "fitness"],
  ["MOCK-BTY-001", "ชุด Jade Roller + Gua Sha", 390, "beauty"],
  ["MOCK-BTY-002", "แปรงทำความสะอาดผิวหน้า", 590, "beauty"],
  ["MOCK-BTY-003", "เครื่องม้วนผม Pro", 890, "beauty"],
];

const CATALOG: MockCatalogEntry[] = RAW.map(([id, title, price, categoryId]) => ({
  externalProductId: id,
  title,
  description: `Mock catalog item — ${id}`,
  priceTHB: price,
  imageUrl: `https://picsum.photos/seed/${id}/400/400`,
  raw: { id, title, price, categoryId },
  categoryId,
}));

const STATUSES = ["AWAITING_FULFILLMENT", "PROCESSING", "SHIPPED", "DELIVERED"];

export const mockAdapter: SupplierAdapter & {
  categories(): Promise<SupplierCategory[]>;
} = {
  name: Supplier.MOCK,

  async fetchProductByUrl(url: string): Promise<NormalizedProduct> {
    const externalProductId = `MOCK-${Buffer.from(url).toString("base64").slice(0, 8)}`;
    return {
      externalProductId,
      title: `Imported product (${externalProductId})`,
      description: `Mock-imported from ${url}`,
      priceTHB: 499,
      imageUrl: `https://picsum.photos/seed/${externalProductId}/400/400`,
      raw: { url },
    };
  },

  async fetchProductById(externalId: string): Promise<NormalizedProduct> {
    const hit = CATALOG.find((p) => p.externalProductId === externalId);
    if (hit) return hit;
    return {
      externalProductId: externalId,
      title: `Mock product ${externalId}`,
      priceTHB: 499,
      imageUrl: `https://picsum.photos/seed/${externalId}/400/400`,
      raw: { externalId },
    };
  },

  async listCatalog(query: CatalogQuery): Promise<CatalogPage> {
    const search = (query.search ?? "").trim().toLowerCase();
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));

    let filtered: MockCatalogEntry[] = CATALOG;
    if (query.category) filtered = filtered.filter((p) => p.categoryId === query.category);
    if (typeof query.minPriceTHB === "number") {
      filtered = filtered.filter((p) => p.priceTHB >= query.minPriceTHB!);
    }
    if (typeof query.maxPriceTHB === "number") {
      filtered = filtered.filter((p) => p.priceTHB <= query.maxPriceTHB!);
    }
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.externalProductId.toLowerCase().includes(search),
      );
    }

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      items,
      page,
      pageSize,
      total: filtered.length,
      hasMore: start + items.length < filtered.length,
    };
  },

  async categories(): Promise<SupplierCategory[]> {
    const counts = new Map<string, number>();
    for (const p of CATALOG) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
    return CATEGORY_LIST.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
  },

  async placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    return {
      externalOrderId: `MOCK-ORD-${Date.now()}-${input.internalOrderId.slice(0, 6)}`,
      status: "AWAITING_FULFILLMENT",
      raw: { items: input.items, address: input.address },
    };
  },

  async getTracking(externalOrderId: string): Promise<TrackingResult> {
    const i = Math.floor(Math.random() * STATUSES.length);
    return {
      externalOrderId,
      status: STATUSES[i],
      trackingNumber: `MOCKTRK-${externalOrderId.slice(-6)}`,
      raw: {},
    };
  },
};
