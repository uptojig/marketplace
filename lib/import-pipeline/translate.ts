
import type { SupplierProduct } from '@/lib/import-sources/types';

/**
 * Thai localization for supplier products.
 *
 * Real impl: Claude API with the product-translator-ip-filter skill prompt.
 * Current: rule-based mock that demonstrates the output shape.
 *
 * Pricing psychology (per skill):
 *   - Under ฿5,000: avoid round numbers, prefer ฿299/฿499/฿990
 *   - Markup: typically 2.5x-4x cost (we use 3x default)
 *   - costTHB = costUSD * 36 + shipping
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

// Category mapping
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
  const thTitle = await translateTitle(enTitle, product.supplierCategories);

  const enDesc = product.description ?? '';
  const thDesc = await translateDescription(enDesc, enTitle);

  const cat = mapCategory(enTitle, product.supplierCategories);

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
    tags: product.supplierTags ?? [],
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
  return Promise.all(products.map(translateProduct));
}

// =============== Helpers ===============

/**
 * Stub: real impl calls Claude API.
 * For demo, applies simple keyword swaps that look passably Thai.
 */
async function translateTitle(en: string, categories?: string[]): Promise<string> {
  // TODO: real Claude API call:
  // const res = await anthropic.messages.create({
  //   model: 'claude-3-7-sonnet-20250219',
  //   system: SKILL_PROMPT,  // load product-translator-ip-filter skill
  //   messages: [{ role: 'user', content: JSON.stringify({ title: en, categories }) }],
  // });
  // return JSON.parse(res.content[0].text).title.th;

  // Mock: pattern-match common product types
  const lc = en.toLowerCase();
  if (lc.includes('earbuds')) return 'หูฟังบลูทูธไร้สาย ตัดเสียงรบกวน คุยโทรศัพท์ชัด';
  if (lc.includes('laptop stand')) return 'ที่วางโน๊ตบุ๊กพับได้ ปรับองศาได้ ระบายความร้อน';
  if (lc.includes('water bottle')) return 'กระติกน้ำสแตนเลส 750ml เก็บความเย็น 24 ชม.';
  if (lc.includes('ring light')) return 'ไฟริงไลท์ 10 นิ้ว พร้อมขาตั้ง ปรับแสง 3 โทน';
  if (lc.includes('phone holder') && lc.includes('car')) {
    return 'ที่วางโทรศัพท์ในรถ แม่เหล็กแรง ติดแน่น ไม่หล่น';
  }
  if (lc.includes('sweater') || lc.includes('pullover')) {
    return 'เสื้อสเวตเตอร์ถักไหมพรม สไตล์เกาหลี ทรงโอเวอร์ไซส์';
  }
  if (lc.includes('baking mat')) return 'แผ่นรองอบซิลิโคน กันติด ใช้ซ้ำได้ ปลอดสาร BPA (เซ็ต 2 ชิ้น)';
  if (lc.includes('organizer') || lc.includes('drawer')) {
    return 'กล่องเก็บของอะคริลิคใส วางซ้อนได้ จัดเครื่องสำอาง';
  }
  return en;
}

async function translateDescription(en: string, title: string): Promise<string> {
  // Mock — same TODO as title
  const lc = (title + ' ' + en).toLowerCase();
  if (lc.includes('earbuds')) {
    return 'หูฟังตัดเสียงรบกวน เสียงคมชัด เบสแน่น แบตอึด 35 ชม. กันน้ำ IPX5 ใช้สั่งงานผ่านสัมผัส ชาร์จไว USB-C';
  }
  if (lc.includes('water bottle')) {
    return 'กระติกน้ำสแตนเลสฉนวน 2 ชั้น เก็บเย็น 24 ชม. ร้อน 12 ชม. ฝาเกลียวกันรั่ว มีหูจับ พกพาสะดวก';
  }
  if (lc.includes('ring light')) {
    return 'ไฟริงไลท์ขนาด 10 นิ้ว ปรับแสงได้ 3 โทน 10 ระดับ มาพร้อมขาตั้ง 1.6 เมตร เหมาะกับไลฟ์สด ถ่ายคอนเทนต์ TikTok';
  }
  return en.slice(0, 200);
}

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
