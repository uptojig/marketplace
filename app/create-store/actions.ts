"use server";

import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { unstable_noStore as noStore } from "next/cache";
import {
  layoutSchema,
  blockSchemas,
  type BlockType,
  type PageData,
} from "@/lib/landing-schema";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";
import { aliexpressAdapter } from "@/lib/suppliers/aliexpress/adapter";

// ===== Unified Product type =====
type Product = {
  title: string;
  priceTHB: number;
  imageUrl?: string;
  source: string;
  categoryName?: string;
};

const LAYOUT_ARCHETYPES = [
  "เน้นเล่าเรื่อง (Storytelling): ปัญหา → ฟีเจอร์ → ขายของ",
  "เน้นขายด่วน (Urgency): สินค้า+โปรโมชัน → รีวิว → CTA",
  "เน้นพรีเมียม (Minimalist): บล็อกน้อย ภาพใหญ่ ข้อความดุดัน",
  "เน้นข้อมูลครบ (Catalog): สินค้าเยอะ ฟีเจอร์ครบ",
];

// ===== Selling Angles (มุมมองการขาย) =====
const SELLING_ANGLES = [
  "สายสุขภาพ/แก้ปัญหา: ขยี้ปัญหาเรื้อรังที่ลูกค้าเจอ เน้นว่าสินค้านี้ช่วยแก้ปัญหา หรือเซฟสุขภาพให้ดีขึ้นอย่างไร",
  "สายแฟชั่นไลฟ์สไตล์: เน้นดีไซน์สวย ภาพลักษณ์ดูดี ใช้แล้วเท่ปัง แมตช์ได้กับทุกลุค ไม่เน้นศัพท์เทคนิค",
  "สายคุ้มค่า (Budget): เน้นความถูกและคุ้ม! ของดีไม่จำเป็นต้องแพง อวดรีวิวว่าทนทาน ใช้ได้นาน คุ้มทุกบาท",
  "สายฮาร์ดคอร์ (Performance/Pro): ดุดันขั้นสุด เน้นสเปค ประสิทธิภาพ วัสดุพรีเมียม สำหรับคนที่ต้องการสิ่งที่ดีที่สุด"
];

const TH_EN_KEYWORDS: [string, string][] = [
  ["เคสมือถือ", "phone case"], ["เคสโทรศัพท์", "phone case"], ["เคส", "case cover"],
  ["เสื้อผ้า", "clothing"], ["เสื้อ", "shirt top"], ["กางเกง", "pants"],
  ["กระโปรง", "skirt"], ["ชุดเดรส", "dress"], ["รองเท้า", "shoes"],
  ["กระเป๋า", "bag"], ["แฟชั่น", "fashion"], ["เกาหลี", "korean fashion"],
  ["แว่นตา", "glasses sunglasses"], ["นาฬิกา", "watch"],
  ["เครื่องประดับ", "jewelry accessories"], ["สร้อย", "necklace"],
  ["แหวน", "ring"], ["ต่างหู", "earring"], ["GPS", "GPS tracker"],
  ["สัตว์เลี้ยง", "pet"], ["แมว", "cat"], ["สุนัข", "dog"],
  ["หูฟัง", "earphone headphone"], ["ลำโพง", "speaker bluetooth"],
  ["ที่ชาร์จ", "charger"], ["สายชาร์จ", "charging cable"],
  ["แบตเตอรี่", "power bank battery"], ["มือถือ", "phone mobile"],
  ["โทรศัพท์", "phone"], ["คอมพิวเตอร์", "computer"], ["คีย์บอร์ด", "keyboard"],
  ["เมาส์", "mouse"], ["บ้าน", "home decor"], ["ของแต่งบ้าน", "home decoration"],
  ["โคมไฟ", "lamp light"], ["หมอน", "pillow"], ["ผ้าม่าน", "curtain"],
  ["ครัว", "kitchen"], ["เครื่องสำอาง", "cosmetics makeup"], ["สกินแคร์", "skincare"],
  ["ครีม", "cream"], ["ลิปสติก", "lipstick"], ["แปรงแต่งหน้า", "makeup brush"],
  ["กีฬา", "sports"], ["ออกกำลังกาย", "fitness gym"], ["โยคะ", "yoga"],
  ["ตกปลา", "fishing"], ["แคมป์", "camping"], ["ของเล่น", "toys"],
  ["เด็ก", "kids baby"], ["รถยนต์", "car accessories"], ["มอเตอร์ไซค์", "motorcycle"],
  ["ติดตาม", "tracker GPS"],
];

function extractSearchKeyword(brief: string): string {
  const hits: string[] = [];
  for (const [th, en] of TH_EN_KEYWORDS) {
    if (brief.includes(th)) hits.push(en);
  }
  const english = brief.match(/[a-zA-Z]{2,}/g);
  if (english) hits.push(...english);
  if (hits.length === 0) return "trending products";
  const unique = [...new Set(hits)].slice(0, 3);
  return unique.join(" ");
}

function formatProduct(p: Product, i: number): string {
  return [
    `${i}. [${p.source.toUpperCase()}] "${p.title}"`,
    `   ราคา: ฿${p.priceTHB.toLocaleString()}`,
    p.imageUrl ? `   รูป: ${p.imageUrl}` : null,
    p.categoryName ? `   หมวด: ${p.categoryName}` : null,
  ].filter(Boolean).join("\n");
}

// ===== Derive designFamily จาก keyword (ไม่พึ่ง AI) =====
function deriveDesignFamily(prompt: string): string {
  if (/สปอร์ต|วิ่ง|กีฬา|เร็ว|แรง|พลัง/.test(prompt)) return "F";
  if (/พรีเมียม|หรู|แพง|ทอง|เงินแท้|luxury/.test(prompt)) return "C";
  if (/เกาหลี|ผู้หญิง|สวย|น่ารัก|หวาน/.test(prompt)) return "B";
  if (/เกมมิ่ง|ไซเบอร์|neon|gaming/.test(prompt)) return "E";
  if (/ออร์แกนิค|ธรรมชาติ|สมุนไพร/.test(prompt)) return "G";
  if (/ผู้ชาย|ดิบ|อินดัส|หนัง/.test(prompt)) return "D";
  if (/flash|sale|ลด|โปร/.test(prompt)) return "I";
  return "A";
}

// ===== Fetch products from BOTH suppliers in parallel =====
async function fetchAllProducts(keyword: string): Promise<Product[]> {
  const results: Product[] = [];

  const fetchers: Promise<void>[] = [];

  if (process.env.CJ_API_KEY) {
    fetchers.push(
      cjAdapter.listCatalog({ search: keyword, pageSize: 6 })
        .then((r) => {
          for (const p of r.items) {
            results.push({
              title: p.title,
              priceTHB: p.priceTHB,
              imageUrl: p.imageUrl,
              source: "CJ",
              categoryName: (p.raw as any)?.categoryName,
            });
          }
          console.log(`[CJ] ✅ ${r.items.length} items`);
        })
        .catch((err) => console.error("[CJ] ❌", err)),
    );
  }

  if (process.env.ALIEXPRESS_APP_KEY) {
    fetchers.push(
      aliexpressAdapter.listCatalog({ search: keyword, pageSize: 6 })
        .then((r) => {
          for (const p of r.items) {
            results.push({
              title: p.title,
              priceTHB: p.priceTHB,
              imageUrl: p.imageUrl,
              source: "AliExpress",
            });
          }
          console.log(`[AE] ✅ ${r.items.length} items`);
        })
        .catch((err) => console.error("[AE] ❌", err)),
    );
  }

  await Promise.allSettled(fetchers);
  return results;
}

export async function generateStorefront(
  prompt: string,
): Promise<PageData & { _meta: Record<string, unknown> }> {
  noStore(); // สั่ง Next.js ว่า "ห้ามจำ! ให้เรียก AI ใหม่ทุกครั้ง"

  const archetype = LAYOUT_ARCHETYPES[Math.floor(Math.random() * LAYOUT_ARCHETYPES.length)];
  const randomAngle = SELLING_ANGLES[Math.floor(Math.random() * SELLING_ANGLES.length)];
  const searchKeyword = extractSearchKeyword(prompt);

  // ── ดึงสินค้าจากทั้ง CJ + AliExpress ขนานกัน ──
  const products = await fetchAllProducts(searchKeyword);

  let productContext = "";
  if (products.length > 0) {
    const list = products.map((p, i) => formatProduct(p, i + 1)).join("\n\n");
    productContext = `\n\nสินค้าจริงจาก Catalog (${products.length} ชิ้น) — ใช้ชื่อ ราคา รูปจากนี้เท่านั้น:\n${list}`;
  }

  // ══════════════════════════════════════════════════════
  // STEP 1: AI เป็น "สถาปนิก" — Schema จิ๋ว
  // ══════════════════════════════════════════════════════
  const { object: architecture } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: layoutSchema,
    temperature: 0.85,
    presencePenalty: 0.3,
    prompt: `คุณคือสถาปนิกออกแบบ Landing Page ออกแบบโครงสร้างเว็บให้เหมาะสมกับ: "${prompt}"

นี่คือชิ้นส่วน UI (Blocks) ทั้งหมดที่คุณมีในโกดัง กรุณาเลือกใช้ให้เหมาะสม:
- HeroBanner: ป้ายโฆษณาหลักด้านบนสุด (ควรมีเสมอ)
- ProductHero: โชว์รูปสินค้าขนาดใหญ่และรายละเอียด
- OfferGrid: ตารางเปรียบเทียบราคาสินค้าหรือโปรโมชัน
- Features: อธิบายสรรพคุณและข้อดีของสินค้า
- Testimonial: รีวิวจากลูกค้า เพิ่มความน่าเชื่อถือ
- FAQ: ตอบคำถามที่พบบ่อย
- Stats: ตัวเลขสถิติความน่าเชื่อถือ
- CTA: ปุ่มปิดการขาย กระตุ้นให้กดซื้อ (ควรอยู่ท้ายๆ)
- Footer: ส่วนท้ายเว็บ

กลยุทธ์โครงสร้างหน้า: "${archetype}"
มุมมองการขาย (Selling Angle): "${randomAngle}"

กฎพื้นฐาน: เลือกใช้แค่ 3-6 บล็อกที่คิดว่าจะทำยอดขายได้ดีที่สุด ห้ามเลือกเกินนี้!

กฎการจัดโครงสร้าง (CRITICAL RULES):
- ความไม่ซ้ำซ้อน: ห้ามใช้ "HeroBanner" และ "ProductHero" ในหน้าเดียวกัน (เลือกแค่อย่างใดอย่างหนึ่งเพื่อเปิดหัวเว็บ)
- การไหลลื่น: หลังจากเปิดหัวเว็บแล้ว ห้ามเอาบล็อกขายของ (OfferGrid) มาติดกันทันที ควรคั่นด้วยบล็อกเล่าเรื่อง เช่น Features, Testimonial หรือ FAQ ก่อนเสมอ`,
  });

  // ══════════════════════════════════════════════════════
  // STEP 2: Derive title + designFamily จาก Code Logic
  // ══════════════════════════════════════════════════════
  const derivedTitle = prompt.length > 50
    ? `${prompt.substring(0, 50)}...`
    : prompt;
  const derivedDesignFamily = deriveDesignFamily(prompt);

  // ══════════════════════════════════════════════════════
  // STEP 3: AI เป็น "Copywriter" — Promise.all ขนาน ทีละ Block
  // ══════════════════════════════════════════════════════
  const populatedBlocks = await Promise.all(
    architecture.blocks.map(async (blockType) => {
      const blockSchema = blockSchemas[blockType as BlockType];
      if (!blockSchema) return null;

      const { object: blockData } = await generateObject({
        model: anthropic("claude-sonnet-4-6"),
        schema: blockSchema,
        temperature: 0.85,
        presencePenalty: 0.3,
        prompt: `คุณคือนักเขียน Copywriter ระดับพระกาฬ หน้าที่ของคุณคือเขียนเนื้อหาภาษาไทยสำหรับบล็อก "${blockType}" 
สำหรับสินค้านี้: "${prompt}"

โครงสร้างหน้าเว็บนี้ออกแบบมาในสไตล์: "${archetype}" (จูนอารมณ์การเขียนให้เข้ากับสไตล์นี้)

🚨 กฎเหล็ก: คุณต้องเขียนคำโฆษณาและการจัดเรียงเนื้อหาโดยยึดมุมมองนี้เท่านั้น -> "${randomAngle}"
ห้ามใช้คำซ้ำซาก และให้คำนึงถึงบริบทของมุมมองนี้เป็นหลัก

กฎการเขียนเนื้อหา:
1. ห้ามใช้คำซ้ำซาก: หลีกเลี่ยงการใช้คำซ้ำๆ ในทุกบล็อก ให้หาคำไวพจน์ (Synonyms) หรืออธิบายเป็นความรู้สึกแทน
2. เล่าเรื่องตามบริบท: 
   - ถ้าเป็น Hero/ProductHero ให้เน้นฮุกความสนใจ
   - ถ้าเป็น Features ให้พูดถึงปัญหาและวิธีแก้ (Pain point -> Solution)
   - ถ้าเป็น Testimonial ให้เขียนภาษาพูดที่เป็นธรรมชาติ ไม่เหมือนหุ่นยนต์อวยสินค้า
3. ความยาว: เขียนให้กระชับ อ่านง่าย และทรงพลัง
4. กฎบังคับ: rating 4.6-4.8, ราคาบาท, รูปจาก CJ/AliExpress catalog หรือ Unsplash${productContext}`,
      });

      return { type: blockType as BlockType, props: blockData as Record<string, unknown> };
    }),
  );

  // ══════════════════════════════════════════════════════
  // STEP 4: ประกอบร่าง
  // ══════════════════════════════════════════════════════
  const blocks = populatedBlocks.filter(
    (b): b is { type: BlockType; props: Record<string, unknown> } => b !== null,
  );

  return {
    title: derivedTitle,
    description: `Landing page สำหรับ ${derivedTitle}`,
    designFamily: derivedDesignFamily,
    themeColor: architecture.themeColor,
    blocks,
    _meta: {
      archetype,
      productsUsed: { total: products.length, cj: products.filter(p => p.source === "CJ").length, aliexpress: products.filter(p => p.source === "AliExpress").length },
      searchKeyword,
      step1: architecture,
    },
  };
}
