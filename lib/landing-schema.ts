import { z } from "zod";

// ===== Design Families (A-I) =====
export const DESIGN_FAMILY_INFO: Record<
  string,
  { name: string; nameTh: string; themeColor: string }
> = {
  A: { name: "Editorial Minimal Warm", nameTh: "มินิมอลอบอุ่น", themeColor: "#b8956a" },
  B: { name: "Editorial Soft Feminine", nameTh: "ซอฟต์เฟมินีน", themeColor: "#831843" },
  C: { name: "Luxury Heritage Gold", nameTh: "ลักชัวรี่เฮอริเทจ", themeColor: "#D4AF37" },
  D: { name: "Industrial Masculine", nameTh: "อินดัสเทรียลผู้ชาย", themeColor: "#0a0a0a" },
  E: { name: "Cyberpunk Gaming Neon", nameTh: "ไซเบอร์พังค์เกมมิ่ง", themeColor: "#a855f7" },
  F: { name: "Sport Editorial Action", nameTh: "สปอร์ตแอ็คชั่น", themeColor: "#1e3a8a" },
  G: { name: "Botanical Lifestyle Premium", nameTh: "โบทานิคัลไลฟ์สไตล์", themeColor: "#22c55e" },
  H: { name: "Cozy Niche Skeumorphism", nameTh: "โคซี่นิชเชอะ", themeColor: "#4A3B32" },
  I: { name: "Playful Mass Commerce", nameTh: "เพลย์ฟูลแมสคอมเมิร์ซ", themeColor: "#f472b6" },
};

// ===== Step 1 Schema: โครงกระดูก (เล็กมาก) =====
export const BLOCK_TYPES = [
  "HeroBanner", "ProductHero", "Features", "OfferGrid",
  "Testimonial", "FAQ", "CTA", "Stats",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const globalHeaderSchema = z.object({
  logo: z.object({
    imageUrl: z.string().optional(),
    altText: z.string().describe("ข้อความ Alt (มักเป็นชื่อร้าน)"),
    linkTo: z.string().default("/"),
    brandText: z.string().optional().describe("ชื่อร้านแบบ Text"),
    svgCode: z.string().optional().describe("โค้ด SVG แบบ Raw ของโลโก้ที่ออกแบบมาให้เข้ากับธีม (ห้ามใส่ markdown block)"),
    size: z.enum(["sm", "md", "lg"]).default("md"),
  }),
  nav: z.array(z.object({
    text: z.string(),
    href: z.string(),
  })).describe("เมนูนำทาง (เช่น หน้าแรก, สินค้า, ติดต่อเรา)"),
  showCart: z.boolean().default(true),
  showSearch: z.boolean().default(false),
  sticky: z.boolean().default(true),
});

export const globalFooterSchema = z.object({
  brand: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
  copyright: z.string(),
  columns: z.array(z.object({
    title: z.string(),
    links: z.array(z.object({
      text: z.string(),
      href: z.string(),
    }))
  })).describe("คอลัมน์เมนูด้านล่าง"),
});

export const layoutSchema = z.object({
  themeColor: z.string().describe("สีหลัก HEX Code ที่เหมาะกับสินค้า"),
  designFamily: z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I"]).describe("เลือก Design Family ที่เหมาะที่สุด"),
  globalHeader: globalHeaderSchema,
  globalFooter: globalFooterSchema,
  blocks: z.array(
    z.enum(["HeroBanner", "ProductHero", "Features", "OfferGrid", "Testimonial", "FAQ", "CTA", "Stats"])
  ).min(3).max(6).describe("เลือก 3-6 blocks เรียงลำดับสำหรับหน้าแรก (ห้ามมี Footer ในนี้แล้ว เพราะย้ายไป globalFooter)"),
  aboutBlocks: z.array(
    z.enum(["HeroBanner", "Features", "Testimonial", "FAQ", "CTA"])
  ).min(1).max(3).describe("บล็อกสำหรับหน้า เกี่ยวกับเรา (About Us)").optional(),
  contactBlocks: z.array(
    z.enum(["HeroBanner", "FAQ", "CTA"])
  ).min(1).max(2).describe("บล็อกสำหรับหน้า ติดต่อเรา (Contact)").optional(),
});

export type LayoutData = z.infer<typeof layoutSchema>;

// ===== Step 2 Schemas: เนื้อหนัง (ทีละ block) =====

export const blockSchemas: Record<BlockType, z.ZodType> = {
  HeroBanner: z.object({
    headline: z.string().describe("พาดหัวหลัก ดึงดูดความสนใจ"),
    subheadline: z.string().describe("คำบรรยายรอง"),
    ctaText: z.string().describe("ข้อความปุ่ม"),
    imageUrl: z.string().describe("URL รูปจาก Unsplash (ถ้าไม่มีให้ว่างไว้)"),
    svgCode: z.string().optional().describe("โค้ด SVG แบบ Raw ของภาพประกอบ (ห้ามใส่ markdown block)"),
    layoutStyle: z.enum(["text-left", "text-center", "split-image"]).describe("รูปแบบเลย์เอาต์"),
  }),

  ProductHero: z.object({
    headline: z.string().describe("ชื่อสินค้าหลัก"),
    subheadline: z.string().describe("จุดเด่นสินค้า"),
    price: z.number().describe("ราคาขาย บาท"),
    originalPrice: z.number().describe("ราคาเต็ม (ถ้าไม่ลดใส่เท่ากับ price)"),
    ctaText: z.string().describe("ข้อความปุ่ม"),
    imageUrl: z.string().describe("รูปสินค้า"),
    layoutStyle: z.enum(["split", "centered", "reverse"]).optional().describe("รูปแบบหน้าจอสินค้า"),
  }),

  Features: z.object({
    title: z.string().describe("หัวข้อ section"),
    layoutStyle: z.enum(["grid", "list", "cards"]).optional().describe("รูปแบบเลย์เอาต์ (grid, list, cards)"),
    items: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })).length(3).describe("จุดเด่น 3 ข้อ"),
  }),

  OfferGrid: z.object({
    title: z.string().describe("หัวข้อ"),
    layoutStyle: z.enum(["grid", "carousel", "bento"]).optional().describe("รูปแบบเลย์เอาต์ของสินค้าแนะนำ (bento จะมีขนาดใหญ่ชิ้นแรก)"),
    products: z.array(z.object({
      id: z.string().describe("ID สินค้าของจริงจาก Catalog เท่านั้น! (ห้ามแต่งเอง)"),
      name: z.string(),
      price: z.number(),
      imageUrl: z.string(),
      badge: z.string().optional(),
    })).length(3).describe("สินค้า 3 ชิ้น เลือกจาก Context เท่านั้น"),
  }),

  Testimonial: z.object({
    title: z.string().describe("หัวข้อ"),
    layoutStyle: z.enum(["grid", "carousel", "featured"]).optional().describe("รูปแบบเลย์เอาต์ (grid, carousel, featured)"),
    quotes: z.array(z.object({
      text: z.string(),
      author: z.string(),
      rating: z.number().describe("4.6-4.8 เท่านั้น"),
    })).length(3).describe("รีวิว 3 คน"),
  }),

  FAQ: z.object({
    title: z.string().describe("หัวข้อ"),
    items: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).length(4).describe("คำถาม 4 ข้อ"),
  }),

  CTA: z.object({
    headline: z.string().describe("หัวข้อปิดการขาย"),
    subheadline: z.string().describe("สร้าง urgency"),
    ctaText: z.string().describe("ข้อความปุ่ม"),
  }),

  Stats: z.object({
    items: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).length(4).describe("ตัวเลข 4 ตัว"),
  }),
};

// ===== Final PageData type =====
export type PageData = {
  title: string;
  description: string;
  designFamily: string;
  themeColor: string;
  blocks: Array<{ type: BlockType; props: Record<string, unknown> }>;
};
