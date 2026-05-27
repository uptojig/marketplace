/**
 * NotionMart — shared palette + extended hex for the bespoke chrome.
 */

import type { BlockPalette } from '../_shared/palette';

export const NOTION_MART_PALETTE: BlockPalette = {
  background: '#FFFFFF',
  muted: '#F7F6F3',
  card: '#FFFFFF',
  cardForeground: '#1A1A1A',
  border: '#E5E5E5',
  foreground: '#1A1A1A',
  mutedForeground: '#6B6B6B',
  primary: '#000000',
  primaryForeground: '#FFFFFF',
};

export const NOTION_MART_HEX = {
  primary: '#000000',
  primaryHover: '#1A1A1A',
  primaryDark: '#000000',
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  accentDark: '#1E40AF',
  savings: '#DC2626',
  ink: '#1A1A1A',
  inkMuted: '#6B6B6B',
  bg: '#FFFFFF',
  bgSoft: '#F7F6F3',
  border: '#E5E5E5',
  muted: '#EFEEEC',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
} as const;
