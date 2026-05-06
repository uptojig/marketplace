import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  layoutSchema,
  blockSchemas,
  type BlockType,
} from "@/lib/landing-schema";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";
import { aliexpressAdapter } from "@/lib/suppliers/aliexpress/adapter";
import { translateProductTitlesForStore } from "@/lib/translate-titles";

export class AgentNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY missing");
    this.name = "AgentNotConfiguredError";
  }
}

// ===== Unified Product type =====
type Product = {
  id: string;
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

const SELLING_ANGLES = [
  "สายสุขภาพ/แก้ปัญหา: ขยี้ปัญหาเรื้อรังที่ลูกค้าเจอ เน้นว่าสินค้านี้ช่วยแก้ปัญหา หรือเซฟสุขภาพให้ดีขึ้นอย่างไร",
  "สายแฟชั่นไลฟ์สไตล์: เน้นดีไซน์สวย ภาพลักษณ์ดูดี ใช้แล้วเท่ปัง แมตช์ได้กับทุกลุค ไม่เน้นศัพท์เทคนิค",
  "สายคุ้มค่า (Budget): เน้นความถูกและคุ้ม! ของดีไม่จำเป็นต้องแพง อวดรีวิวว่าทนทาน ใช้ได้นาน คุ้มทุกบาท",
  "สายฮาร์ดคอร์ (Performance/Pro): ดุดันขั้นสุด เน้นสเปค ประสิทธิภาพ วัสดุพรีเมียม สำหรับคนที่ต้องการสิ่งที่ดีที่สุด"
];

const TH_EN_KEYWORDS: [string, string][] = [
  // Apparel & accessories
  ["เคสมือถือ", "phone case"], ["เสื้อผ้า", "clothing"], ["รองเท้า", "shoes"],
  ["ถุงเท้า", "socks"], ["ถุงน่อง", "stockings tights"],
  ["หมวก", "hat cap"], ["เข็มขัด", "belt"], ["ผ้าพันคอ", "scarf"],
  ["ชุดชั้นใน", "underwear lingerie"], ["ชุดนอน", "pajamas sleepwear"],
  ["กระเป๋า", "bag"], ["แฟชั่น", "fashion"], ["เกาหลี", "korean fashion"],
  ["แว่นตา", "glasses sunglasses"], ["เครื่องประดับ", "jewelry accessories"],
  // Tech / lifestyle
  ["สัตว์เลี้ยง", "pet"], ["หูฟัง", "earphone headphone"], ["ลำโพง", "speaker bluetooth"],
  ["แบตเตอรี่", "power bank battery"], ["คอมพิวเตอร์", "computer"], ["บ้าน", "home decor"],
  ["ครัว", "kitchen"], ["เครื่องสำอาง", "cosmetics makeup"], ["สกินแคร์", "skincare"],
  ["กีฬา", "sports"], ["ออกกำลังกาย", "fitness gym"], ["แคมป์", "camping"],
  ["ของเล่น", "toys"], ["เด็ก", "kids baby"], ["รถยนต์", "car accessories"],
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

function formatProduct(p: Product, i: number): string {
  return [
    `${i}. [ID: ${p.id}] "${p.title}"`,
    `   ราคา: ฿${p.priceTHB.toLocaleString()}`,
    p.imageUrl ? `   รูป: ${p.imageUrl}` : null,
  ].filter(Boolean).join("\n");
}

export async function runLandingAgent(args: {
  storeId: string;
  brief: string;
  themeHint?: string;
}): Promise<void> {
  const store = await prisma.store.findUnique({
    where: { id: args.storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      contactEmail: true,
      products: {
        where: { active: true },
        select: {
          id: true,
          externalProductId: true,
          title: true,
          titleTh: true,
          priceTHB: true,
          imageUrl: true,
          categoryName: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!store) {
    await prisma.store.update({
      where: { id: args.storeId },
      data: { landingStatus: "failed", landingError: "store_not_found" },
    }).catch(() => undefined);
    return;
  }

  let products: Product[] = store.products.map((p) => ({
    id: p.id,
    title: p.titleTh ?? p.title,
    priceTHB: Number(p.priceTHB),
    imageUrl: p.imageUrl ?? undefined,
    source: "StoreDB",
    categoryName: p.categoryName ?? undefined,
  }));

  console.log(`[landing-agent] store="${store.name}" db_products=${products.length} brief="${args.brief.slice(0, 50)}"`);

  // Fallback to searching CJ/AliExpress if store has no products
  if (products.length === 0) {
    console.log(`[landing-agent] 0 products in DB → searching CJ/AE...`);
    const searchKeyword = extractSearchKeyword(args.brief);
    
    const fetchers: Promise<void>[] = [];
    if (process.env.CJ_API_KEY) {
      fetchers.push(
        cjAdapter.listCatalog({ search: searchKeyword, pageSize: 6 })
          .then(async (r) => {
            console.log(`[landing-agent] CJ search "${searchKeyword}" returned ${r.items.length} items`);
            for (const p of r.items) {
              const newProd = await prisma.product.create({
                data: {
                  storeId: store.id,
                  externalProductId: p.externalProductId,
                  title: p.title,
                  titleTh: p.title,
                  description: "Imported by Agent",
                  descriptionTh: "นำเข้าโดย AI",
                  priceTHB: p.priceTHB,
                  imageUrl: p.imageUrl,
                  galleryUrls: [],
                  supplier: "CJ",
                  active: true,
                }
              });
              products.push({
                id: newProd.id,
                title: p.title,
                priceTHB: p.priceTHB,
                imageUrl: p.imageUrl ?? undefined,
                source: "CJ",
                categoryName: (p.raw as any)?.categoryName,
              });
            }
          })
          .catch((err) => console.error("[CJ] ❌ Error:", err)),
      );
    }

    if (process.env.ALIEXPRESS_APP_KEY) {
      fetchers.push(
        aliexpressAdapter.listCatalog({ search: searchKeyword, pageSize: 6 })
          .then(async (r) => {
            console.log(`[landing-agent] AE search "${searchKeyword}" returned ${r.items.length} items`);
            for (const p of r.items) {
              const newProd = await prisma.product.create({
                data: {
                  storeId: store.id,
                  externalProductId: p.externalProductId,
                  title: p.title,
                  titleTh: p.title,
                  description: "Imported by Agent",
                  descriptionTh: "นำเข้าโดย AI",
                  priceTHB: p.priceTHB,
                  imageUrl: p.imageUrl,
                  galleryUrls: [],
                  supplier: "ALIEXPRESS",
                  active: true,
                }
              });
              products.push({
                id: newProd.id,
                title: p.title,
                priceTHB: p.priceTHB,
                imageUrl: p.imageUrl ?? undefined,
                source: "AliExpress",
              });
            }
          })
          .catch((err) => console.error("[AE] ❌ Error:", err)),
      );
    }

    await Promise.allSettled(fetchers);
  }

  console.log(`[landing-agent] After CJ/AE fetch: products.length=${products.length}`);
  
  if (products.length === 0) {
    await prisma.store.update({
      where: { id: args.storeId },
      data: { landingStatus: "failed", landingError: "no_products" },
    }).catch(() => undefined);
    return;
  }

  try {
    const archetype = LAYOUT_ARCHETYPES[Math.floor(Math.random() * LAYOUT_ARCHETYPES.length)];
    const randomAngle = SELLING_ANGLES[Math.floor(Math.random() * SELLING_ANGLES.length)];

    let productContext = "";
    if (products.length > 0) {
      const list = products.map((p, i) => formatProduct(p, i + 1)).join("\n\n");
      productContext = `\n\nข้อมูลสินค้าในระบบ (${products.length} ชิ้น) — **ต้องใช้ ID จาก List นี้ไปกรอกใน OfferGrid เท่านั้น!**\n${list}`;
    }

    console.log(`[landing-agent] Manager: Orchestrating Architecture...`);
    
    // 🌟 Worker 1 (Manager/Architect): วางโครง + Chrome (Header/Footer)
    const { object: architecture } = await generateObject({
      model: anthropic("claude-sonnet-4-6"),
      schema: layoutSchema,
      temperature: 0.8,
      prompt: `คุณคือ Manager Architect (ผู้จัดการโปรเจกต์ทำเว็บ) 
หน้าที่ของคุณคือวางโครงสร้างเว็บ (Multi-page schema) สำหรับร้านค้า: "${store.name}" 
สินค้าหรือบรีฟ: "${args.brief}"

1. เลือก themeColor และ designFamily ที่เหมาะสมที่สุด
2. ออกแบบโลโก้ร้านเป็น SVG (ใส่ใน globalHeader.logo.svgCode) โดยให้เป็นภาพ Vector ที่ดูทันสมัย เรียบง่าย และเข้ากับบรีฟสินค้า
3. จัดการ globalHeader (ใส่โลโก้และเมนูนำทาง)
   **สำคัญมาก**: ในเมนูนำทาง (nav) ให้บังคับใส่ลิงก์เหล่านี้เพื่อให้ดูเป็นร้านค้าเต็มรูปแบบ (Multi-page):
   - "หน้าแรก" (href: "/")
   - "สินค้าทั้งหมด" (href: "/category")
   - "เกี่ยวกับเรา" (href: "/about")
   - "ติดต่อเรา" (href: "/contact")
3. จัดการ globalFooter (ข้อมูลติดต่อร้าน)
4. เลือกว่าจะใช้ blocks อะไรบ้าง สำหรับหน้าแรก (blocks), หน้าเกี่ยวกับเรา (aboutBlocks), และหน้าติดต่อเรา (contactBlocks)

กลยุทธ์โครงสร้างหน้า: "${archetype}"
ข้อห้าม: ห้ามใช้ "HeroBanner" คู่กับ "ProductHero" ในหน้าเดียวกัน!`,
    });

    console.log(`[landing-agent] Workers: Copywriting and Merchandising...`);
    
    // Helper to run workers for a list of blocks
    const populateBlocks = async (blockTypes: string[], pageContext: string) => {
      const populated = await Promise.all(
        blockTypes.map(async (blockType) => {
          const blockSchema = blockSchemas[blockType as BlockType];
          if (!blockSchema) return null;

          const { object: blockData } = await generateObject({
            model: anthropic("claude-sonnet-4-6"),
            schema: blockSchema,
            temperature: 0.85,
            prompt: `คุณคือนักเขียน Copywriter และ Merchandiser
กรุณาเขียนเนื้อหาภาษาไทยสำหรับบล็อก "${blockType}" สำหรับหน้า "${pageContext}" ให้สอดคล้องกับบรีฟ: "${args.brief}"

มุมมองการขาย: "${randomAngle}"

🚨 กฎเหล็ก:
- ถ้าเป็น OfferGrid หรือ ProductHero คุณต้องใช้สินค้าและ ID ตามที่ให้ไว้ด้านล่างนี้เท่านั้น! ห้ามแต่ง ID เองเด็ดขาด!
- ถ้าบล็อกไหนมีฟิลด์ svgCode ให้เขียน SVG Code แบบ vector ลายเส้นที่เข้ากับธีม (ห้ามใส่ markdown block \`\`\`svg)
- เขียนให้น่าสนใจ ไม่ใช้คำซ้ำซาก
${productContext}`,
          });

          return { type: blockType as BlockType, props: blockData as Record<string, unknown> };
        })
      );
      return populated.filter((b): b is { type: BlockType; props: Record<string, unknown> } => b !== null);
    };

    // 🌟 Worker 2 & 3 (Copywriter / Merchandiser): ลงรายละเอียดแต่ละ Block สำหรับแต่ละหน้า
    const homeBlocks = await populateBlocks(architecture.blocks, "หน้าแรก (Home)");
    const aboutBlocks = await populateBlocks(architecture.aboutBlocks || ["HeroBanner", "Features"], "เกี่ยวกับเรา (About Us)");
    const contactBlocks = await populateBlocks(architecture.contactBlocks || ["FAQ", "CTA"], "ติดต่อเรา (Contact)");

    const derivedTitle = args.brief.length > 50 ? `${args.brief.substring(0, 50)}...` : args.brief;

    // 🌟 Merge: รวมร่างเป็น V12 Multi-Page Schema
    const schemaData = {
      schemaVersion: "12",
      type: "block_registry_v1",
      title: derivedTitle,
      designFamily: architecture.designFamily,
      themeColor: architecture.themeColor,
      globalHeader: architecture.globalHeader,
      globalFooter: architecture.globalFooter,
      pages: [
        {
          slug: "home",
          isHomepage: true,
          blocks: homeBlocks
        },
        {
          slug: "about",
          isHomepage: false,
          blocks: aboutBlocks
        },
        {
          slug: "contact",
          isHomepage: false,
          blocks: contactBlocks
        }
      ],
      // (Backward compatibility)
      blocks: homeBlocks, 
      _meta: { archetype, randomAngle }
    };

    await prisma.store.update({
      where: { id: args.storeId },
      data: {
        landingBlocks: schemaData as never,
        landingTitle: derivedTitle,
        landingThemeVariant: architecture.designFamily,
        landingGeneratedAt: new Date(),
        landingStatus: "ready",
        landingError: null,
        // Update store color to match AI choice!
        primaryColor: architecture.themeColor,
      },
    });

    console.log(`[landing-agent] saved v12 multi-page schema! ✅`);

    // Best-effort: translate every product's title to Thai so category /
    // PDP / search / related grids read in Thai too. The agent already
    // bakes Thai titles into OfferGrid/ProductHero blocks for the
    // homepage (see landing-agent-managed.ts sync), but the local
    // pipeline doesn't write them back to Product.titleTh — without
    // this call those non-homepage routes fall back to English.
    // Failures here don't block the user-visible landing flow.
    try {
      const tr = await translateProductTitlesForStore(args.storeId);
      console.log(
        `[landing-agent] titleTh backfill: translated=${tr.translated} skipped=${tr.skipped} failed=${tr.failed}`,
      );
    } catch (err) {
      console.error(`[landing-agent] titleTh backfill failed:`, err);
    }
  } catch (err) {
    const msg =
      err instanceof AgentNotConfiguredError
        ? "agent_not_configured"
        : err instanceof Error
          ? err.message.slice(0, 500)
          : "unknown_error";
    await prisma.store
      .update({
        where: { id: args.storeId },
        data: { landingStatus: "failed", landingError: msg },
      })
      .catch(() => undefined);
  }
}
