'use client';
import React from 'react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
  };
  categories: string[];
  accent?: string;
}

export function Footer({ store, categories }: FooterProps) {
  const year = new Date().getFullYear();
  const urls = {
    home: `/stores/${store.slug}`,
    shop: `/stores/${store.slug}/category`,
    about: `/stores/${store.slug}/about`,
    shipping: `/stores/${store.slug}/shipping`,
  };

  return (
    <footer className="relative bg-[#1E1B4B] text-[#C4B5FD] overflow-hidden">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#A78BFA]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#F472B6]/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#A78BFA] to-[#F472B6] text-white font-bold">P</span>
              <span className="font-extrabold text-xl text-white">
                <span className="text-[#C4B5FD]">Persona</span>
                <span className="text-[#F9A8D4]">Path</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#A78BFA]/80 max-w-sm">
              ก้าวแรกของการรู้จักตัวเอง สำหรับคนไทยทุกคน
            </p>
            <p className="text-xs leading-relaxed text-[#A78BFA]/60">
              hello@personapath.co
            </p>
          </div>

          {/* Collections */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] tracking-[0.18em] uppercase text-white font-bold mb-5">หมวด</h4>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((c) => (
                <li key={c}>
                  <a
                    href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
                    className="text-[13px] text-[#A78BFA]/80 hover:text-white transition-colors"
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] tracking-[0.18em] uppercase text-white font-bold mb-5">ข้อมูล</h4>
            <ul className="space-y-3">
              <li><a href={urls.about} className="text-[13px] text-[#A78BFA]/80 hover:text-white">เกี่ยวกับเรา</a></li>
              <li><a href={urls.shipping} className="text-[13px] text-[#A78BFA]/80 hover:text-white">การจัดส่ง</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] tracking-[0.18em] uppercase text-white font-bold mb-5">ติดตาม</h4>
            <ul className="space-y-3">
              {store.instagramUrl && <li><a href={store.instagramUrl} className="text-[13px] text-[#A78BFA]/80 hover:text-white">Instagram</a></li>}
              {store.facebookUrl && <li><a href={store.facebookUrl} className="text-[13px] text-[#A78BFA]/80 hover:text-white">Facebook</a></li>}
              {!store.instagramUrl && !store.facebookUrl && (
                <li><span className="text-[13px] text-[#A78BFA]/50">@personapath</span></li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#4C1D95]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#A78BFA]/60">© {year} {store.name}</p>
          <p className="text-[11px] text-[#A78BFA]/60">ก้าวแรกของการรู้จักตัวเอง</p>
        </div>
      </div>
    </footer>
  );
}
