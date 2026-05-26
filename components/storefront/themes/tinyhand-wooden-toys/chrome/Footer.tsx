'use client';
import React from 'react';
import Link from 'next/link';

interface TinyhandFooterProps {
  store: {
    slug: string;
    name: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    lineId?: string | null;
  };
}

const DEFAULT_BRAND_COPY = 'ของเล่นไม้สำหรับเด็กเล็ก ปลอดสารเคมี';

export function TinyhandFooter({ store }: TinyhandFooterProps) {
  const brandCopy =
    store.description?.trim() ||
    store.tagline?.trim() ||
    DEFAULT_BRAND_COPY;

  const hasAnyContact = Boolean(store.lineId || store.contactEmail || store.contactPhone);

  return (
    <footer className="bg-[#3a2e22] text-[#ebe1c8] font-[family:var(--font-prompt)]">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain mb-4" />
            ) : (
              <h3 className="font-[family:var(--font-kanit)] text-xl font-bold mb-4 text-[#f7f1e3]">{store.name}</h3>
            )}
            <p className="text-sm opacity-90 max-w-sm">
              {brandCopy}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#c9974b]">เลือกซื้อตามอายุ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/stores/${store.slug}/category/1-plus`} className="hover:text-[#f7f1e3] transition-colors">1+ ขวบ (เริ่มเรียนรู้)</Link></li>
              <li><Link href={`/stores/${store.slug}/category/2-plus`} className="hover:text-[#f7f1e3] transition-colors">2+ ขวบ (พัฒนาการ)</Link></li>
              <li><Link href={`/stores/${store.slug}/category/3-plus`} className="hover:text-[#f7f1e3] transition-colors">3+ ขวบ (จินตนาการ)</Link></li>
              <li><Link href={`/stores/${store.slug}/category/4-plus`} className="hover:text-[#f7f1e3] transition-colors">4+ ขวบ (ทักษะ)</Link></li>
            </ul>
          </div>
          {hasAnyContact && (
            <div>
              <h4 className="font-bold mb-4 text-[#c9974b]">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm opacity-90">
                {store.lineId && <li>Line: {store.lineId}</li>}
                {store.contactEmail && (
                  <li>
                    Email: <a href={`mailto:${store.contactEmail}`} className="hover:text-[#f7f1e3] transition-colors break-all">{store.contactEmail}</a>
                  </li>
                )}
                {store.contactPhone && (
                  <li>
                    โทร: <a href={`tel:${store.contactPhone}`} className="hover:text-[#f7f1e3] transition-colors">{store.contactPhone}</a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="pt-8 border-t border-[#4a3e32] text-center text-xs opacity-70">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
