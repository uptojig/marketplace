'use client';

import React from 'react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { Plus, ArrowRight, Droplets, Recycle, Wind, Check } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface SalukiHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: Category[];
}

export function SalukiHomepage({ store, products, categories }: SalukiHomepageProps) {
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

  const featuredProducts = products.slice(0, 8);
  const heroProduct = products.length > 0 ? products[0] : null;

  return (
    <div className="bg-[#ecfdf5] min-h-screen font-[family:var(--font-kanit)] text-[#064e3b]">
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"
            alt="Yoga in nature"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#ecfdf5]/90 via-[#ecfdf5]/70 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 flex h-full items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a7f3d0]/80 text-[#0f766e] text-sm font-medium mb-6 backdrop-blur-sm border border-[#0f766e]/20">
              <Recycle className="w-4 h-4" />
              <span>Eco-Friendly Activewear</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold mb-6 text-[#064e3b] leading-tight font-[family:var(--font-prompt)]">
              ขยับได้ทุกท่า <br className="hidden md:block"/>ไม่ต้องดึงเสื้อ
            </h1>
            <p className="text-lg md:text-xl text-[#0f766e] mb-10 max-w-lg leading-relaxed font-light">
              ชุดโยคะและพีลาทิสจากผ้ารีไซเคิล PET 100% ไม่หดและไม่ดึงรั้ง ตัดให้พอดีกับสรีระสาวเอเชีย
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                href={`/stores/${store.slug}?category=leggings`}
                className="px-8 py-4 bg-[#0f766e] text-white rounded-full font-medium hover:bg-[#064e3b] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#0f766e]/30 flex items-center gap-2"
              >
                ดูเลกกิ้ง <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href={`/stores/${store.slug}#story`}
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-[#0f766e] rounded-full font-medium hover:bg-white transition-all border border-[#a7f3d0]"
              >
                เรื่องราวของเรา
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story Block - Visual Signature */}
      <section id="story" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-[#0f766e] font-[family:var(--font-prompt)]">
              Made from 18 PET bottles
            </h2>
            <p className="text-lg text-[#064e3b]/80 mb-16 leading-relaxed max-w-2xl mx-auto">
              เราเปลี่ยนขวดพลาสติกใช้แล้ว ให้กลายเป็นเส้นใยคุณภาพสูง ที่มีความยืดหยุ่น ซับเหงื่อได้ดี และนุ่มสบายผิว ชุดโยคะของเราทุกชุด ช่วยลดขยะพลาสติกในทะเลอย่างยั่งยืน
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#0f766e] mb-6 shadow-sm border border-[#a7f3d0]">
                  <Recycle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-3">รักษ์โลก 100%</h3>
                <p className="text-[#0f766e] text-center text-sm">ผลิตจากเส้นใยรีไซเคิล ช่วยลดขยะพลาสติก</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#0f766e] mb-6 shadow-sm border border-[#a7f3d0]">
                  <Wind className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-3">ระบายอากาศดีเยี่ยม</h3>
                <p className="text-[#0f766e] text-center text-sm">เนื้อผ้าแห้งไว ไม่อับชื้น เหมาะกับการออกกำลังกายทุกรูปแบบ</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#0f766e] mb-6 shadow-sm border border-[#a7f3d0]">
                  <Droplets className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-3">ยืดหยุ่น 4 ทิศทาง</h3>
                <p className="text-[#0f766e] text-center text-sm">กระชับสัดส่วน ขยับท่าไหนก็มั่นใจ ไม่โป๊</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-[#ecfdf5]">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button className="px-6 py-2.5 rounded-full bg-[#0f766e] text-white text-sm font-medium shadow-md shadow-[#0f766e]/20 transition-all">
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  className="px-6 py-2.5 rounded-full bg-white text-[#0f766e] text-sm font-medium border border-[#a7f3d0] hover:bg-[#a7f3d0]/30 transition-all"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium text-[#0f766e] mb-4 font-[family:var(--font-prompt)]">
                สินค้ามาใหม่
              </h2>
              <p className="text-[#064e3b]/70">สีสันแห่งธรรมชาติ สู่ชุดโยคะที่ใส่สบายที่สุด</p>
            </div>
            <Link href={`/stores/${store.slug}/products`} className="hidden md:flex items-center gap-2 text-[#0f766e] hover:text-[#064e3b] font-medium transition-colors">
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col h-full rounded-2xl overflow-hidden bg-[#ecfdf5]/30 border border-[#d1fae5] hover:shadow-xl hover:shadow-[#a7f3d0]/20 transition-all duration-300">
                <Link href={`/stores/${store.slug}/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#d1fae5]/50 flex-shrink-0">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#0f766e]/40">
                      <span className="font-[family:var(--font-prompt)]">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#0f766e] text-white text-xs font-bold rounded-full">
                      Sale
                    </div>
                  )}
                  
                  {/* Quick Add Button Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out bg-gradient-to-t from-black/50 to-transparent">
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full py-3 bg-white text-[#0f766e] rounded-xl font-medium shadow-lg hover:bg-[#0f766e] hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      เพิ่มลงตะกร้า
                    </button>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-medium text-[#0f766e] mb-2 uppercase tracking-wider">
                    {product.categoryName || 'Activewear'}
                  </div>
                  <Link href={`/stores/${store.slug}/products/${product.id}`}>
                    <h3 className="text-lg font-medium text-[#064e3b] group-hover:text-[#0f766e] transition-colors line-clamp-2 mb-4 font-[family:var(--font-prompt)]">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB ? (
                        <>
                          <span className="text-xs text-[#064e3b]/50 line-through mb-1">
                            ฿{product.compareAtPriceTHB.toLocaleString()}
                          </span>
                          <span className="text-xl font-semibold text-[#0f766e]">
                            ฿{product.priceTHB.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-semibold text-[#0f766e]">
                          ฿{product.priceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Mobile Quick Add */}
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="lg:hidden w-10 h-10 rounded-full bg-[#ecfdf5] border border-[#0f766e] text-[#0f766e] flex items-center justify-center hover:bg-[#0f766e] hover:text-white transition-colors"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href={`/stores/${store.slug}/products`} className="inline-flex items-center gap-2 text-[#0f766e] font-medium border-b-2 border-[#0f766e] pb-1">
              ดูสินค้าทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature / Trust Section */}
      <section className="py-24 bg-[#0f766e] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-medium font-[family:var(--font-prompt)] leading-tight">
                ใส่ใจทุกการเคลื่อนไหว <br /> และสิ่งแวดล้อม
              </h2>
              <p className="text-[#a7f3d0] text-lg leading-relaxed">
                Saluki Yoga มุ่งมั่นสร้างสรรค์ชุดออกกำลังกายที่ไม่เพียงแค่สวยงามและใส่สบาย แต่ต้องเป็นมิตรกับโลกของเราด้วย
              </p>
              
              <ul className="space-y-4">
                {[
                  "กระบวนการผลิตใช้น้ำน้อยกว่าปกติ 80%",
                  "แพ็คเกจจิ้งสามารถย่อยสลายได้ 100%",
                  "ไม่ใช้สารเคมีอันตรายในการย้อมสี",
                  "รายได้ส่วนหนึ่งสนับสนุนมูลนิธิพิทักษ์ทะเล"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-[#a7f3d0]/20">
                      <Check className="w-4 h-4 text-[#a7f3d0]" />
                    </div>
                    <span className="text-[#ecfdf5]">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                <Link 
                  href={`/stores/${store.slug}/sustainability`}
                  className="inline-flex items-center gap-2 text-[#a7f3d0] hover:text-white font-medium transition-colors"
                >
                  อ่านเรื่องราวความยั่งยืน <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-full bg-[#a7f3d0]/10 absolute -inset-8 animate-pulse"></div>
              <img 
                src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80"
                alt="Sustainable activewear"
                className="relative rounded-3xl object-cover w-full aspect-[4/5] shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
