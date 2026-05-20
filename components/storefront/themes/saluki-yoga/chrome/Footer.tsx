'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from 'lucide-react';

interface SalukiFooterProps {
  storeSlug: string;
  storeName: string;
  tagline?: string;
}

export function SalukiFooter({ storeSlug, storeName, tagline }: SalukiFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#064e3b] text-[#d1fae5] pt-16 pb-8 font-[family:var(--font-kanit)]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-medium text-white mb-6 tracking-wider">
              {storeName}
            </h3>
            <p className="text-[#a7f3d0] mb-6 leading-relaxed">
              {tagline || "เสื้อผ้าโยคะและพีลาทิส ผลิตจากผ้ารีไซเคิล"}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white hover:bg-[#a7f3d0] hover:text-[#064e3b] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white hover:bg-[#a7f3d0] hover:text-[#064e3b] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white hover:bg-[#a7f3d0] hover:text-[#064e3b] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-6">คอลเลกชัน</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href={`/${storeSlug}?category=leggings`} className="hover:text-white transition-colors">เลกกิ้งรีไซเคิล</Link>
              </li>
              <li>
                <Link href={`/${storeSlug}?category=tops`} className="hover:text-white transition-colors">สปอร์ตบรา & ครอป</Link>
              </li>
              <li>
                <Link href={`/${storeSlug}?category=sets`} className="hover:text-white transition-colors">เซ็ตเข้าชุด</Link>
              </li>
              <li>
                <Link href={`/${storeSlug}?category=accessories`} className="hover:text-white transition-colors">เสื่อและอุปกรณ์</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-6">ช่วยเหลือ</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">คำถามที่พบบ่อย</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">การจัดส่งและการคืนสินค้า</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">ตารางไซส์</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">วิธีดูแลรักษาชุดโยคะ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-6">ติดต่อเรา</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#a7f3d0] shrink-0" />
                <span>123 สุขุมวิท ซอย 24<br />คลองเตย กรุงเทพมหานคร 10110</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#a7f3d0]" />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#a7f3d0]" />
                <span>hello@{storeSlug}.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#0f766e] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#a7f3d0]">
          <p>&copy; {currentYear} {storeName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</Link>
            <Link href="#" className="hover:text-white transition-colors">เงื่อนไขการให้บริการ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
