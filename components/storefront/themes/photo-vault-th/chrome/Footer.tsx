'use client';

import React from 'react';
import Link from 'next/link';
import {
  Aperture,
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  MapPin,
  Camera,
} from 'lucide-react';

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
    twitterUrl?: string | null;
    messengerUrl?: string | null;
    websiteUrl?: string | null;
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
  { href: (s) => `/stores/${s}/shipping`, label: 'การจัดส่ง / ดาวน์โหลด', pageSlug: 'shipping' },
  { href: (s) => `/stores/${s}/returns`, label: 'นโยบายคืนสินค้า', pageSlug: 'returns' },
  { href: (s) => `/stores/${s}/faq`, label: 'คำถามที่พบบ่อย', pageSlug: 'faq' },
  { href: (s) => `/stores/${s}/contact`, label: 'ติดต่อช่างภาพ', pageSlug: null },
];

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

export function Footer({
  store,
  categories = [],
  availableSupportPages = [],
}: FooterProps) {
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
    'Lightroom Presets · Photoshop Actions · LUTs สำหรับช่างภาพมืออาชีพ';

  return (
    <footer className="bg-[#0C0A09] text-[#F5F5F4] border-t border-[#44403C] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-5">
          <Link
            href={`/stores/${store.slug}`}
            className="flex items-center gap-3"
          >
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="w-12 h-12 border border-[#F59E0B] bg-gradient-to-br from-[#1C1917] to-[#0C0A09] flex items-center justify-center pv-glow-amber">
                <Aperture className="w-6 h-6 text-[#F59E0B]" strokeWidth={1.5} />
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#A8A29E] font-semibold">
                Photo Vault
              </p>
              <p className="font-[family:var(--font-kanit)] text-xl font-bold text-[#F5F5F4]">
                {store.name}
              </p>
            </div>
          </Link>
          <p className="text-sm text-[#A8A29E] leading-relaxed">{tagline}</p>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#FBBF24]">
            <Camera className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด .xmp .acr .cube</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] mb-5 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-[#F59E0B]" /> ช้อปปิ้ง
          </h4>
          <ul className="space-y-3 text-sm text-[#A8A29E]">
            {categories.slice(0, 5).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="hover:text-[#F5F5F4] transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[#44403C] group-hover:bg-[#F59E0B] transition-colors" />
                  {cat}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-[#F59E0B] hover:text-[#FBBF24] transition-colors inline-flex items-center gap-1"
              >
                ดูทั้งหมด <span>→</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#E11D48] mb-5 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-[#E11D48]" /> ช่วยเหลือ
          </h4>
          <ul className="space-y-3 text-sm text-[#A8A29E]">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href(store.slug)}
                  className="hover:text-[#F5F5F4] transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-[#44403C] group-hover:bg-[#E11D48] transition-colors" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#FBBF24] mb-5 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-[#FBBF24]" /> ติดต่อ
          </h4>
          <ul className="space-y-3 text-sm text-[#A8A29E]">
            {store.lineId && (
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#10B981] shrink-0" />
                <span className="uppercase tracking-wider text-xs">
                  LINE: {store.lineId}
                </span>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="hover:text-[#F5F5F4] break-all transition-colors"
                >
                  {store.contactEmail}
                </a>
              </li>
            )}
            {store.contactPhone && (
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <a
                  href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                  className="hover:text-[#F5F5F4] transition-colors"
                >
                  {store.contactPhone}
                </a>
              </li>
            )}
            {hasAddress && (
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
                <div className="leading-relaxed text-xs">
                  {line1 && <div>{line1}</div>}
                  {line2 && <div>{line2}</div>}
                  {line3 && <div>{line3}</div>}
                </div>
              </li>
            )}
          </ul>

          <div className="flex gap-2 mt-6">
            {store.facebookUrl && (
              <a
                href={store.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 border border-[#44403C] flex items-center justify-center hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-[#A8A29E]"
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
                className="w-9 h-9 border border-[#44403C] flex items-center justify-center hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-[#A8A29E]"
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
                className="w-9 h-9 border border-[#44403C] flex items-center justify-center hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors text-[#A8A29E]"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#44403C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] uppercase tracking-[0.24em] text-[#A8A29E]">
          <p>© {new Date().getFullYear()} {store.name} · สงวนลิขสิทธิ์</p>
          <div className="flex gap-5">
            {availableSupportPages.includes('terms') && (
              <Link
                href={`/stores/${store.slug}/terms`}
                className="hover:text-[#F59E0B] transition-colors"
              >
                ข้อกำหนด
              </Link>
            )}
            {availableSupportPages.includes('privacy') && (
              <Link
                href={`/stores/${store.slug}/privacy`}
                className="hover:text-[#F59E0B] transition-colors"
              >
                ความเป็นส่วนตัว
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
