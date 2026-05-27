'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  Sparkles,
  ChevronRight,
  FileText,
  Menu,
  X as XIcon,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
}

export function Header({
  storeSlug,
  storeName,
  storeLogoUrl,
  categories = [],
}: Props) {
  const count = useCart((s) =>
    s.lines
      .filter((line) => line.storeSlug === storeSlug)
      .reduce((n, l) => n + l.qty, 0),
  );
  const initial = storeName.trim().slice(0, 1).toUpperCase();
  const visibleCats = categories.slice(0, 6);
  const [mobileOpen, setMobileOpen] = useState(false);

  const urls = {
    home: `/stores/${storeSlug}`,
    shop: `/stores/${storeSlug}/category`,
    cart: `/stores/${storeSlug}/cart`,
    about: `/stores/${storeSlug}/about`,
    faq: `/stores/${storeSlug}/faq`,
    contact: `/stores/${storeSlug}/contact`,
    search: `/stores/${storeSlug}/search`,
  };

  return (
    <>
      <div className="hidden lg:flex h-full flex-col bg-white text-[#1A1A1A] font-[family:var(--font-prompt)]">
        <Link
          href={urls.home}
          className="flex items-center gap-2.5 px-4 py-3 border-b border-[#E5E5E5] group"
        >
          {storeLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storeLogoUrl}
              alt={storeName}
              className="h-7 w-7 object-contain rounded"
            />
          ) : (
            <span
              aria-hidden
              className="h-7 w-7 rounded grid place-items-center text-white text-[13px] font-bold font-[family:var(--font-kanit)] bg-black"
            >
              {initial}
            </span>
          )}
          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <span className="font-[family:var(--font-kanit)] font-semibold text-[13px] text-[#1A1A1A] truncate group-hover:text-[#2563EB] transition-colors">
              {storeName}
            </span>
            <span className="text-[10px] text-[#6B6B6B] tracking-wide truncate">
              Notion Templates · Workspace
            </span>
          </div>
        </Link>

        <form action={urls.search} method="get" role="search" className="px-3 py-3 border-b border-[#E5E5E5]">
          <label className="relative block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B6B]" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="ค้นหาเทมเพลต..."
              aria-label="ค้นหา"
              className="w-full pl-8 pr-2 py-1.5 rounded text-[12px] bg-[#F7F6F3] border border-transparent text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#E5E5E5] focus:bg-white"
            />
          </label>
        </form>

        <nav aria-label="หลัก" className="px-2 py-3 border-b border-[#E5E5E5]">
          <ul className="space-y-0.5">
            <SidebarLink href={urls.home} icon={<FileText className="h-3.5 w-3.5" />} label="หน้าร้าน" />
            <SidebarLink href={urls.shop} icon={<Sparkles className="h-3.5 w-3.5" />} label="คลังเทมเพลต" />
            <SidebarLink href={urls.cart} icon={<ShoppingCart className="h-3.5 w-3.5" />} label="ตะกร้า" badge={count} />
          </ul>
        </nav>

        {visibleCats.length > 0 && (
          <nav aria-label="หมวดหมู่" className="px-2 py-3 border-b border-[#E5E5E5] flex-1 min-h-0 overflow-y-auto">
            <p className="px-2 pb-1.5 text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-[family:var(--font-kanit)] font-medium">
              หมวดหมู่
            </p>
            <ul className="space-y-0.5">
              {visibleCats.map((c) => (
                <li key={c}>
                  <Link
                    href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] text-[#1A1A1A] hover:bg-[#EFEEEC] hover:text-[#2563EB] transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 text-[#6B6B6B] shrink-0" aria-hidden />
                    <span className="truncate">{c}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="px-3 py-3 border-t border-[#E5E5E5] mt-auto">
          <ul className="space-y-0.5 text-[11px]">
            <li><Link href={urls.about} className="block px-2 py-1 rounded text-[#6B6B6B] hover:bg-[#EFEEEC] hover:text-[#1A1A1A] transition-colors">เกี่ยวกับเรา</Link></li>
            <li><Link href={urls.faq} className="block px-2 py-1 rounded text-[#6B6B6B] hover:bg-[#EFEEEC] hover:text-[#1A1A1A] transition-colors">คำถามที่พบบ่อย</Link></li>
            <li><Link href={urls.contact} className="block px-2 py-1 rounded text-[#6B6B6B] hover:bg-[#EFEEEC] hover:text-[#1A1A1A] transition-colors">ติดต่อเรา</Link></li>
          </ul>
        </div>
      </div>

      <div className="lg:hidden bg-white border-b border-[#E5E5E5] text-[#1A1A1A] font-[family:var(--font-prompt)]">
        <div className="flex items-center gap-2 px-3 py-2">
          <button type="button" aria-label="เปิดเมนู" onClick={() => setMobileOpen((v) => !v)} className="p-2 rounded hover:bg-[#EFEEEC] transition-colors">
            {mobileOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href={urls.home} className="flex items-center gap-2 min-w-0">
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeLogoUrl} alt={storeName} className="h-6 w-6 object-contain rounded" />
            ) : (
              <span aria-hidden className="h-6 w-6 rounded grid place-items-center text-white text-[11px] font-bold font-[family:var(--font-kanit)] bg-black">{initial}</span>
            )}
            <span className="font-[family:var(--font-kanit)] font-semibold text-[13px] text-[#1A1A1A] truncate">{storeName}</span>
          </Link>
          <form action={urls.search} method="get" role="search" className="flex-1 ml-2">
            <label className="relative block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#6B6B6B]" aria-hidden />
              <input type="search" name="q" placeholder="ค้นหา..." aria-label="ค้นหา" className="w-full pl-7 pr-2 py-1.5 rounded text-[12px] bg-[#F7F6F3] border border-transparent text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#E5E5E5] focus:bg-white" />
            </label>
          </form>
          <Link href={urls.cart} aria-label="ตะกร้าสินค้า" className="relative p-2 rounded hover:bg-[#EFEEEC] transition-colors shrink-0">
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full grid place-items-center text-[10px] font-bold bg-black text-white">{count}</span>
            )}
          </Link>
        </div>
        {mobileOpen && (
          <nav aria-label="เมนู (มือถือ)" className="border-t border-[#E5E5E5] px-3 py-3 bg-white">
            <ul className="space-y-1 text-[13px]">
              <li><Link href={urls.home} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#EFEEEC]"><FileText className="h-3.5 w-3.5" /> หน้าร้าน</Link></li>
              <li><Link href={urls.shop} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#EFEEEC]"><Sparkles className="h-3.5 w-3.5" /> คลังเทมเพลต</Link></li>
              {visibleCats.length > 0 && (
                <li>
                  <p className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-[family:var(--font-kanit)] font-medium">หมวดหมู่</p>
                  <ul className="space-y-0.5">
                    {visibleCats.map((c) => (
                      <li key={c}><Link href={`${urls.shop}?cat=${encodeURIComponent(c)}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] hover:bg-[#EFEEEC] hover:text-[#2563EB]"><ChevronRight className="h-3 w-3 text-[#6B6B6B]" aria-hidden />{c}</Link></li>
                    ))}
                  </ul>
                </li>
              )}
              <li className="pt-2 border-t border-[#E5E5E5]"><Link href={urls.about} onClick={() => setMobileOpen(false)} className="block px-2 py-1.5 rounded text-[#6B6B6B] hover:bg-[#EFEEEC] hover:text-[#1A1A1A]">เกี่ยวกับเรา</Link></li>
              <li><Link href={urls.faq} onClick={() => setMobileOpen(false)} className="block px-2 py-1.5 rounded text-[#6B6B6B] hover:bg-[#EFEEEC] hover:text-[#1A1A1A]">คำถามที่พบบ่อย</Link></li>
              <li><Link href={urls.contact} onClick={() => setMobileOpen(false)} className="block px-2 py-1.5 rounded text-[#6B6B6B] hover:bg-[#EFEEEC] hover:text-[#1A1A1A]">ติดต่อเรา</Link></li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}

function SidebarLink({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number; }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] text-[#1A1A1A] hover:bg-[#EFEEEC] hover:text-[#2563EB] transition-colors group">
        <span className="text-[#6B6B6B] group-hover:text-[#2563EB] shrink-0 transition-colors">{icon}</span>
        <span className="flex-1 truncate">{label}</span>
        {typeof badge === 'number' && badge > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded grid place-items-center text-[10px] font-bold bg-black text-white">{badge}</span>
        )}
      </Link>
    </li>
  );
}
