'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, Facebook, Instagram, MapPin } from 'lucide-react';

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
  { href: (s) => `/stores/${s}/shipping`, label: 'การจัดส่ง', pageSlug: 'shipping' },
  { href: (s) => `/stores/${s}/returns`, label: 'นโยบายคืนสินค้า', pageSlug: 'returns' },
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
    'อาณาจักรแห่งสีสัน และปาร์ตี้คอนเสิร์ต ส่งตรงถึงมือคุณ';

  return (
    <footer className="bg-black text-white border-t-8 border-yellow-400 font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link
            href={`/stores/${store.slug}`}
            className="font-[family:var(--font-kanit)] text-3xl font-black tracking-tighter uppercase flex items-center gap-2"
          >
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 bg-white flex items-center justify-center border-4 border-white shrink-0">
                  <div className="w-5 h-5 bg-pink-500 rotate-45" />
                </div>
                <span className="truncate">{store.name}</span>
              </>
            )}
          </Link>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">
            {tagline}
          </p>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-black text-2xl mb-6 uppercase italic text-yellow-400">
            ช้อปปิ้ง
          </h4>
          <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-slate-300">
            {categories.slice(0, 5).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="hover:text-white hover:underline decoration-4 underline-offset-4 transition-colors block"
                >
                  {cat}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/stores/${store.slug}/category`}
                className="hover:text-white hover:underline decoration-4 underline-offset-4 transition-colors block text-yellow-400"
              >
                ดูทั้งหมด →
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-black text-2xl mb-6 uppercase italic text-pink-500">
            ช่วยเหลือ
          </h4>
          <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-slate-300">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href(store.slug)}
                  className="hover:text-white hover:underline decoration-4 underline-offset-4 transition-colors block"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-black text-2xl mb-6 uppercase italic text-blue-400">
            ติดต่อเรา
          </h4>
          <ul className="space-y-4 text-sm font-bold text-slate-300">
            {store.lineId && (
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 shrink-0" />
                <span className="uppercase tracking-widest">LINE: {store.lineId}</span>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                <a href={`mailto:${store.contactEmail}`} className="hover:text-white break-all">
                  {store.contactEmail}
                </a>
              </li>
            )}
            {store.contactPhone && (
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                <a href={`tel:${store.contactPhone.replace(/\s+/g, '')}`} className="hover:text-white">
                  {store.contactPhone}
                </a>
              </li>
            )}
            {hasAddress && (
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed uppercase tracking-widest">
                  {line1 && <div>{line1}</div>}
                  {line2 && <div>{line2}</div>}
                  {line3 && <div>{line3}</div>}
                </div>
              </li>
            )}
          </ul>
          <div className="flex gap-3 mt-6">
            {store.facebookUrl && (
              <a
                href={store.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 border-4 border-white bg-blue-600 flex items-center justify-center hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {store.instagramUrl && (
              <a
                href={store.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 border-4 border-white bg-pink-500 flex items-center justify-center hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/~${store.lineId}`}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 border-4 border-white bg-green-400 text-black flex items-center justify-center hover:bg-yellow-400 active:translate-x-1 active:translate-y-1"
                aria-label="LINE"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white text-black border-t-8 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col md:flex-row justify-between items-center gap-2 text-xs font-black uppercase tracking-widest">
          <p>© {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์</p>
          <div className="flex gap-6">
            {availableSupportPages.includes('terms') && (
              <Link href={`/stores/${store.slug}/terms`} className="hover:text-pink-600">
                ข้อกำหนด
              </Link>
            )}
            {availableSupportPages.includes('privacy') && (
              <Link href={`/stores/${store.slug}/privacy`} className="hover:text-blue-600">
                นโยบายความเป็นส่วนตัว
              </Link>
            )}
          </div>
          <p>Bangkok, Thailand</p>
        </div>
      </div>
    </footer>
  );
}
