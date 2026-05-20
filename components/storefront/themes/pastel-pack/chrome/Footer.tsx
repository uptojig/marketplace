'use client';

import React from 'react';
import Link from 'next/link';
import { PackageOpen, Instagram, Facebook, MessageCircle } from 'lucide-react';

interface PastelPackFooterProps {
  storeName: string;
  storeSlug: string;
}

export function PastelPackFooter({ storeName, storeSlug }: PastelPackFooterProps) {
  return (
    <footer className="bg-[#0f4a44] text-[#ccfbf1] py-16 border-t-[12px] border-[#0f766e]">
      <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 font-[family:var(--font-prompt)]">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#0f766e] text-[#fde68a] rounded-xl flex items-center justify-center">
              <PackageOpen className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-[#fde68a] font-[family:var(--font-kanit)]">{storeName}</h3>
          </div>
          <p className="text-[#f0fdfa] mb-8 text-lg max-w-md font-light">
            บรรจุภัณฑ์รักษ์โลกสำหรับร้านคราฟต์
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-[#0f766e] rounded-full flex items-center justify-center hover:bg-[#fde68a] hover:text-[#0f766e] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-[#0f766e] rounded-full flex items-center justify-center hover:bg-[#fde68a] hover:text-[#0f766e] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-[#0f766e] rounded-full flex items-center justify-center hover:bg-[#fde68a] hover:text-[#0f766e] transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-[#fde68a] mb-6 text-xl font-[family:var(--font-kanit)] tracking-wider">หมวดหมู่สินค้า</h4>
          <ul className="space-y-4">
            <li><Link href={`/${storeSlug}/category/boxes`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> กล่องลูกฟูก</Link></li>
            <li><Link href={`/${storeSlug}/category/bags`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> ถุงคราฟท์</Link></li>
            <li><Link href={`/${storeSlug}/category/stickers`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> สติกเกอร์ย่อยสลายได้</Link></li>
            <li><Link href={`/${storeSlug}/category/all`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> สินค้าทั้งหมด</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-[#fde68a] mb-6 text-xl font-[family:var(--font-kanit)] tracking-wider">บริการลูกค้า</h4>
          <ul className="space-y-4">
            <li><Link href={`/${storeSlug}/about`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> เกี่ยวกับเรา</Link></li>
            <li><Link href={`/${storeSlug}/shipping`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> การจัดส่ง</Link></li>
            <li><Link href={`/${storeSlug}/returns`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> นโยบายการคืนสินค้า</Link></li>
            <li><Link href={`/${storeSlug}/contact`} className="hover:text-[#fde68a] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span> ติดต่อเรา</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 mt-16 pt-8 border-t border-[#0f766e] flex flex-col md:flex-row items-center justify-between font-[family:var(--font-prompt)] text-sm">
        <p className="opacity-80 mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
        <div className="flex gap-6 opacity-80">
          <Link href={`/${storeSlug}/privacy`} className="hover:text-[#fde68a]">นโยบายความเป็นส่วนตัว</Link>
          <Link href={`/${storeSlug}/terms`} className="hover:text-[#fde68a]">ข้อตกลงและเงื่อนไข</Link>
        </div>
      </div>
    </footer>
  );
}
