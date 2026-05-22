'use client';
import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

const PAGE_SIZE = 12;

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface LandingContent {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  heroCtaLabel?: string | null;
  heroCtaUrl?: string | null;
  heroImageUrl?: string | null;
  heroAlignment?: string | null;
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
  landingContent?: LandingContent | null;
}

const DEFAULT_HERO_HEADLINE = 'ไอเท็มแกดเจ็ตตัวท็อป\nลดราคาจัดเต็ม!';
const DEFAULT_HERO_SUBHEAD =
  'รวมสายชาร์จคุณภาพสูง หัวชาร์จเร็ว เคสโทรศัพท์ และของแต่งโต๊ะทำงาน ดีลส่งตรงจากโรงงาน ราคาประหยัดสุดๆ';
const DEFAULT_HERO_CTA = 'ช้อปเลยตอนนี้';

export function Homepage({ store, products, categories, landingContent }: HomepageProps) {
  const heroHeadline = landingContent?.heroHeadline?.trim() || DEFAULT_HERO_HEADLINE;
  const heroSubhead = landingContent?.heroSubheadline?.trim() || DEFAULT_HERO_SUBHEAD;
  const heroCtaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_HERO_CTA;
  const heroCtaUrl = landingContent?.heroCtaUrl?.trim() || '#shop-section';
  const heroImageUrl = landingContent?.heroImageUrl?.trim() || null;
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [page, setPage] = useState(1);

  const add = useCart((s) => s.add);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

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
  };

  const filteredProducts = selectedCategory === 'ทั้งหมด'
    ? products
    : products.filter((p) => p.categoryName === selectedCategory);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const rangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredProducts.length);

  // Mock icons for categories
  const categoryIcons: Record<string, string> = {
    'เคส': '📱',
    'สายชาร์จ': '🔌',
    'หัวชาร์จ': '⚡',
    'ไฟ': '💡',
    'ของแต่งโต๊ะ': '🖥️',
  };

  // Find a product to feature in the main hero banner (preferably one with an image)
  const heroProduct = products.find((p) => p.imageUrl) || products[0];

  return (
    <main className="bg-[#fff7ed] text-[#7f1d1d] min-h-screen font-sans">
      
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 py-16 px-4 md:px-8 overflow-hidden border-b border-[#fdba74]">
        {/* Decorative circle details */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left: Headline & Stamps */}
          <div className="lg:col-span-7 space-y-6 text-white text-center lg:text-left">
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="bg-yellow-300 text-[#dc2626] font-[family:var(--font-kanit)] font-black text-xs px-3 py-1 border-2 border-white shadow transform -rotate-3">
                ลด 50%
              </span>
              <span className="bg-white text-red-600 font-[family:var(--font-kanit)] font-black text-xs px-3 py-1 border-2 border-red-600 shadow transform rotate-2">
                ส่งฟรี!
              </span>
              <span className="bg-[#dc2626] text-white font-[family:var(--font-kanit)] font-black text-xs px-3 py-1 border-2 border-yellow-300 shadow transform -rotate-1">
                HOT
              </span>
            </div>
            
            <h1 className="font-[family:var(--font-kanit)] font-black text-4xl sm:text-5xl lg:text-6xl leading-tight text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] uppercase whitespace-pre-line">
              {heroHeadline}
            </h1>

            <p className="text-white font-medium text-sm sm:text-base max-w-lg mx-auto lg:mx-0 whitespace-pre-line">
              {heroSubhead}
            </p>

            <div className="pt-2">
              <a
                href={heroCtaUrl}
                className="inline-flex items-center gap-2 bg-yellow-300 text-red-700 hover:bg-yellow-400 font-[family:var(--font-kanit)] font-black px-8 py-3.5 shadow-lg text-lg transform hover:scale-105 transition-all"
              >
                {heroCtaLabel} <ArrowRight size={20} />
              </a>
            </div>
          </div>

          {/* Right: Featured Oversized Hero Product */}
          {heroProduct && (
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white border-4 border-yellow-300 p-6 shadow-2xl relative transform rotate-1 max-w-sm w-full group">
                {/* Sale stamp */}
                <div className="absolute -top-4 -right-4 bg-red-600 text-white font-[family:var(--font-kanit)] font-black text-sm px-4 py-2 border-2 border-white shadow-md transform rotate-12 z-20 animate-bounce">
                  ฮิตที่สุด!
                </div>

                <div className="aspect-square bg-orange-50 overflow-hidden relative border border-orange-100">
                  {heroImageUrl || heroProduct.imageUrl ? (
                    <img
                      src={heroImageUrl || heroProduct.imageUrl || ''}
                      alt={heroHeadline.split('\n')[0]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-200">
                      NO IMAGE
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-[family:var(--font-kanit)] font-black text-md text-[#7f1d1d] truncate">
                    {heroProduct.title}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="font-[family:var(--font-prompt)] text-2xl font-black text-[#dc2626]">
                      ฿{heroProduct.priceTHB.toLocaleString()}
                    </span>
                    {heroProduct.compareAtPriceTHB && (
                      <span className="font-[family:var(--font-prompt)] text-sm text-gray-400 line-through">
                        ฿{heroProduct.compareAtPriceTHB.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(heroProduct, e)}
                    className="mt-4 w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-[family:var(--font-kanit)] font-black py-2.5 shadow transition-colors"
                  >
                    หยิบใส่ตะกร้าด่วน
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Main Shop Container Section with Sidebar */}
      <section id="shop-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Desktop Left Sidebar Category Strip */}
          <aside className="lg:col-span-3 space-y-6 hidden lg:block">
            <div className="bg-white border border-[#fdba74] p-4 shadow-sm">
              <h3 className="font-[family:var(--font-kanit)] font-black text-lg text-[#dc2626] border-b border-[#fdba74] pb-2 mb-4">
                หมวดหมู่แกดเจ็ต
              </h3>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedCategory('ทั้งหมด')}
                  className={`w-full text-left px-4 py-2.5 font-[family:var(--font-prompt)] font-bold text-xs uppercase tracking-wider transition-all border ${
                    selectedCategory === 'ทั้งหมด'
                      ? 'bg-gradient-to-r from-[#dc2626] to-[#f97316] text-white border-transparent'
                      : 'bg-white text-[#7f1d1d] border-orange-100 hover:bg-[#fff7ed]'
                  }`}
                >
                  📦 ทั้งหมด ({products.length})
                </button>
                {categories.map((c) => {
                  const count = products.filter((p) => p.categoryName === c).length;
                  const icon = categoryIcons[c] || '🏷️';
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`w-full text-left px-4 py-2.5 font-[family:var(--font-prompt)] font-bold text-xs uppercase tracking-wider transition-all border ${
                        selectedCategory === c
                          ? 'bg-gradient-to-r from-[#dc2626] to-[#f97316] text-white border-transparent'
                          : 'bg-white text-[#7f1d1d] border-orange-100 hover:bg-[#fff7ed]'
                      }`}
                    >
                      {icon} {c} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Same-day Shipping Stamp Banner */}
            <div className="bg-yellow-300 border-2 border-[#dc2626] p-6 text-center transform -rotate-1 relative shadow-md">
              <span className="text-xl">🚚</span>
              <h4 className="font-[family:var(--font-kanit)] font-black text-md text-[#dc2626] mt-2">
                จัดส่งด่วนพิเศษ
              </h4>
              <p className="text-xs text-red-900 font-[family:var(--font-prompt)] font-medium mt-1 leading-relaxed">
                กรุงเทพฯ ปริมณฑล ได้รับสินค้าใน 24 ชั่วโมง ต่างจังหวัด 1-2 วันทำการ
              </p>
            </div>
          </aside>

          {/* Mobile category icon bar */}
          <div className="lg:hidden col-span-1">
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('ทั้งหมด')}
                className={`px-4 py-2 whitespace-nowrap font-bold text-xs uppercase tracking-wider transition-all border ${
                  selectedCategory === 'ทั้งหมด'
                    ? 'bg-[#dc2626] text-white border-transparent'
                    : 'bg-white text-[#7f1d1d] border-[#fdba74]'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 whitespace-nowrap font-bold text-xs uppercase tracking-wider transition-all border ${
                    selectedCategory === c
                      ? 'bg-[#dc2626] text-white border-transparent'
                      : 'bg-white text-[#7f1d1d] border-[#fdba74]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Right Main Grid */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white border border-[#fdba74] p-4 flex items-center justify-between shadow-sm">
              <span className="font-[family:var(--font-kanit)] font-black text-sm uppercase text-[#7f1d1d]">
                รายการสินค้าในแคมเปญ
              </span>
              <span className="text-xs font-[family:var(--font-prompt)] font-bold text-orange-600 bg-orange-50 px-3 py-1">
                {filteredProducts.length === 0
                  ? 'ไม่มีรายการ'
                  : `แสดง ${rangeStart}-${rangeEnd} จาก ${filteredProducts.length} รายการ`}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#fdba74] py-16 text-center shadow-sm">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-sm font-semibold text-gray-500">ไม่มีสินค้าในหมวดหมู่นี้ชั่วคราว</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {pagedProducts.map((p) => {
                  const hasDiscount = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                  const discountPercent = hasDiscount
                    ? Math.round(((p.compareAtPriceTHB! - p.priceTHB) / p.compareAtPriceTHB!) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-[#fdba74] flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                    >
                      <a href={`/stores/${store.slug}/products/${p.id}`} className="block relative aspect-square bg-orange-50/10 overflow-hidden">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-orange-100 font-bold text-xs">
                            NO IMAGE
                          </div>
                        )}

                        {/* Stamp Badges on cards */}
                        {discountPercent > 0 && (
                          <span className="absolute top-2 left-2 bg-[#dc2626] text-white font-[family:var(--font-kanit)] font-black text-[9px] px-2 py-0.5 border border-white transform -rotate-6">
                            -{discountPercent}%
                          </span>
                        )}
                        {p.priceTHB < 300 && (
                          <span className="absolute top-2 right-2 bg-yellow-300 text-red-700 font-[family:var(--font-kanit)] font-black text-[9px] px-2 py-0.5 border border-red-500 transform rotate-3">
                            ส่งฟรี!
                          </span>
                        )}
                      </a>

                      <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <a href={`/stores/${store.slug}/products/${p.id}`} className="block">
                            <h3 className="font-[family:var(--font-prompt)] text-xs font-bold text-[#7f1d1d] hover:text-[#dc2626] transition-colors leading-snug line-clamp-2">
                              {p.title}
                            </h3>
                          </a>
                        </div>

                        <div className="mt-3 pt-2 border-t border-orange-50 flex flex-col gap-2">
                          <div className="flex items-baseline flex-wrap">
                            <span className="font-[family:var(--font-prompt)] text-md font-extrabold text-[#dc2626] mr-1.5">
                              ฿{p.priceTHB.toLocaleString()}
                            </span>
                            {p.compareAtPriceTHB && (
                              <span className="font-[family:var(--font-prompt)] text-[10px] text-gray-400 line-through">
                                ฿{p.compareAtPriceTHB.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => handleAddToCart(p, e)}
                            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-[family:var(--font-kanit)] font-black text-[10px] py-1.5 text-center shadow-sm uppercase tracking-wider transition-colors"
                          >
                            หยิบใส่ตะกร้า
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <nav
                aria-label="แบ่งหน้ารายการสินค้า"
                className="flex flex-wrap items-center justify-center gap-2 pt-6"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-[#dc2626] text-[#dc2626] font-[family:var(--font-kanit)] font-black text-xs uppercase shadow-sm hover:bg-[#fff7ed] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← ก่อนหน้า
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === currentPage ? 'page' : undefined}
                    className={`min-w-[40px] px-3 py-2 font-[family:var(--font-kanit)] font-black text-xs border-2 shadow-sm transition-colors ${
                      n === currentPage
                        ? 'bg-[#dc2626] text-white border-[#dc2626]'
                        : 'bg-white text-[#7f1d1d] border-[#fdba74] hover:bg-[#fff7ed]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-[#dc2626] text-[#dc2626] font-[family:var(--font-kanit)] font-black text-xs uppercase shadow-sm hover:bg-[#fff7ed] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ถัดไป →
                </button>
              </nav>
            )}
          </div>

        </div>
      </section>

    </main>
  );
}
