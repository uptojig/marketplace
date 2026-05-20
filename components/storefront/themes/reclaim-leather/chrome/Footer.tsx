'use client';
import React from 'react';
import Link from 'next/link';

interface FooterProps {
  store: {
    name: string;
    slug: string;
  };
}

export function ReclaimLeatherFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#2a1a09] text-[#e6d7b8] pt-16 pb-8 border-t-[6px] border-[#5b3a1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${store.slug}`} className="inline-block font-[family:var(--font-prompt)] font-bold text-3xl text-[#c9974b] mb-4">
              {store.name}
            </Link>
            <p className="font-[family:var(--font-kanit)] text-[#e6d7b8]/80 text-lg max-w-sm mb-6">
              กระเป๋าและเครื่องหนังจากเศษหนังเหลือใช้
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-10 h-10 rounded-full bg-[#5b3a1e] flex items-center justify-center hover:bg-[#c9974b] transition-colors cursor-pointer text-[#f4ead8]">IG</div>
              <div className="w-10 h-10 rounded-full bg-[#5b3a1e] flex items-center justify-center hover:bg-[#c9974b] transition-colors cursor-pointer text-[#f4ead8]">FB</div>
            </div>
          </div>

          <div>
            <h3 className="font-[family:var(--font-prompt)] font-semibold text-xl text-[#f4ead8] mb-6">สินค้าของเรา</h3>
            <ul className="space-y-3 font-[family:var(--font-kanit)] text-[#e6d7b8]/80">
              <li><Link href={`/${store.slug}/category/bags`} className="hover:text-[#c9974b] transition-colors">กระเป๋าสะพายข้าง</Link></li>
              <li><Link href={`/${store.slug}/category/wallets`} className="hover:text-[#c9974b] transition-colors">วอลเล็ต</Link></li>
              <li><Link href={`/${store.slug}/category/accessories`} className="hover:text-[#c9974b] transition-colors">พวงกุญแจและอื่นๆ</Link></li>
              <li><Link href={`/${store.slug}/collections/new`} className="hover:text-[#c9974b] transition-colors">สินค้ามาใหม่</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-[family:var(--font-prompt)] font-semibold text-xl text-[#f4ead8] mb-6">ช่วยเหลือ</h3>
            <ul className="space-y-3 font-[family:var(--font-kanit)] text-[#e6d7b8]/80">
              <li><Link href={`/${store.slug}/repair`} className="hover:text-[#c9974b] transition-colors">ส่งซ่อม (Repair-for-life)</Link></li>
              <li><Link href={`/${store.slug}/shipping`} className="hover:text-[#c9974b] transition-colors">การจัดส่ง</Link></li>
              <li><Link href={`/${store.slug}/care`} className="hover:text-[#c9974b] transition-colors">วิธีดูแลรักษาเครื่องหนัง</Link></li>
              <li><Link href={`/${store.slug}/contact`} className="hover:text-[#c9974b] transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#5b3a1e]/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-[family:var(--font-kanit)] text-[#e6d7b8]/60 text-sm">
            &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="flex gap-2">
            <div className="w-8 h-5 bg-[#e6d7b8]/20 rounded"></div>
            <div className="w-8 h-5 bg-[#e6d7b8]/20 rounded"></div>
            <div className="w-8 h-5 bg-[#e6d7b8]/20 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
