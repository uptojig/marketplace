/**
 * Mu Wallpaper palette — Thai สายมู (auspicious / lucky) DIGITAL wallpaper
 * store. Mystical-premium dark look extracted verbatim from the design
 * export (`ออกแบบเว็บขาย-Wallpaper-สายมู/assets/app.css :root`).
 *
 * The 6 storefront CSS vars (--shop-primary, --shop-bg, --shop-ink,
 * --shop-ink-muted, --shop-border, --shop-card) are seeded by the family
 * layout from the store's admin-chosen palette, so every component
 * references `var(--shop-*)` FIRST and only falls back to these hex
 * constants. The export's GOLD accent maps to --shop-primary, keeping the
 * theme recolorable from the admin while shipping the gilded-on-midnight
 * look out of the box.
 */

export const MU_WALLPAPER_HEX = {
  // Surfaces (deep mystical midnight)
  bg: '#0b0918', // page background
  bg2: '#120e26', // gradient-stop / footer band
  surface: '#181333', // cards / panels
  surface2: '#211a44', // raised chips / avatars

  // Ink
  ink: '#f4f1ea', // foreground
  inkMuted: '#a6a0c8', // secondary text
  faint: '#6f6a93', // tertiary / captions

  // Borders
  border: 'rgba(255,255,255,.09)',
  border2: 'rgba(255,255,255,.14)',

  // Gold accent (maps to --shop-primary)
  gold: '#e9cd84',
  gold2: '#f7e6ad', // bright top of the gold gradient
  goldDeep: '#b9913f', // deep bottom of the gold gradient
  goldInk: '#241906', // text colour on top of gold fills

  // Auspicious category glows (สายมู 5 ด้าน)
  wealth: '#f0c86a', // การเงิน
  love: '#ff7eb6', // ความรัก
  career: '#ffa45c', // การงาน
  protect: '#7aa6ff', // แคล้วคลาด
  health: '#5fd6a8', // สุขภาพ

  // Radii / shadow / motion (from export)
  radius: '18px',
  radiusLg: '24px',
  ease: 'cubic-bezier(.23,1,.32,1)',
  shadow: '0 18px 50px -18px rgba(0,0,0,.7)',
} as const;

/**
 * Gold gradient used by every CTA, badge, coin and the brand mark. Derived
 * from the token map so the fallback stays in sync; admin-set
 * `--shop-primary` overrides the mid-stop so the whole storefront recolors.
 */
export const MU_WALLPAPER_GOLD_GRADIENT = `linear-gradient(120deg, ${MU_WALLPAPER_HEX.gold2}, var(--shop-primary, ${MU_WALLPAPER_HEX.gold}) 55%, ${MU_WALLPAPER_HEX.goldDeep})`;

/** Map a สายมู category key → its glow hex (used by wallpaper preview art). */
export const MU_CATEGORY_GLOW: Record<string, string> = {
  wealth: MU_WALLPAPER_HEX.wealth,
  love: MU_WALLPAPER_HEX.love,
  career: MU_WALLPAPER_HEX.career,
  protect: MU_WALLPAPER_HEX.protect,
  health: MU_WALLPAPER_HEX.health,
};
