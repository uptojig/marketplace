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
    <footer className="bg-[#0F172A] text-[#94A3B8]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#F97316] text-white font-extrabold">S</span>
              <span className="font-extrabold text-lg">
                <span className="text-[#93C5FD]">SMS</span>
                <span className="text-[#FDBA74]">UP</span>
                <span className="text-[#FDBA74]">+</span>
              </span>
            </div>
            <p className="text-[12.5px] font-bold text-[#FB923C] tracking-wide">Shop More · Smile Up</p>
            <p className="text-[13.5px] leading-relaxed text-[#94A3B8] max-w-sm">
              แพลตฟอร์ม SMS Marketing สำหรับธุรกิจไทย ใช้ง่าย ส่งไว เห็นผลจริง
            </p>
            <p className="text-[12px] text-[#64748B]">02-123-4567 · hello@smsup.co.th</p>
          </div>

          {/* Services */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] tracking-[0.18em] uppercase text-white font-bold mb-5">บริการ</h4>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((c) => (
                <li key={c}>
                  <a href={`${urls.shop}?cat=${encodeURIComponent(c)}`} className="text-[13px] text-[#94A3B8] hover:text-white">{c}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] tracking-[0.18em] uppercase text-white font-bold mb-5">ข้อมูล</h4>
            <ul className="space-y-3">
              <li><a href={urls.about} className="text-[13px] text-[#94A3B8] hover:text-white">เกี่ยวกับเรา</a></li>
              <li><a href={urls.shipping} className="text-[13px] text-[#94A3B8] hover:text-white">การจัดส่ง</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] tracking-[0.18em] uppercase text-white font-bold mb-5">ติดตาม</h4>
            <ul className="space-y-3">
              {store.facebookUrl && <li><a href={store.facebookUrl} className="text-[13px] text-[#94A3B8] hover:text-white">Facebook</a></li>}
              {store.instagramUrl && <li><a href={store.instagramUrl} className="text-[13px] text-[#94A3B8] hover:text-white">Instagram</a></li>}
              {!store.facebookUrl && !store.instagramUrl && (
                <li><span className="text-[13px] text-[#64748B]">@smsup-plus</span></li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#64748B]">© {year} {store.name}</p>
          <p className="text-[11px] text-[#475569]">SMS Marketing สำหรับ SME ไทย</p>
        </div>
      </div>
    </footer>
  );
}
