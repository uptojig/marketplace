'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, Facebook, Instagram, MapPin, Sparkles } from 'lucide-react';

interface FooterProps {
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
    lineId?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  categories?: string[];
  availableSupportPages?: string[];
}

const SUPPORT_LINKS: Array<{
  href: (slug: string) => string;
  label: string;
  pageSlug: string | null;
}> = [
  { href: (s) => `/stores/${s}/about`, label: 'เกี่ยวกับเรา', pageSlug: 'about' },
  { href: (s) => `/stores/${s}/shipping`, label: 'การส่งไฟล์', pageSlug: 'shipping' },
  { href: (s) => `/stores/${s}/returns`, label: 'การคืนเงิน', pageSlug: 'returns' },
  { href: (s) => `/stores/${s}/faq`, label: 'คำถามที่พบบ่อย', pageSlug: 'faq' },
  { href: (s) => `/stores/${s}/contact`, label: 'ติดต่อเรา', pageSlug: null },
];

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

export function Footer({ store, categories = [], availableSupportPages = [] }: FooterProps) {
  const supportLinks = SUPPORT_LINKS.filter(
    (l) => l.pageSlug === null || availableSupportPages.includes(l.pageSlug),
  );
  const line1 = joinAddress([store.addressLine1, store.addressLine2]);
  const line2 = joinAddress([store.subdistrict, store.district]);
  const line3 = joinAddress([store.province, store.postalCode]);
  const hasAddress = !!(line1 || line2 || line3);
  const tagline =
    store.description?.trim() ||
    store.tagline?.trim() ||
    'วอลเปเปอร์มงคล สายมู หนุนดวง เสริมโชค สไตล์ Mario เลเวลอัพชีวิต';

  return (
    <footer className="bg-[#1A1A2E] text-white font-[family:var(--font-prompt)]">
      {/* Coin rail accent — Mario style */}
      <div className="h-3 bg-gradient-to-r from-[#E52521] via-[#FFD700] to-[#009A4E]" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-5">
          <Link
            href={`/stores/${store.slug}`}
            className="font-[family:var(--font-kanit)] text-2xl font-black tracking-tight uppercase flex items-center gap-3"
          >
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-auto object-contain border-4 border-white bg-white p-1"
              />
            ) : (
              <div className="relative w-12 h-12 bg-[#E52521] border-4 border-white flex items-center justify-center shadow-[3px_3px_0_0_#FFD700]">
                <span className="font-black text-white text-xl">M</span>
                <span className="absolute -top-2 -right-2 text-xs" aria-hidden>
                  ⭐
                </span>
              </div>
            )}
            <span className="truncate text-white">{store.name}</span>
          </Link>
          <p className="text-sm font-semibold text-white/70 leading-relaxed">{tagline}</p>
          <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#1A1A2E] border-4 border-white px-3 py-1.5 font-[family:var(--font-kanit)] font-black text-[11px] uppercase tracking-widest shadow-[3px_3px_0_0_#E52521]">
            <Sparkles className="w-3.5 h-3.5" /> มูเลเวลอัพ
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-black text-lg mb-4 uppercase tracking-widest text-[#FFD700] border-b-2 border-[#FFD700]/40 pb-2">
            หมวดวอลเปเปอร์
          </h4>
          <ul className="space-y-3 text-sm font-semibold text-white/80">
            {categories.length > 0 ? (
              categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className="hover:text-[#FFD700] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-white/50 text-xs">เร็วๆ นี้</li>
            )}
            <li>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-[#FFD700] font-bold hover:text-white"
              >
                ดูทั้งหมด →
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-black text-lg mb-4 uppercase tracking-widest text-[#FFD700] border-b-2 border-[#FFD700]/40 pb-2">
            ช่วยเหลือ
          </h4>
          <ul className="space-y-3 text-sm font-semibold text-white/80">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href(store.slug)}
                  className="hover:text-[#FFD700] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-black text-lg mb-4 uppercase tracking-widest text-[#FFD700] border-b-2 border-[#FFD700]/40 pb-2">
            ติดต่อเรา
          </h4>
          <ul className="space-y-3 text-sm font-semibold text-white/80">
            {store.lineId && (
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#009A4E] shrink-0" />
                <span>LINE: @{store.lineId}</span>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E52521] shrink-0" />
                <a href={`mailto:${store.contactEmail}`} className="hover:text-[#FFD700] break-all">
                  {store.contactEmail}
                </a>
              </li>
            )}
            {store.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FFD700] shrink-0" />
                <a
                  href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                  className="hover:text-[#FFD700]"
                >
                  {store.contactPhone}
                </a>
              </li>
            )}
            {hasAddress && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-xs">
                  {line1 && <div>{line1}</div>}
                  {line2 && <div>{line2}</div>}
                  {line3 && <div>{line3}</div>}
                </div>
              </li>
            )}
          </ul>
          <div className="flex gap-2 mt-5">
            {store.facebookUrl && (
              <a
                href={store.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 border-4 border-white bg-[#1877F2] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {store.instagramUrl && (
              <a
                href={store.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 border-4 border-white bg-[#E52521] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/~${store.lineId}`}
                target="_blank"
                rel="noreferrer"
                aria-label="LINE"
                className="w-10 h-10 border-4 border-white bg-[#009A4E] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#5C94FC] border-t-4 border-[#1A1A2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex flex-col md:flex-row justify-between items-center gap-2 text-xs font-bold tracking-wider text-[#1A1A2E]">
          <p>© {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์ทุกประการ ✨</p>
          <div className="flex gap-5">
            {availableSupportPages.includes('terms') && (
              <Link href={`/stores/${store.slug}/terms`} className="hover:text-[#E52521]">
                ข้อกำหนด
              </Link>
            )}
            {availableSupportPages.includes('privacy') && (
              <Link href={`/stores/${store.slug}/privacy`} className="hover:text-[#E52521]">
                นโยบายความเป็นส่วนตัว
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
