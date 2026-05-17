'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Star, LayoutGrid, Timer } from 'lucide-react';

interface CategoryInfo {
  id: string; // Category ID
  name: string; // Category name
  icon?: string; // Optional icon class or emoji
  image?: string; // Image for category icon
}

interface ProductInfo {
  id: string; // Product ID
  name: string; // Product name
  image?: string; // Main image URL
  price: number; // Current selling price
  originalPrice?: number; // Original price for discount calculation
  soldCount?: number; // Number of items sold (e.g. 10k+)
  rating?: number; // 0-5 rating
}

export interface HomepageProps {
  categories: CategoryInfo[]; // List of quick-access categories (8-10 items)
  flashSales: ProductInfo[]; // Products on flash sale right now
  justForYou: ProductInfo[]; // Recommended products grid
  shopUrl: string; // Base catalog URL
  productBaseUrl: string; // Base product detail URL
}

export function Homepage({ categories, flashSales, justForYou, shopUrl, productBaseUrl }: HomepageProps) {
  
  return (
    <main className="bg-[var(--shop-bg)] min-h-screen pb-20">
      
      {/* Hero Banner Grid (Taobao style - Banner left, mini banners right) */}
      <div className="max-w-[1400px] mx-auto px-4 pt-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 aspect-[21/9] lg:aspect-[2.5/1] bg-[var(--meg-highlight)] rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-[var(--mega-gradient-btn)] opacity-90"></div>
            <div className="absolute flex flex-col justify-center h-full px-8 md:px-16 text-white w-full md:w-2/3 z-10">
              <span className="bg-white text-[var(--shop-primary)] text-xs font-bold px-2 py-1 rounded-sm w-max mb-3">SUPER BRAND DAY</span>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight">เซลจัดหนัก<br/>ลดสูงสุด 80%</h2>
              <p className="text-sm md:text-base mb-6 opacity-90">ส่งฟรีไม่มีขั้นต่ำ เก็บโค้ดเลยวันนี้ลดเพิ่มอีก 20%</p>
              <a href={shopUrl} className="bg-white text-[var(--shop-primary)] font-bold px-6 py-2.5 rounded-full w-max shadow-lg hover:scale-105 transition-transform">
                ช้อปเลย
              </a>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute right-20 -bottom-20 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="hidden lg:flex flex-col gap-4">
            <div className="flex-1 bg-white rounded-2xl p-5 border border-[var(--shop-border)] relative overflow-hidden">
               <div className="absolute right-0 bottom-0 w-24 h-24 bg-[var(--mega-highlight)] rounded-tl-full blur-xl z-0"></div>
               <div className="relative z-10">
                 <h3 className="font-bold text-[var(--shop-ink)] mb-1">สมาชิกใหม่</h3>
                 <p className="text-xs text-[var(--shop-ink-muted)] mb-3">รับคูปองส่วนลดมูลค่า 500.-</p>
                 <button className="bg-[var(--shop-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full">เก็บโค้ด</button>
               </div>
            </div>
            <div className="flex-1 bg-[var(--shop-card)] rounded-2xl p-5 border border-[var(--shop-border)] overflow-hidden relative">
               <div className="relative z-10">
                 <h3 className="font-bold text-[var(--shop-accent)] mb-1">ส่งฟรีพิเศษ</h3>
                 <p className="text-xs text-[var(--shop-ink-muted)]">เมื่อช้อปครบ 99.- ขึ้นไป</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigator (Dense Icons) */}
      <div className="max-w-[1400px] mx-auto px-4 mb-6">
        <div className="bg-[var(--shop-card)] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-wrap lg:flex-nowrap gap-x-2 gap-y-6 justify-between hide-scrollbar overflow-x-auto">
          {categories.map((cat, idx) => (
             <a key={idx} href={`${shopUrl}?category=${cat.id}`} className="flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] group cursor-pointer">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.2rem] bg-[var(--mega-highlight)] flex items-center justify-center group-hover:-translate-y-1 transition-transform border border-orange-100 relative overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                  ) : (
                    <div className="text-[var(--shop-primary)]"><LayoutGrid size={24} /></div>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs text-[var(--shop-ink)] text-center line-clamp-2 px-1 leading-tight group-hover:text-[var(--shop-primary)] font-medium">
                  {cat.name}
                </span>
             </a>
          ))}
        </div>
      </div>

      {/* Flash Sale Bar */}
      <div className="max-w-[1400px] mx-auto px-4 mb-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--shop-border)]">
          {/* Flash Sale Header */}
          <div className="px-5 py-4 border-b border-[var(--shop-border)] flex justify-between items-center bg-gradient-to-r from-[var(--mega-highlight)] to-white">
            <div className="flex items-center gap-3">
              <Zap size={24} className="text-[var(--shop-accent)] fill-[var(--shop-accent)]" />
              <h2 className="text-xl font-extrabold text-[var(--shop-ink)] italic tracking-tight">FLASH SALE</h2>
              <div className="hidden sm:flex items-center gap-1.5 ml-4">
                <span className="text-xs font-bold text-[var(--shop-ink-muted)] mr-1">จบใน:</span>
                <span className="bg-[var(--shop-ink)] text-white text-xs font-mono px-2 py-0.5 rounded">02</span><span className="text-[var(--shop-ink)] font-bold">:</span>
                <span className="bg-[var(--shop-ink)] text-white text-xs font-mono px-2 py-0.5 rounded">45</span><span className="text-[var(--shop-ink)] font-bold">:</span>
                <span className="bg-[var(--shop-accent)] text-white text-xs font-mono px-2 py-0.5 rounded">59</span>
              </div>
            </div>
            <a href={shopUrl} className="text-xs font-bold text-[var(--shop-primary)] flex items-center hover:opacity-80">
              ดูทั้งหมด <ChevronRight size={16} />
            </a>
          </div>
          {/* Flash Sale Items Horizontal Scroll */}
          <div className="p-4 flex gap-4 overflow-x-auto hide-scrollbar snap-x">
             {flashSales.map((item, idx) => {
               const discount = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
               return (
                 <a key={idx} href={`${productBaseUrl}/${item.id}`} className="min-w-[130px] sm:min-w-[160px] snap-start group relative">
                   {discount > 0 && (
                     <div className="absolute top-0 left-0 bg-[var(--shop-accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg rounded-tl-lg z-10">
                       -{discount}%
                     </div>
                   )}
                   <div className="aspect-square bg-[var(--shop-bg)] rounded-xl mb-3 overflow-hidden border border-gray-100">
                     {item.image ? (
                       <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-300"><LayoutGrid size={32} /></div>
                     )}
                   </div>
                   <div className="flex flex-col items-center text-center">
                     <span className="font-bold text-[var(--shop-primary)] text-lg leading-none mb-1">฿{item.price.toLocaleString()}</span>
                     {item.originalPrice && (
                       <span className="text-[10px] text-[var(--shop-ink-muted)] line-through">฿{item.originalPrice.toLocaleString()}</span>
                     )}
                     <div className="w-full bg-orange-100 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-[var(--shop-accent)] h-full" style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                     </div>
                     <span className="text-[9px] text-[var(--shop-accent)] font-bold mt-1">ขายแล้ว {item.soldCount || 10} ชิ้น</span>
                   </div>
                 </a>
               );
             })}
          </div>
        </div>
      </div>

      {/* Just For You (Infinite Grid) */}
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-center gap-4 mb-6 mt-10">
          <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-[var(--shop-primary)] to-transparent opacity-50"></div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--shop-primary)] flex items-center gap-2">
             <Star className="fill-[var(--shop-primary)]" size={20} /> สินค้าแนะนำสำหรับคุณ
          </h2>
          <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-[var(--shop-primary)] to-transparent opacity-50"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {justForYou.map((item, idx) => (
             <a key={idx} href={`${productBaseUrl}/${item.id}`} className="bg-[var(--shop-card)] rounded-xl overflow-hidden hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all border border-[var(--shop-border)] group flex flex-col">
               <div className="aspect-square bg-[var(--shop-bg)] relative overflow-hidden">
                 {item.image ? (
                   <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300"><LayoutGrid size={40} /></div>
                 )}
               </div>
               <div className="p-3 flex flex-col flex-1 justify-between">
                 <div>
                   <h3 className="text-xs sm:text-sm text-[var(--shop-ink)] leading-snug line-clamp-2 mb-2 group-hover:text-[var(--shop-primary)] transition-colors">
                     {item.name}
                   </h3>
                 </div>
                 <div className="flex flex-col mt-auto">
                   <div className="flex items-baseline gap-1">
                     <span className="text-[10px] text-[var(--shop-primary)] font-bold">฿</span>
                     <span className="text-base sm:text-lg font-extrabold text-[var(--shop-primary)]">
                       {item.price.toLocaleString()}
                     </span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] text-[var(--shop-ink-muted)] mt-1">
                     <span className="flex items-center gap-0.5"><Star size={10} className="fill-yellow-400 text-yellow-400" /> {item.rating || '4.9'}</span>
                     <span>ขายแล้ว {item.soldCount || '1k+'}</span>
                   </div>
                 </div>
               </div>
             </a>
          ))}
        </div>
      </div>
      
    </main>
  );
}
