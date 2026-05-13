/**
 * Thai standard category tree.
 * Used to:
 *   1. Display category filter in sidebar
 *   2. Map supplier categories → Thai standards (translation pipeline reads from here)
 *   3. Slot products into our marketplace navigation
 */

export interface CategoryNode {
  slug: string;
  label: string;
  icon: string; // Lucide icon name
  children?: CategoryNode[];
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    slug: 'fashion',
    label: 'แฟชั่น',
    icon: 'shirt',
    children: [
      { slug: 'fashion-women', label: 'ผู้หญิง', icon: 'venus' },
      { slug: 'fashion-men', label: 'ผู้ชาย', icon: 'mars' },
      { slug: 'fashion-bags', label: 'กระเป๋า', icon: 'shopping-bag' },
      { slug: 'fashion-shoes', label: 'รองเท้า', icon: 'shoe' },
      { slug: 'fashion-accessories', label: 'แอ็คเซสซอรี่', icon: 'gem' },
    ],
  },
  {
    slug: 'electronics',
    label: 'อิเล็กทรอนิกส์',
    icon: 'smartphone',
    children: [
      { slug: 'electronics-audio', label: 'เครื่องเสียง', icon: 'headphones' },
      { slug: 'electronics-phone', label: 'มือถือ + อุปกรณ์', icon: 'smartphone' },
      { slug: 'electronics-computer', label: 'คอมพิวเตอร์', icon: 'laptop' },
      { slug: 'electronics-photo', label: 'กล้อง + ถ่ายภาพ', icon: 'camera' },
      { slug: 'electronics-gaming', label: 'เกม', icon: 'gamepad' },
    ],
  },
  {
    slug: 'home',
    label: 'บ้าน + สวน',
    icon: 'home',
    children: [
      { slug: 'home-kitchen', label: 'ครัว', icon: 'utensils' },
      { slug: 'home-drinkware', label: 'แก้วน้ำ + กระติก', icon: 'coffee' },
      { slug: 'home-storage', label: 'จัดเก็บของ', icon: 'archive' },
      { slug: 'home-decor', label: 'ของแต่งบ้าน', icon: 'lamp' },
      { slug: 'home-bedding', label: 'เครื่องนอน', icon: 'bed' },
    ],
  },
  {
    slug: 'beauty',
    label: 'ความงาม',
    icon: 'sparkles',
    children: [
      { slug: 'beauty-skincare', label: 'สกินแคร์', icon: 'droplet' },
      { slug: 'beauty-makeup', label: 'เครื่องสำอาง', icon: 'palette' },
      { slug: 'beauty-hair', label: 'ผม', icon: 'scissors' },
      { slug: 'beauty-tools', label: 'อุปกรณ์ความงาม', icon: 'tool' },
    ],
  },
  {
    slug: 'sports',
    label: 'กีฬา + กลางแจ้ง',
    icon: 'dumbbell',
    children: [
      { slug: 'sports-fitness', label: 'ฟิตเนส + เวท', icon: 'dumbbell' },
      { slug: 'sports-outdoor', label: 'แคมป์ + เดินป่า', icon: 'tent' },
      { slug: 'sports-yoga', label: 'โยคะ + ออกกำลังกายเบา', icon: 'leaf' },
    ],
  },
  {
    slug: 'auto',
    label: 'รถยนต์ + มอเตอร์ไซค์',
    icon: 'car',
    children: [
      { slug: 'auto-accessories', label: 'แอ็คเซสซอรี่รถ', icon: 'plug' },
      { slug: 'auto-care', label: 'ดูแลรถ', icon: 'droplets' },
    ],
  },
  {
    slug: 'baby',
    label: 'แม่และเด็ก',
    icon: 'baby',
    children: [
      { slug: 'baby-toys', label: 'ของเล่น', icon: 'puzzle' },
      { slug: 'baby-clothes', label: 'เสื้อผ้าเด็ก', icon: 'shirt' },
      { slug: 'baby-feeding', label: 'อาหาร + ให้นม', icon: 'milk' },
    ],
  },
  {
    slug: 'pet',
    label: 'สัตว์เลี้ยง',
    icon: 'paw-print',
    children: [
      { slug: 'pet-dog', label: 'หมา', icon: 'dog' },
      { slug: 'pet-cat', label: 'แมว', icon: 'cat' },
    ],
  },
  {
    slug: 'office',
    label: 'เครื่องใช้สำนักงาน',
    icon: 'briefcase',
    children: [
      { slug: 'office-stationery', label: 'เครื่องเขียน', icon: 'pencil' },
      { slug: 'office-furniture', label: 'เฟอร์นิเจอร์สำนักงาน', icon: 'armchair' },
    ],
  },
];

/**
 * Map supplier-provided category strings to our Thai category slugs.
 * Returns multiple slugs if product fits multiple categories.
 */
export function mapSupplierCategories(supplierCats: string[], title?: string): string[] {
  const haystack = `${supplierCats.join(' ')} ${title ?? ''}`.toLowerCase();
  const results = new Set<string>();

  const rules: Array<[RegExp, string]> = [
    // Electronics
    [/headphone|earbuds|audio|speaker|microphone/, 'electronics-audio'],
    [/phone holder|phone case|phone charger|mobile/, 'electronics-phone'],
    [/laptop|keyboard|mouse|monitor|usb/, 'electronics-computer'],
    [/camera|tripod|ring light|gimbal|lens/, 'electronics-photo'],
    [/gaming|console|controller|joystick/, 'electronics-gaming'],
    // Fashion
    [/women.+dress|women.+top|women.+blouse|women.+sweater/, 'fashion-women'],
    [/men.+shirt|men.+pants|men.+jacket/, 'fashion-men'],
    [/handbag|tote bag|backpack|wallet/, 'fashion-bags'],
    [/sneakers|sandals|boots|loafers/, 'fashion-shoes'],
    [/sunglasses|watch|hat|cap|scarf|jewelry/, 'fashion-accessories'],
    // Home
    [/kitchen|cookware|baking|cutting board|knife set/, 'home-kitchen'],
    [/water bottle|tumbler|drinkware|mug|thermos/, 'home-drinkware'],
    [/storage|organizer|drawer|container|box/, 'home-storage'],
    [/lamp|wall art|cushion|vase|candle/, 'home-decor'],
    [/bedding|pillow|blanket|sheet|duvet/, 'home-bedding'],
    // Beauty
    [/skincare|serum|moisturizer|sunscreen/, 'beauty-skincare'],
    [/lipstick|foundation|mascara|eyeshadow|blush/, 'beauty-makeup'],
    [/hair brush|shampoo|hair dryer/, 'beauty-hair'],
    [/makeup tool|nail|tweezer/, 'beauty-tools'],
    // Sports
    [/dumbbell|resistance band|workout|fitness/, 'sports-fitness'],
    [/tent|camping|hiking|backpacking/, 'sports-outdoor'],
    [/yoga mat|meditation/, 'sports-yoga'],
    // Auto
    [/car mount|car charger|car phone/, 'auto-accessories'],
    [/wax|polish|car cleaning/, 'auto-care'],
    // Baby
    [/toy|plush|stuffed/, 'baby-toys'],
    [/kids clothes|baby clothes/, 'baby-clothes'],
    [/baby bottle|formula|baby food/, 'baby-feeding'],
    // Pet
    [/dog collar|dog leash|dog food|dog toy/, 'pet-dog'],
    [/cat toy|cat food|cat litter|cat tree/, 'pet-cat'],
    // Office
    [/pen|pencil|notebook|sticky note/, 'office-stationery'],
    [/office chair|desk|laptop stand/, 'office-furniture'],
  ];

  for (const [pattern, slug] of rules) {
    if (pattern.test(haystack)) results.add(slug);
  }

  return Array.from(results);
}

/**
 * Flatten tree to a lookup by slug. Used for label rendering.
 */
export function buildCategoryLookup(): Map<string, CategoryNode> {
  const map = new Map<string, CategoryNode>();
  for (const top of CATEGORY_TREE) {
    map.set(top.slug, top);
    for (const child of top.children ?? []) {
      map.set(child.slug, child);
    }
  }
  return map;
}

export const CATEGORY_LOOKUP = buildCategoryLookup();
