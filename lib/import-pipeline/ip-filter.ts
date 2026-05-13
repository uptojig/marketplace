'use server';

import type {
  AnnotatedSupplierProduct,
  IpCategory,
  IpVerdict,
  SupplierProduct,
} from '@/lib/import-sources/types';

/**
 * IP / Compliance filter.
 *
 * `quickIpScan` — fast keyword-based, runs on every search result inline.
 * `checkIp` — fuller validation (placeholder for LLM call) before commit.
 *
 * Real impl: replace quickIpScan with Claude API + product-translator-ip-filter
 * skill prompt. Current: deterministic keyword scan that catches the obvious.
 */

export interface IpCheckResult {
  verdict: IpVerdict;
  category?: IpCategory;
  reason?: string;
  flaggedTerms: string[];
}

interface RuleSet {
  category: IpCategory;
  verdict: IpVerdict;
  keywords: string[];
  tags?: string[]; // supplier-side tags that hard-trigger this category
}

const RULES: RuleSet[] = [
  {
    category: 'brand_counterfeit',
    verdict: 'REJECTED',
    keywords: [
      'lv', 'louis vuitton', 'gucci', 'hermes', 'prada', 'chanel', 'dior', 'fendi',
      'burberry', 'balenciaga', 'versace',
      'nike', 'adidas', 'puma', 'jordan', 'yeezy', 'new balance', 'converse',
      'apple iphone', 'airpods replica', 'samsung replica', 'xiaomi replica',
      'rolex', 'omega', 'cartier', 'patek philippe', 'audemars',
      'replica', 'super copy', 'aaa quality', '1:1 quality', 'mirror quality',
    ],
    tags: ['replica', 'counterfeit', '1to1'],
  },
  {
    category: 'copyrighted_character',
    verdict: 'REJECTED',
    keywords: [
      'disney', 'mickey mouse', 'minnie mouse', 'donald duck', 'frozen elsa', 'anna frozen',
      'marvel', 'spiderman', 'spider man', 'iron man', 'avengers', 'thor', 'hulk', 'captain america',
      'star wars', 'baby yoda', 'mandalorian', 'darth vader',
      'pokemon', 'pikachu', 'charizard',
      'hello kitty', 'sanrio', 'cinnamoroll', 'kuromi',
      'doraemon', 'naruto', 'one piece anime', 'dragon ball',
      'spongebob', 'paw patrol', 'peppa pig', 'bluey',
      'harry potter', 'lord of the rings',
    ],
    tags: ['licensed-character', 'official-licensed'],
  },
  {
    category: 'regulated_substance',
    verdict: 'REJECTED',
    keywords: [
      'vape', 'e-cig', 'e-cigarette', 'pod system', 'disposable vape', 'iqos',
      'kratom', 'cbd oil', 'thc', 'cannabis', 'marijuana',
      'weight loss pill', 'diet pill', 'erection',
    ],
    tags: ['vape', 'cbd', 'kratom'],
  },
  {
    category: 'weapon',
    verdict: 'REJECTED',
    keywords: [
      'combat knife', 'tactical knife', 'butterfly knife', 'switchblade', 'karambit',
      'stun gun', 'taser', 'pepper spray', 'self defense weapon',
      'firearm', 'pistol scope', 'rifle scope', 'gun accessory',
    ],
  },
  {
    category: 'adult_content',
    verdict: 'REJECTED',
    keywords: ['sex toy', 'dildo', 'vibrator', 'masturbator', 'cosplay sexy', 'lingerie sexy'],
  },
  {
    category: 'animal_welfare',
    verdict: 'REJECTED',
    keywords: ['real fur', 'mink fur', 'ivory', 'tortoise shell', 'shark fin', 'crocodile leather'],
  },
  {
    category: 'health_claim',
    verdict: 'FLAGGED',
    keywords: [
      'cures cancer', 'cure cancer', 'fda approved', 'lose 10kg in', 'guaranteed cure',
      'medical grade', 'doctor recommended', 'cure diabetes',
    ],
  },
];

const IP_CATEGORY_TH: Record<IpCategory, string> = {
  brand_counterfeit: 'แบรนด์ปลอม',
  copyrighted_character: 'ลิขสิทธิ์การ์ตูน',
  regulated_substance: 'สินค้าควบคุม',
  weapon: 'อาวุธ',
  adult_content: 'เนื้อหาผู้ใหญ่',
  animal_welfare: 'สวัสดิภาพสัตว์',
  health_claim: 'อ้างผลทางสุขภาพ',
};

export function getIpCategoryLabel(cat: IpCategory): string {
  return IP_CATEGORY_TH[cat];
}

/**
 * Fast IP check — runs inline at search time on every result.
 * Pure sync function so it works in server + client (no Claude API call).
 */
export function quickIpScan(product: SupplierProduct): IpCheckResult {
  const haystack = [
    product.title,
    product.description ?? '',
    ...(product.supplierTags ?? []),
    ...(product.supplierCategories ?? []),
  ]
    .join(' ')
    .toLowerCase();

  for (const rule of RULES) {
    // Tag-based hard trigger
    const tagHit = rule.tags?.find((t) => product.supplierTags?.includes(t));
    if (tagHit) {
      return {
        verdict: rule.verdict,
        category: rule.category,
        reason: `Supplier tag: ${tagHit}`,
        flaggedTerms: [tagHit],
      };
    }

    // Keyword scan
    const kwHits = rule.keywords.filter((kw) => haystack.includes(kw));
    if (kwHits.length > 0) {
      return {
        verdict: rule.verdict,
        category: rule.category,
        reason: `${IP_CATEGORY_TH[rule.category]}: ${kwHits.slice(0, 3).join(', ')}`,
        flaggedTerms: kwHits,
      };
    }
  }

  return { verdict: 'ACCEPTED', flaggedTerms: [] };
}

/**
 * Full IP check — server-only, intended for batch processing before DB insert.
 * Currently same as quickIpScan; will be replaced with Claude API for richer reasoning.
 */
export async function checkIp(product: SupplierProduct): Promise<IpCheckResult> {
  // TODO: real impl
  //   const res = await anthropic.messages.create({
  //     model: 'claude-3-7-sonnet',
  //     system: loadSkillPrompt('product-translator-ip-filter'),
  //     messages: [{ role: 'user', content: JSON.stringify(product) }],
  //   });
  //   return parseIpResultFromResponse(res);
  return quickIpScan(product);
}

export async function checkIpBatch(products: SupplierProduct[]): Promise<IpCheckResult[]> {
  return Promise.all(products.map(checkIp));
}

/**
 * Apply IP-side filtering to annotated products.
 * Used after search returns annotated list — UI passes which categories to hide.
 */
export function applyIpFilters(
  products: AnnotatedSupplierProduct[],
  opts: {
    hideRejected?: boolean;
    hideFlagged?: boolean;
    excludeCategories?: IpCategory[];
  },
): AnnotatedSupplierProduct[] {
  return products.filter((p) => {
    if (opts.hideRejected && p.ipVerdict === 'REJECTED') return false;
    if (opts.hideFlagged && p.ipVerdict === 'FLAGGED') return false;
    if (opts.excludeCategories?.length && p.ipCategory) {
      if (opts.excludeCategories.includes(p.ipCategory)) return false;
    }
    return true;
  });
}
