/**
 * OmniPack — 3 palette presets for the ready-made packaging store theme.
 * Kraft / craft-paper / eco vibes.
 */
import type { KonvyPalette } from './konvy-palettes';

export const OMNIPACK_PALETTES: readonly KonvyPalette[] = [
  {
    id: 'kraft',
    name: 'Kraft Brown',
    primary: '#B8845F',
    accent: '#87A96B',
    gradient: 'linear-gradient(135deg, #B8845F 0%, #8B6F47 100%)',
    blurb: 'น้ำตาลคราฟท์ / กล่องลูกฟูก / eco-friendly',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#3B6E47',
    accent: '#C9A87C',
    gradient: 'linear-gradient(135deg, #3B6E47 0%, #5C8A5C 100%)',
    blurb: 'เขียวป่า / รีไซเคิล / องค์กรสายรักษ์โลก',
  },
  {
    id: 'terracotta',
    name: 'Terracotta Warm',
    primary: '#C97B5B',
    accent: '#F4D5A8',
    gradient: 'linear-gradient(135deg, #C97B5B 0%, #A85B3B 100%)',
    blurb: 'ส้มดิน / อบอุ่น / สไตล์ artisan boutique',
  },
];

export function getOmnipackPalette(id: string | null | undefined) {
  if (!id) return undefined;
  return OMNIPACK_PALETTES.find((p) => p.id === id);
}
