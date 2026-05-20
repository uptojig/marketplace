'use client';
import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, User, Cpu } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export function SmartloopHomeHeader({ store }: { store: Store }) {
  return (
    <header className="bg-[#064e3b] text-white font-[family:var(--font-kanit)] sticky top-0 z-50 shadow-md">
      {/* Top utility bar */}
      <div className="bg-[#f0fdf4] text-[#064e3b] px-4 py-1 flex justify-between text-xs font-[family:var(--font-prompt)] border-b border-[#dcfce7]">
        <div className="flex gap-4">
          <span className="hover:text-[#059669] cursor-pointer">สำหรับลูกค้าองค์กร (B2B)</span>
          <span className="hover:text-[#059669] cursor-pointer">เช็คสถานะการจัดส่ง</span>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-[#059669] cursor-pointer">TH / THB</span>
          <span className="hover:text-[#059669] cursor-pointer">ติดต่อเรา</span>
        </div>
      </div>
      
      {/* Main header */}
      <div className="px-4 py-3 flex flex-wrap lg:flex-nowrap items-center gap-4 max-w-[1400px] mx-auto">
        <Link href={`/${store.slug}`} className="flex items-center gap-2 flex-shrink-0">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-8 object-contain bg-white p-1 rounded-sm" />
          ) : (
            <div className="flex items-center gap-2">
              <Cpu className="w-8 h-8 text-[#34d399]" />
              <span className="text-xl font-bold tracking-tight uppercase">{store.name}</span>
            </div>
          )}
        </Link>
        
        {/* Search Bar - Electronics Distributor Style */}
        <div className="flex-1 flex items-center bg-white rounded-sm overflow-hidden h-10 ml-0 lg:ml-4 w-full order-last lg:order-none max-w-full lg:max-w-3xl border-2 border-transparent focus-within:border-[#34d399]">
          <select className="bg-[#f0fdf4] text-[#064e3b] h-full px-3 text-sm border-r border-gray-200 outline-none font-[family:var(--font-prompt)] hidden sm:block">
            <option>ทุกหมวดหมู่</option>
            <option>สมาร์ทสวิตช์</option>
            <option>เซ็นเซอร์</option>
            <option>กล้องวงจรปิด</option>
          </select>
          <input 
            type="text" 
            placeholder="ค้นหาสินค้า (เช่น รุ่น, แบรนด์, รหัสสินค้า)..." 
            className="flex-1 h-full px-4 text-[#064e3b] text-sm outline-none font-[family:var(--font-prompt)] placeholder-gray-400"
          />
          <button className="bg-[#059669] hover:bg-[#047857] h-full px-5 transition-colors">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex items-center gap-5 ml-auto flex-shrink-0">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-[#34d399] font-[family:var(--font-prompt)]">บัญชีของฉัน</span>
            <span className="text-sm font-semibold flex items-center gap-1 cursor-pointer hover:text-[#34d399] transition-colors"><User className="w-4 h-4" /> เข้าสู่ระบบ</span>
          </div>
          <Link href={`/cart`} className="relative flex items-center gap-2 hover:text-[#34d399] transition-colors">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-[#34d399] text-[#064e3b] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </div>
            <span className="hidden sm:inline text-sm font-semibold">ตะกร้า</span>
          </Link>
          <button className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Navigation Categories */}
      <div className="bg-[#059669] px-4 hidden lg:block border-t border-[#047857]">
        <div className="max-w-[1400px] mx-auto flex items-center gap-6 text-sm font-[family:var(--font-prompt)]">
          <button className="flex items-center gap-2 bg-[#047857] px-4 py-2 font-bold uppercase hover:bg-[#064e3b] transition-colors">
            <Menu className="w-4 h-4" /> หมวดหมู่สินค้าทั้งหมด
          </button>
          <a href="#" className="hover:text-[#34d399] transition-colors font-medium">หลอดไฟอัจฉริยะ</a>
          <a href="#" className="hover:text-[#34d399] transition-colors font-medium">สมาร์ทปลั๊ก</a>
          <a href="#" className="hover:text-[#34d399] transition-colors font-medium">เซ็นเซอร์ความปลอดภัย</a>
          <a href="#" className="hover:text-[#34d399] transition-colors font-medium">กล้องสมาร์ทโฮม</a>
          <a href="#" className="hover:text-[#34d399] transition-colors font-medium text-yellow-300 ml-auto">PROMOTIONS</a>
        </div>
      </div>
    </header>
  );
}
