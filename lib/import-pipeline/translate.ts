
import type { SupplierProduct } from '@/lib/import-sources/types';
import Anthropic from '@anthropic-ai/sdk';
import { AGENT_MODEL } from '@/lib/agent/config';

/**
 * Thai localization for supplier products.
 *
 * Real impl: Claude API via the @anthropic-ai/sdk. Model is the shared
 * Haiku 4.5 (lib/agent/config.AGENT_MODEL) — chosen for speed/cost on
 * batch translation tasks (~394 products per enrichment run).
 *
 * Pricing psychology (per skill):
 *   - Under ฿5,000: avoid round numbers, prefer ฿299/฿499/฿990
 *   - Markup: typically 2.5x-4x cost (we use 3x default)
 *   - costTHB = costUSD * 36 + shipping
 *
 * `translateProductCopy` exported separately because the enrichment
 * tool only needs title + description + a category hint (the rest of
 * `TranslatedProduct` — pricing, variants — applies to fresh imports,
 * not products that already live in the DB).
 */

export interface TranslatedProduct {
  sku: string;
  title: { th: string; en: string };
  description: { th: string; en: string };
  category: string;
  categorySlug: string;
  tags: string[];
  priceTHB: number;
  compareAtTHB: number;
  costTHB: number;
  stock: number;
  lowStockThreshold: number;
  images: Array<{ url: string; primary: boolean; alt: string }>;
  variants: Array<{
    color?: string;
    size?: string;
    material?: string;
    sku: string;
    stock: number;
  }>;
  specs: Record<string, string>;
}

const USD_TO_THB = 36;
const DEFAULT_MARKUP = 3.0;

// Color/material translation table (per skill: references/variant-naming.md)
const COLOR_TH: Record<string, string> = {
  black: 'ดำ',
  white: 'ขาว',
  red: 'แดง',
  blue: 'น้ำเงิน',
  navy: 'กรมท่า',
  green: 'เขียว',
  olive: 'เขียวมะกอก',
  yellow: 'เหลือง',
  pink: 'ชมพู',
  brown: 'น้ำตาล',
  beige: 'เบจ',
  gray: 'เทา',
  silver: 'เงิน',
  gold: 'ทอง',
  sand: 'ทราย',
  purple: 'ม่วง',
};

/**
 * Output of a single product copy translation call.
 *
 * `categoryNameTh` + `categorySlug` are PROPOSALS from the model. The
 * enrichment server action ultimately decides whether to assign the
 * product to an existing Category row (by slug-match) or create a new
 * one. Pure-translation callers (the legacy import pipeline below)
 * map them onto the in-memory `CATEGORY_MAP` instead.
 */
export interface TranslatedCopy {
  titleTh: string;
  descriptionTh: string;
  categoryNameTh: string;
  categorySlug: string;
  tags: string[];
}

export class TranslateNotConfiguredError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY missing');
    this.name = 'TranslateNotConfiguredError';
  }
}

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new TranslateNotConfiguredError();
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

const TRANSLATE_COPY_TOOL: Anthropic.Tool = {
  name: 'emit_thai_copy',
  description:
    'Return the Thai translation of a single dropshipping product. ' +
    'Output natural marketing copy suitable for a Thai e-commerce listing, ' +
    'not a literal word-for-word translation.',
  input_schema: {
    type: 'object',
    properties: {
      titleTh: {
        type: 'string',
        description:
          'Thai marketing-quality title. Concise, idiomatic. Keep brand names / model numbers in Latin script when they appear. Max 120 chars.',
      },
      descriptionTh: {
        type: 'string',
        description:
          'Thai description, 1-3 short paragraphs. Highlight features, materials, sizing. Drop filler like "high quality", "wholesale", "drop shipping". Max 1500 chars.',
      },
      categoryNameTh: {
        type: 'string',
        description:
          'Concise Thai category label (1-3 words) — what shoppers would expect to filter by, e.g. "เสื้อผ้าผู้หญิง", "หูฟัง", "ของใช้ในครัว".',
      },
      categorySlug: {
        type: 'string',
        description:
          'Lowercase ASCII URL slug for the category — a-z/0-9/hyphen only, e.g. "women-fashion", "earbuds", "kitchenware".',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Up to 6 short Thai tags useful for search. Stay product-relevant; no marketing fluff.',
      },
    },
    required: ['titleTh', 'descriptionTh', 'categoryNameTh', 'categorySlug', 'tags'],
  },
};

/**
 * System prompt for the translator. Sent with prompt caching so the
 * ~394-product batch only pays the prompt-build cost on the first
 * call — subsequent products in the run reuse the cached prefix.
 *
 * See: https://docs.claude.com/en/docs/build-with-claude/prompt-caching
 */
const TRANSLATE_SYSTEM_PROMPT = `You are translating dropshipping product copy from English to Thai for a Thai marketplace. Translate the title and description to natural, sellable Thai, and propose a Thai category label + ASCII URL slug.

Rules:
- Output Thai. Keep brand names, model numbers, and technical specs in Latin script.
- Sound like a real Thai product listing — not a literal translation. Drop filler ("high quality", "wholesale", "drop shipping", "factory direct").
- Title: <= 120 Thai characters, marketing-grade.
- Description: 1-3 short paragraphs, focused on features / materials / sizing that matter to a Thai shopper. <= 1500 chars.
- Category: pick a single concise Thai label a shopper would filter on (e.g. "เสื้อผ้าผู้หญิง", "หูฟัง", "ของใช้ในครัว"). Match the proposed slug to it.
- Slug: lowercase a-z/0-9 with hyphens; no Thai script, no other punctuation. Max 60 chars.
- Tags: <= 6 short Thai keywords. Skip generic marketing words.
- Never invent specs that aren't in the source.
- ALWAYS call the emit_thai_copy tool — do NOT reply with plain text.`;

function basicSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function cleanSlug(raw: string | undefined, fallback: string): string {
  const cleaned = basicSlug(raw ?? '');
  return cleaned || fallback || 'category';
}

/**
 * Call Claude Haiku 4.5 to translate one product's title + description
 * and propose a category. Throws on hard errors so the caller can
 * decide whether to retry or skip — we never silently return English.
 *
 * Uses prompt caching on the system prompt (the system block is the
 * largest static part of the request; with caching, the per-call cost
 * drops to roughly user-tokens + output-tokens after the first hit).
 */
export async function translateProductCopy(input: {
  title: string;
  description?: string | null;
  supplierCategories?: string[];
  /** Existing per-store category names — purely a hint, not a constraint. */
  storeCategoryHints?: string[];
}): Promise<TranslatedCopy> {
  const client = getClient();

  const userParts: string[] = [];
  userParts.push(`Title (English): ${input.title}`);
  if (input.description?.trim()) {
    // Bound the description so a wall-of-text supplier blurb doesn't
    // blow out the input-token budget. 4000 chars is enough to capture
    // every CJ description we've seen in spot-checks.
    userParts.push(`Description (English):\n${input.description.trim().slice(0, 4000)}`);
  }
  if (input.supplierCategories && input.supplierCategories.length > 0) {
    userParts.push(`Supplier categories: ${input.supplierCategories.join(' > ')}`);
  }
  if (input.storeCategoryHints && input.storeCategoryHints.length > 0) {
    userParts.push(
      `Existing store categories (prefer one of these if it fits, else propose new):\n${input.storeCategoryHints
        .map((c) => `  - ${c}`)
        .join('\n')}`,
    );
  }

  const response = await client.messages.create({
    model: AGENT_MODEL,
    max_tokens: 1500,
    system: [
      {
        type: 'text',
        text: TRANSLATE_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [TRANSLATE_COPY_TOOL],
    tool_choice: { type: 'tool', name: TRANSLATE_COPY_TOOL.name },
    messages: [{ role: 'user', content: userParts.join('\n\n') }],
  });

  for (const block of response.content) {
    if (block.type !== 'tool_use' || block.name !== TRANSLATE_COPY_TOOL.name) continue;
    const out = block.input as Partial<TranslatedCopy>;
    const titleTh = (out.titleTh ?? '').trim();
    const descriptionTh = (out.descriptionTh ?? '').trim();
    const categoryNameTh = (out.categoryNameTh ?? '').trim();
    const fallbackSlug = basicSlug(input.title) || 'product';
    const categorySlug = cleanSlug(out.categorySlug, fallbackSlug);
    const tags = Array.isArray(out.tags)
      ? out.tags.filter((t): t is string => typeof t === 'string').slice(0, 6)
      : [];
    if (!titleTh) {
      throw new Error('translator returned empty titleTh');
    }
    return {
      titleTh: titleTh.slice(0, 200),
      descriptionTh: descriptionTh.slice(0, 2000),
      categoryNameTh: categoryNameTh.slice(0, 80) || 'อื่นๆ',
      categorySlug,
      tags,
    };
  }

  throw new Error('translator did not call emit_thai_copy tool');
}

// Category mapping — used by the legacy `translateProduct` path (the
// supplier import pipeline). The enrichment tool ignores this and
// asks Claude to pick a Thai category directly per-product.
const CATEGORY_MAP: Array<{ keywords: string[]; th: string; slug: string }> = [
  { keywords: ['earbuds', 'headphones', 'audio'], th: 'เครื่องเสียง > หูฟัง', slug: 'electronics-audio' },
  { keywords: ['laptop stand', 'laptop'], th: 'อุปกรณ์คอมพิวเตอร์ > ฐานวางโน๊ตบุ๊ก', slug: 'computer-stands' },
  { keywords: ['water bottle', 'drinkware', 'tumbler'], th: 'ของใช้ในบ้าน > ขวดน้ำ', slug: 'home-drinkware' },
  { keywords: ['ring light', 'photo'], th: 'อุปกรณ์ถ่ายภาพ > ไฟ', slug: 'photo-lighting' },
  { keywords: ['phone holder', 'car mount'], th: 'อุปกรณ์รถยนต์ > ที่วางโทรศัพท์', slug: 'car-phone-mount' },
  { keywords: ['sweater', 'pullover', 'knit'], th: 'เสื้อผ้าผู้หญิง > เสื้อกันหนาว', slug: 'women-sweater' },
  { keywords: ['baking mat', 'bakeware'], th: 'ของใช้ในครัว > อุปกรณ์เบเกอรี่', slug: 'kitchen-bakeware' },
  { keywords: ['organizer', 'storage box', 'drawer'], th: 'ของใช้ในบ้าน > กล่องเก็บของ', slug: 'home-storage' },
];

export async function translateProduct(product: SupplierProduct): Promise<TranslatedProduct> {
  const enTitle = product.title;
  const enDesc = product.description ?? '';

  // Pull live Thai copy + category proposal from Claude. Fall back to
  // English + heuristic category if the API isn't configured or errors
  // — the legacy import pipeline shouldn't hard-fail on a translator
  // hiccup; it can still surface the row for the operator to fix up
  // manually after import.
  let thTitle = enTitle;
  let thDesc = enDesc;
  let cat: { th: string; slug: string } = mapCategory(enTitle, product.supplierCategories);
  let tags: string[] = product.supplierTags ?? [];

  try {
    const ai = await translateProductCopy({
      title: enTitle,
      description: enDesc,
      supplierCategories: product.supplierCategories,
    });
    thTitle = ai.titleTh;
    thDesc = ai.descriptionTh;
    cat = { th: ai.categoryNameTh, slug: ai.categorySlug };
    tags = ai.tags.length > 0 ? ai.tags : tags;
  } catch (err) {
    // Best-effort during import. The enrichment tool re-runs against
    // the persisted row later and will fail loudly there if needed.
    if (err instanceof TranslateNotConfiguredError) {
      // ANTHROPIC_API_KEY not set — silent fallback; this is expected
      // in local dev. Logs would be noise.
    } else {
      console.warn('[import-pipeline.translate] translateProductCopy failed, falling back to heuristic:', err);
    }
  }

  const costTHB = Math.round(product.costPrice * USD_TO_THB);
  const priceTHB = applyPricingPsychology(costTHB * DEFAULT_MARKUP);
  const compareAtTHB = applyPricingPsychology(priceTHB * 1.5);

  const variants = product.variants.map((v) => ({
    color: v.attributes.color ? COLOR_TH[v.attributes.color.toLowerCase()] ?? v.attributes.color : undefined,
    size: v.attributes.size,
    material: v.attributes.material,
    sku: generateSku(cat.slug, product.externalId, v.externalVariantId),
    stock: v.stock ?? 0,
  }));

  return {
    sku: generateSku(cat.slug, product.externalId),
    title: { th: thTitle, en: enTitle },
    description: { th: thDesc, en: enDesc },
    category: cat.th,
    categorySlug: cat.slug,
    tags,
    priceTHB,
    compareAtTHB,
    costTHB,
    stock: variants.reduce((s, v) => s + v.stock, 0) || 50,
    lowStockThreshold: 5,
    images: product.images.map((url, i) => ({ url, primary: i === 0, alt: thTitle })),
    variants,
    specs: {
      origin: product.shippingFrom ?? 'จีน',
      shipping: `จัดส่ง ${product.shippingDays?.min ?? 7}-${product.shippingDays?.max ?? 15} วัน`,
    },
  };
}

export async function translateBatch(products: SupplierProduct[]): Promise<TranslatedProduct[]> {
  // Bounded concurrency: hit Anthropic 5-at-a-time to amortize the
  // per-request HTTP overhead without blowing through token/min limits.
  const CONCURRENCY = 5;
  const out: TranslatedProduct[] = new Array(products.length);
  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const slice = products.slice(i, i + CONCURRENCY);
    const results = await Promise.all(slice.map(translateProduct));
    for (let j = 0; j < results.length; j++) out[i + j] = results[j];
  }
  return out;
}

// =============== Helpers ===============

function mapCategory(title: string, supplierCats?: string[]): { th: string; slug: string } {
  const haystack = `${title} ${(supplierCats ?? []).join(' ')}`.toLowerCase();
  for (const cat of CATEGORY_MAP) {
    if (cat.keywords.some((k) => haystack.includes(k))) {
      return { th: cat.th, slug: cat.slug };
    }
  }
  return { th: 'อื่นๆ', slug: 'other' };
}

/**
 * Apply Thai pricing psychology (per skill):
 *   - Under ฿100: round to 9 (89, 99)
 *   - ฿100-฿1000: end with 9 or 99 (199, 299, 499, 699, 990)
 *   - ฿1000-฿5000: end with 90 or 99 (1290, 1990, 2990, 4990)
 *   - Over ฿5000: round to nearest 100
 */
function applyPricingPsychology(raw: number): number {
  if (raw < 100) {
    return Math.floor(raw / 10) * 10 + 9;
  }
  if (raw < 1000) {
    const base = Math.floor(raw / 100) * 100;
    return base + 99;
  }
  if (raw < 5000) {
    const base = Math.floor(raw / 100) * 100;
    return base - 10 + 99; // e.g. 1290, 1490, 1990
  }
  return Math.round(raw / 100) * 100;
}

function generateSku(categorySlug: string, productId: string, variantId?: string): string {
  const catCode = categorySlug.split('-')[0].slice(0, 3).toUpperCase();
  const num = productId.replace(/[^0-9]/g, '').slice(-4) || '0000';
  const varCode = variantId ? `-${variantId.split('_').pop()?.toUpperCase().slice(0, 4)}` : '';
  return `${catCode}-${num}${varCode}`;
}
