'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from 'lucide-react';

interface SalukiFooterProps {
  store: {
    slug: string;
    name: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
  };
}

const DEFAULT_BRAND_COPY = 'เสื้อผ้าโยคะและพีลาทิสคุณภาพ ออกแบบเพื่อการเคลื่อนไหวอย่างอิสระ';

export function SalukiFooter({ store }: SalukiFooterProps) {
  const currentYear = new Date().getFullYear();
  const brandCopy =
    store.description?.trim() ||
    store.tagline?.trim() ||
    DEFAULT_BRAND_COPY;

  const addressParts = [
    store.addressLine1,
    store.addressLine2,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ].filter((p): p is string => Boolean(p && p.trim()));
  const hasAddress = addressParts.length > 0;

  return (
    <footer className="bg-[#064e3b] text-[#d1fae5] pt-16 pb-8 font-[family:var(--font-kanit)]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain mb-6" />
            ) : (
              <h3 className="text-2xl font-medium text-white mb-6 tracking-wider">
                {store.name}
              </h3>
            )}
            <p className="text-[#a7f3d0] mb-6 leading-relaxed">
              {brandCopy}
            </p>
            <div className="flex space-x-4">
              {store.instagramUrl && (
                <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white hover:bg-[#a7f3d0] hover:text-[#064e3b] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {store.facebookUrl && (
                <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white hover:bg-[#a7f3d0] hover:text-[#064e3b] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {store.twitterUrl && (
                <a href={store.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white hover:bg-[#a7f3d0] hover:text-[#064e3b] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-6">คอลเลกชัน</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href={`/stores/${store.slug}?category=leggings`} className="hover:text-white transition-colors">เลกกิ้งรีไซเคิล</Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}?category=tops`} className="hover:text-white transition-colors">สปอร์ตบรา & ครอป</Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}?category=sets`} className="hover:text-white transition-colors">เซ็ตเข้าชุด</Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}?category=accessories`} className="hover:text-white transition-colors">เสื่อและอุปกรณ์</Link>
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
              {hasAddress && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#a7f3d0] shrink-0" />
                  <span>{addressParts.join(' ')}</span>
                </li>
              )}
              {store.contactPhone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#a7f3d0]" />
                  <a href={`tel:${store.contactPhone}`} className="hover:text-white transition-colors">{store.contactPhone}</a>
                </li>
              )}
              {store.contactEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#a7f3d0]" />
                  <a href={`mailto:${store.contactEmail}`} className="hover:text-white transition-colors break-all">{store.contactEmail}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#0f766e] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#a7f3d0]">
          <p>&copy; {currentYear} {store.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</Link>
            <Link href="#" className="hover:text-white transition-colors">เงื่อนไขการให้บริการ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
