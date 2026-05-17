'use client';
import React from 'react';
import { SlidersHorizontal, ChevronDown, Package } from 'lucide-react';

interface ProductInfo {
  slug: string; // Product slug
  name: string; // Product name
  image?: string; // Product image
  category: string; // Category name
  price: number; // Product price
}

interface FilterOption {
  label: string; // Filter label
  value: string; // Filter value
}

interface FilterGroup {
  label: string; // Filter group display name
  key: string; // Filter group key
  options: FilterOption[]; // Filter options
}

interface SortOption {
  label: string; // Sort option label
  value: string; // Sort option value
}

export interface CatalogProps {
  products: ProductInfo[]; // Items for current page
  filters: FilterGroup[]; // Filter groups
  activeFilters: Record<string, string[]>; // Active filter selections
  sortOptions: SortOption[]; // Available sort options
  pagination: { currentPage: number; totalPages: number }; // Pagination status
  onFilterChange: (key: string, value: string) => void;
  shopUrl: string; // Base URL for shop
}

export function Catalog({ products, filters, activeFilters, sortOptions, pagination, onFilterChange, shopUrl }: CatalogProps) {
  return (
    <div className="bg-[var(--shop-bg)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--shop-ink)]">All Packaging</h1>
          <p className="text-[var(--shop-ink-muted)] mt-2 text-sm">Showing {products.length} products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold text-[var(--shop-ink)] mb-6">
                <SlidersHorizontal size={18} /> Filters
              </div>
              
              <div className="space-y-6">
                {filters.map((filterGroup, idx) => (
                  <details key={idx} open className="group">
                    <summary className="flex justify-between items-center font-medium text-[var(--shop-ink)] cursor-pointer list-none">
                      {filterGroup.label}
                      <ChevronDown size={16} className="text-[var(--shop-ink-muted)] group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 space-y-3 pb-2 border-b border-[var(--shop-border)] group-last:border-0 group-last:pb-0">
                      {filterGroup.options.map((opt: FilterOption, oIdx: number) => {
                        const isChecked = activeFilters[filterGroup.key]?.includes(opt.value);
                        return (
                          <label key={oIdx} className="flex items-center gap-3 cursor-pointer group/label">
                            <input 
                              type="checkbox" 
                              checked={isChecked || false}
                              onChange={(e) => onFilterChange(filterGroup.key, opt.value)}
                              className="w-4 h-4 rounded border-[var(--shop-border)] text-[var(--shop-primary)] focus:ring-[var(--shop-primary)] cursor-pointer accent-[var(--shop-primary)]"
                            />
                            <span className="text-sm text-[var(--shop-ink-muted)] group-hover/label:text-[var(--shop-ink)] transition-colors">
                              {opt.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-end mb-6">
              <select 
                className="bg-[var(--shop-card)] border border-[var(--shop-border)] text-[var(--shop-ink)] text-sm rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-[var(--shop-primary)]"
                defaultValue="recommended"
              >
                {sortOptions.map((opt, idx) => (
                  <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {products.map((p, i) => (
                <a key={i} href={`${shopUrl}/${p.slug}`} className="group flex flex-col bg-[var(--shop-card)] rounded-xl border border-[var(--shop-border)] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square w-full bg-[#f3f4f6] relative">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--shop-ink-muted)]">
                        <Package size={40} className="opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs text-[var(--shop-ink-muted)] mb-1 uppercase tracking-wider">{p.category}</div>
                    <h3 className="font-medium text-[var(--shop-ink)] mb-2 line-clamp-2">{p.name}</h3>
                    <div className="mt-auto flex items-end justify-between">
                      <div className="font-semibold text-[var(--shop-ink)]">
                        ฿{p.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
