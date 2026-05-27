'use client';
import React, { useState } from 'react';
import {
  ArrowRight,
  Download,
  BookOpen,
  Sparkles,
  Star,
  FileText,
  Presentation,
  ClipboardList,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

export interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
}

/**
 * EduClassroom — homepage for a Thai K-9 teacher digital-material store.
 *
 * Layout language: looks like a friendly classroom notebook.
 *   - Hero on cream/notebook paper with a chalk-yellow ruled margin.
 *   - "หมวดสื่อการสอน" tiles with subject icons (ใบงาน/สไลด์/ข้อสอบ/แบบทดสอบ).
 *   - "ดาวประจำสัปดาห์" featured rail with gold-star highlight badges.
 *   - Trust strip with download/edit/curriculum assurances.
 *   - Product grid with paper-card aesthetic + Add-to-cart that
 *     reads "หยิบใส่ตะกร้า" so a teacher feels at home.
 *
 * Every text/image is DB-backed via {store, products, categories}.
 */
export function Homepage({ store, products, categories }: HomepageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl || undefined,
    });
    showConfirm(product.title, store.slug);
  };

  const filteredProducts =
    selectedCategory === 'ทั้งหมด'
      ? products
      : products.filter((p) => p.categoryName === selectedCategory);

  // Subject icon mapping — falls back to a neutral icon for unmatched
  // categories. Real category names come from DB.
  const categoryIcon = (label: string) => {
    const k = label.toLowerCase();
    if (k.includes('ใบงาน') || k.includes('แบบฝึก')) return FileText;
    if (k.includes('สไลด์') || k.includes('การสอน')) return Presentation;
    if (k.includes('ข้อสอบ') || k.includes('แบบทดสอบ')) return ClipboardList;
    if (k.includes('เกม') || k.includes('กิจกรรม')) return Sparkles;
    return BookOpen;
  };

  const featured = products.slice(0, 3);

  return (
    <main className="bg-[#FAFAF9] text-[#0F172A] min-h-screen font-[family:var(--font-prompt)]">
      {/* ─── Hero ─── notebook page with ruled-margin accent ─── */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0]">
        {/* Soft cream notebook backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FEF3C7] via-[#FAFAF9] to-[#EFF6FF] pointer-events-none" />

        {/* Notebook ruling — subtle horizontal lines */}
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(37,99,235,0.22) 31px, rgba(37,99,235,0.22) 32px)',
          }}
        />

        {/* Left chalk-yellow margin line */}
        <div className="absolute top-0 bottom-0 left-[7%] w-px bg-[#F59E0B]/40 pointer-events-none hidden md:block" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-white text-[#2563EB] text-xs font-[family:var(--font-kanit)] font-bold px-3 py-1.5 rounded-full border border-[#2563EB]/20 shadow-sm">
                  <GraduationCap size={14} />
                  ห้องเรียนคลาสรูม
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#F59E0B] text-white text-xs font-[family:var(--font-kanit)] font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <Star size={12} fill="white" />
                  ครูแนะนำครู
                </span>
              </div>

              <h1 className="font-[family:var(--font-kanit)] font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#0F172A]">
                ใบงาน · สไลด์ · ข้อสอบ
                <br />
                <span className="text-[#2563EB]">พร้อมสอนวันรุ่งขึ้น</span>
              </h1>

              <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
                สื่อการสอนสำหรับครูประถม–มัธยมต้น ออกแบบโดยครูประจำการ
                สอดคล้องกับหลักสูตรแกนกลาง ดาวน์โหลดได้ทันที แก้ไขใน
                Google Slides ได้อิสระ
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#shop-section"
                  className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-[family:var(--font-kanit)] font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all text-base"
                >
                  เลือกสื่อการสอน <ArrowRight size={18} />
                </a>
                <a
                  href={`/stores/${store.slug}/category`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#FEF3C7] text-[#0F172A] hover:text-[#B45309] font-[family:var(--font-kanit)] font-bold px-6 py-3 rounded-full border-2 border-[#E2E8F0] hover:border-[#F59E0B] transition-all text-base"
                >
                  ดูทั้งหมด ({products.length}) <BookOpen size={18} />
                </a>
              </div>

              {/* Mini trust strip */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { icon: Download, label: 'ดาวน์โหลดทันที' },
                  { icon: CheckCircle2, label: 'แก้ไขใน Slides ได้' },
                  { icon: ShieldStar, label: 'รับประกันคุณภาพ' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-sm"
                  >
                    <Icon size={16} className="text-[#16A34A] shrink-0" />
                    <span className="text-xs font-[family:var(--font-kanit)] font-semibold text-[#0F172A] truncate">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero featured product card stack */}
            {featured.length > 0 && (
              <div className="lg:col-span-5 relative">
                {/* Decorative pencil-yellow corner */}
                <div className="absolute -top-3 -left-3 w-20 h-20 bg-[#F59E0B]/20 rounded-2xl rotate-12 pointer-events-none hidden md:block" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#2563EB]/10 rounded-full pointer-events-none hidden md:block" />

                <div className="relative space-y-4">
                  {/* Top featured "ดาวประจำสัปดาห์" */}
                  <FeaturedHeroCard
                    product={featured[0]}
                    store={store}
                    onAdd={handleAddToCart}
                  />

                  {/* Two secondary stacked cards */}
                  {featured.slice(1, 3).length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {featured.slice(1, 3).map((p) => (
                        <SecondaryHeroCard
                          key={p.id}
                          product={p}
                          store={store}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Subject tiles ─── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-[family:var(--font-kanit)] font-bold text-2xl sm:text-3xl text-[#0F172A]">
                หมวดสื่อการสอน
              </h2>
              <p className="text-sm text-[#475569] mt-1">
                เลือกตามชั้นเรียนหรือรูปแบบสื่อที่ต้องการ
              </p>
            </div>
            <a
              href={`/stores/${store.slug}/category`}
              className="hidden md:inline-flex items-center gap-1 text-sm font-[family:var(--font-kanit)] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              ดูทั้งหมด <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.slice(0, 8).map((c) => {
              const Icon = categoryIcon(c);
              const count = products.filter(
                (p) => p.categoryName === c,
              ).length;
              return (
                <a
                  key={c}
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(c)}`}
                  className="group bg-white border-2 border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 bg-[#EFF6FF] group-hover:bg-[#2563EB] rounded-xl flex items-center justify-center transition-colors">
                      <Icon
                        size={20}
                        className="text-[#2563EB] group-hover:text-white transition-colors"
                      />
                    </div>
                    <span className="text-[10px] font-[family:var(--font-kanit)] font-bold uppercase tracking-wider text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                  <h3 className="font-[family:var(--font-kanit)] font-bold text-sm text-[#0F172A] leading-snug">
                    {c}
                  </h3>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Filter chips + Product grid ─── */}
      <section
        id="shop-section"
        className="bg-white border-y border-[#E2E8F0] py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-[family:var(--font-kanit)] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#F59E0B]/40 px-2.5 py-1 rounded-full mb-2">
                <Star size={12} fill="#F59E0B" className="text-[#F59E0B]" />
                ดาวประจำสัปดาห์
              </div>
              <h2 className="font-[family:var(--font-kanit)] font-bold text-2xl sm:text-3xl text-[#0F172A]">
                สื่อที่ครูดาวน์โหลดมากที่สุด
              </h2>
            </div>
            <span className="text-sm font-[family:var(--font-kanit)] font-semibold text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-full self-start">
              พบ {filteredProducts.length} รายการ
            </span>
          </div>

          {/* Filter chips */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <ChipButton
                active={selectedCategory === 'ทั้งหมด'}
                onClick={() => setSelectedCategory('ทั้งหมด')}
                label={`ทั้งหมด (${products.length})`}
              />
              {categories.map((c) => {
                const count = products.filter(
                  (p) => p.categoryName === c,
                ).length;
                return (
                  <ChipButton
                    key={c}
                    active={selectedCategory === c}
                    onClick={() => setSelectedCategory(c)}
                    label={`${c} (${count})`}
                  />
                );
              })}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="bg-[#FAFAF9] border-2 border-dashed border-[#E2E8F0] rounded-2xl py-16 text-center">
              <BookOpen
                size={36}
                className="mx-auto mb-3 text-[#94A3B8]"
              />
              <p className="text-sm font-[family:var(--font-kanit)] font-semibold text-[#475569]">
                ยังไม่มีสื่อในหมวดนี้ในขณะนี้
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const hasDiscount =
                  p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                const discountPercent = hasDiscount
                  ? Math.round(
                      ((p.compareAtPriceTHB! - p.priceTHB) /
                        p.compareAtPriceTHB!) *
                        100,
                    )
                  : 0;

                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    store={store}
                    discountPercent={discountPercent}
                    onAdd={handleAddToCart}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────────────

interface FeaturedHeroCardProps {
  product: Product;
  store: { slug: string; name: string };
  onAdd: (p: Product, e: React.MouseEvent) => void;
}

function FeaturedHeroCard({ product, store, onAdd }: FeaturedHeroCardProps) {
  return (
    <div className="bg-white border-2 border-[#2563EB]/20 rounded-2xl overflow-hidden shadow-xl">
      <a
        href={`/stores/${store.slug}/products/${product.id}`}
        className="block relative aspect-[16/9] bg-[#EFF6FF] overflow-hidden"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ChalkboardPlaceholder />
        )}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-[#F59E0B] text-white text-[10px] font-[family:var(--font-kanit)] font-bold px-2.5 py-1 rounded-full shadow-md">
          <Star size={11} fill="white" />
          ดาวประจำสัปดาห์
        </div>
      </a>
      <div className="p-4 space-y-3">
        <div>
          <span className="text-[10px] font-[family:var(--font-kanit)] font-bold uppercase tracking-wider text-[#2563EB]">
            {product.categoryName || 'สื่อแนะนำ'}
          </span>
          <h3 className="font-[family:var(--font-kanit)] font-bold text-base text-[#0F172A] mt-1 line-clamp-2">
            {product.title}
          </h3>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-[family:var(--font-kanit)] text-2xl font-bold text-[#2563EB]">
              ฿{product.priceTHB.toLocaleString()}
            </span>
            {product.compareAtPriceTHB && (
              <span className="text-xs text-[#94A3B8] line-through">
                ฿{product.compareAtPriceTHB.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={(e) => onAdd(product, e)}
            className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-[family:var(--font-kanit)] font-bold text-xs px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            <Download size={13} />
            หยิบใส่ตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}

interface SecondaryHeroCardProps {
  product: Product;
  store: { slug: string };
}

function SecondaryHeroCard({ product, store }: SecondaryHeroCardProps) {
  return (
    <a
      href={`/stores/${store.slug}/products/${product.id}`}
      className="block bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
    >
      <div className="aspect-square bg-[#FEF3C7] overflow-hidden relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ChalkboardPlaceholder small />
        )}
      </div>
      <div className="p-3">
        <h4 className="font-[family:var(--font-kanit)] font-bold text-xs text-[#0F172A] line-clamp-2 leading-snug min-h-[2rem]">
          {product.title}
        </h4>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-[family:var(--font-kanit)] text-sm font-bold text-[#2563EB]">
            ฿{product.priceTHB.toLocaleString()}
          </span>
          {product.compareAtPriceTHB && (
            <span className="text-[10px] text-[#94A3B8] line-through">
              ฿{product.compareAtPriceTHB.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

interface ChipButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function ChipButton({ active, onClick, label }: ChipButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-[family:var(--font-kanit)] font-bold whitespace-nowrap transition-all border ${
        active
          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
          : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
      }`}
    >
      {label}
    </button>
  );
}

interface ProductCardProps {
  product: Product;
  store: { slug: string };
  discountPercent: number;
  onAdd: (p: Product, e: React.MouseEvent) => void;
}

function ProductCard({
  product,
  store,
  discountPercent,
  onAdd,
}: ProductCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#2563EB] hover:-translate-y-0.5 transition-all group flex flex-col">
      <a
        href={`/stores/${store.slug}/products/${product.id}`}
        className="block relative aspect-square bg-[#EFF6FF] overflow-hidden"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ChalkboardPlaceholder small />
        )}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-[#16A34A] text-white font-[family:var(--font-kanit)] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            ลด {discountPercent}%
          </span>
        )}
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 backdrop-blur text-[#2563EB] font-[family:var(--font-kanit)] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
          <Download size={10} />
          PDF
        </span>
      </a>

      <div className="p-3 flex-1 flex flex-col gap-2">
        {product.categoryName && (
          <span className="text-[10px] font-[family:var(--font-kanit)] font-bold uppercase tracking-wider text-[#475569]">
            {product.categoryName}
          </span>
        )}
        <a href={`/stores/${store.slug}/products/${product.id}`}>
          <h3 className="font-[family:var(--font-kanit)] text-sm font-bold text-[#0F172A] hover:text-[#2563EB] leading-snug line-clamp-2 min-h-[2.5rem] transition-colors">
            {product.title}
          </h3>
        </a>

        <div className="mt-auto pt-2 border-t border-[#F1F5F9] flex flex-col gap-2">
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="font-[family:var(--font-kanit)] text-base font-bold text-[#2563EB]">
              ฿{product.priceTHB.toLocaleString()}
            </span>
            {product.compareAtPriceTHB && (
              <span className="text-[10px] text-[#94A3B8] line-through">
                ฿{product.compareAtPriceTHB.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={(e) => onAdd(product, e)}
            className="w-full bg-[#FEF3C7] hover:bg-[#F59E0B] text-[#B45309] hover:text-white font-[family:var(--font-kanit)] font-bold text-[11px] py-2 rounded-full transition-colors flex items-center justify-center gap-1"
          >
            <Download size={12} />
            หยิบใส่ตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Chalkboard-style SVG placeholder — used in place of remote images so
 * we never depend on picsum / unsplash. Pure inline SVG, theme tokens
 * baked in.
 */
function ChalkboardPlaceholder({ small = false }: { small?: boolean }) {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#1D4ED8]">
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chalk doodles */}
        <circle cx="40" cy="40" r="18" stroke="white" strokeWidth="1.2" fill="none" />
        <rect x="120" y="30" width="40" height="28" stroke="white" strokeWidth="1.2" fill="none" rx="4" />
        <path d="M 30 130 L 60 100 L 90 130 L 60 160 Z" stroke="white" strokeWidth="1.2" fill="none" />
        <path d="M 110 110 Q 140 90 170 110 T 200 110" stroke="white" strokeWidth="1.2" fill="none" />
        <text x="100" y="100" fontSize="14" fill="white" textAnchor="middle" opacity="0.85" fontFamily="var(--font-kanit)">A B C</text>
        <text x="100" y="180" fontSize="10" fill="white" textAnchor="middle" opacity="0.65" fontFamily="var(--font-kanit)">1 2 3 4 5</text>
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-1 text-white">
        <BookOpen size={small ? 24 : 36} strokeWidth={1.5} />
        {!small && (
          <span className="text-[10px] font-[family:var(--font-kanit)] font-bold uppercase tracking-wider opacity-90">
            ตัวอย่างสื่อ
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Local lucide-style icon — ShieldCheck has a generic look, this is a
 * shield with a star inside so the trust strip leans "ดาวประจำสัปดาห์".
 */
function ShieldStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polygon points="12 9 13.4 11.8 16.5 12.2 14.2 14.3 14.8 17.3 12 15.8 9.2 17.3 9.8 14.3 7.5 12.2 10.6 11.8 12 9" />
    </svg>
  );
}
