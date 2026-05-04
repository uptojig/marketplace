/**
 * Landing-page agent invocation for Basketplace.
 *
 * Uses the standalone Claude Messages API with the same system prompt
 * and tool definitions as the /create-store flow, but pipes a different
 * prompt that pre-supplies the store's already-curated products.
 *
 * Architecture:
 *   POST /api/admin/stores/<id>/generate-landing
 *     ↓ (set status="generating", returns 202)
 *   void runLandingAgent(storeId, brief, themeHint)
 *     ↓ async, fire-and-forget
 *   - Read store + active products from DB
 *   - Compose enriched user prompt with product list
 *   - Call Claude Messages API with system prompt + generate_page_schema tool
 *   - Validate schema → Save blocks + status="ready" (or "failed" on error)
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import {
  AGENT_MODEL,
  SYSTEM_PROMPT,
  GENERATE_PAGE_SCHEMA_TOOL,
} from "@/lib/agent/config";

export class AgentNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY missing");
    this.name = "AgentNotConfiguredError";
  }
}

type Block = {
  blockType: string;
  content: Record<string, unknown>;
  tailwindClasses?: string;
};

type DesignFamily = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";

/** v12 multi-page schema from agent */
type GeneratedMultiPageSchema = {
  schemaVersion: "12";
  metadata: Record<string, unknown>;
  designFamily: DesignFamily;
  globalHeader: Record<string, unknown>;
  globalFooter: Record<string, unknown>;
  pages: Array<{
    slug: string;
    isHomepage?: boolean;
    metadata?: Record<string, unknown>;
    blocks: Block[];
  }>;
  reasoning: string;
};

/** v11 single-page schema (legacy compat) */
type GeneratedSinglePageSchema = {
  title: string;
  slug?: string;
  description?: string;
  designFamily?: DesignFamily;
  themeVariant?: "minimal" | "cute";
  metadata?: Record<string, unknown>;
  blocks: Block[];
  reasoning: string;
};

type GeneratedPageSchema = GeneratedMultiPageSchema | GeneratedSinglePageSchema;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AgentNotConfiguredError();
  return new Anthropic({ apiKey });
}

/** HTML shop schema from the new generate_shop_html tool */
type HtmlShopSchema = {
  type: "html";
  designFamily?: string;
  headerHtml: string;
  footerHtml: string;
  pages: Array<{ slug: string; isHomepage?: boolean; html: string }>;
  reasoning?: string;
};

function validateHtmlSchema(input: unknown):
  | { ok: true; schema: HtmlShopSchema }
  | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "input_must_be_object" };
  }
  // eslint-disable-next-line
  const s = input as any;

  if (typeof s.headerHtml !== "string" || s.headerHtml.length < 10) {
    return { ok: false, error: "headerHtml_required" };
  }
  if (typeof s.footerHtml !== "string" || s.footerHtml.length < 10) {
    return { ok: false, error: "footerHtml_required" };
  }
  if (!Array.isArray(s.pages) || s.pages.length < 1) {
    return { ok: false, error: "pages_required" };
  }
  for (let i = 0; i < s.pages.length; i++) {
    const p = s.pages[i];
    if (!p || typeof p.slug !== "string") {
      return { ok: false, error: `page_${i}_missing_slug` };
    }
    if (typeof p.html !== "string" || p.html.length < 10) {
      return { ok: false, error: `page_${i}_missing_html` };
    }
  }
  return {
    ok: true,
    schema: {
      type: "html",
      designFamily: typeof s.designFamily === "string" ? s.designFamily : "A",
      headerHtml: s.headerHtml,
      footerHtml: s.footerHtml,
      pages: s.pages,
      reasoning: typeof s.reasoning === "string" ? s.reasoning : undefined,
    },
  };
}

function composePrompt(args: {
  storeName: string;
  brief: string;
  themeHint?:
    | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
    | "minimal" | "cute";
  contactEmail?: string;
  products: Array<{
    externalProductId: string;
    title: string;
    titleTh: string | null;
    priceTHB: number;
    imageUrl: string | null;
    categoryName: string | null;
  }>;
}): string {
  const lines = [
    `Brief from operator: ${args.brief}`,
    ``,
    `Store name: ${args.storeName}`,
    args.contactEmail ? `Contact email: ${args.contactEmail}` : "",
    args.themeHint ? `Theme hint: prefer "${args.themeHint}".` : "",
    ``,
    `Products already curated for this store (${args.products.length} items). Use THESE — do NOT generate fake products. Build the page around the most visually striking items.`,
    ``,
  ].filter(Boolean);

  args.products.forEach((p, i) => {
    lines.push(
      `${i + 1}. id="${p.externalProductId}" — ${p.title}` +
        (p.titleTh ? ` (TH: ${p.titleTh})` : "") +
        ` — ฿${p.priceTHB}` +
        (p.categoryName ? ` — ${p.categoryName}` : "") +
        (p.imageUrl ? ` — image: ${p.imageUrl}` : ""),
    );
  });

  lines.push(
    ``,
    `Use these REAL products in the HTML — show their ACTUAL imageUrl, translate titles to Thai, show ฿ prices.`,
    `Each product card must link to: /products/{externalProductId}`,
    `Show product images with: <img src="{imageUrl}" alt="{Thai title}" class="..."/>`,
    `Contact email: ${args.contactEmail ?? "contact@readypay.co"}`,
  );

  return lines.join("\n");
}

/**
 * Call Claude Messages API directly with system prompt + tool.
 * Retries up to 3 times if schema validation fails.
 */
async function runAgentSession(prompt: string): Promise<HtmlShopSchema> {
  const client = getClient();
  const toolName = GENERATE_PAGE_SCHEMA_TOOL.name; // "generate_shop_html"

  type MessageParam = { role: "user" | "assistant"; content: string | Anthropic.ContentBlockParam[] };
  const messages: MessageParam[] = [
    { role: "user", content: prompt },
  ];

  for (let turn = 0; turn < 3; turn++) {
    console.log(`[landing-agent] turn=${turn} sending to Claude (model=${AGENT_MODEL})...`);
    const stream = client.messages.stream({
      model: AGENT_MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      tools: [GENERATE_PAGE_SCHEMA_TOOL],
      tool_choice: turn === 0 ? { type: "tool", name: toolName } : { type: "auto" },
      messages,
    });
    const response = await stream.finalMessage();
    console.log(`[landing-agent] turn=${turn} stop_reason=${response.stop_reason}`);

    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === toolName) {
        const input = block.input as Record<string, unknown>;
        const pageCount = Array.isArray(input.pages) ? input.pages.length : 0;
        console.log(`[landing-agent] got HTML: pages=${pageCount}`);
        const result = validateHtmlSchema(block.input);
        if (result.ok) {
          console.log(`[landing-agent] HTML schema valid ✅`);
          return result.schema;
        }
        console.log(`[landing-agent] invalid: ${result.error}`);

        messages.push({
          role: "assistant",
          content: response.content as Anthropic.ContentBlockParam[],
        });
        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify({ ok: false, error: result.error }),
              is_error: true,
            },
          ] as unknown as Anthropic.ContentBlockParam[],
        });
        break;
      }
    }

    const hasToolUse = response.content.some((b) => b.type === "tool_use");
    if (!hasToolUse) break;
  }

  throw new Error("agent_did_not_emit_schema");
}

/* ------------------------------------------------------------------ */
/*  Thai brief → English CJ search keyword                           */
/* ------------------------------------------------------------------ */

const TH_EN_KEYWORDS: [string, string][] = [
  ["เคสมือถือ", "phone case"],
  ["เคสโทรศัพท์", "phone case"],
  ["เคส", "case cover"],
  ["เสื้อผ้า", "clothing"],
  ["เสื้อ", "shirt top"],
  ["กางเกง", "pants"],
  ["กระโปรง", "skirt"],
  ["ชุดเดรส", "dress"],
  ["รองเท้า", "shoes"],
  ["กระเป๋า", "bag"],
  ["แฟชั่น", "fashion"],
  ["เกาหลี", "korean fashion"],
  ["แว่นตา", "glasses sunglasses"],
  ["นาฬิกา", "watch"],
  ["เครื่องประดับ", "jewelry accessories"],
  ["สร้อย", "necklace"],
  ["แหวน", "ring"],
  ["ต่างหู", "earring"],
  ["GPS", "GPS tracker"],
  ["สัตว์เลี้ยง", "pet"],
  ["แมว", "cat"],
  ["สุนัข", "dog"],
  ["หูฟัง", "earphone headphone"],
  ["ลำโพง", "speaker bluetooth"],
  ["ที่ชาร์จ", "charger"],
  ["สายชาร์จ", "charging cable"],
  ["แบตเตอรี่", "power bank battery"],
  ["มือถือ", "phone mobile"],
  ["โทรศัพท์", "phone"],
  ["คอมพิวเตอร์", "computer"],
  ["คีย์บอร์ด", "keyboard"],
  ["เมาส์", "mouse"],
  ["บ้าน", "home decor"],
  ["ของแต่งบ้าน", "home decoration"],
  ["โคมไฟ", "lamp light"],
  ["หมอน", "pillow"],
  ["ผ้าม่าน", "curtain"],
  ["ครัว", "kitchen"],
  ["เครื่องสำอาง", "cosmetics makeup"],
  ["สกินแคร์", "skincare"],
  ["ครีม", "cream"],
  ["ลิปสติก", "lipstick"],
  ["แปรงแต่งหน้า", "makeup brush"],
  ["กีฬา", "sports"],
  ["ออกกำลังกาย", "fitness gym"],
  ["โยคะ", "yoga"],
  ["ตกปลา", "fishing"],
  ["แคมป์", "camping"],
  ["ของเล่น", "toys"],
  ["เด็ก", "kids baby"],
  ["รถยนต์", "car accessories"],
  ["มอเตอร์ไซค์", "motorcycle"],
  ["ติดตาม", "tracker GPS"],
];

function thaiToEnglishSearch(brief: string): string {
  const hits: string[] = [];
  for (const [th, en] of TH_EN_KEYWORDS) {
    if (brief.includes(th)) hits.push(en);
  }
  const english = brief.match(/[a-zA-Z]{2,}/g);
  if (english) hits.push(...english);
  if (hits.length === 0) return "fashion accessories";
  const unique = [...new Set(hits)].slice(0, 3);
  return unique.join(" ");
}

/**
 * Public entry point — fire-and-forget from the API route.
 */
export async function runLandingAgent(args: {
  storeId: string;
  brief: string;
  themeHint?:
    | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
    | "minimal" | "cute";
}): Promise<void> {
  const store = await prisma.store.findUnique({
    where: { id: args.storeId },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      products: {
        where: { active: true },
        select: {
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

  type ProductForPrompt = {
    externalProductId: string;
    title: string;
    titleTh: string | null;
    priceTHB: number;
    imageUrl: string | null;
    categoryName: string | null;
  };

  let products: ProductForPrompt[] = store.products.map((p) => ({
    externalProductId: p.externalProductId,
    title: p.title,
    titleTh: p.titleTh,
    priceTHB: Number(p.priceTHB),
    imageUrl: p.imageUrl,
    categoryName: p.categoryName,
  }));
  console.log(`[landing-agent] store="${store.name}" db_products=${products.length} brief="${args.brief.slice(0, 50)}"`);

  if (products.length === 0) {
    console.log(`[landing-agent] 0 products in DB → searching CJ...`);
    try {
      const { cjAdapter } = await import("@/lib/suppliers/cj/adapter");
      const searchQuery = thaiToEnglishSearch(args.brief);
      console.log(`[landing-agent] CJ search: "${searchQuery}"`);
      const result = await cjAdapter.listCatalog({
        search: searchQuery,
        pageSize: 6,
      });
      products = result.items.map((p) => ({
        externalProductId: p.externalProductId,
        title: p.title,
        titleTh: null,
        priceTHB: p.priceTHB,
        imageUrl: p.imageUrl ?? null,
        categoryName: null,
      }));
      console.log(`[landing-agent] CJ returned ${products.length} products`);
    } catch (err) {
      console.error(`[landing-agent] CJ search failed:`, err);
    }
  }

  if (products.length === 0) {
    await prisma.store.update({
      where: { id: args.storeId },
      data: { landingStatus: "failed", landingError: "no_products" },
    }).catch(() => undefined);
    return;
  }

  const prompt = composePrompt({
    storeName: store.name,
    brief: args.brief,
    themeHint: args.themeHint,
    contactEmail: store.contactEmail ?? undefined,
    products,
  });

  try {
    const schema = await runAgentSession(prompt);

    // Save HTML schema to DB
    const { reasoning, ...schemaData } = schema;
    const homePage = schema.pages.find((p) => p.isHomepage) ?? schema.pages[0];
    await prisma.store.update({
      where: { id: args.storeId },
      data: {
        landingBlocks: schemaData as never,
        landingTitle: store.name,
        landingThemeVariant: schema.designFamily ?? "A",
        landingGeneratedAt: new Date(),
        landingStatus: "ready",
        landingError: null,
      },
    });
    console.log(`[landing-agent] saved HTML schema: ${schema.pages.length} pages ✅`);
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
