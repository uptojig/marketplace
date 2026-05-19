'use client';
import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Check, LayoutGrid, Star } from 'lucide-react';

interface ProductInfo {
  id: string; // Product ID
  name: string; // Product name
  image?: string; // Product image
  price: number; // Current price
  originalPrice?: number; // Old price
  soldCount?: number; // Sold count
  rating?: number; // Rating score
  location?: string; // Shipping from location
  isMall?: boolean; // Is official mall product
}

interface FilterOption {
  label: string; // Filter label (e.g. "Samsung", "Bangkok")
  value: string; // Filter value
}

interface FilterGroup {
  label: string; // Filter group display name
  key: string; // Filter group key internally
  options: FilterOption[]; // Options available
}

export interface CatalogProps {
  products: ProductInfo[]; // Items to show
  filters: FilterGroup[]; // Filter categories
  activeFilters: Record<string, string[]>; // Current selected filters
  sortOptions: { label: string; value: string }[]; // Sort fields
  pagination: { currentPage: number; totalPages: number }; // Page info
  onFilterChange: (key: string, value: string) => void;
  productBaseUrl: string; // Base URL strictly for generating single item links
}

export function Catalog({ products, filters, activeFilters, sortOptions, pagination, onFilterChange, productBaseUrl }: CatalogProps) {
  
  return (
    <div className="bg-[var(--shop-bg)] min-h-screen py-4 sm:py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          
          {/* Sidebar Filters (Hidden on small mobile by default, but let's keep it visible for desktop) */}
          <aside className="w-full lg:w-60 flex-shrink-0 hidden md:block">
            <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-5 sticky top-24">
              <div className="flex items-center gap-2 font-bold text-[var(--shop-ink)] mb-6 text-sm border-b border-[var(--shop-border)] pb-3">
                <SlidersHorizontal size={18} /> คัดกรองสินค้า
              </div>
              
              <div className="space-y-6">
                {filters.map((filterGroup, idx) => (
                  <details key={idx} open className="group">
                    <summary className="flex justify-between items-center font-bold text-[var(--shop-ink)] cursor-pointer list-none text-sm">
                      {filterGroup.label}
                      <ChevronDown size={14} className="text-[var(--shop-ink-muted)] group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 space-y-2 pb-1">
                      {filterGroup.options.map((opt, oIdx) => {
                        const isChecked = activeFilters[filterGroup.key]?.includes(opt.value);
                        return (
                          <label key={oIdx} className="flex items-start gap-2 cursor-pointer group/label">
                            <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${isChecked ? 'bg-[var(--shop-primary)] border-[var(--shop-primary)]' : 'border-gray-300 bg-white'}`}>
                              {isChecked && <Check size={12} className="text-white" />}
                            </div>
                            <input 
                              type="checkbox" 
                              checked={isChecked || false}
                              onChange={(e) => onFilterChange(filterGroup.key, opt.value)}
                              className="hidden"
                            />
                            <span className={`text-xs ${isChecked ? 'text-[var(--shop-primary)] font-medium' : 'text-[var(--shop-ink-muted)] group-hover/label:text-[var(--shop-primary)]'} transition-colors`}>
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

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Top Toolbar (Sort & Display options) */}
            <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto">
                <span className="text-xs text-[var(--shop-ink-muted)] whitespace-nowrap min-w-max mr-2 hidden sm:inline">เรียงตาม:</span>
                {sortOptions.map((opt, idx) => (
                  <button 
                    key={idx} 
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors border ${idx === 0 ? 'bg-[var(--shop-primary)] text-white border-[var(--shop-primary)]' : 'bg-[var(--shop-card)] text-[var(--shop-ink)] border-[var(--shop-border)] hover:border-[var(--shop-primary)] hover:text-[var(--shop-primary)]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--shop-ink-muted)]">
                <span>หน้า {pagination.currentPage}/{pagination.totalPages}</span>
              </div>
            </div>

            {/* Product Grid (Dense 2 cols mobile, up to 5 cols desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.map((p, i) => (
                <a key={i} href={`${productBaseUrl}/${p.id}`} className="bg-[var(--shop-card)] rounded-xl overflow-hidden hover:shadow-lg transition-all border border-[var(--shop-border)] hover:border-[var(--shop-primary)] group flex flex-col relative">
                  
                  {/* Mall Badge */}
                  {p.isMall && (
                    <div className="absolute top-2 left-0 bg-[var(--shop-accent)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-r z-10 shadow-sm flex items-center">
                      Mall
                    </div>
                  )}

                  <div className="aspect-square bg-[var(--shop-bg)] relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><LayoutGrid size={40} /></div>
                    )}
                  </div>
                  
                  <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between gap-1.5">
                    <h3 className="text-xs sm:text-sm text-[var(--shop-ink)] leading-snug line-clamp-2 group-hover:text-[var(--shop-primary)] transition-colors">
                      {p.name}
                    </h3>
                    
                    {/* Price and Details */}
                    <div className="flex flex-col mt-auto gap-0.5">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-[10px] text-[var(--shop-primary)] font-bold">฿</span>
                        <span className="text-base sm:text-xl font-extrabold text-[var(--shop-primary)] leading-none">
                          {p.price.toLocaleString()}
                        </span>
                        {p.originalPrice && (
                          <span className="text-[9px] text-[var(--shop-ink-muted)] line-through ml-1">฿{p.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[var(--shop-ink-muted)] mt-1">
                        <span className="flex items-center gap-0.5"><Star size={10} className="fill-[var(--shop-primary)] text-[var(--shop-primary)]" /> {p.rating || '4.9'}</span>
                        <span>ขายแล้ว {p.soldCount || 0}</span>
                      </div>
                      <div className="text-[9px] text-[var(--shop-ink-muted)] mt-0.5">
                        {p.location || 'กรุงเทพมหานคร'}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Simple Pagination */}
            <div className="mt-8 flex justify-center">
              <button disabled className="px-4 py-2 border border-[var(--shop-border)] text-sm rounded-md mr-2 opacity-50 bg-white">ก่อนหน้า</button>
              <button className="px-4 py-2 bg-[var(--shop-primary)] text-white font-medium text-sm rounded-md shadow-sm">ถัดไป</button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
