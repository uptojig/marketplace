/**
 * MotoFog — 3 palette presets for the motorcycle parts / racing theme.
 * High-saturation moto-sport colors with technical-gray bases.
 */
import type { KonvyPalette } from './konvy-palettes';

export const MOTOFOG_PALETTES: readonly KonvyPalette[] = [
  {
    id: 'moto-orange',
    name: 'Moto Orange',
    primary: '#FF6B35',
    accent: '#5C6B73',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #C44A1E 100%)',
    blurb: 'ส้มมอเตอร์สปอร์ต + เทาดวง / โทน adventure',
  },
  {
    id: 'race-green',
    name: 'Race Green',
    primary: '#1B4332',
    accent: '#52B788',
    gradient: 'linear-gradient(135deg, #1B4332 0%, #0F2E22 100%)',
    blurb: 'เขียวเรซซิ่ง / โทน British racing',
  },
  {
    id: 'jet-black',
    name: 'Jet Black',
    primary: '#0A0A0A',
    accent: '#FFC72C',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
    blurb: 'ดำเงา + เหลืองเตือน / โทน street stunt',
  },
];

export function getMotofogPalette(id: string | null | undefined) {
  if (!id) return undefined;
  return MOTOFOG_PALETTES.find((p) => p.id === id);
}
