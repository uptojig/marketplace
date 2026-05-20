'use client';

import React from 'react';
import Link from 'next/link';
import { Mountain, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import type { FooterProps } from '@/lib/templates/types';

export function TrailcraftFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#1a2e05] text-[#ecfccb] pt-16 pb-8 border-t-[8px] border-[#365314]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${store.slug}`} className="flex items-center gap-2 mb-6 text-[#facc15]">
              <Mountain className="h-8 w-8" />
              <span className="font-[family:var(--font-kanit)] font-bold text-3xl uppercase tracking-wider">
                {store.name}
              </span>
            </Link>
            <p className="font-[family:var(--font-prompt)] text-[#ecfccb]/80 max-w-sm mb-6 leading-relaxed">
              รองเท้าและเสื้อผ้าเทรล สำหรับนักวิ่งภูเขาในไทย คัดสรรโดยนักวิ่ง เพื่อนักวิ่ง
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 bg-[#365314] flex items-center justify-center rounded-full hover:bg-[#84cc16] hover:text-[#1a2e05] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 bg-[#365314] flex items-center justify-center rounded-full hover:bg-[#84cc16] hover:text-[#1a2e05] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-lg text-[#fdfbe8] mb-4 uppercase tracking-wider">Explore</h3>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              <li><Link href="#" className="hover:text-[#facc15] transition-colors">รองเท้าเทรล (Trail Shoes)</Link></li>
              <li><Link href="#" className="hover:text-[#facc15] transition-colors">กระเป๋าน้ำ (Hydration Vests)</Link></li>
              <li><Link href="#" className="hover:text-[#facc15] transition-colors">เสื้อผ้าเทคนิคัล (Apparel)</Link></li>
              <li><Link href="#" className="hover:text-[#facc15] transition-colors">อุปกรณ์เสริม (Accessories)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-lg text-[#fdfbe8] mb-4 uppercase tracking-wider">Basecamp</h3>
            <ul className="space-y-4 font-[family:var(--font-prompt)] text-sm text-[#ecfccb]/80">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#84cc16] shrink-0 mt-0.5" />
                <span>123 ถนนเชียงใหม่-หางดง<br/>ต.แม่เหียะ อ.เมืองเชียงใหม่<br/>เชียงใหม่ 50100</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#84cc16] shrink-0" />
                <span>053-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#84cc16] shrink-0" />
                <span>basecamp@{store.slug}.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#365314] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 font-[family:var(--font-prompt)] text-sm text-[#ecfccb]/60">
          <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#facc15]">Terms</Link>
            <Link href="#" className="hover:text-[#facc15]">Privacy</Link>
            <Link href="#" className="hover:text-[#facc15]">Shipping & Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
