'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  MapPin,
  Terminal,
  Sparkles,
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
  { href: (s) => `/stores/${s}/shipping`, label: 'การจัดส่งดิจิทัล', pageSlug: 'shipping' },
  { href: (s) => `/stores/${s}/returns`, label: 'นโยบายคืนเงิน', pageSlug: 'returns' },
  { href: (s) => `/stores/${s}/faq`, label: 'คำถามที่พบบ่อย', pageSlug: 'faq' },
  { href: (s) => `/stores/${s}/contact`, label: 'ติดต่อเรา', pageSlug: null },
];

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

const GRADIENT_BG = 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)';
const GLOW =
  '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)';

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
    'มาร์เก็ตเพลส AI Prompts สำหรับครีเอเตอร์ — ดาวน์โหลดทันที ใช้งานได้ตลอดชีพ';

  return (
    <footer className="bg-[#0B0B1F] text-[#F8FAFC] border-t border-[#312E81]/60 font-[family:var(--font-prompt)] relative overflow-hidden">
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(168,85,247,0.4) 0%, rgba(6,182,212,0.2) 50%, transparent 80%)',
        }}
        aria-hidden
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-5 lg:col-span-1">
          <Link
            href={`/stores/${store.slug}`}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="h-9 w-auto object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW }}
              >
                <Terminal className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            )}
            <span className="font-[family:var(--font-kanit)] font-semibold text-xl tracking-tight truncate">
              {store.name}
            </span>
          </Link>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{tagline}</p>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>เปิดให้บริการ 24/7</span>
          </div>
        </div>

        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.16em] mb-5 text-[#F8FAFC]">
            หมวดหมู่
          </h4>
          <ul className="space-y-3 text-sm text-[#94A3B8]">
            {categories.slice(0, 5).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="hover:text-[#A855F7] transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 opacity-50" />
                  {cat}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-[#06B6D4] hover:text-[#A855F7] transition-colors font-medium"
              >
                ดูทั้งหมด →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.16em] mb-5 text-[#F8FAFC]">
            ช่วยเหลือ
          </h4>
          <ul className="space-y-3 text-sm text-[#94A3B8]">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href(store.slug)}
                  className="hover:text-[#A855F7] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.16em] mb-5 text-[#F8FAFC]">
            ติดต่อเรา
          </h4>
          <ul className="space-y-3 text-sm text-[#94A3B8]">
            {store.lineId && (
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>LINE: {store.lineId}</span>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="hover:text-[#A855F7] transition-colors break-all"
                >
                  {store.contactEmail}
                </a>
              </li>
            )}
            {store.contactPhone && (
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A855F7] shrink-0" />
                <a
                  href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                  className="hover:text-[#A855F7] transition-colors"
                >
                  {store.contactPhone}
                </a>
              </li>
            )}
            {hasAddress && (
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
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
                className="w-9 h-9 rounded-lg border border-[#312E81] hover:border-[#A855F7] bg-[#13132E] hover:bg-[#1E1E3F] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {store.instagramUrl && (
              <a
                href={store.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-[#312E81] hover:border-[#A855F7] bg-[#13132E] hover:bg-[#1E1E3F] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/~${store.lineId}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-[#312E81] hover:border-[#10B981] bg-[#13132E] hover:bg-[#1E1E3F] flex items-center justify-center text-[#94A3B8] hover:text-[#10B981] transition-all"
                aria-label="LINE"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#312E81]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-[#94A3B8]">
          <p>
            © {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์
          </p>
          <div className="flex gap-5">
            {availableSupportPages.includes('terms') && (
              <Link
                href={`/stores/${store.slug}/terms`}
                className="hover:text-[#A855F7] transition-colors"
              >
                ข้อกำหนด
              </Link>
            )}
            {availableSupportPages.includes('privacy') && (
              <Link
                href={`/stores/${store.slug}/privacy`}
                className="hover:text-[#A855F7] transition-colors"
              >
                นโยบายความเป็นส่วนตัว
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
