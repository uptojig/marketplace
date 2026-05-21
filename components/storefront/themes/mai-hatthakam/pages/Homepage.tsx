'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Leaf, Hand, MapPin } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MaiHatthakamHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: Category[];
}

export function MaiHatthakamHomepage({ store, products, categories }: MaiHatthakamHomepageProps) {
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

  return (
    <div className="bg-[#fef9f1] text-[#3a1a07] font-[family:var(--font-kanit)]">
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2940&auto=format&fit=crop" 
            alt="ช่างปั้นกำลังขึ้นรูปดินบนแป้นหมุน" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#3a1a07]/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fef9f1] via-transparent to-transparent opacity-90" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#fde8c8]/50 text-[#fde8c8] text-xs uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Flame className="w-3 h-3 mr-2 text-[#d97706]" />
            Batch 20 · เชียงราย
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-[#fef9f1] mb-6 font-[family:var(--font-prompt)] drop-shadow-lg leading-tight">
            ทุกใบ ปั้นด้วยมือ
          </h1>
          <p className="text-lg md:text-xl text-[#fde8c8] mb-10 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
            แก้ว ถ้วยชา และจาน ทำมือทีละชิ้นที่เชียงราย ดินแม่ขมิ้นจากแม่อาย เคลือบขี้เถ้าจากแกลบข้าวเหนียว ผลิตเป็นล็อต 20 ชิ้น
          </p>
          <Link 
            href={`/stores/${store.slug}/c/all`}
            className="inline-flex items-center justify-center px-8 py-4 bg-[#d97706] text-[#fef9f1] hover:bg-[#7c2d12] transition-colors duration-300 font-medium text-lg rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transform"
          >
            ดูล็อตล่าสุด
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Brand Philosophy / Tagline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fef9f1]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-[#7c2d12] font-[family:var(--font-prompt)] mb-8">
            เซรามิกทำมือจากเตาดินเผาที่เชียงราย
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#fde8c8] flex items-center justify-center mb-4 text-[#7c2d12]">
                <Hand className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">ทำมือทุกขั้นตอน</h3>
              <p className="text-[#3a1a07]/70 text-sm text-center leading-relaxed">
                ไม่ใช้แป้นพิมพ์ ปั้นขึ้นรูปทีละใบด้วยแป้นหมุน ทำให้แต่ละชิ้นมีรูปทรงและผิวสัมผัสที่เป็นเอกลักษณ์
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#fde8c8] flex items-center justify-center mb-4 text-[#7c2d12]">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">วัตถุดิบจากธรรมชาติ</h3>
              <p className="text-[#3a1a07]/70 text-sm text-center leading-relaxed">
                ใช้ดินแม่ขมิ้น และน้ำเคลือบที่ผสมเองจากขี้เถ้าแกลบข้าวเหนียวและไม้ฟืนในท้องถิ่น
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#fde8c8] flex items-center justify-center mb-4 text-[#7c2d12]">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">เผาไฟสูง 1,250°C</h3>
              <p className="text-[#3a1a07]/70 text-sm text-center leading-relaxed">
                เผาด้วยเตาฟืนและเตาแก๊สที่อุณหภูมิสูง ทำให้เซรามิกมีความแกร่ง ทนทาน และปลอดภัยสำหรับการใช้งาน
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white border-y border-[#fde8c8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-[#fde8c8] pb-6">
            <div>
              <p className="text-[#d97706] font-semibold text-sm tracking-wider uppercase mb-2">Batch 20</p>
              <h2 className="text-3xl font-medium text-[#7c2d12] font-[family:var(--font-prompt)]">ผลงานล่าสุด</h2>
            </div>
            <Link 
              href={`/stores/${store.slug}/c/all`}
              className="hidden sm:inline-flex items-center text-[#7c2d12] hover:text-[#d97706] font-medium transition-colors"
            >
              ดูทั้งหมด <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/stores/${store.slug}/p/${product.id}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/5] bg-[#fef9f1] mb-4 overflow-hidden rounded-sm shadow-sm">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#fde8c8] bg-[#3a1a07]/5">
                      <Flame className="w-12 h-12 mb-2 text-[#7c2d12]/20" />
                      <span className="text-xs text-[#7c2d12]/40">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  
                  {/* Signature mark overlay simulating the bottom signature requirement visually */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] italic text-white/80 drop-shadow-md font-serif">Mai H.</span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full py-2.5 bg-[#fef9f1] text-[#7c2d12] text-sm font-medium hover:bg-[#d97706] hover:text-[#fef9f1] transition-colors rounded-sm"
                    >
                      เพิ่มลงตะกร้า
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1">
                  {product.categoryName && (
                    <span className="text-xs text-[#7c2d12]/60 mb-1">{product.categoryName}</span>
                  )}
                  <h3 className="text-base font-medium text-[#3a1a07] group-hover:text-[#d97706] transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[#7c2d12] font-medium">
                      ฿{product.priceTHB.toLocaleString()}
                    </span>
                    {product.compareAtPriceTHB && (
                      <span className="text-sm text-[#3a1a07]/40 line-through">
                        ฿{product.compareAtPriceTHB.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-10 sm:hidden">
            <Link 
              href={`/stores/${store.slug}/c/all`}
              className="flex w-full items-center justify-center py-3 border border-[#7c2d12] text-[#7c2d12] hover:bg-[#7c2d12] hover:text-[#fef9f1] transition-colors rounded-sm"
            >
              ดูผลงานทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* About the Kiln / Visual Signature Section */}
      <section className="py-24 bg-[#3a1a07] text-[#fef9f1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7c2d12]/40 to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=2940&auto=format&fit=crop" 
                alt="ไฟในเตาเผาเซรามิก" 
                className="w-full h-full object-cover rounded-sm shadow-2xl grayscale-[20%] sepia-[30%]"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#d97706] rounded-sm -z-10 hidden md:block"></div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-8">
              <span className="text-[#d97706] font-semibold tracking-wider uppercase text-sm">Our Studio</span>
              <h2 className="text-4xl md:text-5xl font-medium font-[family:var(--font-prompt)] leading-tight">
                ลมหายใจของดิน<br />และศิลปะแห่งไฟ
              </h2>
              <div className="space-y-4 text-[#fde8c8]/80 leading-relaxed font-light">
                <p>
                  ที่ ใหม่ หัตถกรรม เราเชื่อว่าความสวยงามของเซรามิกไม่ได้มาจากความสมบูรณ์แบบ แต่มาจากร่องรอยของการทำมือและธรรมชาติของไฟในเตาเผา
                </p>
                <p>
                  ทุกชิ้นงานผ่านการขึ้นรูปด้วยแป้นหมุนทีละใบ ปล่อยให้ดินแสดงตัวตนของมันอย่างอิสระ เมื่อเข้าสู่เตาเผาที่อุณหภูมิสูงกว่า 1,250 องศาเซลเซียส เปลวไฟและขี้เถ้าจะสร้างลวดลายและสีสันที่คาดเดาไม่ได้ ทำให้เซรามิกทุกชิ้นมีเพียงใบเดียวในโลก
                </p>
                <p>
                  ด้านล่างของผลงานทุกชิ้น จะมีลายเซ็นสลักด้วยมือ เพื่อยืนยันถึงความตั้งใจและเวลาที่ถูกถ่ายทอดลงในดินแต่ละก้อน
                </p>
              </div>
              <div className="pt-6">
                <Link 
                  href={`/stores/${store.slug}/about`}
                  className="inline-flex items-center text-[#fef9f1] border-b border-[#d97706] pb-1 hover:text-[#d97706] transition-colors"
                >
                  อ่านเรื่องราวของเรา <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories / Collections */}
      {categories.length > 0 && (
        <section className="py-20 bg-[#fef9f1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-medium text-[#7c2d12] font-[family:var(--font-prompt)] mb-10">หมวดหมู่ผลงาน</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/stores/${store.slug}/c/${category.slug}`}
                  className="px-6 py-3 border border-[#7c2d12]/30 text-[#3a1a07] hover:border-[#d97706] hover:bg-[#fde8c8]/30 transition-all rounded-sm font-medium"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit Us CTA */}
      <section className="py-16 bg-[#fde8c8]/50 border-t border-[#fde8c8]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <MapPin className="w-10 h-10 text-[#7c2d12] mx-auto mb-6" />
          <h2 className="text-2xl font-medium text-[#7c2d12] font-[family:var(--font-prompt)] mb-4">เยี่ยมชมสตูดิโอ</h2>
          <p className="text-[#3a1a07]/80 mb-8 max-w-xl mx-auto">
            เราเปิดสตูดิโอให้ผู้ที่สนใจเข้าชมกระบวนการทำงานและเตาเผาของเราในทุกวันเสาร์ พร้อมเลือกชมผลงานล็อตใหม่ก่อนใคร
          </p>
          <a href="#" className="inline-flex items-center px-6 py-3 bg-[#3a1a07] text-[#fef9f1] hover:bg-[#7c2d12] transition-colors rounded-sm text-sm font-medium">
            ดูแผนที่การเดินทาง
          </a>
        </div>
      </section>

    </div>
  );
}
