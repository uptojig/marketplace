'use client';

import React from 'react';
import {
  IconArrowRight,
  IconHeart,
  IconStarFilled,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import type { Product } from './Homepage';

// ============ Types ============
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'color' | 'size' | 'price';
  options: FilterOption[];
}

export interface ActiveFilters {
  /** Map of filter key -> array of selected values */
  [key: string]: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export interface CatalogProps {
  /** Category title for hero strip */
  title?: string;
  /** Lead copy under title */
  lead?: string;
  products?: Product[];
  filters?: FilterGroup[];
  activeFilters?: ActiveFilters;
  sortOptions?: SortOption[];
  currentSort?: string;
  pagination?: Pagination;
  /** Color hex map for swatch chips by value */
  colorHexMap?: Record<string, string>;
  onFilterChange?: (key: string, value: string, checked: boolean) => void;
  onSortChange?: (sort: string) => void;
  onPageChange?: (page: number) => void;
  onClearFilters?: () => void;
  // URL prop: store homepage (breadcrumb root)
  homeUrl: string;
  // URL prop: shop / catalog landing page
  shopUrl: string;
}

const DEFAULT_FILTERS: FilterGroup[] = [
  {
    key: 'category',
    label: 'Category',
    type: 'checkbox',
    options: [
      { value: 'bikini', label: 'Bikini Sets', count: 120 },
      { value: 'one-piece', label: 'One-Piece', count: 68 },
      { value: 'tankini', label: 'Tankini', count: 42 },
      { value: 'cover-up', label: 'Cover-Ups', count: 35 },
      { value: 'accessories', label: 'Accessories', count: 88 },
    ],
  },
  {
    key: 'size',
    label: 'Size',
    type: 'size',
    options: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: '2XL', label: '2XL' },
      { value: '3XL', label: '3XL' },
    ],
  },
  {
    key: 'color',
    label: 'Color',
    type: 'color',
    options: [
      { value: 'EC4899', label: 'Coral' },
      { value: '38BDF8', label: 'Sky' },
      { value: '1E40AF', label: 'Navy' },
      { value: 'F59E0B', label: 'Gold' },
      { value: 'FB923C', label: 'Orange' },
      { value: '10B981', label: 'Emerald' },
      { value: 'A855F7', label: 'Lavender' },
      { value: '0F172A', label: 'Black' },
      { value: 'FFFFFF', label: 'White' },
      { value: 'F43F5E', label: 'Crimson' },
    ],
  },
  {
    key: 'pattern',
    label: 'Pattern',
    type: 'checkbox',
    options: [
      { value: 'solid', label: 'Solid Color', count: 54 },
      { value: 'polka', label: 'Polka Dot', count: 28 },
      { value: 'tropical', label: 'Tropical', count: 36 },
      { value: 'floral', label: 'Floral', count: 42 },
      { value: 'animal', label: 'Animal Print', count: 14 },
      { value: 'geometric', label: 'Geometric', count: 18 },
    ],
  },
  {
    key: 'style',
    label: 'Style',
    type: 'checkbox',
    options: [
      { value: 'triangle', label: 'Triangle', count: 42 },
      { value: 'bandeau', label: 'Bandeau', count: 28 },
      { value: 'halter', label: 'Halter', count: 35 },
      { value: 'sporty', label: 'Sporty', count: 22 },
    ],
  },
];

const DEFAULT_SORT: SortOption[] = [
  { value: 'featured', label: 'Sort: แนะนำ' },
  { value: 'newest', label: 'ใหม่ล่าสุด' },
  { value: 'bestseller', label: 'ขายดี' },
  { value: 'price-asc', label: 'ราคา ต่ำ-สูง' },
  { value: 'price-desc', label: 'ราคา สูง-ต่ำ' },
  { value: 'rating', label: 'คะแนนสูงสุด' },
];

const tinyBikini = (color: string) => (
  <svg viewBox="0 0 200 250" width="60%" aria-hidden="true">
    <path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill={color} />
    <path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill={color} />
    <path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill={color} />
  </svg>
);

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', slug: 'polka-pink-triangle', name: 'Polka Pink · Triangle Set', desc: 'มี Padding · ปรับสายได้', price: 890, was: 1290, rating: 4.9, colors: ['#EC4899', '#38BDF8', '#FACC15'], tag: 'hot', tagLabel: 'BESTSELLER', bgVariant: 'bg-rose', illustration: tinyBikini('#EC4899') },
  { id: 'p2', slug: 'ocean-blue', name: 'Ocean Blue · Bandeau', desc: 'สายถอดได้ · Push-up', price: 1290, rating: 4.8, colors: ['#38BDF8', '#0F172A'], tag: 'new', tagLabel: 'NEW', bgVariant: 'bg-sky', illustration: tinyBikini('#38BDF8') },
  { id: 'p3', slug: 'sunset-gold', name: 'Sunset Gold · Tankini', desc: 'ผ้ารีไซเคิล · ปิดเอว', price: 1190, was: 1990, rating: 4.7, colors: ['#F59E0B', '#10B981'], tag: 'sale', tagLabel: '−40%', bgVariant: 'bg-yellow', illustration: tinyBikini('#F59E0B') },
  { id: 'p4', slug: 'coral-wave', name: 'Coral Wave · Cutout 1pc', desc: 'เปิดหลัง · ผ้านุ่ม', price: 1490, was: 1890, rating: 5.0, colors: ['#FB923C', '#EC4899'], tag: 'best', tagLabel: 'TOP RATED', bgVariant: 'bg-orange', illustration: tinyBikini('#FB923C') },
  { id: 'p5', slug: 'tropical-bloom', name: 'Tropical Bloom · Halter', desc: 'ลายดอกไม้ · สายผูกคอ', price: 1090, rating: 4.9, colors: ['#3B82F6', '#10B981'], tag: 'new', tagLabel: 'NEW', bgVariant: 'bg-blue', illustration: tinyBikini('#3B82F6') },
  { id: 'p6', slug: 'emerald-lush', name: 'Emerald Lush · Sporty', desc: 'ฟิตเซ็กซี่ · ออกกำลังกาย', price: 790, was: 1150, rating: 4.8, colors: ['#10B981', '#7C3AED'], tag: 'sale', tagLabel: '−30%', bgVariant: 'bg-green', illustration: tinyBikini('#10B981') },
  { id: 'p7', slug: 'lavender-dream', name: 'Lavender Dream · Strappy', desc: 'สายแคบ · เซ็กซี่', price: 1190, rating: 4.7, colors: ['#A855F7', '#EC4899'], tag: 'hot', tagLabel: 'TRENDING', bgVariant: 'bg-purple', illustration: tinyBikini('#A855F7') },
  { id: 'p8', slug: 'crimson-curve', name: 'Crimson Curve · Maillot', desc: 'เปิดข้าง · ดีไซน์เด่น', price: 1690, was: 2290, rating: 4.9, colors: ['#F43F5E', '#0F172A'], tag: 'best', tagLabel: "EDITOR'S", bgVariant: 'bg-coral', illustration: tinyBikini('#F43F5E') },
  { id: 'p9', slug: 'sea-foam', name: 'Sea Foam · Wrap 1pc', desc: 'ผ้านุ่ม · ดีไซน์เรียบ', price: 1390, rating: 4.8, colors: ['#0EA5E9'], tag: 'new', tagLabel: 'NEW', bgVariant: 'bg-sky', illustration: tinyBikini('#0EA5E9') },
  { id: 'p10', slug: 'blush-pink', name: 'Blush Pink · Underwire', desc: 'ผ้ายืด · ใส่สบาย', price: 990, was: 1320, rating: 4.7, colors: ['#F472B6', '#F43F5E'], tag: 'sale', tagLabel: '−25%', bgVariant: 'bg-rose', illustration: tinyBikini('#F472B6') },
  { id: 'p11', slug: 'honey-sun', name: 'Honey Sun · Triangle', desc: 'ผ้ารีไซเคิล · UV protection', price: 1090, rating: 4.6, colors: ['#FBBF24', '#FB923C'], tag: 'eco', tagLabel: 'ECO', bgVariant: 'bg-yellow', illustration: tinyBikini('#FBBF24') },
  { id: 'p12', slug: 'tangerine', name: 'Tangerine · Sporty Maillot', desc: 'เปิดหลัง · ใส่ออกกำลังกาย', price: 1290, rating: 4.8, colors: ['#FB923C'], bgVariant: 'bg-orange', illustration: tinyBikini('#FB923C') },
];

const DEFAULT_PAGINATION: Pagination = { page: 1, totalPages: 10, total: 120, pageSize: 12 };

// ============ Component ============
export function Catalog({
  title = 'Bikini Sets',
  lead = '120 สไตล์ · สีสันสด · ผ้าคุณภาพ · พร้อมส่ง',
  products = DEFAULT_PRODUCTS,
  filters = DEFAULT_FILTERS,
  activeFilters = { category: ['bikini'], size: ['S', 'M'], pattern: ['polka'], color: ['EC4899'] },
  sortOptions = DEFAULT_SORT,
  currentSort = 'featured',
  pagination = DEFAULT_PAGINATION,
  onFilterChange,
  onSortChange,
  onPageChange,
  onClearFilters,
  homeUrl,
  shopUrl,
}: CatalogProps) {
  const isActive = (key: string, val: string) => activeFilters[key]?.includes(val) ?? false;

  const renderFilterGroup = (g: FilterGroup) => {
    if (g.type === 'color') {
      return (
        <div className="bk-color-grid">
          {g.options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`bk-color-chip${isActive(g.key, o.value) ? ' active' : ''}`}
              style={{ background: `#${o.value}`, ...(o.value === 'FFFFFF' ? { border: '1.5px solid #ccc' } : {}) }}
              aria-label={`${o.label} color`}
              aria-pressed={isActive(g.key, o.value)}
              onClick={() => onFilterChange?.(g.key, o.value, !isActive(g.key, o.value))}
            />
          ))}
        </div>
      );
    }
    if (g.type === 'size') {
      return (
        <div className="bk-size-grid">
          {g.options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`bk-size-chip${isActive(g.key, o.value) ? ' active' : ''}`}
              aria-pressed={isActive(g.key, o.value)}
              onClick={() => onFilterChange?.(g.key, o.value, !isActive(g.key, o.value))}
            >
              {o.label}
            </button>
          ))}
        </div>
      );
    }
    return (
      <div className="bk-filter-items">
        {g.options.map((o) => (
          <label key={o.value} className="bk-filter-check">
            <input
              type="checkbox"
              checked={isActive(g.key, o.value)}
              onChange={(e) => onFilterChange?.(g.key, o.value, e.target.checked)}
            />
            {o.label}
            {o.count !== undefined && <span className="count">{o.count}</span>}
          </label>
        ))}
      </div>
    );
  };

  // Build page number list (with ellipsis)
  const pages: (number | 'ellipsis')[] = [];
  if (pagination.totalPages <= 7) {
    for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, 4, 5, 'ellipsis', pagination.totalPages);
  }

  return (
    <main>
      {/* HERO */}
      <section className="bk-cat-hero">
        <div className="bk-container">
          <div className="bk-cat-hero-inner">
            <div>
              <span className="bk-kicker" style={{ color: 'rgba(255,255,255,0.85)' }}>★ Summer 2026 Collection</span>
              <h1>{title}</h1>
              <p className="lead">{lead}</p>
            </div>
            <div className="bk-cat-hero-stats">
              <div><div className="num">{pagination.total}</div><div className="lbl">Styles</div></div>
              <div><div className="num">XS-3XL</div><div className="lbl">Size Range</div></div>
              <div><div className="num">14 ★</div><div className="lbl">New Arrivals</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="bk-container">
        <nav className="bk-crumb" aria-label="Breadcrumb">
          <a href={homeUrl}>Home</a>
          <span>/</span>
          <a href={shopUrl}>Shop</a>
          <span>/</span>
          <span className="current">{title}</span>
        </nav>
      </div>

      {/* MAIN */}
      <div className="bk-container">
        <div className="bk-catalog-layout">
          <aside className="bk-sidebar" aria-label="Product filters">
            {filters.map((g) => (
              <div key={g.key} className="bk-filter-block">
                <div className="bk-filter-title">{g.label}</div>
                {renderFilterGroup(g)}
              </div>
            ))}
            <div className="bk-filter-block">
              <button type="button" className="bk-btn bk-btn-secondary bk-btn-sm bk-btn-block" onClick={onClearFilters}>
                ล้างตัวกรอง
              </button>
            </div>
          </aside>

          <section aria-label="Products">
            <div className="bk-catalog-bar">
              <div className="results">
                พบ <b>{pagination.total}</b> สินค้า · หน้า {pagination.page} / {pagination.totalPages}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select value={currentSort} onChange={(e) => onSortChange?.(e.target.value)} aria-label="Sort products">
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bk-products-grid">
              {products.map((p) => (
                <a key={p.id} className="bk-pcard" href={`/shop/${p.slug}`}>
                  <div className={`bk-pcard-img ${p.bgVariant ?? 'bg-rose'}`}>
                    {p.tag && (
                      <div className="bk-pcard-tags">
                        <span className={`bk-tag bk-tag-${p.tag}`}>{p.tagLabel ?? p.tag.toUpperCase()}</span>
                      </div>
                    )}
                    <button type="button" className="bk-pcard-fav" aria-label="Add to wishlist" onClick={(e) => e.preventDefault()}><IconHeart size={16} /></button>
                    {p.illustration}
                  </div>
                  <div className="bk-pcard-info">
                    <div className="bk-pcard-name">{p.name}</div>
                    {p.desc && <div className="bk-pcard-desc">{p.desc}</div>}
                    <div className="bk-pcard-foot">
                      <div>
                        <span className="bk-price">฿{p.price.toLocaleString()}</span>
                        {p.was && <span className="bk-was">฿{p.was.toLocaleString()}</span>}
                      </div>
                      {p.rating && (
                        <div className="bk-meta">
                          <IconStarFilled size={11} className="star" />
                          {p.rating}
                        </div>
                      )}
                    </div>
                    {p.colors && (
                      <div className="bk-pcard-colors">
                        {p.colors.map((c, i) => (
                          <div key={i} className="bk-pcard-color" style={{ background: c }} />
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            <nav className="bk-pagination" aria-label="Pagination">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                aria-label="Previous page"
              >
                <IconChevronLeft size={14} />
              </button>
              {pages.map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>···</span>
                ) : (
                  <a
                    key={p}
                    href={`?page=${p}`}
                    className={p === pagination.page ? 'active' : ''}
                    aria-current={p === pagination.page ? 'page' : undefined}
                    onClick={(e) => { e.preventDefault(); onPageChange?.(p); }}
                  >
                    {p}
                  </a>
                )
              )}
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
                aria-label="Next page"
              >
                <IconChevronRight size={14} />
              </button>
            </nav>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Catalog;
