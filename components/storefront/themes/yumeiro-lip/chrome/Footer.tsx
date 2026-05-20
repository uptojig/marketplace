'use client';
import React from 'react';

interface YumeiroLipFooterProps {
  store: {
    name: string;
  };
}

export function YumeiroLipFooter({ store }: YumeiroLipFooterProps) {
  return (
    <footer className="bg-[#fbcfe8] text-[#831843] py-12 px-4 font-[family:var(--font-kanit)] mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold text-[#ec4899] mb-4 font-[family:var(--font-prompt)]">{store.name}</h3>
          <p className="opacity-80">ลิปและบลัชเชอร์ K-beauty ตัวเดียวจบ</p>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-wider opacity-60">Customer Care</h4>
          <ul className="space-y-2 opacity-80 text-sm">
            <li className="hover:text-[#ec4899] cursor-pointer transition-colors">ติดตามสถานะการจัดส่ง</li>
            <li className="hover:text-[#ec4899] cursor-pointer transition-colors">นโยบายการเปลี่ยนคืนสินค้า</li>
            <li className="hover:text-[#ec4899] cursor-pointer transition-colors">ติดต่อเรา</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-wider opacity-60">Connect</h4>
          <ul className="space-y-2 opacity-80 text-sm">
            <li className="hover:text-[#ec4899] cursor-pointer transition-colors">Instagram</li>
            <li className="hover:text-[#ec4899] cursor-pointer transition-colors">TikTok</li>
            <li className="hover:text-[#ec4899] cursor-pointer transition-colors">Line Official</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#831843]/10 text-center text-sm opacity-60">
        &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
      </div>
    </footer>
  );
}
