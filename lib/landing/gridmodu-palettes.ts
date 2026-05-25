/**
 * GridModu — 3 palette presets for the modular grid / motor accessory theme.
 * Carbon dark base with electric trim — bike-modder / spec-rows aesthetic.
 */
import type { KonvyPalette } from './konvy-palettes';

export const GRIDMODU_PALETTES: readonly KonvyPalette[] = [
  {
    id: 'carbon-cyan',
    name: 'Carbon Cyan',
    primary: '#2C2C2C',
    accent: '#00BFFF',
    gradient: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
    blurb: 'คาร์บอน + ฟ้าไซเบอร์ / โทน performance',
  },
  {
    id: 'rally-red',
    name: 'Rally Red',
    primary: '#1C1C1C',
    accent: '#E63946',
    gradient: 'linear-gradient(135deg, #1C1C1C 0%, #2A0E10 100%)',
    blurb: 'ดำ + แดงแรลลี่ / โทน racing / ของแต่งซิ่ง',
  },
  {
    id: 'titanium-gold',
    name: 'Titanium Gold',
    primary: '#3A3A3A',
    accent: '#D4A017',
    gradient: 'linear-gradient(135deg, #3A3A3A 0%, #1E1E1E 100%)',
    blurb: 'เทาไทเทเนียม + ทอง / โทน premium tuning',
  },
];

export function getGridmoduPalette(id: string | null | undefined) {
  if (!id) return undefined;
  return GRIDMODU_PALETTES.find((p) => p.id === id);
}
