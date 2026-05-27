'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, Facebook, Instagram, MapPin, Palette } from 'lucide-react';

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
  { href: (s) => `/stores/${s}/shipping`, label: 'ใบอนุญาตการใช้งาน', pageSlug: 'shipping' },
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
  const tagline = store.description?.trim() ||
    store.tagline?.trim() ||
    'SVG illustrations · icon packs · vector assets แก้ไขได้ใน Figma, Adobe Illustrator, Sketch';

  return (
    <footer className="bg-white border-t border-[#FBCFE8] text-[#1E1B4B] font-[family:var(--font-prompt)]">
      {/* Rainbow accent ribbon */}
      <div className="h-1.5 bg-gradient-to-r from-[#F472B6] via-[#FBBF24] via-[#34D399] via-[#60A5FA] to-[#A78BFA]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-3"
          >
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="h-11 w-auto object-contain rounded-xl" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F472B6] via-[#FBBF24] to-[#60A5FA] flex items-center justify-center vb-glow-primary">
                <Palette className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-[family:var(--font-kanit)] font-black text-xl">
              {store.name}
            </span>
          </Link>
          <p className="text-sm text-[#6366F1] leading-relaxed">
            {tagline}
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FCE7F3] text-[#DB2777] px-3 py-1 text-[11px] font-bold tracking-wide font-[family:var(--font-kanit)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F472B6]" />
            Made for designers
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-black text-base mb-5 text-[#DB2777]">
              คอลเลคชั่น
            </h4>
            <ul className="space-y-3 text-sm">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className="text-[#1E1B4B]/80 hover:text-[#DB2777] transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#F472B6] group-hover:w-3 transition-all" />
                    {cat}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/stores/${store.slug}/category`}
                  className="text-[#2563EB] font-bold hover:underline inline-flex items-center gap-1"
                >
                  เรียกดูทั้งหมด <span aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Support */}
        {supportLinks.length > 0 && (
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-black text-base mb-5 text-[#2563EB]">
              ช่วยเหลือ
            </h4>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href(store.slug)}
                    className="text-[#1E1B4B]/80 hover:text-[#2563EB] transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#60A5FA] group-hover:w-3 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-black text-base mb-5 text-[#B45309]">
            ติดต่อเรา
          </h4>
          <ul className="space-y-3 text-sm">
            {store.lineId && (
              <li className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-[#047857]" />
                </span>
                <span>LINE: {store.lineId}</span>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#FCE7F3] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#DB2777]" />
                </span>
                <a href={`mailto:${store.contactEmail}`} className="hover:text-[#DB2777] break-all">
                  {store.contactEmail}
                </a>
              </li>
            )}
            {store.contactPhone && (
              <li className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#B45309]" />
                </span>
                <a href={`tel:${store.contactPhone.replace(/\s+/g, '')}`} className="hover:text-[#B45309]">
                  {store.contactPhone}
                </a>
              </li>
            )}
            {hasAddress && (
              <li className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                </span>
                <div className="leading-relaxed text-[#1E1B4B]/80">
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
                className="w-9 h-9 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center hover:bg-[#60A5FA] hover:text-white transition-colors"
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
                className="w-9 h-9 rounded-full bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center hover:bg-[#F472B6] hover:text-white transition-colors"
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
                className="w-9 h-9 rounded-full bg-[#D1FAE5] text-[#047857] flex items-center justify-center hover:bg-[#34D399] hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#FBCFE8] bg-[#FEFCE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6366F1]">
          <p className="font-medium">
            © {new Date().getFullYear()} {store.name} · ทุกผลงานสงวนลิขสิทธิ์โดยศิลปินเจ้าของไฟล์
          </p>
          <div className="flex gap-5">
            {availableSupportPages.includes('terms') && (
              <Link href={`/stores/${store.slug}/terms`} className="hover:text-[#DB2777] font-bold">
                ข้อกำหนด
              </Link>
            )}
            {availableSupportPages.includes('privacy') && (
              <Link href={`/stores/${store.slug}/privacy`} className="hover:text-[#2563EB] font-bold">
                ความเป็นส่วนตัว
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
