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

  // Saluki shades derive from --shop-primary (the operator's picked accent
  // threaded by app/stores/[slug]/layout.tsx). Hex fallbacks preserve the
  // original saluki forest+sage palette when --shop-primary is missing.
  const deep = "color-mix(in srgb, var(--shop-primary, #064e3b) 70%, black)";
  const mid = "var(--shop-primary, #0f766e)";
  const accent = "color-mix(in srgb, var(--shop-primary, #0f766e) 30%, white)";
  const body = "color-mix(in srgb, var(--shop-primary, #0f766e) 18%, white)";

  return (
    <footer
      className="pt-16 pb-8 font-[family:var(--font-kanit)]"
      style={{ background: deep, color: body }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-medium text-white mb-6 tracking-wider">
              {storeName}
            </h3>
            <p className="mb-6 leading-relaxed" style={{ color: accent }}>
              {tagline || "เสื้อผ้าโยคะและพีลาทิส ผลิตจากผ้ารีไซเคิล"}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors" style={{ background: mid }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors" style={{ background: mid }}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors" style={{ background: mid }}>
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-6">คอลเลกชัน</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href={`/stores/${storeSlug}?category=leggings`} className="hover:text-white transition-colors">เลกกิ้งรีไซเคิล</Link>
              </li>
              <li>
                <Link href={`/stores/${storeSlug}?category=tops`} className="hover:text-white transition-colors">สปอร์ตบรา & ครอป</Link>
              </li>
              <li>
                <Link href={`/stores/${storeSlug}?category=sets`} className="hover:text-white transition-colors">เซ็ตเข้าชุด</Link>
              </li>
              <li>
                <Link href={`/stores/${storeSlug}?category=accessories`} className="hover:text-white transition-colors">เสื่อและอุปกรณ์</Link>
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
                <MapPin className="w-5 h-5 shrink-0" style={{ color: accent }} />
                <span>123 สุขุมวิท ซอย 24<br />คลองเตย กรุงเทพมหานคร 10110</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" style={{ color: accent }} />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: accent }} />
                <span>hello@{storeSlug}.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
          style={{ borderColor: mid, color: accent }}
        >
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
