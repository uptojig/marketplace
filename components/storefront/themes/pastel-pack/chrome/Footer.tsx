'use client';

import React from 'react';
import Link from 'next/link';
import { PackageOpen, Instagram, Facebook, MessageCircle } from 'lucide-react';

interface PastelPackFooterProps {
  storeName: string;
  storeSlug: string;
  logoUrl?: string | null;
}

export function PastelPackFooter({ storeName, storeSlug, logoUrl }: PastelPackFooterProps) {
  return (
    <footer className="bg-[var(--shop-ink)] text-[var(--shop-bg-soft)] py-16 border-t-[12px] border-[var(--shop-primary)]">
      <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 font-[family:var(--font-prompt)]">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="w-12 h-12 bg-[var(--shop-primary)] text-[var(--shop-accent)] rounded-xl flex items-center justify-center">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-[var(--shop-accent)] font-[family:var(--font-kanit)]">{storeName}</h3>
              </>
            )}
          </div>
          <p className="text-[var(--shop-bg)] mb-8 text-lg max-w-md font-light">
            บรรจุภัณฑ์รักษ์โลกสำหรับร้านคราฟต์
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-[var(--shop-primary)] rounded-full flex items-center justify-center hover:bg-[var(--shop-accent)] hover:text-[var(--shop-primary)] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-[var(--shop-primary)] rounded-full flex items-center justify-center hover:bg-[var(--shop-accent)] hover:text-[var(--shop-primary)] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-[var(--shop-primary)] rounded-full flex items-center justify-center hover:bg-[var(--shop-accent)] hover:text-[var(--shop-primary)] transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-[var(--shop-accent)] mb-6 text-xl font-[family:var(--font-kanit)] tracking-wider">หมวดหมู่สินค้า</h4>
          <ul className="space-y-4">
            <li><Link href={`/stores/${storeSlug}/category/boxes`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> กล่องลูกฟูก</Link></li>
            <li><Link href={`/stores/${storeSlug}/category/bags`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> ถุงคราฟท์</Link></li>
            <li><Link href={`/stores/${storeSlug}/category/stickers`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> สติกเกอร์ย่อยสลายได้</Link></li>
            <li><Link href={`/stores/${storeSlug}/category/all`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> สินค้าทั้งหมด</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-[var(--shop-accent)] mb-6 text-xl font-[family:var(--font-kanit)] tracking-wider">บริการลูกค้า</h4>
          <ul className="space-y-4">
            <li><Link href={`/stores/${storeSlug}/about`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> เกี่ยวกับเรา</Link></li>
            <li><Link href={`/stores/${storeSlug}/shipping`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> การจัดส่ง</Link></li>
            <li><Link href={`/stores/${storeSlug}/returns`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> นโยบายการคืนสินค้า</Link></li>
            <li><Link href={`/stores/${storeSlug}/contact`} className="hover:text-[var(--shop-accent)] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--shop-primary)]"></span> ติดต่อเรา</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-16 pt-8 border-t border-[var(--shop-primary)] flex flex-col md:flex-row items-center justify-between font-[family:var(--font-prompt)] text-sm">
        <p className="opacity-80 mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
        <div className="flex gap-6 opacity-80">
          <Link href={`/stores/${storeSlug}/privacy`} className="hover:text-[var(--shop-accent)]">นโยบายความเป็นส่วนตัว</Link>
          <Link href={`/stores/${storeSlug}/terms`} className="hover:text-[var(--shop-accent)]">ข้อตกลงและเงื่อนไข</Link>
        </div>
      </div>
    </footer>
  );
}
