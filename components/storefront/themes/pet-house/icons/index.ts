/**
 * Fluffy House — Category Icons
 *
 * 4 SVG illustrations สำหรับ category cards บนหน้า catalog
 * แต่ละ component รับ className + size + aria-label
 *
 * Usage:
 *   import { PetGearIcon, BowlsIcon, ToysIcon, BedRugIcon } from './fluffy-icons';
 *   <PetGearIcon size={120} className="my-icon" />
 *
 * หรือใช้ CATEGORY_ICONS map สำหรับ dynamic rendering:
 *   const Icon = CATEGORY_ICONS[slug];
 *   <Icon className="w-full h-full" />
 */

export { PetGearIcon } from './PetGearIcon';
export { BowlsIcon } from './BowlsIcon';
export { ToysIcon } from './ToysIcon';
export { BedRugIcon } from './BedRugIcon';

import { PetGearIcon } from './PetGearIcon';
import { BowlsIcon } from './BowlsIcon';
import { ToysIcon } from './ToysIcon';
import { BedRugIcon } from './BedRugIcon';

/** Slug ที่ใช้แมพ icon — ปรับตาม slug ใน DB ของ category */
export type CategorySlug = 'pet-equipment' | 'pet-supplies' | 'pet-toys' | 'pet-home';

/** Map slug → React component สำหรับ dynamic rendering */
export const CATEGORY_ICONS: Record<CategorySlug, React.ComponentType<{ className?: string; size?: number | string }>> = {
  'pet-equipment': PetGearIcon,
  'pet-supplies': BowlsIcon,
  'pet-toys': ToysIcon,
  'pet-home': BedRugIcon,
};

/** สีพื้นหลังของการ์ดแต่ละ category (จับคู่กับ icon) */
export const CATEGORY_BG: Record<CategorySlug, string> = {
  'pet-equipment': '#FAEBA0', // เหลือง
  'pet-supplies': '#F0F7E5', // เขียวอ่อน
  'pet-toys': '#FCE8DB', // พีช
  'pet-home': '#F4E1F0', // ชมพูอ่อน
};

/** Tag chip ภาษาอังกฤษ (สั้น ใช้ใน badge บนการ์ด) */
export const CATEGORY_TAG: Record<CategorySlug, string> = {
  'pet-equipment': 'PET GEAR',
  'pet-supplies': 'SUPPLIES',
  'pet-toys': 'TOYS',
  'pet-home': 'HOME',
};
