'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { Palette, Paintbrush, Droplets, Sparkles, Plus, Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface PigmentStudioHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: { id: string; name: string; slug: string }[];
}

export function PigmentStudioHomepage({ store, products, categories }: PigmentStudioHomepageProps) {
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
  const newestProducts = products.slice(8, 12);

  return (
    <div className="min-h-screen bg-[#fff7ed] text-[#7c2d12] overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden">
        {/* Background abstract blobs */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-[#f97316] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob"></div>
        <div className="absolute top-0 right-48 w-72 h-72 bg-[#facc15] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-[#fed7aa] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fed7aa]/50 text-[#f97316] font-[family:var(--font-prompt)] font-medium text-sm mb-6 border border-[#f97316]/20">
                <Sparkles className="w-4 h-4" />
                <span>สีน้ำระดับ Professional</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-[family:var(--font-kanit)] leading-[1.1] mb-6 text-[#7c2d12]">
                สีน้ำที่นักวาด<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-[#facc15] relative inline-block">
                  อินดี้เลือกใช้
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#facc15] opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,0" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="text-lg md:text-xl font-[family:var(--font-prompt)] text-[#7c2d12]/80 mb-10 leading-relaxed">
                สีน้ำ Daniel Smith, Schmincke พู่กันโคลินสกีและพู่กันสังเคราะห์ พร้อมกระดาษวาดภาพระดับ professional
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/stores/${store.slug}/products`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#f97316] text-white rounded-full font-[family:var(--font-prompt)] font-medium text-lg hover:bg-[#ea580c] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all duration-300 group"
                >
                  <Palette className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  ดูชุดเริ่มต้น
                </Link>
                <Link
                  href={`/stores/${store.slug}/about`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#7c2d12] rounded-full font-[family:var(--font-prompt)] font-medium text-lg border-2 border-[#fed7aa] hover:border-[#f97316] hover:bg-[#fff7ed] transition-all duration-300"
                >
                  ทำความรู้จักเรา
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#fff7ed] bg-[#fed7aa] flex items-center justify-center overflow-hidden">
                      <img src={`https://picsum.photos/seed/${i + 20}/100/100`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="font-[family:var(--font-prompt)]">
                  <div className="flex items-center text-[#facc15]">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-[#7c2d12]/70 mt-1">รีวิวจากศิลปินกว่า 500+ ท่าน</p>
                </div>
              </div>
            </div>
            
            <div className="relative lg:h-[600px] flex justify-center items-center">
              {/* Decorative splatters behind image */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
              <div className="relative w-full max-w-md aspect-square rounded-[2rem] bg-white p-4 shadow-[0_20px_50px_rgba(124,45,18,0.1)] transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden border-4 border-[#fed7aa]">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative bg-[#fff7ed]">
                  <img 
                    src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1471&auto=format&fit=crop" 
                    alt="Watercolors" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                {/* Floating element */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border-2 border-[#fed7aa] flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="w-12 h-12 bg-[#f97316] rounded-full flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-[family:var(--font-kanit)]">
                    <p className="font-bold text-[#7c2d12]">สีสดใสทนนาน</p>
                    <p className="text-xs text-[#7c2d12]/60">พิกเมนต์เข้มข้น</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="border-y-2 border-[#fed7aa] bg-[#fff7ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#fed7aa]">
            <div className="p-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#fed7aa]/50 rounded-full flex items-center justify-center mb-4 text-[#f97316]">
                <Droplets className="w-8 h-8" />
              </div>
              <h3 className="font-[family:var(--font-kanit)] font-bold text-xl text-[#7c2d12] mb-2">สีคุณภาพสูงสุด</h3>
              <p className="font-[family:var(--font-prompt)] text-[#7c2d12]/70 text-sm">คัดสรรแบรนด์ระดับโลกเพื่อผลงานที่ดีที่สุดของคุณ</p>
            </div>
            <div className="p-4 flex flex-col items-center justify-center pt-8 md:pt-4">
              <div className="w-16 h-16 bg-[#fed7aa]/50 rounded-full flex items-center justify-center mb-4 text-[#f97316]">
                <Paintbrush className="w-8 h-8" />
              </div>
              <h3 className="font-[family:var(--font-kanit)] font-bold text-xl text-[#7c2d12] mb-2">อุปกรณ์ครบครัน</h3>
              <p className="font-[family:var(--font-prompt)] text-[#7c2d12]/70 text-sm">ตั้งแต่พู่กันโคลินสกีไปจนถึงกระดาษคอตตอน 100%</p>
            </div>
            <div className="p-4 flex flex-col items-center justify-center pt-8 md:pt-4">
              <div className="w-16 h-16 bg-[#fed7aa]/50 rounded-full flex items-center justify-center mb-4 text-[#f97316]">
                <Palette className="w-8 h-8" />
              </div>
              <h3 className="font-[family:var(--font-kanit)] font-bold text-xl text-[#7c2d12] mb-2">ทำสวอชสีให้ดูทุกสี</h3>
              <p className="font-[family:var(--font-prompt)] text-[#7c2d12]/70 text-sm">ให้คุณเห็นเนื้อสีจริงๆ ก่อนตัดสินใจซื้อ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 px-4 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="relative inline-block">
              <h2 className="text-4xl md:text-5xl font-bold font-[family:var(--font-kanit)] text-[#7c2d12] relative z-10">
                คอลเลกชันสีน้ำยอดฮิต
              </h2>
              {/* Highlight stroke behind text */}
              <div className="absolute -bottom-2 left-0 w-full h-4 bg-[#facc15]/40 rounded-full -rotate-1 z-0"></div>
            </div>
            <Link
              href={`/stores/${store.slug}/products`}
              className="group font-[family:var(--font-prompt)] text-[#f97316] font-medium flex items-center gap-2 hover:text-[#ea580c] transition-colors"
            >
              ดูสีทั้งหมด
              <div className="w-8 h-8 rounded-full bg-[#fff7ed] flex items-center justify-center group-hover:bg-[#fed7aa] transition-colors">
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative flex flex-col cursor-pointer">
                <Link href={`/stores/${store.slug}/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`} />
                
                {/* Visual Signature: Hand-painted swatch effect */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-transparent mb-6 transition-transform duration-500 group-hover:-translate-y-2">
                  {/* Swatch Paper Background (simulated texture) */}
                  <div className="absolute inset-0 bg-[#fef8f5] shadow-[0_4px_12px_rgba(124,45,18,0.08)] rounded-xl border border-[#fed7aa]/30 z-0">
                    <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                  </div>
                  
                  {/* The actual product image as the painted swatch */}
                  <div className="absolute inset-4 sm:inset-6 z-10">
                    <div className="w-full h-[70%] relative overflow-hidden rounded-[2px] shadow-sm transform group-hover:scale-105 transition-transform duration-700">
                      {/* Mask to make the image look like a brushed swatch */}
                      <div className="absolute inset-0 bg-black" style={{ WebkitMaskImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M5,20 C30,15 70,25 95,15 C90,40 98,60 90,85 C65,95 35,85 10,90 C15,65 5,45 5,20 Z\'/></svg>")', WebkitMaskSize: '100% 100%' }}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#f97316] to-[#facc15]" />
                        )}
                      </div>
                    </div>
                    
                    {/* Swatch Label Area */}
                    <div className="absolute bottom-0 left-0 w-full h-[25%] flex flex-col justify-end pb-2">
                      <div className="w-full h-px bg-[#7c2d12]/10 mb-2"></div>
                      <div className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest text-[#7c2d12]/50 mb-1">
                        {product.categoryName || 'Watercolor'}
                      </div>
                      <div className="font-[family:var(--font-kanit)] font-medium text-[#7c2d12] text-sm leading-tight truncate">
                        {product.title}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start z-20">
                  <div>
                    <h3 className="text-lg font-[family:var(--font-kanit)] font-bold text-[#7c2d12] leading-tight line-clamp-1 group-hover:text-[#f97316] transition-colors">
                      <Link href={`/stores/${store.slug}/products/${product.id}`}>{product.title}</Link>
                    </h3>
                    <div className="mt-1 flex items-center gap-2 font-[family:var(--font-prompt)]">
                      <span className="text-[#f97316] font-bold">฿{product.priceTHB.toLocaleString()}</span>
                      {product.compareAtPriceTHB && (
                        <span className="text-[#7c2d12]/40 line-through text-sm">
                          ฿{product.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="flex-shrink-0 w-10 h-10 bg-[#fff7ed] text-[#f97316] rounded-full flex items-center justify-center hover:bg-[#f97316] hover:text-white transition-all duration-300 shadow-sm border border-[#fed7aa] ml-4"
                    aria-label="Add to cart"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Banner */}
      <section className="py-16 px-4 bg-[#7c2d12] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f97316] rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#facc15] rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-[family:var(--font-kanit)] text-white mb-4">
                อุปกรณ์ศิลปะระดับมืออาชีพ
              </h2>
              <p className="font-[family:var(--font-prompt)] text-[#fed7aa] text-lg mb-8">
                สำรวจหมวดหมู่สินค้าทั้งหมดของเรา ตั้งแต่สีน้ำ พู่กัน กระดาษ และอุปกรณ์เสริมที่ช่วยให้การวาดภาพของคุณสนุกยิ่งขึ้น
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    href={`/stores/${store.slug}/category/${category.slug}`}
                    className="px-6 py-2 bg-white/10 hover:bg-[#f97316] text-white rounded-full font-[family:var(--font-prompt)] font-medium transition-colors border border-white/20"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 bg-[#facc15] rounded-full animate-pulse opacity-20"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-[#f97316] to-[#facc15] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.5)] transform rotate-12">
                  <Palette className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-4 bg-[#fff7ed]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#facc15]/20 text-[#7c2d12] font-[family:var(--font-prompt)] font-medium text-sm mb-4 border border-[#facc15]/30">
              <Sparkles className="w-4 h-4 mr-2 text-[#f97316]" />
              สินค้ามาใหม่
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-[family:var(--font-kanit)] text-[#7c2d12]">
              อัปเดตสีสันใหม่ๆ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newestProducts.map((product) => (
              <div key={product.id} className="group relative bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-[#fed7aa]/50">
                <Link href={`/stores/${store.slug}/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`} />
                
                {/* Visual Signature applied to new arrivals too */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#fff7ed] rounded-2xl mb-4 p-4">
                   <div className="absolute inset-0 bg-white shadow-inner m-4 rounded-xl border border-[#fed7aa]/30"></div>
                   
                   <div className="relative w-full h-full flex items-center justify-center p-2 z-10">
                    <div className="w-[85%] h-[85%] relative" style={{ clipPath: 'polygon(5% 5%, 95% 8%, 98% 90%, 8% 95%)' }}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#f97316] to-[#facc15]" />
                      )}
                    </div>
                  </div>
                  
                  {/* New badge */}
                  <div className="absolute top-4 right-4 bg-[#facc15] text-[#7c2d12] font-[family:var(--font-prompt)] font-bold text-xs px-3 py-1 rounded-full z-20 transform rotate-12 shadow-sm">
                    NEW
                  </div>
                </div>

                <div className="text-center px-2 z-20 relative">
                  <p className="font-[family:var(--font-prompt)] text-xs text-[#f97316] mb-1 font-medium uppercase tracking-wider">
                    {product.categoryName || 'New Arrival'}
                  </p>
                  <h3 className="text-lg font-[family:var(--font-kanit)] font-bold text-[#7c2d12] mb-2 line-clamp-1 group-hover:text-[#f97316] transition-colors">
                    <Link href={`/stores/${store.slug}/products/${product.id}`}>{product.title}</Link>
                  </h3>
                  <div className="flex justify-center items-center gap-2 font-[family:var(--font-prompt)] mb-4">
                    <span className="text-[#7c2d12] font-bold">฿{product.priceTHB.toLocaleString()}</span>
                  </div>
                  
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full py-3 bg-[#fff7ed] text-[#f97316] rounded-xl font-[family:var(--font-prompt)] font-medium group-hover:bg-[#f97316] group-hover:text-white transition-colors duration-300 border border-[#fed7aa] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    หยิบใส่ตะกร้า
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link
              href={`/stores/${store.slug}/products`}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#f97316] rounded-full font-[family:var(--font-prompt)] font-medium text-lg border-2 border-[#f97316] hover:bg-[#f97316] hover:text-white transition-all duration-300"
            >
              ดูสินค้ามาใหม่ทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto bg-[#f97316] rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#facc15] rounded-full mix-blend-multiply opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#fff7ed] rounded-full mix-blend-overlay opacity-20 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-[family:var(--font-kanit)] text-white mb-4">
              รับข่าวสาร Workshop และสีเข้าใหม่
            </h2>
            <p className="font-[family:var(--font-prompt)] text-[#fff7ed]/90 text-lg mb-8 max-w-2xl mx-auto">
              ลงทะเบียนรับข่าวสารเพื่อไม่พลาดกิจกรรม Workshop สีน้ำฟรีทุกเสาร์แรกของเดือน และโปรโมชั่นพิเศษสำหรับสมาชิก
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                className="flex-1 px-6 py-4 rounded-full font-[family:var(--font-prompt)] text-[#7c2d12] focus:outline-none focus:ring-4 focus:ring-[#facc15]/50 border-none"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-[#7c2d12] text-white rounded-full font-[family:var(--font-prompt)] font-medium hover:bg-[#5a200d] transition-colors whitespace-nowrap"
              >
                ติดตามข่าวสาร
              </button>
            </form>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}} />
    </div>
  );
}
