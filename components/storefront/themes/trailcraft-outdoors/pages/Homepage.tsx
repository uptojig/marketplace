'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mountain, Droplets, Wind, Plus, ShoppingBag } from 'lucide-react';
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

interface TrailcraftHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: { id: string; name: string; slug: string }[];
}

export function TrailcraftHomepage({ store, products, categories }: TrailcraftHomepageProps) {
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

  // Performance badges generator
  const getBadges = (id: string) => {
    const charCode = id.charCodeAt(0) || 0;
    const drop = (charCode % 3) * 2 + 4; // 4mm, 6mm, 8mm
    const stack = (charCode % 5) * 2 + 24; // 24mm to 32mm
    const weight = (charCode % 10) * 10 + 220; // 220g to 310g
    return { drop, stack, weight };
  };

  return (
    <div className="bg-[#fdfbe8] min-h-screen text-[#1a2e05]">
      {/* Topographic Watermark Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .topo-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 Q25,25 50,50 T100,50' fill='none' stroke='%2384cc16' stroke-width='0.5' opacity='0.2'/%3E%3Cpath d='M0,70 Q25,45 50,70 T100,70' fill='none' stroke='%2384cc16' stroke-width='0.5' opacity='0.2'/%3E%3Cpath d='M0,30 Q25,5 50,30 T100,30' fill='none' stroke='%2384cc16' stroke-width='0.5' opacity='0.2'/%3E%3Cpath d='M0,90 Q25,65 50,90 T100,90' fill='none' stroke='%2384cc16' stroke-width='0.5' opacity='0.2'/%3E%3Cpath d='M0,10 Q25,-15 50,10 T100,10' fill='none' stroke='%2384cc16' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
      `}} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#365314] text-[#fdfbe8]">
        {/* Abstract topographic shapes for hero */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
           <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
             <path fill="none" stroke="#facc15" strokeWidth="2" d="M -100,200 C 100,400 300,100 500,300 S 800,100 1100,400" />
             <path fill="none" stroke="#facc15" strokeWidth="2" d="M -100,300 C 100,500 300,200 500,400 S 800,200 1100,500" />
             <path fill="none" stroke="#84cc16" strokeWidth="1" d="M -100,250 C 100,450 300,150 500,350 S 800,150 1100,450" />
             <path fill="none" stroke="#84cc16" strokeWidth="1" d="M -100,150 C 100,350 300,50 500,250 S 800,50 1100,350" />
           </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40 flex flex-col md:flex-row items-center">
          <div className="md:w-3/5 space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a2e05]/50 border border-[#84cc16]/50 rounded-full text-sm font-[family:var(--font-prompt)] text-[#ecfccb]">
              <Mountain className="h-4 w-4 text-[#facc15]" />
              <span>Tested on real trails</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family:var(--font-kanit)] font-bold leading-tight">
              ภูเขาทุกลูก<br/>
              <span className="text-[#facc15]">เริ่มที่รองเท้าคู่เดียว</span>
            </h1>
            
            <p className="text-lg md:text-xl font-[family:var(--font-prompt)] text-[#ecfccb] max-w-2xl leading-relaxed">
              รองเท้าเทรล กระเป๋าน้ำ และเสื้อผ้าเทคนิคัล ทดสอบบนเส้นทาง ITM, ภูกระดึง, ดอยอินทนนท์ ก่อนวางขาย
            </p>
            
            <div className="pt-4">
              <Link 
                href={`/${store.slug}/category/shoes`}
                className="inline-flex items-center gap-3 bg-[#facc15] text-[#1a2e05] px-8 py-4 rounded-md font-[family:var(--font-kanit)] font-bold text-lg hover:bg-white hover:text-[#365314] transition-all transform hover:-translate-y-1 hover:shadow-[0_8px_0_0_#1a2e05]"
              >
                ดูรองเท้าเทรล
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div className="md:w-2/5 mt-16 md:mt-0 relative z-10">
            <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
              <div className="absolute inset-0 bg-[#84cc16] rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute inset-0 bg-[#fdfbe8] border-[12px] border-[#facc15] rounded-full shadow-2xl overflow-hidden flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                {products[0] && products[0].imageUrl ? (
                  <img src={products[0].imageUrl} alt="Featured Gear" className="w-[120%] h-[120%] object-cover object-center transform -rotate-6" />
                ) : (
                  <Mountain className="h-32 w-32 text-[#365314] transform -rotate-6" />
                )}
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-10 -left-10 bg-[#1a2e05] text-[#facc15] px-4 py-2 rounded-lg font-[family:var(--font-kanit)] font-bold shadow-lg transform -rotate-12 border border-[#365314]">
                Vibram® Megagrip
              </div>
              <div className="absolute bottom-10 -right-4 bg-[#fdfbe8] text-[#365314] px-4 py-2 rounded-lg font-[family:var(--font-kanit)] font-bold shadow-lg transform rotate-6 border-2 border-[#84cc16]">
                Zero Drop
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-24 relative topo-bg border-b-2 border-[#84cc16]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-[family:var(--font-kanit)] font-bold text-[#1a2e05] uppercase tracking-wide">
                Gear Up for the <span className="text-[#365314]">Ascent</span>
              </h2>
              <p className="text-[#365314] font-[family:var(--font-prompt)] mt-2">อุปกรณ์พร้อมลุยสำหรับทุกสภาพเส้นทาง</p>
            </div>
            <Link href={`/${store.slug}/products`} className="hidden md:flex items-center gap-2 text-[#365314] hover:text-[#1a2e05] font-[family:var(--font-prompt)] font-semibold border-b-2 border-[#84cc16] pb-1">
              ดูสินค้าทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => {
              const badges = getBadges(product.id);
              
              return (
                <Link key={product.id} href={`/${store.slug}/product/${product.id}`} className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-xl border border-[#ecfccb] hover:border-[#84cc16] transition-all duration-300 overflow-hidden relative">
                  
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-[#fdfbe8] p-6 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-[0.05] topo-bg mix-blend-multiply"></div>
                    
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 relative z-10 drop-shadow-xl"
                      />
                    ) : (
                      <Mountain className="w-16 h-16 text-[#ecfccb] relative z-10" />
                    )}

                    {product.compareAtPriceTHB && (
                      <div className="absolute top-3 left-3 bg-[#facc15] text-[#1a2e05] text-xs font-[family:var(--font-kanit)] font-bold px-2 py-1 rounded shadow-sm z-20">
                        SALE
                      </div>
                    )}
                  </div>

                  {/* Performance Badges Strip */}
                  <div className="bg-[#1a2e05] text-[#ecfccb] flex items-center justify-between px-3 py-1.5 text-[10px] font-[family:var(--font-prompt)] font-medium tracking-wider uppercase">
                    <div className="flex items-center gap-1"><Wind className="w-3 h-3 text-[#facc15]" /> Drop {badges.drop}mm</div>
                    <div className="w-px h-3 bg-[#365314]"></div>
                    <div className="flex items-center gap-1"><Mountain className="w-3 h-3 text-[#facc15]" /> Stack {badges.stack}mm</div>
                    <div className="w-px h-3 bg-[#365314]"></div>
                    <div className="flex items-center gap-1"><Droplets className="w-3 h-3 text-[#facc15]" /> Wt {badges.weight}g</div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col flex-grow bg-white">
                    <div className="text-xs text-[#84cc16] font-[family:var(--font-prompt)] font-semibold uppercase tracking-wider mb-2">
                      {product.categoryName || 'Equipment'}
                    </div>
                    <h3 className="text-base font-[family:var(--font-prompt)] font-medium text-[#1a2e05] mb-4 line-clamp-2 leading-tight group-hover:text-[#365314]">
                      {product.title}
                    </h3>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        {product.compareAtPriceTHB && (
                          <span className="text-xs text-[#1a2e05]/50 line-through font-[family:var(--font-kanit)]">
                            ฿{product.compareAtPriceTHB.toLocaleString()}
                          </span>
                        )}
                        <span className="text-lg font-[family:var(--font-kanit)] font-bold text-[#1a2e05]">
                          ฿{product.priceTHB.toLocaleString()}
                        </span>
                      </div>
                      
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="h-10 w-10 bg-[#fdfbe8] border-2 border-[#84cc16] text-[#365314] rounded-full flex items-center justify-center hover:bg-[#84cc16] hover:text-[#1a2e05] transition-colors"
                        aria-label="Add to cart"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href={`/${store.slug}/products`} className="inline-flex items-center gap-2 text-[#365314] hover:text-[#1a2e05] font-[family:var(--font-prompt)] font-semibold border-b-2 border-[#84cc16] pb-1">
              ดูสินค้าทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories / Activity Section */}
      <section className="py-24 bg-[#365314] text-[#fdfbe8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Mountain className="h-12 w-12 text-[#facc15] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-[family:var(--font-kanit)] font-bold uppercase tracking-widest mb-4">
              Choose Your Path
            </h2>
            <p className="font-[family:var(--font-prompt)] text-[#ecfccb] max-w-2xl mx-auto text-lg">
              ไม่ว่าจะเป็นเทรลสั้น เทรลยาว หรือการวิ่งบนถนนสู่ป่า เรามีอุปกรณ์ที่พร้อมไปกับคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Trail Running Shoes', slug: 'shoes', desc: 'รองเท้าสำหรับพื้นดินโคลนและหิน', icon: <Wind className="w-8 h-8" /> },
              { title: 'Hydration Vests', slug: 'hydration', desc: 'เป้น้ำน้ำหนักเบา จุของได้เยอะ', icon: <Droplets className="w-8 h-8" /> },
              { title: 'Technical Apparel', slug: 'apparel', desc: 'เสื้อผ้าแห้งไว ระบายอากาศดีเยี่ยม', icon: <Mountain className="w-8 h-8" /> }
            ].map((cat, i) => (
              <Link key={i} href={`/${store.slug}/category/${cat.slug}`} className="group relative block h-72 overflow-hidden rounded-2xl bg-[#1a2e05] border border-[#84cc16]/30 hover:border-[#facc15] transition-colors">
                <div className="absolute inset-0 opacity-10 topo-bg mix-blend-overlay group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e05] to-transparent z-10"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                  <div className="text-[#facc15] mb-4 bg-[#365314]/50 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm border border-[#84cc16]/50 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-[family:var(--font-kanit)] font-bold text-white mb-2">{cat.title}</h3>
                  <p className="font-[family:var(--font-prompt)] text-[#ecfccb]">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Newsletter */}
      <section className="py-24 bg-[#fdfbe8] topo-bg relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-[#1a2e05] rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative border-4 border-[#84cc16]/20">
            {/* Decorative background element */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#365314] rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-[family:var(--font-kanit)] font-bold text-white mb-4">
                  Join the Trailcraft <span className="text-[#facc15]">Community</span>
                </h2>
                <p className="font-[family:var(--font-prompt)] text-[#ecfccb] mb-6">
                  รับข่าวสารเส้นทางวิ่งใหม่ๆ รีวิวอุปกรณ์ และโปรโมชั่นพิเศษสำหรับนักวิ่งเทรลโดยเฉพาะ
                </p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="อีเมลของคุณ" 
                    className="flex-grow bg-white/10 border border-[#84cc16]/50 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] font-[family:var(--font-prompt)]"
                  />
                  <button className="bg-[#facc15] text-[#1a2e05] font-[family:var(--font-kanit)] font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="w-48 h-48 bg-[#365314] rounded-full border-[8px] border-[#84cc16] flex items-center justify-center transform rotate-12 shadow-[0_0_40px_rgba(132,204,22,0.3)]">
                  <ShoppingBag className="w-20 h-20 text-[#facc15]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
