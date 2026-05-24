/**
 * Theme palettes registry — maps a templateId to its list of preset
 * color palettes. Admin UI uses this to render a swatch picker for stores
 * on a theme that ships preset shades. Picking a swatch sets the store's
 * themeAccentOverride + themeAccentSecondary + themePrimaryGradient at once.
 *
 * Themes WITHOUT a preset list use the default themeAccentOverride color
 * picker (single hex).
 */
import { KONVY_PALETTES, type KonvyPalette } from './konvy-palettes';
import { OMNIPACK_PALETTES } from './omnipack-palettes';
import { BLACKWRAPP_PALETTES } from './blackwrapp-palettes';
import { GRIDMODU_PALETTES } from './gridmodu-palettes';
import { MOTOFOG_PALETTES } from './motofog-palettes';

export type ThemePalette = KonvyPalette;

export const THEME_PALETTES: Record<string, readonly ThemePalette[]> = {
  konvy: KONVY_PALETTES,
  omnipack: OMNIPACK_PALETTES,
  blackwrapp: BLACKWRAPP_PALETTES,
  gridmodu: GRIDMODU_PALETTES,
  motofog: MOTOFOG_PALETTES,
};

/** Returns presets for the given templateId, or empty array if none defined. */
export function getThemePalettes(templateId: string | null | undefined): readonly ThemePalette[] {
  if (!templateId) return [];
  return THEME_PALETTES[templateId] ?? [];
}

/** Look up a single preset within a theme by its id. */
export function getThemePalette(
  templateId: string | null | undefined,
  paletteId: string | null | undefined,
): ThemePalette | undefined {
  if (!templateId || !paletteId) return undefined;
  return THEME_PALETTES[templateId]?.find((p) => p.id === paletteId);
}
