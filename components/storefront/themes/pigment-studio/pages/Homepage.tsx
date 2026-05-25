'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/store/cart';
import { Palette, Paintbrush, Droplets, Sparkles, Plus, Star, PawPrint, Heart, Mail } from 'lucide-react';

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

  const featuredProducts = products.slice(0, 8);
  const newestProducts = products.slice(8, 12);
  const isZugarbox = store.slug === 'zugarbox';

  return (
    <div className="min-h-screen bg-[#fff7ed] text-[#7c2d12] overflow-hidden">
      {/* Hero Section */}
      {isZugarbox ? (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef5e7] via-[#fffbf7] to-[#fedec9] py-16 sm:py-24">
          {/* Soft Glowing Blur Blobs */}
          <div className="absolute top-10 left-10 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-[#ffe4cc]/50 rounded-full filter blur-[80px] sm:blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-[#ffd1b3]/40 rounded-full filter blur-[100px] sm:blur-[140px] -z-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Content Column */}
              <div className="lg:col-span-7 text-left space-y-6">
                <span className="inline-flex items-center px-5 py-2 rounded-full bg-[#fde8c8]/70 border border-[#fde8c8] text-[#7c2d12] text-sm font-semibold tracking-wider uppercase backdrop-blur-sm shadow-sm select-none">
                  <PawPrint className="w-4.5 h-4.5 mr-2 text-[#e67e22] fill-[#e67e22]" />
                  คอลเลกชันทาสแมว
                </span>
                
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#3a1a07] font-[family:var(--font-prompt)] leading-[1.2] tracking-tight">
                  <span className="lg:whitespace-nowrap">ไอเทมน่ารักสไตล์สีน้ำสุดคิ้วท์</span>
                  <br className="hidden lg:inline" />
                  <span className="lg:whitespace-nowrap">ที่จะทำให้ใจคุณฟู</span>
                </h1>
                
                <p className="text-[#5c3e2b] text-lg sm:text-xl max-w-2xl leading-relaxed font-light">
                  ช้อปแก้วเซรามิก ลายแมวเหมียวสุดอบอุ่น, เครื่องเขียนสีน้ำสุดละมุน และของใช้ของตกแต่งบ้านดีไซน์พิเศษ สำหรับคนรักสัตว์และงานคราฟต์
                </p>
                
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link 
                    href={`/stores/${store.slug}/products`}
                    className="inline-flex items-center justify-center px-10 py-4 bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 transform"
                  >
                    ช้อปความน่ารัก
                  </Link>
                  <Link 
                    href={`/stores/${store.slug}/products`}
                    className="inline-flex items-center justify-center px-10 py-4 bg-white hover:bg-[#fef5e7]/30 border border-[#5c3e2b]/20 hover:border-[#5c3e2b]/50 text-[#5c3e2b] font-bold text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 transform"
                  >
                    ดูคอลเลกชันใหม่
                  </Link>
                </div>
                
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex -space-x-3">
                    <img 
                      src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=120&fit=crop" 
                      alt="Avatar 1" 
                      className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=120&h=120&fit=crop" 
                      alt="Avatar 2" 
                      className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=120&h=120&fit=crop" 
                      alt="Avatar 3" 
                      className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&h=120&fit=crop" 
                      alt="Avatar 4" 
                      className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5 text-[#facc15]">
                      <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                      <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                      <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                      <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                      <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                    </div>
                    <span className="text-sm sm:text-base text-[#5c3e2b]/80 font-[family:var(--font-prompt)] font-medium mt-0.5">
                      รีวิวจากทาสแมวและคนรักความคราฟท์กว่า 500+ คน
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right Image Card Column */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end items-center relative py-6">
                <div className="relative rotate-[-1.5deg] hover:rotate-0 transition-all duration-500 hover:scale-[1.02] bg-white p-4 pb-6 rounded-3xl border border-[#fedec9] shadow-[0_20px_50px_rgba(240,180,120,0.15)] max-w-md sm:max-w-lg lg:max-w-[450px] w-full">
                  <div className="relative aspect-[1.1] overflow-hidden rounded-2xl bg-[#fef9f1]">
                    <img 
                      src="/cat_ceramics_hero.png" 
                      alt="แก้วเซรามิกรูปแมวน่ารักและขวดน้ำ" 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Badge at the bottom-left of the image */}
                    <div className="absolute bottom-4 left-4 flex items-center bg-white shadow-lg rounded-2xl p-2 border border-[#fedec9]/40 select-none">
                      <div className="w-10 h-10 rounded-xl bg-[#e67e22] flex items-center justify-center text-white shadow-sm">
                        <Heart className="w-6 h-6 fill-white text-white" />
                      </div>
                      <div className="flex flex-col text-left ml-2.5 pr-2">
                        <span className="text-sm font-bold text-[#3a1a07] font-[family:var(--font-prompt)] leading-tight">ดีไซน์เฉพาะตัว</span>
                        <span className="text-xs text-[#5c3e2b]/70 font-[family:var(--font-prompt)] mt-0.5">ดีไซน์เฉพาะตัว</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>
      ) : (
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
                  <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border-2 border-[#fedec9] flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
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
      )}

      {/* Features Banner */}
      {isZugarbox ? (
        <section className="border-y-2 border-[#fed7aa] bg-[#fff5ea] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#fed7aa]">
              <div className="p-4 flex flex-col items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-12 h-12 mx-auto mb-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" fill="#fff" filter="drop-shadow(0 2px 4px rgba(220,150,120,0.15))" />
                  <circle cx="50" cy="50" r="42" fill="#fff9f3" stroke="#fde8c8" strokeWidth="1" />
                  <path d="M50 48C42 48 37 53 37 62C37 70 43 74 50 74C57 74 63 70 63 62C63 53 58 48 50 48Z" fill="#d08b62" />
                  <circle cx="34" cy="42" r="8" fill="#e68a60" />
                  <circle cx="45" cy="33" r="8" fill="#e68a60" />
                  <circle cx="58" cy="33" r="8" fill="#e68a60" />
                  <circle cx="68" cy="42" r="8" fill="#e68a60" />
                </svg>
                <h3 className="font-[family:var(--font-prompt)] font-bold text-lg text-[#5c3e2b] mb-1">รักสัตว์อย่างมีสไตล์</h3>
                <p className="font-[family:var(--font-prompt)] text-[#8c6d58] text-xs leading-relaxed max-w-xs">คัดสรรสินค้าดีไซน์พิเศษสำหรับเพื่อนสี่ขา</p>
              </div>
              <div className="p-4 flex flex-col items-center justify-center pt-8 md:pt-4">
                <svg viewBox="0 0 100 100" className="w-12 h-12 mx-auto mb-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" fill="#fff" filter="drop-shadow(0 2px 4px rgba(220,150,120,0.15))" />
                  <circle cx="50" cy="50" r="42" fill="#fff9f3" stroke="#fde8c8" strokeWidth="1" />
                  <path d="M30 40 L22 20 L42 30 Z" fill="#d08b62" />
                  <path d="M70 40 L78 20 L58 30 Z" fill="#d08b62" />
                  <path d="M32 38 L26 23 L40 31 Z" fill="#ffbda2" />
                  <path d="M68 38 L74 23 L60 31 Z" fill="#ffbda2" />
                  <circle cx="50" cy="52" r="24" fill="#fcfcfc" stroke="#d08b62" strokeWidth="1.5" />
                  <path d="M66 40 C62 38 58 42 58 48 C58 52 64 56 68 54 C72 52 74 44 66 40 Z" fill="#d08b62" opacity="0.8" />
                  <path d="M38 52 Q42 48 46 52" stroke="#4a2511" strokeWidth="2" strokeLinecap="round" />
                  <path d="M54 52 Q58 48 62 52" stroke="#4a2511" strokeWidth="2" strokeLinecap="round" />
                  <path d="M50 56 L48 54 L52 54 Z" fill="#ff9d82" />
                  <path d="M46 60 Q50 63 50 60 Q50 63 54 60" stroke="#4a2511" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="36" cy="57" r="3" fill="#ffbda2" />
                  <circle cx="64" cy="57" r="3" fill="#ffbda2" />
                </svg>
                <h3 className="font-[family:var(--font-prompt)] font-bold text-lg text-[#5c3e2b] mb-1">งานคราฟต์สุดน่ารัก</h3>
                <p className="font-[family:var(--font-prompt)] text-[#8c6d58] text-xs leading-relaxed max-w-xs">รวมของใช้และของแต่งบ้านสไตล์คาอี้</p>
              </div>
              <div className="p-4 flex flex-col items-center justify-center pt-8 md:pt-4">
                <svg viewBox="0 0 100 100" className="w-12 h-12 mx-auto mb-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" fill="#fff" filter="drop-shadow(0 2px 4px rgba(220,150,120,0.15))" />
                  <circle cx="50" cy="50" r="42" fill="#fff9f3" stroke="#fde8c8" strokeWidth="1" />
                  <path d="M35 65 C30 55 30 40 45 35 C55 32 70 35 73 45 C75 52 68 62 60 62 C55 62 52 58 48 58 C44 58 42 65 35 65 Z" fill="#fff" stroke="#d08b62" strokeWidth="1.5" />
                  <circle cx="41" cy="45" r="3" fill="#fff9f3" stroke="#d08b62" strokeWidth="1" />
                  <circle cx="52" cy="40" r="4" fill="#ff8ba4" opacity="0.9" />
                  <circle cx="64" cy="44" r="4" fill="#ffb252" opacity="0.9" />
                  <circle cx="62" cy="54" r="4" fill="#52d3ff" opacity="0.9" />
                  <circle cx="50" cy="52" r="3.5" fill="#8affb4" opacity="0.9" />
                  <g transform="translate(62, 22) scale(0.28)">
                    <path d="M50 25 C40 25 35 35 50 45 C65 35 60 25 50 25 Z" fill="#ff8ba4" />
                    <path d="M25 50 C25 40 35 35 45 50 C35 65 25 60 25 50 Z" fill="#ff8ba4" />
                    <path d="M50 75 C60 75 65 65 50 55 C35 65 40 75 50 75 Z" fill="#ff8ba4" />
                    <path d="M75 50 C75 60 65 65 55 50 C65 35 75 40 75 50 Z" fill="#ff8ba4" />
                    <circle cx="50" cy="50" r="10" fill="#ffd56b" />
                  </g>
                </svg>
                <h3 className="font-[family:var(--font-prompt)] font-bold text-lg text-[#5c3e2b] mb-1">ดีไซน์ลายน้ำอบอุ่น</h3>
                <p className="font-[family:var(--font-prompt)] text-[#8c6d58] text-xs leading-relaxed max-w-xs">ทุกชิ้นงานผ่านการคัดสรรสีน้ำอย่างละมุน</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
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
      )}

      {/* Featured Collection */}
      <section className="py-24 px-4 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          {isZugarbox ? (
            <>
              <div className="flex justify-between items-end mb-12 gap-6">
                <div className="relative inline-block">
                  <h2 className="text-3xl md:text-4xl font-bold font-[family:var(--font-prompt)] text-[#7c2d12] relative z-10">
                    สินค้าทั้งหมด
                  </h2>
                  <div className="absolute -bottom-1 left-0 w-full h-3 bg-[#fde8c8] rounded-full -z-10 opacity-70"></div>
                </div>
                <Link
                  href={`/stores/${store.slug}/products`}
                  className="font-[family:var(--font-prompt)] text-[#8c6d58] hover:text-[#e67e22] text-sm font-semibold flex items-center gap-1.5 transition-colors group"
                >
                  ดูทั้งหมด
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#fff5ea] text-[#e67e22] text-xs font-bold transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product, index) => {
                  const getCardMetadata = (title: string) => {
                    const lower = title.toLowerCase();
                    if (lower.includes('พาสเทล') || lower.includes('pastel cat mug')) {
                      return { tag: 'แก้วเซรามิก', label: 'Cute Pastel Cat Mug Set' };
                    }
                    if (lower.includes('ตุ๊กตาแมว') || lower.includes('adorable ceramic') || (lower.includes('cat') && lower.includes('เซรามิก'))) {
                      return { tag: 'ตุ๊กตาเซรามิก', label: 'Adorable Ceramic Cat' };
                    }
                    if (lower.includes('ปลอกคอ') || lower.includes('collar')) {
                      return { tag: 'ปลอกคอ', label: 'Watercolor Pet Collar' };
                    }
                    if (lower.includes('ขวดน้ำเก็บอุณหภูมิ') || lower.includes('thermos') || lower.includes('กระบอกน้ำ') || lower.includes('อุณหภูมิ')) {
                      return { tag: 'ขวดน้ำ', label: 'Cat Paw Print Thermos' };
                    }
                    if (lower.includes('สามน่ารัก') || lower.includes('แก้วเซรามิกสาม')) {
                      return { tag: 'แก้วดินเผา', label: 'แก้วเซรามิกสามน่ารักดีไซน์เฉพาะ...' };
                    }
                    if (lower.includes('กายะ') || lower.includes('healing cartoon') || lower.includes('แก้วกาแฟ')) {
                      return { tag: 'แก้วกาแฟ', label: 'แก้วกาแฟเซรามิก กายะ Healing Cartoo...' };
                    }
                    if (lower.includes('ปากกา') || lower.includes('multi-flow') || lower.includes('มัลติโฟล')) {
                      return { tag: 'ปากกาสีน้ำ', label: 'ปากกามัลติโฟลเพียงหนึ่งเดียว ดีไซน์น่ารัก' };
                    }
                    if (lower.includes('หมอน') || lower.includes('โครงแมว')) {
                      return { tag: 'หมอน', label: 'หมอนตัวน้อยโครงแมว สัตว์เลี้ยงน่ารัก...' };
                    }
                    return { tag: 'ของใช้', label: title };
                  };

                  const metadata = getCardMetadata(product.title);

                  return (
                    <div key={`${product.id}-${index}`} className="group relative flex flex-col">
                      <Link href={`/stores/${store.slug}/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`} />
                      
                      {/* Polaroid Card */}
                      <div className="relative aspect-[4/5] w-full p-4 pb-5 bg-[#faf5f0] rounded-2xl border border-[#f3e6d8] shadow-[0_4px_16px_rgba(124,45,18,0.03)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_24px_rgba(124,45,18,0.08)]">
                        {/* Wavy masked image */}
                        <div className="relative aspect-square w-full overflow-hidden bg-white rounded-lg border border-[#f3e6d8]/50 shadow-inner">
                          <div 
                            className="w-full h-full relative"
                            style={{ 
                              WebkitMaskImage: 'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M5,20 C30,15 70,25 95,15 C90,40 98,60 90,85 C65,95 35,85 10,90 C15,65 5,45 5,20 Z\'/></svg>")',
                              WebkitMaskSize: '100% 100%' 
                            }}
                          >
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#e67e22] to-[#fde8c8]" />
                            )}
                          </div>
                        </div>

                        {/* Divider Line */}
                        <div className="w-full h-px bg-[#d08b62]/15 my-3"></div>

                        {/* Card Info Area */}
                        <div className="flex flex-col items-center text-center">
                          <span className="font-[family:var(--font-prompt)] text-[9px] text-[#7c2d12]/50 uppercase tracking-widest mb-0.5">
                            {metadata.tag}
                          </span>
                          <p className="font-[family:var(--font-prompt)] text-[11px] text-[#7c2d12] font-semibold tracking-wide truncate max-w-full">
                            {metadata.label}
                          </p>
                        </div>
                      </div>

                      {/* Outside Card: Thai Title, Price, Plus Button */}
                      <div className="flex justify-between items-end mt-3 z-20 relative">
                        <div className="flex flex-col text-left">
                          <h3 className="font-[family:var(--font-prompt)] text-sm font-semibold text-[#5c3e2b] line-clamp-1 group-hover:text-[#e67e22] transition-colors">
                            <Link href={`/stores/${store.slug}/products/${product.id}`}>{product.title}</Link>
                          </h3>
                          <span className="font-[family:var(--font-prompt)] text-sm font-bold text-[#e67e22] mt-0.5">
                            ฿{product.priceTHB.toLocaleString()}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-7 h-7 rounded-full border border-[#fedec9] bg-[#fff5ea] hover:bg-[#e67e22] hover:text-white text-[#e67e22] flex items-center justify-center transition-all duration-300 font-bold shadow-sm"
                          aria-label="Add to cart"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="relative inline-block">
                  <h2 className="text-4xl md:text-5xl font-bold font-[family:var(--font-kanit)] text-[#7c2d12] relative z-10">
                    คอลเลกชันสีน้ำยอดฮิต
                  </h2>
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
                {featuredProducts.map((product, index) => (
                  <div key={`${product.id}-${index}`} className="group relative flex flex-col cursor-pointer">
                    <Link href={`/stores/${store.slug}/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`} />
                    
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-transparent mb-6 transition-transform duration-500 group-hover:-translate-y-2">
                      <div className="absolute inset-0 bg-[#fef8f5] shadow-[0_4px_12px_rgba(124,45,18,0.08)] rounded-xl border border-[#fed7aa]/30 z-0">
                        <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                      </div>
                      
                      <div className="absolute inset-4 sm:inset-6 z-10">
                        <div className="w-full h-[70%] relative overflow-hidden rounded-[2px] shadow-sm transform group-hover:scale-105 transition-transform duration-700">
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
            </>
          )}
        </div>
      </section>

      {/* Category Banner */}
      {isZugarbox ? (
        <section className="py-16 px-4 bg-[#4a2511] relative overflow-hidden">
          {/* Background decorative glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e67e22] rounded-full blur-3xl opacity-15 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffb252] rounded-full blur-3xl opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold font-[family:var(--font-prompt)] text-white mb-4 leading-tight">
                  สำรวจคอลเลกชันเครื่องครัวและของใช้ในบ้านสุดพิเศษ
                </h2>
                <p className="font-[family:var(--font-prompt)] text-[#fed7aa] text-base mb-8 leading-relaxed font-light">
                  ค้นพบเครื่องใช้และของตกแต่งที่ออกแบบมาเพื่อเติมเต็มความสุขในทุกมุมบ้าน ตั้งแต่แก้วกาแฟลายการ์ตูนไปจนถึงเครื่องเขียนดีไซน์เฉพาะตัว
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {[
                    { name: 'แก้วกาแฟ', slug: 'แก้วกาแฟ' },
                    { name: 'เครื่องเขียน', slug: 'เครื่องเขียน' },
                    { name: 'ของตกแต่งบ้าน', slug: 'ของตกแต่งบ้าน' },
                    { name: 'เบาะและหมอน', slug: 'เบาะและหมอน' },
                    { name: 'ของสะสม', slug: 'ของสะสม' }
                  ].map((category, index) => (
                    <Link
                      key={`${category.slug}-${index}`}
                      href={`/stores/${store.slug}/products?category=${encodeURIComponent(category.name)}`}
                      className="px-5 py-2 bg-white/10 hover:bg-white/20 text-[#fed7aa] rounded-full font-[family:var(--font-prompt)] text-sm font-medium transition-all border border-white/10"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative w-48 h-48">
                  {/* Glowing Cat Bubble */}
                  <div className="absolute inset-0 bg-[#e67e22] rounded-full blur-xl opacity-40 animate-pulse"></div>
                  <div className="absolute inset-2 border-2 border-[#facc15]/30 rounded-full"></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-[#ff9f43] to-[#e67e22] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(230,126,34,0.6)]">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M35 75 Q35 50 40 45 L35 25 L45 35 Q50 30 55 35 L65 25 L60 45 Q65 50 65 75 Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M45 48 C45 48 48 44 50 44 C52 44 55 48 55 48" stroke="white" strokeWidth="2" />
                      <circle cx="45" cy="42" r="1.5" fill="white" />
                      <circle cx="55" cy="42" r="1.5" fill="white" />
                      <path d="M50 48 L50 54 Q48 56 46 54 M50 54 Q52 56 54 54" stroke="white" strokeWidth="1.5" />
                      <path d="M65 65 Q78 65 75 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M42 75 C42 71 47 71 47 75" stroke="white" strokeWidth="2" />
                      <path d="M58 75 C58 71 53 71 53 75" stroke="white" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
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
                  {categories.slice(0, 5).map((category, index) => (
                    <Link
                      key={`${category.id}-${category.slug}-${index}`}
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
      )}

      {/* New Arrivals */}
      <section className="py-24 px-4 bg-[#fff7ed]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#facc15]/20 text-[#7c2d12] font-[family:var(--font-prompt)] font-medium text-sm mb-4 border border-[#facc15]/30">
              <Sparkles className="w-4 h-4 mr-2 text-[#f97316]" />
              สินค้ามาใหม่
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-[family:var(--font-kanit)] text-[#7c2d12]">
              {isZugarbox ? "สินค้ามาใหม่" : "อัปเดตสีสันใหม่ๆ"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newestProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="group relative bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-[#fed7aa]/50">
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
      {isZugarbox ? (
        <section className="py-20 px-4 relative">
          {/* Peeking Cat Wrapper */}
          <div className="max-w-4xl mx-auto relative group">
            {/* Peeking Cat Illustration */}
            <div className="absolute -top-[42px] left-10 sm:left-16 w-24 h-[44px] overflow-visible z-20 pointer-events-none transition-transform duration-500 ease-out group-hover:-translate-y-2">
              <svg viewBox="0 0 100 50" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ears */}
                <path d="M15 50 L25 15 L40 38 Z" fill="#e68a60" />
                <path d="M18 50 L25 22 L35 40 Z" fill="#ffbda2" /> {/* Inner ear */}
                
                <path d="M85 50 L75 15 L60 38 Z" fill="#e68a60" />
                <path d="M82 50 L75 22 L65 40 Z" fill="#ffbda2" /> {/* Inner ear */}
                
                {/* Head */}
                <path d="M20 50 Q20 28 50 28 Q80 28 80 50 Z" fill="#e68a60" />
                
                {/* Cheeks blush */}
                <circle cx="32" cy="45" r="4" fill="#ffbda2" opacity="0.8" />
                <circle cx="68" cy="45" r="4" fill="#ffbda2" opacity="0.8" />
                
                {/* Eyes */}
                <path d="M38 41 Q42 38 46 41" stroke="#4a2511" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M54 41 Q58 38 62 41" stroke="#4a2511" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Nose & Mouth */}
                <path d="M50 44 L48 46 L52 46 Z" fill="#ff9d82" />
                <path d="M47 48 Q50 50 50 48 Q50 50 53 48" stroke="#4a2511" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Newsletter Card Container */}
            <div className="w-full bg-gradient-to-br from-[#fffdfa] via-[#fff5eb] to-[#fedec9] rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden border border-[#fedec9] shadow-[0_24px_60px_rgba(230,126,34,0.08)]">
              {/* Cozy Stitched Inner Border */}
              <div className="absolute inset-2 md:inset-3 border-2 border-dashed border-[#e67e22]/15 rounded-[2.25rem] pointer-events-none" />

              {/* Decorative Paws & Watercolor Splashes */}
              <svg viewBox="0 0 100 100" className="absolute -top-6 -left-6 w-24 h-24 text-[#e67e22]/10 fill-current opacity-30 transform -rotate-12 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 48C42 48 37 53 37 62C37 70 43 74 50 74C57 74 63 70 63 62C63 53 58 48 50 48Z" />
                <circle cx="34" cy="42" r="8" />
                <circle cx="45" cy="33" r="8" />
                <circle cx="58" cy="33" r="8" />
                <circle cx="68" cy="42" r="8" />
              </svg>
              
              <svg viewBox="0 0 100 100" className="absolute -bottom-8 -right-8 w-32 h-32 text-[#ffd1b3]/25 fill-current opacity-40 transform rotate-45 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 48C42 48 37 53 37 62C37 70 43 74 50 74C57 74 63 70 63 62C63 53 58 48 50 48Z" />
                <circle cx="34" cy="42" r="8" />
                <circle cx="45" cy="33" r="8" />
                <circle cx="58" cy="33" r="8" />
                <circle cx="68" cy="42" r="8" />
              </svg>

              {/* Watercolor Splashes */}
              <svg viewBox="0 0 100 100" className="absolute top-1/2 -right-10 -translate-y-1/2 w-48 h-48 text-[#fde8c8]/25 fill-current opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 C65 30 90 40 90 60 C90 75 75 90 50 90 C25 90 10 75 10 60 C10 40 35 30 50 10 Z" />
              </svg>
              <svg viewBox="0 0 100 100" className="absolute -bottom-6 -left-12 w-40 h-40 text-[#ffd1b3]/20 fill-current opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15 C70 10 85 25 85 45 C85 65 65 85 45 85 C25 85 15 65 15 45 C15 25 30 20 50 15 Z" />
              </svg>

              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-[family:var(--font-prompt)] text-[#4a2511] mb-4 leading-tight">
                  ✨ เติมความน่ารักให้ทุกวันของคุณ ✨
                </h2>
                <p className="font-[family:var(--font-prompt)] text-[#5c3e2b] text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
                  ขอบคุณที่แวะมาเยี่ยมชม Zugarbox ขอให้วันนี้เป็นวันที่สดใสและเต็มไปด้วยรอยยิ้มนะคะ
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
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
      )}

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
