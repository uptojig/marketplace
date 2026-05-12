import type { CSSProperties } from 'react';
import type { ThemeTokens } from './types';

export const defaultTheme: ThemeTokens = {
  colors: {
    primary: '#0F172A',
    accent: '#3B82F6',
    surface: '#FFFFFF',
    text: '#0F172A',
  },
  typography: {
    titleScale: 'default',
    fontFamily: 'default',
  },
  spacing: 'default',
  radius: 'default',
};

export const themePresets = {
  classic: defaultTheme,
  lookbook: {
    ...defaultTheme,
    spacing: 'airy',
    radius: 'sharp',
    typography: { titleScale: 'editorial', fontFamily: 'display' },
  },
  premium: {
    ...defaultTheme,
    spacing: 'airy',
    radius: 'sharp',
    typography: { titleScale: 'editorial', fontFamily: 'serif' },
  },
  catalog: {
    ...defaultTheme,
    spacing: 'compact',
    radius: 'sharp',
    typography: { titleScale: 'compact', fontFamily: 'default' },
  },
  playful: {
    ...defaultTheme,
    spacing: 'default',
    radius: 'round',
    typography: { titleScale: 'default', fontFamily: 'display' },
  },
} as const satisfies Record<string, ThemeTokens>;

/**
 * Convert ThemeTokens to CSS variables scoped to the storefront.
 * Apply to the .storefront wrapper, not the root — keeps shop theme
 * isolated from the platform UI.
 */
export function themeToCSS(theme: ThemeTokens): CSSProperties {
  return {
    '--store-primary': theme.colors.primary,
    '--store-accent': theme.colors.accent,
    '--store-surface': theme.colors.surface,
    '--store-text': theme.colors.text,
  } as CSSProperties;
}

export function getSpacingClass(spacing: ThemeTokens['spacing']): string {
  return { compact: 'space-y-2', default: 'space-y-4', airy: 'space-y-8' }[spacing];
}

export function getRadiusClass(radius: ThemeTokens['radius']): string {
  return { sharp: 'rounded-none', default: 'rounded-md', round: 'rounded-2xl' }[radius];
}

export function getFontClass(font: ThemeTokens['typography']['fontFamily']): string {
  return {
    default: 'font-sans',
    serif: 'font-serif',
    display: 'font-sans tracking-tight',
  }[font];
}
