'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { PackageOpen, Leaf, Recycle, ShoppingBag, Plus, ArrowRight, Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface PastelPackHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: { id: string; name: string; slug: string }[];
}

export function PastelPackHomepage({ store, products, categories }: PastelPackHomepageProps) {
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

  const featuredProducts = products.slice(0, 4);
  const ecoProducts = products.slice(4, 8);

  return (
    <div className="bg-[#f0fdfa] min-h-screen font-[family:var(--font-prompt)] text-[#0f4a44]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f766e]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fde68a] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0f4a44]/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-24 lg:py-32 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#ccfbf1] text-[#0f766e] px-4 py-2 rounded-full text-sm font-bold mb-6 font-[family:var(--font-kanit)]">
              <Star className="w-4 h-4" /> เริ่มต้น 100 ชิ้น
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[#fde68a] mb-6 font-[family:var(--font-kanit)] leading-[1.1] drop-shadow-lg">
              บรรจุภัณฑ์ที่ลูกค้า<br className="hidden md:block"/>เก็บไว้
            </h1>
            <p className="text-xl md:text-2xl text-[#ccfbf1] mb-10 max-w-2xl font-light leading-relaxed">
              กล่องลูกฟูก ถุงคราฟท์ และสติกเกอร์ย่อยสลายได้ สำหรับร้านคราฟต์ ร้านขนม และร้านเครื่องสำอางเล็ก ราคาเริ่มที่ 100 ชิ้น
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link 
                href={`/${store.slug}/products`}
                className="bg-[#fde68a] text-[#0f766e] px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#0f4a44] transition-all shadow-[0_0_40px_rgba(253,230,138,0.3)] hover:shadow-[0_0_60px_rgba(253,230,138,0.5)] hover:-translate-y-1 font-[family:var(--font-kanit)] flex items-center gap-2"
              >
                เลือกกล่องตามขนาด <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-[#ccfbf1] p-4 rounded-[2rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-[#f0fdfa]/50">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#0f4a44] relative">
                <img 
                  src="https://images.unsplash.com/photo-1616198814651-e71f960c3180?q=80&w=1974&auto=format&fit=crop" 
                  alt="Kraft paper packaging" 
                  className="w-full h-full object-cover mix-blend-luminosity opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f4a44] to-transparent opacity-40"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/20">
                    <p className="font-[family:var(--font-kanit)] text-[#0f4a44] font-bold text-lg">กล่องลูกฟูกพรีเมียม</p>
                    <p className="text-[#0f766e] text-sm">แพ็คละ 100 ใบ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-[#ccfbf1]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f0fdfa] p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-[#0f766e] text-[#fde68a] rounded-2xl rotate-3 flex items-center justify-center mb-6 shadow-lg">
                <PackageOpen className="w-10 h-10 -rotate-3" />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-[family:var(--font-kanit)] text-[#0f4a44]">เริ่มที่ 100 ชิ้น</h3>
              <p className="text-[#0f766e] leading-relaxed">เหมาะสำหรับร้านค้าขนาดเล็ก ไม่ต้องสต๊อกเยอะ ก็มีแพ็คเกจจิ้งสวยๆ ระดับแบรนด์ดังได้</p>
            </div>
            <div className="bg-[#f0fdfa] p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 md:-translate-y-4">
              <div className="w-20 h-20 bg-[#0f766e] text-[#fde68a] rounded-2xl -rotate-3 flex items-center justify-center mb-6 shadow-lg">
                <Leaf className="w-10 h-10 rotate-3" />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-[family:var(--font-kanit)] text-[#0f4a44]">ย่อยสลายได้ 100%</h3>
              <p className="text-[#0f766e] leading-relaxed">ผลิตจากกระดาษคราฟท์และหมึกถั่วเหลือง รักษ์โลก เป็นมิตรกับสิ่งแวดล้อม</p>
            </div>
            <div className="bg-[#f0fdfa] p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-[#0f766e] text-[#fde68a] rounded-2xl rotate-3 flex items-center justify-center mb-6 shadow-lg">
                <Recycle className="w-10 h-10 -rotate-3" />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-[family:var(--font-kanit)] text-[#0f4a44]">ใช้ซ้ำได้</h3>
              <p className="text-[#0f766e] leading-relaxed">ออกแบบให้แข็งแรง ทนทาน ดีไซน์มินิมอล ลูกค้าสามารถนำไปใช้ใส่ของต่อได้</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-[#ccfbf1] pb-6 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-[#0f4a44] font-[family:var(--font-kanit)]">สินค้าขายดี</h2>
              <p className="text-[#0f766e] mt-3 text-lg font-light">แพ็คเกจจิ้งยอดฮิต สำหรับร้านค้าสไตล์มินิมอล</p>
            </div>
            <Link 
              href={`/${store.slug}/products`} 
              className="bg-[#ccfbf1] text-[#0f766e] px-6 py-3 rounded-full font-bold hover:bg-[#0f766e] hover:text-[#fde68a] transition-colors flex items-center gap-2 font-[family:var(--font-kanit)]"
            >
              ดูทั้งหมด <Plus className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/${store.slug}/product/${product.id}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border-2 border-[#ccfbf1] hover:border-[#0f766e]"
              >
                <div className="aspect-[4/5] relative bg-[#f0fdfa] overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#0f766e] opacity-20">
                      <ShoppingBag className="w-24 h-24" />
                    </div>
                  )}
                  {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                    <div className="absolute top-4 right-4 bg-[#fde68a] text-[#0f766e] px-4 py-1.5 rounded-full text-sm font-bold shadow-md font-[family:var(--font-kanit)]">
                      ลดราคา
                    </div>
                  )}
                  {/* Kraft Overlay Effect */}
                  <div className="absolute inset-0 bg-[#d2b48c] mix-blend-color opacity-20 group-hover:opacity-0 transition-opacity duration-500"></div>
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0f4a44]/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-[#fde68a] text-[#0f766e] px-6 py-2 rounded-full font-bold shadow-lg hover:bg-white transition-colors font-[family:var(--font-kanit)] flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" /> เพิ่มลงตะกร้า
                    </button>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1 bg-white">
                  {product.categoryName && (
                    <span className="text-[#0f766e] text-xs font-bold uppercase tracking-widest mb-3 font-[family:var(--font-prompt)] bg-[#ccfbf1] inline-block px-3 py-1 rounded-full w-fit">
                      {product.categoryName}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-[#0f4a44] mb-4 flex-1 line-clamp-2 font-[family:var(--font-kanit)] leading-tight">
                    {product.title}
                  </h3>
                  
                  <div className="flex flex-col mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-black text-[#0f766e] font-[family:var(--font-kanit)]">
                        ฿{product.priceTHB.toLocaleString()}
                      </span>
                      {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                        <span className="text-sm text-[#0f4a44] opacity-50 line-through">
                          ฿{product.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[#0f766e]">ราคาต่อแพ็ค (100 ชิ้น)</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-20 bg-[#0f4a44]">
        <div className="container mx-auto px-4">
          <div className="bg-[#0f766e] rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center border border-[#0f4a44] shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fde68a] rounded-full filter blur-[100px] opacity-30 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ccfbf1] rounded-full filter blur-[100px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>
            
            <div className="flex-1 text-center md:text-left relative z-10">
              <span className="text-[#fde68a] font-bold tracking-widest text-sm uppercase mb-4 inline-block font-[family:var(--font-kanit)] bg-[#0f4a44]/50 px-4 py-2 rounded-full backdrop-blur-sm">
                บริการพิเศษ
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 font-[family:var(--font-kanit)] leading-[1.2]">
                พิมพ์โลโก้ร้าน<br/>บนกล่องของคุณ
              </h2>
              <p className="text-xl text-[#ccfbf1] mb-10 font-light max-w-md leading-relaxed">
                เพิ่มความพรีเมียมให้แบรนด์ <span className="font-bold text-[#fde68a]">ฟรี! ค่าบล็อกพิมพ์</span> เมื่อสั่งครบ 500 ชิ้นขึ้นไป
              </p>
              <Link 
                href={`/${store.slug}/custom-print`}
                className="inline-flex bg-[#fde68a] text-[#0f766e] px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#0f4a44] transition-colors shadow-xl font-[family:var(--font-kanit)] items-center gap-2 text-lg"
              >
                ดูรายละเอียดงานพิมพ์ <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="flex-1 mt-16 md:mt-0 relative z-10 w-full max-w-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-[#fde68a] rounded-[2rem] rotate-6 transform opacity-20 blur-lg"></div>
                <img 
                  src="https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=2070&auto=format&fit=crop" 
                  alt="Custom printed boxes" 
                  className="rounded-[2rem] shadow-2xl rotate-3 border-8 border-[#ccfbf1] mix-blend-luminosity relative z-10 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eco Collection */}
      {ecoProducts.length > 0 && (
        <section className="py-24 bg-[#ccfbf1]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-[#0f4a44] font-[family:var(--font-kanit)] mb-6">คอลเลกชันรักษ์โลก</h2>
              <p className="text-[#0f766e] text-lg max-w-2xl mx-auto font-light leading-relaxed">
                บรรจุภัณฑ์ที่ผลิตจากวัสดุธรรมชาติ 100% ย่อยสลายได้ทางชีวภาพ ไม่ทิ้งสารตกค้างในสิ่งแวดล้อม
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {ecoProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/${store.slug}/product/${product.id}`}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square relative bg-[#f0fdfa] overflow-hidden p-6">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#0f766e] opacity-20 bg-[#ccfbf1] rounded-2xl">
                        <Leaf className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-8 left-8 bg-white/90 backdrop-blur text-[#0f766e] px-3 py-1 rounded-full text-xs font-bold font-[family:var(--font-kanit)] flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Eco
                    </div>
                  </div>
                  
                  <div className="p-8 text-center flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-[#0f4a44] mb-3 font-[family:var(--font-kanit)] line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="text-2xl font-black text-[#0f766e] mb-6 font-[family:var(--font-kanit)] mt-auto">
                      ฿{product.priceTHB.toLocaleString()}
                    </div>
                    
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full py-3.5 rounded-full bg-[#f0fdfa] border-2 border-[#0f766e] text-[#0f766e] font-bold hover:bg-[#0f766e] hover:text-[#fde68a] transition-colors font-[family:var(--font-kanit)] flex items-center justify-center gap-2 group-hover:shadow-lg"
                    >
                      หยิบใส่ตะกร้า
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
