'use client';

import { X } from 'lucide-react';
import { DEFAULT_FILTERS } from '@/lib/import-filters/types';
import { useFilterStore } from '@/lib/import-filters/store';
import { CATEGORY_LOOKUP } from '@/lib/import-filters/categories';

const MARKETPLACE_LABEL: Record<string, string> = {
  not_selling: 'ยังไม่มีคนขาย',
  low_competition: 'คู่แข่งน้อย',
  moderate_competition: 'คู่แข่งปานกลาง',
  saturated: 'อิ่มตัว',
};

/**
 * Compact horizontal strip showing currently-active filters as removable chips.
 * Sits below the search bar, above the product grid.
 */
export function ActiveFilterChips() {
  const f = useFilterStore((s) => s.current);
  const setFilter = useFilterStore((s) => s.setFilter);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);
  const toggleExcludeTag = useFilterStore((s) => s.toggleExcludeTag);
  const toggleMarketplaceStatus = useFilterStore((s) => s.toggleMarketplaceStatus);
  const reset = useFilterStore((s) => s.resetKeepingKeyword);

  const chips: Array<{ key: string; label: string; onClear: () => void }> = [];

  if (f.minPriceUSD > 0 || f.maxPriceUSD < DEFAULT_FILTERS.maxPriceUSD) {
    chips.push({
      key: 'price',
      label: `$${f.minPriceUSD}–$${f.maxPriceUSD}`,
      onClear: () => {
        setFilter('minPriceUSD', 0);
        setFilter('maxPriceUSD', DEFAULT_FILTERS.maxPriceUSD);
      },
    });
  }

  if (f.minMarginX > DEFAULT_FILTERS.minMarginX) {
    chips.push({
      key: 'margin',
      label: `กำไร ≥${f.minMarginX}×`,
      onClear: () => setFilter('minMarginX', DEFAULT_FILTERS.minMarginX),
    });
  }

  if (f.minRating > 0) {
    chips.push({
      key: 'rating',
      label: `${f.minRating}+ ดาว`,
      onClear: () => setFilter('minRating', 0),
    });
  }

  if (f.minOrders > 0) {
    chips.push({
      key: 'orders',
      label: `ยอด ${f.minOrders.toLocaleString()}+`,
      onClear: () => setFilter('minOrders', 0),
    });
  }

  if (f.freeShipping) {
    chips.push({ key: 'free', label: 'ส่งฟรี', onClear: () => setFilter('freeShipping', false) });
  }

  if (f.shipFromTH) {
    chips.push({ key: 'th', label: 'ส่งจาก TH', onClear: () => setFilter('shipFromTH', false) });
  }

  if (f.maxShippingDays < DEFAULT_FILTERS.maxShippingDays) {
    chips.push({
      key: 'days',
      label: `≤${f.maxShippingDays} วัน`,
      onClear: () => setFilter('maxShippingDays', DEFAULT_FILTERS.maxShippingDays),
    });
  }

  if (f.hasVariants) {
    chips.push({ key: 'var', label: 'มีตัวเลือก', onClear: () => setFilter('hasVariants', false) });
  }

  if (f.hasMultipleImages) {
    chips.push({
      key: 'img',
      label: 'ภาพ 2+',
      onClear: () => setFilter('hasMultipleImages', false),
    });
  }

  for (const slug of f.selectedCategories) {
    chips.push({
      key: `cat-${slug}`,
      label: CATEGORY_LOOKUP.get(slug)?.label ?? slug,
      onClear: () => toggleCategory(slug),
    });
  }

  for (const status of f.marketplaceStatusFilter) {
    chips.push({
      key: `mkt-${status}`,
      label: MARKETPLACE_LABEL[status] ?? status,
      onClear: () => toggleMarketplaceStatus(status),
    });
  }

  if (!f.hideRejected) {
    chips.push({
      key: 'show-rejected',
      label: '⚠ แสดงสินค้าเสี่ยง',
      onClear: () => setFilter('hideRejected', true),
    });
  }

  if (f.hideFlagged) {
    chips.push({
      key: 'hide-flagged',
      label: 'ซ่อน flagged',
      onClear: () => setFilter('hideFlagged', false),
    });
  }

  for (const tag of f.excludeTags) {
    chips.push({
      key: `tag-${tag}`,
      label: `บล็อก: ${tag}`,
      onClear: () => toggleExcludeTag(tag),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onClear}
          className="group inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-[11px] transition hover:bg-destructive/5 hover:border-destructive/40"
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
        </button>
      ))}
      <button
        onClick={reset}
        className="ml-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
      >
        ล้างทั้งหมด
      </button>
    </div>
  );
}
