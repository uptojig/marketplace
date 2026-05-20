'use client';

import React from 'react';
import Link from 'next/link';

export function LinenAndLoomFooter({ store }: { store: any }) {
  return (
    <footer className="bg-[#f1f5f9] text-[#475569] pt-16 pb-8 border-t border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href={`/${store.slug}`} className="inline-block mb-4">
              <span className="text-xl font-light text-[#0f172a] font-[family:var(--font-kanit)] tracking-widest uppercase">
                {store.name}
              </span>
            </Link>
            <p className="font-[family:var(--font-prompt)] text-sm max-w-sm leading-relaxed text-[#475569]">
              ผ้าปูที่นอน ผ้าห่ม และผ้าม่านลินินทอด้วยมือ<br/>
              สร้างสรรค์สัมผัสที่อบอุ่นและผ่อนคลายสำหรับบ้านของคุณ
            </p>
          </div>
          
          <div>
            <h4 className="font-[family:var(--font-kanit)] text-[#0f172a] mb-4 text-sm tracking-wider uppercase">ร้านค้า</h4>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              <li><Link href={`/${store.slug}/products`} className="hover:text-[#0f172a] transition-colors">คอลเลกชันใหม่</Link></li>
              <li><Link href={`/${store.slug}/products`} className="hover:text-[#0f172a] transition-colors">สินค้าขายดี</Link></li>
              <li><Link href={`/${store.slug}/products`} className="hover:text-[#0f172a] transition-colors">ชุดเครื่องนอน</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-[family:var(--font-kanit)] text-[#0f172a] mb-4 text-sm tracking-wider uppercase">ช่วยเหลือ</h4>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              <li><Link href={`/${store.slug}/faq`} className="hover:text-[#0f172a] transition-colors">คำถามที่พบบ่อย</Link></li>
              <li><Link href={`/${store.slug}/shipping`} className="hover:text-[#0f172a] transition-colors">การจัดส่ง</Link></li>
              <li><Link href={`/${store.slug}/returns`} className="hover:text-[#0f172a] transition-colors">นโยบายการคืนสินค้า</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#cbd5e1] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-[family:var(--font-prompt)] text-[#64748b]">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#0f172a] cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-[#0f172a] cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-[#0f172a] cursor-pointer transition-colors">Line Official</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
