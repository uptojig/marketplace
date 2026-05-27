'use client';
import React from 'react';
import { Search, ShoppingCart, Download, BookOpen } from 'lucide-react';

export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories: string[];
}

/**
 * EduClassroom — friendly classroom-style header for a Thai K-9 teacher
 * marketplace. Pastel-blue brand band, a notebook-margin search field,
 * and a chalk-yellow "ดาวน์โหลดทันที" pill that anchors the trust signal
 * for digital downloads.
 */
export function Header({ storeSlug, storeName, storeLogoUrl, categories }: HeaderProps) {
  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
  };

  return (
    <header className="bg-[#FAFAF9] border-b border-[#E2E8F0] font-[family:var(--font-prompt)]">
      {/* Friendly classroom announcement bar */}
      <div className="bg-[#2563EB] text-white text-xs font-medium py-2 px-4 text-center font-[family:var(--font-kanit)]">
        ใบงาน · สไลด์ · ข้อสอบ · ดาวน์โหลดได้ทันทีหลังชำระเงิน · ใช้สอนวันรุ่งขึ้นได้เลย
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + "ครูแชร์ครู" stamp */}
          <div className="flex items-center gap-3">
            <a href={urls.home} className="flex items-center gap-2.5 group">
              {storeLogoUrl ? (
                <img src={storeLogoUrl} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="bg-[#2563EB] text-white font-[family:var(--font-kanit)] font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border-2 border-[#FEF3C7]">
                  <BookOpen size={20} />
                </div>
              )}
              <span className="font-[family:var(--font-kanit)] font-bold text-xl tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {storeName}
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] text-[10px] font-[family:var(--font-kanit)] font-bold uppercase border border-[#F59E0B]/40 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              ครูแชร์ครู
            </div>
          </div>

          {/* Notebook-margin search */}
          <div className="w-full md:max-w-xl">
            <div className="relative flex items-center border-2 border-[#2563EB]/30 rounded-full bg-white overflow-hidden focus-within:border-[#2563EB] focus-within:shadow-sm transition-all">
              <Search size={18} className="absolute left-4 text-[#475569]" />
              <input
                type="text"
                placeholder="ค้นหาใบงาน · สไลด์ · ข้อสอบ · ระดับชั้น..."
                className="flex-1 pl-11 pr-4 py-2.5 text-sm bg-transparent text-[#0F172A] focus:outline-none placeholder-[#94A3B8]"
              />
              <button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-[family:var(--font-kanit)] font-bold px-5 py-2.5 transition-colors">
                ค้นหา
              </button>
            </div>
          </div>

          {/* Right rail */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#475569] font-medium bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-2 rounded-full">
              <Download size={14} className="text-[#16A34A]" />
              <span>ดาวน์โหลดได้ทันที</span>
            </div>

            <a
              href={urls.cart}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#F1F5F9] text-[#0F172A] hover:text-[#2563EB] font-[family:var(--font-kanit)] font-bold text-sm transition-colors"
            >
              <ShoppingCart size={18} />
              <span>ตะกร้า</span>
            </a>
          </div>
        </div>
      </div>

      {/* Category strip — pastel pills */}
      {categories.length > 0 && (
        <div className="border-t border-[#E2E8F0] bg-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto flex gap-2 no-scrollbar">
            {categories.map((c) => (
              <a
                key={c}
                href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
                className="px-3 py-1.5 rounded-full text-xs font-[family:var(--font-kanit)] font-semibold text-[#475569] hover:text-[#2563EB] hover:bg-[#FEF3C7] whitespace-nowrap transition-colors border border-transparent hover:border-[#F59E0B]/40"
              >
                {c}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
