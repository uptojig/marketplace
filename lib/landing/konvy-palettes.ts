/**
 * Konvy theme — 7 K-beauty palette presets.
 *
 * Each preset paints (--shop-primary, --shop-accent, --shop-primary-gradient)
 * on a Konvy store via the operator's themeAccentOverride + themeAccentSecondary
 * + themePrimaryGradient fields. Pick one in admin and the storefront re-skins.
 *
 * Inspired by K-beauty product packaging palettes: muted-pastel families that
 * read "premium clean cosmetics" rather than full-saturation marketplace red.
 */

export interface KonvyPalette {
  id: string;
  name: string;
  /** main CTA / price / FLASH SALE pill */
  primary: string;
  /** highlight chips / icons / lightning marks */
  accent: string;
  /** hero / section header strip / category icon backgrounds */
  gradient: string;
  /** short label shown under the swatch in admin */
  blurb: string;
}

export const KONVY_PALETTES: readonly KonvyPalette[] = [
  {
    id: 'rose',
    name: 'Rose Blossom',
    primary: '#FF6B9D',
    accent: '#FFC857',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFB6C1 100%)',
    blurb: 'ชมพูพีช / สด ใส คลาสสิก',
  },
  {
    id: 'coral',
    name: 'Coral Sunset',
    primary: '#FF8B6B',
    accent: '#FFD66B',
    gradient: 'linear-gradient(135deg, #FF8B6B 0%, #FFCBA4 100%)',
    blurb: 'ส้มพีช / อบอุ่น เด็กผู้หญิงสไตล์ K-pop',
  },
  {
    id: 'sand',
    name: 'Sand Beige',
    primary: '#C9A87C',
    accent: '#E0B68F',
    gradient: 'linear-gradient(135deg, #C9A87C 0%, #E8D5B7 100%)',
    blurb: 'นู้ดเบจ / มินิมอล หรู เหมาะกับร้าน Skincare',
  },
  {
    id: 'mint',
    name: 'Mint Fresh',
    primary: '#7BCFB6',
    accent: '#A8E6CF',
    gradient: 'linear-gradient(135deg, #7BCFB6 0%, #C1F0E0 100%)',
    blurb: 'เขียวมินต์ / สดชื่น เหมาะกับ Sunscreen / Body',
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    primary: '#B69CD9',
    accent: '#E8D5F0',
    gradient: 'linear-gradient(135deg, #B69CD9 0%, #DCC4F0 100%)',
    blurb: 'ม่วงพาสเทล / น่ารัก ฝัน สไตล์ Y2K',
  },
  {
    id: 'sky',
    name: 'Sky Cotton',
    primary: '#87CEEB',
    accent: '#B0E0F0',
    gradient: 'linear-gradient(135deg, #87CEEB 0%, #C8E8F5 100%)',
    blurb: 'ฟ้าใส / นุ่ม สบายตา เหมาะกับ Toner / Serum',
  },
  {
    id: 'charcoal',
    name: 'Charcoal Luxe',
    primary: '#4A5568',
    accent: '#FFD700',
    gradient: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)',
    blurb: 'ดำเทาหรู / lux / เหมาะกับ Men line / Premium',
  },
];

export function getKonvyPalette(id: string | null | undefined): KonvyPalette | undefined {
  if (!id) return undefined;
  return KONVY_PALETTES.find((p) => p.id === id);
}
