/**
 * BlackWrapp — 3 palette presets for the dark-mode packaging/wrap theme.
 * Bold black base with one electric accent — premium delivery wrap vibe.
 */
import type { KonvyPalette } from './konvy-palettes';

export const BLACKWRAPP_PALETTES: readonly KonvyPalette[] = [
  {
    id: 'neon-lime',
    name: 'Neon Lime',
    primary: '#1A1A1A',
    accent: '#00FF88',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
    blurb: 'ดำคาร์บอน + เขียวนีออน / โทน premium delivery',
  },
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    primary: '#0A0A0A',
    accent: '#00D4FF',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A2A3A 100%)',
    blurb: 'ดำด้าน + ฟ้าไฟฟ้า / hi-tech wrap',
  },
  {
    id: 'gold-luxe',
    name: 'Gold Luxe',
    primary: '#1A1A1A',
    accent: '#FFD700',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #2A1F0A 100%)',
    blurb: 'ดำ + ทอง / luxury gift wrap / โทนหรู',
  },
];

export function getBlackwrappPalette(id: string | null | undefined) {
  if (!id) return undefined;
  return BLACKWRAPP_PALETTES.find((p) => p.id === id);
}
