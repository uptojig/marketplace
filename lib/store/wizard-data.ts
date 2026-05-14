// ─── Niches ────────────────────────────────────────────────────────────────

export type NicheId =
  | "electronics"
  | "fashion"
  | "beauty"
  | "home"
  | "sport"
  | "kids"
  | "food"
  | "wholesale"
  | "handmade"
  | "vintage"
  | "general";

export type Niche = {
  id: NicheId;
  label: string;
  emoji: string;
  recommendedTemplates: TemplateId[];
};

export const NICHES: Niche[] = [
  { id: "electronics", label: "อิเล็กทรอนิกส์", emoji: "📱", recommendedTemplates: ["catalog-dense", "tech-compare", "single-product"] },
  { id: "fashion", label: "แฟชั่น", emoji: "👗", recommendedTemplates: ["lookbook", "boutique", "vintage"] },
  { id: "beauty", label: "ความงาม", emoji: "💄", recommendedTemplates: ["beauty-swatch", "lookbook", "boutique"] },
  { id: "home", label: "แต่งบ้าน", emoji: "🛋️", recommendedTemplates: ["home-living", "boutique", "classic"] },
  { id: "sport", label: "กีฬา", emoji: "⚽", recommendedTemplates: ["sport-active", "catalog-dense", "classic"] },
  { id: "kids", label: "แม่และเด็ก", emoji: "🧸", recommendedTemplates: ["kids-toys", "classic", "lookbook"] },
  { id: "food", label: "อาหาร", emoji: "🍱", recommendedTemplates: ["subscription", "classic", "boutique"] },
  { id: "wholesale", label: "ขายส่ง / B2B", emoji: "📦", recommendedTemplates: ["wholesale-b2b", "catalog-dense", "classic"] },
  { id: "handmade", label: "งานฝีมือ", emoji: "🎨", recommendedTemplates: ["handmade", "storyteller", "boutique"] },
  { id: "vintage", label: "วินเทจ / มือสอง", emoji: "🕰️", recommendedTemplates: ["vintage", "lookbook", "boutique"] },
  { id: "general", label: "อื่นๆ / ขายทั่วไป", emoji: "🛍️", recommendedTemplates: ["classic", "catalog-dense", "flash-deal"] },
];

// ─── Templates (20) ────────────────────────────────────────────────────────
//
// IMPORTANT: TemplateId values must match `lib/templates/registry.ts` —
// that registry is the source of truth for storefront rendering.
// This local TEMPLATES list is the wizard's lightweight catalog used for
// preview cards + niche ranking only.

export type TemplateId =
  | "classic"
  | "official-brand"
  | "premium-luxury"
  | "lookbook"
  | "beauty-swatch"
  | "boutique"
  | "catalog-dense"
  | "tech-compare"
  | "single-product"
  | "home-living"
  | "sport-active"
  | "kids-toys"
  | "live-commerce"
  | "video-feed"
  | "storyteller"
  | "wholesale-b2b"
  | "flash-deal"
  | "subscription"
  | "handmade"
  | "vintage";

export type TemplateGroup =
  | "trust"
  | "fashion-beauty"
  | "electronics-tech"
  | "lifestyle"
  | "community"
  | "business-model"
  | "specialty";

export type DesktopPattern = "A" | "B" | "C" | "D";

export type ThemeTokens = {
  spacing: "compact" | "default" | "airy";
  radius: "sharp" | "default" | "round";
  titleScale: "compact" | "default" | "editorial" | "display";
  font: "sans" | "sans-display" | "serif";
};

export type Behavior = {
  showTabs?: boolean;
  bottomNav?: "visible" | "hidden";
  heroSize?: "cover" | "large" | "portrait" | "video" | "live-tile" | "none";
  coverHidden?: boolean;
  searchInTopBar?: boolean;
  productGridDensity?: "default" | "dense";
  badgeSlot?: "official" | "b2b" | "condition" | "performance";
  swatchRow?: boolean;
  storyBlock?: boolean;
  sceneCards?: boolean;
  performanceBadges?: boolean;
  categoryTilesColored?: boolean;
  liveBlock?: boolean;
  replayCarousel?: boolean;
  videoFirstGrid?: boolean;
  compareBlock?: boolean;
  pricingTiers?: boolean;
  moqVisible?: boolean;
  countdownBanner?: boolean;
  stockIndicators?: boolean;
  dropCalendar?: boolean;
  makerPortrait?: boolean;
  conditionBadges?: boolean;
  uniqueItemMode?: boolean;
  singleProductMode?: boolean;
  stickyCTA?: "buy-now" | "none";
  hideRatingsCount?: boolean;
  productCardStyle?: "default" | "minimal" | "editorial" | "spec-rows";
};

export type Gating = {
  requiresKYC?: "basic" | "brand-verified" | "business-verified";
};

export type Template = {
  id: TemplateId;
  name: string;
  description: string;
  group: TemplateGroup;
  desktopPattern: DesktopPattern;
  theme: ThemeTokens;
  behavior: Behavior;
  gating?: Gating;
};

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description: "ค่าตั้งต้น ครอบคลุมร้านทั่วไป",
    group: "trust",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { showTabs: true, bottomNav: "visible", heroSize: "cover" },
  },
  {
    id: "official-brand",
    name: "Official Brand",
    description: "แบรนด์ทางการ มี badge ฟ้า ต้องยืนยันตัวตน",
    group: "trust",
    desktopPattern: "A",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { heroSize: "large", showTabs: false, badgeSlot: "official" },
    gating: { requiresKYC: "brand-verified" },
  },
  {
    id: "premium-luxury",
    name: "Premium Luxury",
    description: "หรูหรา minimal ซ่อนตัวเลข ราคา/รีวิว",
    group: "trust",
    desktopPattern: "A",
    theme: { spacing: "airy", radius: "sharp", titleScale: "editorial", font: "serif" },
    behavior: { hideRatingsCount: true, productCardStyle: "minimal" },
  },
  {
    id: "lookbook",
    name: "Lookbook",
    description: "แฟชั่น portrait hero editorial card",
    group: "fashion-beauty",
    desktopPattern: "A",
    theme: { spacing: "airy", radius: "sharp", titleScale: "editorial", font: "sans-display" },
    behavior: { heroSize: "portrait", productCardStyle: "editorial" },
  },
  {
    id: "beauty-swatch",
    name: "Beauty Swatch",
    description: "เครื่องสำอาง โชว์เฉดสีเป็นแถว",
    group: "fashion-beauty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "round", titleScale: "default", font: "sans" },
    behavior: { swatchRow: true },
  },
  {
    id: "boutique",
    name: "Boutique",
    description: "แบรนด์ตัวเล็ก มี story สั้นด้านบน",
    group: "fashion-beauty",
    desktopPattern: "A",
    theme: { spacing: "airy", radius: "default", titleScale: "editorial", font: "sans-display" },
    behavior: { storyBlock: true },
  },
  {
    id: "catalog-dense",
    name: "Catalog Dense",
    description: "ของเยอะ (500+ SKU) ค้นหาแบบ chips + grid แน่น",
    group: "electronics-tech",
    desktopPattern: "B",
    theme: { spacing: "compact", radius: "sharp", titleScale: "compact", font: "sans" },
    behavior: { coverHidden: true, searchInTopBar: true, productGridDensity: "dense" },
  },
  {
    id: "tech-compare",
    name: "Tech Compare",
    description: "เปรียบเทียบ spec สินค้าไอที",
    group: "electronics-tech",
    desktopPattern: "B",
    theme: { spacing: "compact", radius: "sharp", titleScale: "compact", font: "sans" },
    behavior: { compareBlock: true, productCardStyle: "spec-rows" },
  },
  {
    id: "single-product",
    name: "Single Product",
    description: "ขาย 1 สินค้าโดดเด่น sticky Buy Now",
    group: "electronics-tech",
    desktopPattern: "A",
    theme: { spacing: "airy", radius: "default", titleScale: "display", font: "sans-display" },
    behavior: { singleProductMode: true, stickyCTA: "buy-now", bottomNav: "hidden" },
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "เฟอร์นิเจอร์ ของแต่งบ้าน scene card",
    group: "lifestyle",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { sceneCards: true, heroSize: "large" },
  },
  {
    id: "sport-active",
    name: "Sport & Active",
    description: "ชุดกีฬา outdoor performance badges",
    group: "lifestyle",
    desktopPattern: "B",
    theme: { spacing: "default", radius: "sharp", titleScale: "default", font: "sans-display" },
    behavior: { performanceBadges: true },
  },
  {
    id: "kids-toys",
    name: "Kids & Toys",
    description: "สดใส tile หมวดสีพาสเทล",
    group: "lifestyle",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "round", titleScale: "default", font: "sans-display" },
    behavior: { categoryTilesColored: true },
  },
  {
    id: "live-commerce",
    name: "Live Commerce",
    description: "ไลฟ์สด KOL พร้อม replay carousel",
    group: "community",
    desktopPattern: "D",
    theme: { spacing: "compact", radius: "default", titleScale: "default", font: "sans" },
    behavior: { liveBlock: true, replayCarousel: true, heroSize: "live-tile" },
  },
  {
    id: "video-feed",
    name: "Video Feed",
    description: "ฟีดวิดีโอแนวตั้งสไตล์ TikTok Shop",
    group: "community",
    desktopPattern: "D",
    theme: { spacing: "compact", radius: "default", titleScale: "default", font: "sans" },
    behavior: { videoFirstGrid: true, coverHidden: true },
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "เน้นเรื่องราวแบรนด์ ตัวอักษรเยอะ",
    group: "community",
    desktopPattern: "A",
    theme: { spacing: "airy", radius: "sharp", titleScale: "editorial", font: "serif" },
    behavior: { storyBlock: true },
  },
  {
    id: "wholesale-b2b",
    name: "Wholesale B2B",
    description: "ขายส่ง โชว์ pricing tier + MOQ",
    group: "business-model",
    desktopPattern: "B",
    theme: { spacing: "compact", radius: "sharp", titleScale: "compact", font: "sans" },
    behavior: { pricingTiers: true, moqVisible: true, badgeSlot: "b2b" },
    gating: { requiresKYC: "business-verified" },
  },
  {
    id: "flash-deal",
    name: "Flash Deal",
    description: "ดีลด่วน countdown timer + stock indicator",
    group: "business-model",
    desktopPattern: "B",
    theme: { spacing: "compact", radius: "sharp", titleScale: "default", font: "sans" },
    behavior: { countdownBanner: true, stockIndicators: true },
  },
  {
    id: "subscription",
    name: "Subscription Box",
    description: "Subscription รายเดือน drop calendar",
    group: "business-model",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { dropCalendar: true },
  },
  {
    id: "handmade",
    name: "Handmade Artisan",
    description: "งานคราฟต์ โชว์รูป maker + story",
    group: "specialty",
    desktopPattern: "A",
    theme: { spacing: "airy", radius: "default", titleScale: "editorial", font: "serif" },
    behavior: { makerPortrait: true, storyBlock: true },
  },
  {
    id: "vintage",
    name: "Vintage / Pre-owned",
    description: "ของมือสอง วินเทจ พร้อม badge สภาพ",
    group: "specialty",
    desktopPattern: "B",
    theme: { spacing: "default", radius: "sharp", titleScale: "default", font: "serif" },
    behavior: { conditionBadges: true, uniqueItemMode: true },
  },
];

// ─── Palettes ──────────────────────────────────────────────────────────────

export type Palette = {
  id: string;
  name: string;
  primary: string;
  accent: string;
};

export const PALETTES: Palette[] = [
  { id: "midnight", name: "Midnight", primary: "#0f172a", accent: "#f59e0b" },
  { id: "royal", name: "Royal", primary: "#7c3aed", accent: "#3b82f6" },
  { id: "rose", name: "Rose", primary: "#ec4899", accent: "#fb7185" },
  { id: "earthy", name: "Earthy", primary: "#0f766e", accent: "#92400e" },
  { id: "bold", name: "Bold", primary: "#dc2626", accent: "#18181b" },
  { id: "sunset", name: "Sunset", primary: "#f97316", accent: "#facc15" },
  { id: "minimal", name: "Minimal", primary: "#18181b", accent: "#71717a" },
  { id: "mint", name: "Mint", primary: "#059669", accent: "#a7f3d0" },
];

// ─── Phases / Wizard state ─────────────────────────────────────────────────

export type PhaseId = 1 | 2 | 3 | 4 | 5;

export const PHASES: { id: PhaseId; title: string; short: string }[] = [
  { id: 1, title: "เอกลักษณ์แบรนด์", short: "Identity" },
  { id: 2, title: "เลย์เอาต์", short: "Layout" },
  { id: 3, title: "เลือกสินค้า", short: "Products" },
  { id: 4, title: "ประกอบหน้าร้าน", short: "Assembly" },
  { id: 5, title: "เผยแพร่", short: "Launch" },
];

export type BrandVoice = "casual" | "formal" | "playful";

export type ContactInfo = {
  phone: string;
  email: string;
  lineId: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  address: string;
};

export type WizardState = {
  phase: PhaseId;
  identity: {
    name: string;
    niche: NicheId | null;
    description: string;
    brandVoice: BrandVoice;
    logoDataUrl: string | null;
    bannerDataUrl: string | null;
    paletteId: string;
    contact: ContactInfo;
  };
  layout: {
    templateId: TemplateId | null;
  };
  products: {
    /** Legacy "shape of the bundle" hint — still drives the target
     *  count copy in the UI, but actual import is now driven by the
     *  selectedProducts list below. Kept for backwards compat with
     *  stores saved as drafts before the picker landed. */
    starterPack: "10" | "20" | "50" | null;
    /** Full CJ product snapshots the user picked in Phase 3.
     *  createStoreFromWizard() seeds Product stub rows from these
     *  (title/price/image) and then calls enrichCJProduct() per row
     *  for full detail + variants + Thai translation. */
    selectedProducts: Array<{
      externalProductId: string;
      title: string;
      priceTHB: number;
      imageUrl: string | null;
    }>;
  };
  launch: {
    status: "draft" | "live";
  };
};

export const INITIAL_STATE: WizardState = {
  phase: 1,
  identity: {
    name: "",
    niche: null,
    description: "",
    brandVoice: "casual",
    logoDataUrl: null,
    bannerDataUrl: null,
    paletteId: PALETTES[0].id,
    contact: {
      phone: "",
      email: "",
      lineId: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      address: "",
    },
  },
  layout: {
    templateId: null,
  },
  products: {
    starterPack: null,
    selectedProducts: [],
  },
  launch: {
    status: "draft",
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return cleaned || "my-store";
}

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function getTemplate(id: TemplateId | null): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function getNiche(id: NicheId | null): Niche | null {
  if (!id) return null;
  return NICHES.find((n) => n.id === id) ?? null;
}

export function rankTemplates(nicheId: NicheId | null): {
  recommended: Template[];
  others: Template[];
} {
  if (!nicheId) {
    return { recommended: TEMPLATES.slice(0, 3), others: TEMPLATES.slice(3) };
  }
  const niche = getNiche(nicheId);
  const recIds = niche?.recommendedTemplates ?? [];
  const recommended = recIds
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter((t): t is Template => Boolean(t));
  const others = TEMPLATES.filter((t) => !recIds.includes(t.id));
  return { recommended, others };
}
