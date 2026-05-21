'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

interface SirinFooterProps {
  store: {
    name: string;
    slug: string;
  };
}

export function SirinFooter({ store }: SirinFooterProps) {
  return (
    <footer className="bg-[#fff5f7] border-t border-[#fce7f3] text-[#3f0f24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-[family:var(--font-kanit)] font-extrabold text-2xl text-[#be185d] uppercase tracking-widest mb-4">
              {store.name}
            </h3>
            <p className="font-[family:var(--font-prompt)] text-sm leading-relaxed max-w-sm opacity-80">
              เดรส กระโปรง และเสื้อแขนพอง สำหรับสาวออฟฟิศ
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-[#3f0f24] hover:text-[#be185d] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#3f0f24] hover:text-[#be185d] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#3f0f24] hover:text-[#be185d] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-semibold text-lg mb-4 text-[#be185d]">
              ร้านค้า
            </h4>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm opacity-80">
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">คอลเลกชันใหม่</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">เดรส</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">เสื้อเชิ้ต & บลูส</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">กระโปรง</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-semibold text-lg mb-4 text-[#be185d]">
              บริการลูกค้า
            </h4>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm opacity-80">
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">การจัดส่ง</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">นโยบายการเปลี่ยนคืน</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">คำถามที่พบบ่อย</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-[#be185d] transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#fce7f3] mt-16 pt-8 text-center font-[family:var(--font-prompt)] text-xs opacity-60">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
