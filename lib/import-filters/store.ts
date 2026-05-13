'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MarketplaceStatus } from '@/lib/import-sources/types';
import { DEFAULT_FILTERS, type FilterState, type SavedPreset } from './types';

interface FilterStoreState {
  current: FilterState;
  savedPresets: SavedPreset[];

  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setMany: (patch: Partial<FilterState>) => void;
  reset: () => void;
  resetKeepingKeyword: () => void;

  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;

  toggleCategory: (slug: string) => void;
  toggleExcludeTag: (tag: string) => void;
  toggleMarketplaceStatus: (status: MarketplaceStatus) => void;
}

export const useFilterStore = create<FilterStoreState>()(
  persist(
    (set) => ({
      current: DEFAULT_FILTERS,
      savedPresets: [],

      setFilter: (key, value) =>
        set((s) => ({ current: { ...s.current, [key]: value } })),

      setMany: (patch) =>
        set((s) => ({ current: { ...s.current, ...patch } })),

      reset: () => set({ current: DEFAULT_FILTERS }),

      resetKeepingKeyword: () =>
        set((s) => ({ current: { ...DEFAULT_FILTERS, keyword: s.current.keyword, source: s.current.source } })),

      savePreset: (name) =>
        set((s) => {
          const { keyword: _keyword, ...filtersToSave } = s.current;
          const preset: SavedPreset = {
            id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name,
            filters: filtersToSave,
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
          };
          return { savedPresets: [...s.savedPresets, preset] };
        }),

      loadPreset: (presetId) =>
        set((s) => {
          const preset = s.savedPresets.find((p) => p.id === presetId);
          if (!preset) return s;
          return {
            current: { ...preset.filters, keyword: s.current.keyword } as FilterState,
            savedPresets: s.savedPresets.map((p) =>
              p.id === presetId ? { ...p, lastUsedAt: new Date().toISOString() } : p,
            ),
          };
        }),

      deletePreset: (presetId) =>
        set((s) => ({ savedPresets: s.savedPresets.filter((p) => p.id !== presetId) })),

      toggleCategory: (slug) =>
        set((s) => {
          const selected = s.current.selectedCategories;
          const next = selected.includes(slug)
            ? selected.filter((c) => c !== slug)
            : [...selected, slug];
          return { current: { ...s.current, selectedCategories: next } };
        }),

      toggleExcludeTag: (tag) =>
        set((s) => {
          const tags = s.current.excludeTags;
          const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
          return { current: { ...s.current, excludeTags: next } };
        }),

      toggleMarketplaceStatus: (status) =>
        set((s) => {
          const selected = s.current.marketplaceStatusFilter;
          const next = selected.includes(status)
            ? selected.filter((m) => m !== status)
            : [...selected, status];
          return { current: { ...s.current, marketplaceStatusFilter: next } };
        }),
    }),
    {
      name: 'basketplace-import-filters',
      version: 2,
    },
  ),
);
