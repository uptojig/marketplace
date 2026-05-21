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
  { id: "electronics", label: "อิเล็กทรอนิกส์", emoji: "📱", recommendedTemplates: ["wavelength-audio", "carbon-era-cameras", "glow-lamp-co", "smartloop-home", "keystroke-lab"] },
  { id: "fashion", label: "แฟชั่น", emoji: "👗", recommendedTemplates: ["sirin-womenswear", "lila-modest", "reclaim-leather"] },
  { id: "beauty", label: "ความงาม", emoji: "💄", recommendedTemplates: ["caldera-skin", "yumeiro-lip", "hinoki-apothecary"] },
  { id: "home", label: "แต่งบ้าน", emoji: "🛋️", recommendedTemplates: ["korakot-house", "linen-and-loom", "glow-lamp-co"] },
  { id: "sport", label: "กีฬา", emoji: "⚽", recommendedTemplates: ["trailcraft-outdoors", "saluki-yoga"] },
  { id: "kids", label: "แม่และเด็ก", emoji: "🧸", recommendedTemplates: ["tinyhand-wooden-toys"] },
  { id: "food", label: "อาหาร", emoji: "🍱", recommendedTemplates: ["talad-see-sod", "bulkbox-industrial", "petit-cote"] },
  { id: "wholesale", label: "ขายส่ง / B2B", emoji: "📦", recommendedTemplates: ["bulkbox-industrial", "inkstone-paper"] },
  { id: "handmade", label: "งานฝีมือ", emoji: "🎨", recommendedTemplates: ["mai-hatthakam", "pigment-studio"] },
  { id: "vintage", label: "วินเทจ / มือสอง", emoji: "🕰️", recommendedTemplates: ["brutalist-thai", "mono-eight", "atelier-27"] },
  { id: "general", label: "อื่นๆ / ขายทั่วไป", emoji: "🛍️", recommendedTemplates: ["pastel-pack", "sai-sing"] },
];

// ─── Templates (20) ────────────────────────────────────────────────────────
//
// IMPORTANT: TemplateId values must match `lib/templates/registry.ts` —
// that registry is the source of truth for storefront rendering.
// This local TEMPLATES list is the wizard's lightweight catalog used for
// preview cards + niche ranking only.

export type TemplateId =
  | "sai-sing"
  | "talad-see-sod"
  | "brutalist-thai"
  | "mono-eight"
  | "lila-modest"
  | "atelier-27"
  | "bulkbox-industrial"
  | "caldera-skin"
  | "carbon-era-cameras"
  | "glow-lamp-co"
  | "hinoki-apothecary"
  | "inkstone-paper"
  | "keystroke-lab"
  | "korakot-house"
  | "linen-and-loom"
  | "mai-hatthakam"
  | "pastel-pack"
  | "petit-cote"
  | "pigment-studio"
  | "reclaim-leather"
  | "saluki-yoga"
  | "sirin-womenswear"
  | "smartloop-home"
  | "tinyhand-wooden-toys"
  | "trailcraft-outdoors"
  | "wavelength-audio"
  | "yumeiro-lip";

export type TemplateGroup =
  | "trust"
  | "fashion-beauty"
  | "electronics-tech"
  | "lifestyle"
  | "community"
  | "business-model"
  | "specialty"
  | "everyday"
  | "taobao"
  | "packaging";

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
  countdownBanner?: "visible" | "hidden";
  stockIndicators?: "visible" | "hidden" | boolean;
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
    id: "sai-sing",
    name: "Sai Sing",
    description: "ธีมสายมู โทนสีเข้มขลัง เสริมดวงบารมี",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { storyBlock: true, makerPortrait: true },
  },
  {
    id: "talad-see-sod",
    name: "Talad See Sod",
    description: "ตลาดสด ของกินของฝาก สีสันจัดจ้าน",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "brutalist-thai",
    name: "Brutalist Thai",
    description: "ดิบๆ เท่ๆ แฟชั่นแนวสตรีทและตัวอักษรใหญ่",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { heroSize: "none" },
  },
  {
    id: "mono-eight",
    name: "Mono Eight",
    description: "มินิมอล ญี่ปุ่น โทนขาวดำ",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "lila-modest",
    name: "Lila Modest",
    description: "เสื้อผ้ามุสลิม เรียบหรู อ่อนโยน",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { heroSize: "portrait", productCardStyle: "editorial" },
  },
  {
    id: "atelier-27",
    name: "Atelier 27",
    description: "งานศิลปะและงานคราฟต์ พรีเมียม",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { storyBlock: true },
  },
  {
    id: "bulkbox-industrial",
    name: "Bulkbox Industrial",
    description: "ขายส่ง เครื่องจักร อุตสาหกรรม B2B",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { productCardStyle: "spec-rows", badgeSlot: "b2b" },
  },
  {
    id: "caldera-skin",
    name: "Caldera Skin",
    description: "สกินแคร์ เครื่องสำอาง คลินิก สไตล์คลีน",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { productCardStyle: "spec-rows" },
  },
  {
    id: "carbon-era-cameras",
    name: "Carbon Era Cameras",
    description: "กล้องถ่ายรูป อุปกรณ์ไอที สายลุย",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "glow-lamp-co",
    name: "Glow Lamp Co",
    description: "โคมไฟ ของตกแต่งบ้าน โทนอบอุ่น",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { productCardStyle: "editorial" },
  },
  {
    id: "hinoki-apothecary",
    name: "Hinoki Apothecary",
    description: "สปา น้ำหอม สมุนไพร โทนไม้และธรรมชาติ",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { storyBlock: true },
  },
  {
    id: "inkstone-paper",
    name: "Inkstone Paper",
    description: "เครื่องเขียน อุปกรณ์โต๊ะทำงาน มินิมอล",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "keystroke-lab",
    name: "Keystroke Lab",
    description: "คีย์บอร์ด ไอที เกมมิ่ง ดุดัน",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "korakot-house",
    name: "Korakot House",
    description: "เฟอร์นิเจอร์ไม้ แต่งบ้าน โฮมมี่",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { heroSize: "large", productCardStyle: "editorial" },
  },
  {
    id: "linen-and-loom",
    name: "Linen And Loom",
    description: "เสื้อผ้าฝ้าย ลินิน โทนละมุน",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "mai-hatthakam",
    name: "Mai Hatthakam",
    description: "งานหัตถกรรมจักสาน ท้องถิ่น",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { makerPortrait: true, storyBlock: true },
  },
  {
    id: "pastel-pack",
    name: "Pastel Pack",
    description: "แพ็คเกจจิ้ง ของขวัญ สีพาสเทลน่ารัก",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "petit-cote",
    name: "Petit Cote",
    description: "เสื้อผ้าเด็ก ของใช้แม่และเด็ก ละมุน",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "pigment-studio",
    name: "Pigment Studio",
    description: "อุปกรณ์ศิลปะ สีวาดรูป อาร์ตสตูดิโอ",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "reclaim-leather",
    name: "Reclaim Leather",
    description: "งานหนังทำมือ เท่ กระเป๋า เครื่องหนัง",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "saluki-yoga",
    name: "Saluki Yoga",
    description: "โยคะ สายสุขภาพ กีฬา",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "sirin-womenswear",
    name: "Sirin Womenswear",
    description: "เสื้อผ้าผู้หญิง แฟชั่น เรียบหรู",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { heroSize: "portrait", productCardStyle: "editorial" },
  },
  {
    id: "smartloop-home",
    name: "Smartloop Home",
    description: "สมาร์ทโฮม แก็ดเจ็ต ล้ำสมัย",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "tinyhand-wooden-toys",
    name: "Tinyhand Wooden Toys",
    description: "ของเล่นไม้ เสริมพัฒนาการเด็ก",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: {},
  },
  {
    id: "trailcraft-outdoors",
    name: "Trailcraft Outdoors",
    description: "แคมป์ปิ้ง อุปกรณ์เดินป่า สายลุย",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { heroSize: "large", productCardStyle: "sharp" },
  },
  {
    id: "wavelength-audio",
    name: "Wavelength Audio",
    description: "เครื่องเสียง หูฟัง ออดิโอไฟล์ พรีเมียม",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { heroSize: "large", singleProductMode: true },
  },
  {
    id: "yumeiro-lip",
    name: "Yumeiro Lip",
    description: "ลิปสติก บิวตี้ สีสันสดใส",
    group: "specialty",
    desktopPattern: "C",
    theme: { spacing: "default", radius: "default", titleScale: "default", font: "sans" },
    behavior: { swatchRow: true },
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
  const hit = PALETTES.find((p) => p.id === id);
  if (!hit) {
    console.warn(
      `[wizard-data] Unknown paletteId "${id}", falling back to "${PALETTES[0].id}". ` +
        `Valid IDs: ${PALETTES.map((p) => p.id).join(", ")}`,
    );
    return PALETTES[0];
  }
  return hit;
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

// ─── Themes (10) — the curated picker the wizard actually shows ───────────────
//
// The wizard presents 10 CURATED THEMES (one per design family / TemplateGroup),
// NOT the 26 raw templates. The 26 templates collapse to ~10 looks at render
// time anyway (see resolveStoreTheme) — showing all 26 created the illusion of
// choice without delivering distinct results. Each theme writes ONE
// representative templateId so every downstream consumer (resolveStoreTheme,
// storefront, admin tools, Zod) keeps working unchanged. The remaining
// templates stay valid for stores created before this change and for the
// per-template admin tools — they're just no longer offered as separate cards.
//
// Representatives are chosen to be NON-gated so all 10 themes are pickable
// (e.g. business-model uses flash-deal, not the KYC-gated wholesale-b2b).

export type ThemeOptionKey = TemplateGroup; // the 10 design families

export type ThemeOption = {
  key: ThemeOptionKey;
  name: string;
  description: string;
  /**
   * templateId written to Store when this theme is chosen. MUST resolve (via
   * the lib/landing isXStore predicates) to the matching storefront family.
   */
  templateId: TemplateId;
};

export const THEME_OPTIONS: ThemeOption[] = [
  { key: "trust", name: "คลาสสิก", description: "สะอาด น่าเชื่อถือ เหมาะร้านทั่วไป", templateId: "classic" },
  { key: "fashion-beauty", name: "แฟชั่น & บิวตี้", description: "ลุคบุ๊กภาพใหญ่ โทนอ่อน เหมาะเสื้อผ้า/เครื่องสำอาง", templateId: "lookbook" },
  { key: "electronics-tech", name: "อิเล็กทรอนิกส์ & ไอที", description: "แคตตาล็อกแน่น ค้นหาง่าย เหมาะสินค้าเยอะ/สเปกละเอียด", templateId: "catalog-dense" },
  { key: "lifestyle", name: "ไลฟ์สไตล์ & แต่งบ้าน", description: "ภาพบรรยากาศ การ์ดซีน เหมาะของแต่งบ้าน/กีฬา/เด็ก", templateId: "home-living" },
  { key: "business-model", name: "โปรโมชัน & ดีล", description: "เน้นดีล countdown สต็อก เหมาะ flash sale/ขายส่ง", templateId: "flash-deal" },
  { key: "specialty", name: "คราฟต์ & วินเทจ", description: "เล่าเรื่องแบรนด์ โชว์ผู้ผลิต เหมาะงานฝีมือ/มือสอง", templateId: "handmade" },
  { key: "community", name: "วิดีโอ & ไลฟ์", description: "ฟีดวิดีโอ ไลฟ์สด สไตล์ TikTok/โซเชียล", templateId: "video-feed" },
  { key: "everyday", name: "ขายปลีกทั่วไป", description: "สไตล์ Shopee ภาพใหญ่ ราคาเด่น แท็บหมวด", templateId: "everyday-retail" },
  { key: "taobao", name: "มาร์เก็ตเพลส", description: "โทนส้ม-แดง-ชมพู ลดทุกวัน อารมณ์ Taobao", templateId: "taobao-style" },
  { key: "packaging", name: "บรรจุภัณฑ์ & ซัพพลาย", description: "พาสเทลสดใส เหมาะสินค้าบรรจุภัณฑ์/ซัพพลาย", templateId: "packaging-supply" },
];

/**
 * Which curated theme a (legacy or current) templateId belongs to — keyed off
 * the template's design group. Lets the picker highlight the right theme card
 * for stores/drafts saved with any of the 26 templateIds. Falls back to the
 * first theme only if the id is unknown.
 */
export function themeForTemplate(id: TemplateId | null): ThemeOption {
  const group = getTemplate(id).group;
  return THEME_OPTIONS.find((t) => t.key === group) ?? THEME_OPTIONS[0];
}

/**
 * Rank the 10 themes for a niche: themes whose family is hit by the niche's
 * recommended templates come first. Mirrors rankTemplates' intent at theme
 * granularity (no niche → first 3 as recommended).
 */
export function rankThemes(nicheId: NicheId | null): {
  recommended: ThemeOption[];
  others: ThemeOption[];
} {
  if (!nicheId) {
    return { recommended: THEME_OPTIONS.slice(0, 3), others: THEME_OPTIONS.slice(3) };
  }
  const niche = getNiche(nicheId);
  const recGroups = new Set(
    (niche?.recommendedTemplates ?? []).map((id) => getTemplate(id).group),
  );
  const recommended = THEME_OPTIONS.filter((t) => recGroups.has(t.key));
  const others = THEME_OPTIONS.filter((t) => !recGroups.has(t.key));
  return { recommended, others };
}
