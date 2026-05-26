'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, MapPin, Mail, Phone } from 'lucide-react';

interface MaiHatthakamFooterProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
  };
}

export function MaiHatthakamFooter({ store }: MaiHatthakamFooterProps) {
  return (
    <footer className="bg-[#3a1a07] text-[#fde8c8] border-t border-[#7c2d12] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href={`/stores/${store.slug}`} className="inline-block mb-6">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-2xl font-bold text-[#fef9f1] tracking-wider font-[family:var(--font-prompt)] uppercase">
                  {store.name}
                </span>
              )}
            </Link>
            <p className="text-[#fde8c8]/80 text-sm leading-relaxed font-[family:var(--font-kanit)] mb-6 max-w-sm">
              {store.description ?? store.tagline ?? 'งานฝีมือคุณภาพ'}
            </p>
            {(store.instagramUrl || store.facebookUrl) && (
              <div className="flex space-x-5">
                {store.instagramUrl && (
                  <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#fde8c8]/60 hover:text-[#d97706] transition-colors">
                    <span className="sr-only">Instagram</span>
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {store.facebookUrl && (
                  <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#fde8c8]/60 hover:text-[#d97706] transition-colors">
                    <span className="sr-only">Facebook</span>
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Contact & Visit */}
          <div className="md:col-span-4 lg:col-span-4">
            <h3 className="text-sm font-semibold text-[#fef9f1] tracking-wider uppercase mb-6 font-[family:var(--font-kanit)]">ติดต่อ</h3>
            <ul className="space-y-4">
              {(() => {
                const parts = [
                  store.addressLine1,
                  store.addressLine2,
                  store.subdistrict,
                  store.district,
                  store.province,
                  store.postalCode,
                ].filter((p): p is string => Boolean(p && p.trim()));
                if (parts.length === 0) return null;
                return (
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-[#7c2d12] mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#fde8c8]/80 font-[family:var(--font-kanit)] leading-relaxed">
                      {parts.join(' ')}
                    </span>
                  </li>
                );
              })()}
              {store.contactPhone && (
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-[#7c2d12] mr-3 flex-shrink-0" />
                  <a href={`tel:${store.contactPhone}`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">{store.contactPhone}</a>
                </li>
              )}
              {store.contactEmail && (
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-[#7c2d12] mr-3 flex-shrink-0" />
                  <a href={`mailto:${store.contactEmail}`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)] break-all">{store.contactEmail}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[#fef9f1] tracking-wider uppercase mb-6 font-[family:var(--font-kanit)]">ร้านค้า</h3>
              <ul className="space-y-4">
                <li>
                  <Link href={`/stores/${store.slug}/c/all`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
                    สินค้าทั้งหมด
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/c/new`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
                    ล็อตล่าสุด (Batch 20)
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/about`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
                    เรื่องราวของเตาเผา
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#fef9f1] tracking-wider uppercase mb-6 font-[family:var(--font-kanit)]">ช่วยเหลือ</h3>
              <ul className="space-y-4">
                <li>
                  <Link href={`/stores/${store.slug}/faq`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
                    คำถามที่พบบ่อย
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/shipping`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
                    การจัดส่ง
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/care`} className="text-sm text-[#fde8c8]/80 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
                    การดูแลรักษาเซรามิก
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-[#7c2d12]/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-[#fde8c8]/50 font-[family:var(--font-kanit)]">
            &copy; {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href={`/stores/${store.slug}/terms`} className="text-xs text-[#fde8c8]/50 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
              ข้อตกลงและเงื่อนไข
            </Link>
            <Link href={`/stores/${store.slug}/privacy`} className="text-xs text-[#fde8c8]/50 hover:text-[#d97706] transition-colors font-[family:var(--font-kanit)]">
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
