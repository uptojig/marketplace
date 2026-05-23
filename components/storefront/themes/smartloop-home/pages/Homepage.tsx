'use client';
import React, { useState } from 'react';
import { useCart } from '@/lib/store/cart';
import { Filter, ChevronRight, ShoppingCart, Check, Zap, Wifi } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: { id: string; name: string }[];
}

export function SmartloopHomeHomepage({ store, products, categories }: HomepageProps) {
  const add = useCart((s) => s.add);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const filteredProducts = activeCategory 
    ? products.filter(p => p.categoryName === activeCategory)
    : products;

  return (
    <div className="bg-[#f0fdf4] min-h-screen font-[family:var(--font-kanit)] text-[#064e3b]">
      {/* Utility Banner / Hero alternative without image */}
      <div className="bg-[#dcfce7] border-b border-[#34d399] py-8 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#059669] text-white text-xs px-2 py-1 rounded-sm font-[family:var(--font-prompt)] uppercase font-bold mb-4">
              <Zap className="w-3 h-3" /> New Arrivals
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-[#064e3b]">บ้านอัจฉริยะ เริ่มที่ปลั๊กตัวเดียว</h1>
            <p className="text-lg text-[#047857] font-[family:var(--font-prompt)] mb-6 max-w-2xl">
              หลอดไฟ ปลั๊ก เซ็นเซอร์ และกล้องสมาร์ทโฮม ใช้ได้กับ Google Home, Alexa, HomeKit, Matter เลือกฟิลเตอร์ตามระบบที่บ้านใช้
            </p>
            <div className="flex gap-4">
              <button className="bg-[#059669] text-white px-6 py-2.5 font-bold hover:bg-[#047857] transition-colors flex items-center gap-2 shadow-sm rounded-sm">
                ดูทั้งหมด
              </button>
              <button className="bg-white text-[#059669] border border-[#059669] px-6 py-2.5 font-bold hover:bg-[#f0fdf4] transition-colors flex items-center gap-2 shadow-sm rounded-sm">
                แคตตาล็อก B2B
              </button>
            </div>
          </div>
          
          {/* Quick Ecosystem Filters */}
          <div className="bg-white p-4 rounded-sm shadow-sm border border-[#34d399] flex-shrink-0 w-full md:w-auto">
            <h3 className="font-bold mb-3 text-sm flex items-center gap-2 text-[#064e3b]"><Wifi className="w-4 h-4 text-[#059669]" /> รองรับระบบ</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Google Home', 'Apple HomeKit', 'Amazon Alexa', 'Matter'].map(sys => (
                <button key={sys} className="px-3 py-2 text-xs border border-gray-200 rounded-sm hover:border-[#059669] hover:bg-[#f0fdf4] hover:text-[#059669] text-left transition-colors font-[family:var(--font-prompt)] font-medium text-gray-700">
                  {sys}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 font-[family:var(--font-prompt)]">
          <div className="bg-white border border-[#dcfce7] rounded-sm p-4 md:sticky md:top-32 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-[#064e3b] border-b border-gray-100 pb-3 mb-3 text-sm font-[family:var(--font-kanit)]">
              <Filter className="w-4 h-4 text-[#059669]" />
              หมวดหมู่สินค้า
            </div>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveCategory(null)}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center justify-between transition-colors ${!activeCategory ? 'bg-[#059669] text-white font-medium' : 'hover:bg-[#f0fdf4] text-gray-700'}`}
                >
                  ทั้งหมด
                  <span className={`text-xs px-1.5 rounded-sm ${!activeCategory ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{products.length}</span>
                </button>
              </li>
              {categories.map(c => {
                const count = products.filter(p => p.categoryName === c.name).length;
                return (
                  <li key={c.id}>
                    <button 
                      onClick={() => setActiveCategory(c.name)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center justify-between transition-colors ${activeCategory === c.name ? 'bg-[#059669] text-white font-medium' : 'hover:bg-[#f0fdf4] text-gray-700'}`}
                    >
                      {c.name}
                      <span className={`text-xs px-1.5 rounded-sm ${activeCategory === c.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            
            <div className="mt-6">
              <div className="font-bold text-[#064e3b] border-b border-gray-100 pb-3 mb-3 text-sm font-[family:var(--font-kanit)]">
                สถานะสินค้า
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 p-2 hover:bg-[#f0fdf4] rounded-sm cursor-pointer transition-colors">
                <input type="checkbox" className="accent-[#059669]" defaultChecked />
                พร้อมส่ง (In Stock)
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white border border-[#dcfce7] rounded-sm p-3 mb-4 flex justify-between items-center text-sm font-[family:var(--font-prompt)] shadow-sm">
            <span className="text-gray-500">พบ {filteredProducts.length} รายการ</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 hidden sm:inline">เรียงตาม:</span>
              <select className="border-none outline-none bg-transparent font-medium text-[#064e3b] cursor-pointer">
                <option>สินค้าแนะนำ</option>
                <option>ราคา: ต่ำไปสูง</option>
                <option>ราคา: สูงไปต่ำ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 hover:border-[#059669] hover:shadow-md transition-all rounded-sm flex flex-col group relative overflow-hidden">
                {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 font-[family:var(--font-prompt)]">
                    SALE
                  </div>
                )}
                
                <div className="aspect-square bg-white relative p-2 md:p-4 border-b border-gray-100">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-[#f0fdf4] flex items-center justify-center text-[#34d399] rounded-sm">
                      <Zap className="w-8 h-8 md:w-12 md:h-12 opacity-50" />
                    </div>
                  )}
                </div>
                
                <div className="p-2 md:p-3 flex flex-col flex-1 font-[family:var(--font-prompt)]">
                  <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider hidden md:block truncate">
                    {product.categoryName || 'General'}
                  </div>
                  <h3 className="text-xs md:text-sm font-medium text-[#064e3b] line-clamp-2 mb-2 leading-snug group-hover:text-[#059669] transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="mt-auto">
                    <div className="flex flex-col mb-2">
                      {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                        <span className="text-[10px] md:text-xs text-gray-400 line-through">฿{product.compareAtPriceTHB.toLocaleString()}</span>
                      )}
                      <span className="text-sm md:text-base font-bold text-red-600">฿{product.priceTHB.toLocaleString()}</span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full bg-[#f0fdf4] hover:bg-[#059669] text-[#059669] hover:text-white border border-[#34d399] py-1.5 text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-1 rounded-sm"
                    >
                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" /> 
                      <span className="hidden md:inline">เพิ่มลงตะกร้า</span>
                      <span className="md:hidden">เพิ่ม</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="bg-white border border-gray-200 p-12 text-center text-gray-500 font-[family:var(--font-prompt)] rounded-sm shadow-sm flex flex-col items-center justify-center">
              <div className="bg-[#f0fdf4] p-4 rounded-full mb-4">
                <Filter className="w-8 h-8 text-[#34d399]" />
              </div>
              <p className="text-lg font-medium text-[#064e3b]">ไม่พบสินค้าในหมวดหมู่นี้</p>
              <p className="text-sm mt-1">ลองเลือกหมวดหมู่สินค้าอื่นเพื่อค้นหาใหม่</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
