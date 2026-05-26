'use client';
import React from 'react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
  };
  categories: string[];
}

export function Footer({ store, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-4 border-black text-black py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="font-[family:var(--font-google-sans)] font-black text-xl tracking-tighter uppercase block">
                {store.name}
              </span>
            )}
            <p className="text-xs font-medium leading-relaxed">
              {store.description ?? store.tagline ?? 'งานพิมพ์ศิลปะคุณภาพสูง'}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-black mb-4 font-[family:var(--font-google-sans)]">CATALOG</h4>
            <ul className="space-y-2 text-xs font-semibold">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <a
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(category)}`}
                    className="hover:underline"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio info */}
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
              <div>
                <h4 className="text-xs uppercase tracking-widest font-black mb-4 font-[family:var(--font-google-sans)]">STUDIO</h4>
                <p className="text-xs leading-relaxed font-medium">
                  {parts.join(' ')}
                </p>
              </div>
            );
          })()}

          {/* Legal / Policy */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-black mb-4 font-[family:var(--font-google-sans)]">SHIPPING INFO</h4>
            <p className="text-xs leading-relaxed font-medium">
              จัดส่งทั่วประเทศไทยโดยไปรษณีย์ไทย ใส่กระบอกกระดาษแข็งความหนาพิเศษ ป้องกันรอยยับ 100%
            </p>
          </div>

        </div>

        {/* Bottom copyright block */}
        <div className="pt-8 border-t-4 border-black text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-bold font-[family:var(--font-google-sans)]">
          <p>© {currentYear} {store.name}. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4">
            <span className="bg-black text-white px-2 py-0.5 tracking-widest text-[9px] uppercase font-bold">
              GOOGLE SANS GEOMETRIC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
