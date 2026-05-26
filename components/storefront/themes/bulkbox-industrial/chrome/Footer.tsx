'use client';

import React from 'react';
import Link from 'next/link';
import type { FooterProps } from '@/lib/templates/types';
import { Mail, Phone, MapPin, Building2, ShieldCheck, Factory, Truck } from 'lucide-react';

export function BulkboxFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#0f172a] text-[#f8fafc] font-[family:var(--font-prompt)] border-t-4 border-[#0284c7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-3">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="h-12 w-12 bg-[#0284c7] text-white flex items-center justify-center rounded font-bold text-2xl font-[family:var(--font-kanit)]">
                    {store.name.charAt(0)}
                  </div>
                  <span className="font-[family:var(--font-kanit)] font-bold text-xl tracking-tight uppercase">
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            <p className="text-[#cbd5e1] text-sm leading-relaxed">
              {store.description ?? store.tagline ?? 'สินค้าอุตสาหกรรม ขายส่งทั่วประเทศ'}
            </p>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-semibold bg-[#1e293b] px-3 py-1.5 rounded text-[#0284c7] border border-[#334155]">
                <ShieldCheck className="w-4 h-4" /> DBD Registered
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold bg-[#1e293b] px-3 py-1.5 rounded text-[#0284c7] border border-[#334155]">
                <Factory className="w-4 h-4" /> ISO 9001
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-6 uppercase text-[#e2e8f0]">บริการของเรา</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors flex items-center gap-2"><Truck className="w-4 h-4" /> การจัดส่งและโลจิสติกส์</Link></li>
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors">ระบบใบเสนอราคา (Quotation)</Link></li>
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors">เงื่อนไขเครดิตสำหรับนิติบุคคล</Link></li>
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors">บริการสั่งผลิต OEM</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-6 uppercase text-[#e2e8f0]">ศูนย์ช่วยเหลือ</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors">คำถามที่พบบ่อย (FAQ)</Link></li>
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors">ขั้นตอนการสั่งซื้อขายส่ง</Link></li>
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors">การรับประกันสินค้าอุตสาหกรรม</Link></li>
              <li><Link href="#" className="text-[#cbd5e1] hover:text-[#0284c7] text-sm transition-colors">ดาวน์โหลดเอกสาร (Catalog)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-6 uppercase text-[#e2e8f0]">ติดต่อฝ่ายขาย</h3>
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
                  <li className="flex items-start gap-3 text-[#cbd5e1] text-sm">
                    <MapPin className="w-5 h-5 text-[#0284c7] shrink-0" />
                    <span>{parts.join(' ')}</span>
                  </li>
                );
              })()}
              {store.contactPhone && (
                <li className="flex items-center gap-3 text-[#cbd5e1] text-sm">
                  <Phone className="w-5 h-5 text-[#0284c7] shrink-0" />
                  <a href={`tel:${store.contactPhone}`} className="hover:text-white transition-colors">{store.contactPhone}</a>
                </li>
              )}
              {store.contactEmail && (
                <li className="flex items-center gap-3 text-[#cbd5e1] text-sm">
                  <Mail className="w-5 h-5 text-[#0284c7] shrink-0" />
                  <a href={`mailto:${store.contactEmail}`} className="hover:text-white transition-colors break-all">{store.contactEmail}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#94a3b8] text-xs">
            © {new Date().getFullYear()} {store.name} Co., Ltd. All rights reserved. (B2B Industrial Platform)
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[#94a3b8] hover:text-white text-xs transition-colors">ข้อตกลงและเงื่อนไข (B2B)</Link>
            <Link href="#" className="text-[#94a3b8] hover:text-white text-xs transition-colors">นโยบายความเป็นส่วนตัว</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
