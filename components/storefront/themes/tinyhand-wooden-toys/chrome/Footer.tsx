'use client';
import React from 'react';
import Link from 'next/link';

export function TinyhandFooter({ storeName, storeSlug }: { storeName: string; storeSlug: string }) {
  return (
    <footer className="bg-[#3a2e22] text-[#ebe1c8] font-[family:var(--font-prompt)]">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-[family:var(--font-kanit)] text-xl font-bold mb-4 text-[#f7f1e3]">{storeName}</h3>
            <p className="text-sm opacity-90 max-w-sm">
              ของเล่นไม้สำหรับเด็กเล็ก ปลอดสารเคมี
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#c9974b]">เลือกซื้อตามอายุ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${storeSlug}/category/1-plus`} className="hover:text-[#f7f1e3] transition-colors">1+ ขวบ (เริ่มเรียนรู้)</Link></li>
              <li><Link href={`/${storeSlug}/category/2-plus`} className="hover:text-[#f7f1e3] transition-colors">2+ ขวบ (พัฒนาการ)</Link></li>
              <li><Link href={`/${storeSlug}/category/3-plus`} className="hover:text-[#f7f1e3] transition-colors">3+ ขวบ (จินตนาการ)</Link></li>
              <li><Link href={`/${storeSlug}/category/4-plus`} className="hover:text-[#f7f1e3] transition-colors">4+ ขวบ (ทักษะ)</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#c9974b]">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>Line: @tinyhand</li>
              <li>Email: hello@tinyhand.co.th</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#4a3e32] text-center text-xs opacity-70">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
