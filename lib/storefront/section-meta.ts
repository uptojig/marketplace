import type { ThemeKey } from "./resolve-store-theme";

/**
 * section-meta — editor-facing metadata for each theme's homepage sections.
 *
 * Mirrors the SectionSlot ids declared in each
 * components/storefront/themes/<family>/<Family>Homepage.tsx. The storefront
 * renders from the slots (source of truth for ORDER + rendering); this registry
 * is the metadata a settings editor reads to list reorder/hide controls without
 * importing the server components. Keep ids in sync with the homepages.
 *
 * `locked` sections (Hero) can't be hidden or reordered.
 */

export interface SectionMeta {
  id: string;
  /** Thai label shown in the editor. */
  label: string;
  locked?: boolean;
}

export const SECTION_META: Partial<Record<ThemeKey, SectionMeta[]>> = {
  "fashion-beauty": [
    { id: "hero", label: "ฮีโร่ (ปกนิตยสาร)", locked: true },
    { id: "editorial-picks", label: "Today's pick (คัดสรร 3 ชิ้น)" },
    { id: "bestsellers", label: "ขายดีประจำซีซัน" },
    { id: "brand-story", label: "เรื่องราวแบรนด์" },
  ],
  trust: [
    { id: "hero", label: "ฮีโร่ (gallery-wall)", locked: true },
    { id: "heritage-bar", label: "แถบความน่าเชื่อถือ (3 เสา)" },
    { id: "collection-showcase", label: "คอลเลกชัน (4 ช่อง)" },
    { id: "brand-story", label: "เรื่องราวแบรนด์" },
  ],
  "business-model": [
    { id: "hero", label: "ฮีโร่ (countdown + สถิติ)", locked: true },
    { id: "coupon-strip", label: "คูปองยกล็อต (BULK)" },
    { id: "deals-grid", label: "ดีลสินค้า" },
    { id: "brand-story", label: "เรื่องราวพาร์ตเนอร์" },
  ],
  lifestyle: [
    { id: "hero", label: "ฮีโร่", locked: true },
    { id: "mood-selector", label: "เลือกตามมู้ด" },
    { id: "bestsellers", label: "ขายดี" },
    { id: "brand-story", label: "เรื่องราวแบรนด์" },
  ],
  "electronics-tech": [
    { id: "hero", label: "ฮีโร่", locked: true },
    { id: "specs-bar", label: "แถบสเปก" },
    { id: "catalog-index", label: "แคตตาล็อกล่าสุด" },
    { id: "brand-story", label: "เรื่องราวแบรนด์" },
  ],
  specialty: [
    { id: "hero", label: "ฮีโร่", locked: true },
    { id: "makers-bar", label: "แถบช่างฝีมือ" },
    { id: "handcrafted", label: "งานคราฟต์" },
    { id: "brand-story", label: "เรื่องราวแบรนด์" },
  ],
};

/** Sections an operator may reorder/hide for a theme (excludes locked + unknown themes). */
export function editableSections(themeKey: ThemeKey): SectionMeta[] {
  return (SECTION_META[themeKey] ?? []).filter((s) => !s.locked);
}
