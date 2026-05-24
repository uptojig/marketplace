'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Truck,
  CreditCard,
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
  const tagline =
    store.tagline?.trim() ||
    store.description?.trim() ||
    'เคสมือถือคุณภาพและอุปกรณ์เสริมเทคโนโลยี · คัดสรรลายสวยทุกรุ่น';

  return (
    <footer
      className="font-[family:var(--font-prompt)]"
      style={{
        background: 'var(--shop-bg, #FBF8F3)',
        color: 'var(--shop-ink, #1A1A1F)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Trust strip — "จ่ายผ่าน ANYPAY" (NO COD) */}
      <div className="border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,90,106,0.1)', color: 'var(--shop-primary, #FF5A6A)' }}
            >
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <p className="font-medium">ส่งใน 1–3 วัน</p>
              <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)]">ทั่วประเทศ</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,90,106,0.1)', color: 'var(--shop-primary, #FF5A6A)' }}
            >
              <CreditCard className="w-4 h-4" />
            </span>
            <div>
              <p className="font-medium">จ่ายผ่าน ANYPAY</p>
              <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)]">PromptPay · บัตร · โอน</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,90,106,0.1)', color: 'var(--shop-primary, #FF5A6A)' }}
            >
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <p className="font-medium">คัดสรรคุณภาพ</p>
              <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)]">รับประกันคุณภาพ</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,90,106,0.1)', color: 'var(--shop-primary, #FF5A6A)' }}
            >
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <p className="font-medium">เปลี่ยน/คืน 7 วัน</p>
              <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)]">ไม่พอใจคืนเงิน</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <Link href={`/stores/${store.slug}`} className="flex items-center gap-2.5">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }}
                aria-hidden
              >
                {store.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-[family:var(--font-kanit)] text-xl font-semibold tracking-tight">
              {store.name}
            </span>
          </Link>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] leading-relaxed">{tagline}</p>
          <div className="flex gap-2">
            {store.facebookUrl && (
              <a
                href={store.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-[color:var(--shop-ink,#1A1A1F)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
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
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-[color:var(--shop-ink,#1A1A1F)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
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
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-[color:var(--shop-ink,#1A1A1F)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Shopping */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-base mb-4">ช้อปปิ้ง</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
              >
                สินค้าทั้งหมด
              </Link>
            </li>
            {categories.slice(0, 6).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support — links wrapped in <Link>, not bare li */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-base mb-4">ช่วยเหลือ</h4>
          <ul className="space-y-2.5 text-sm">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href(store.slug)}
                  className="text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + Address */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-base mb-4">ติดต่อเรา</h4>
          <ul className="space-y-2.5 text-sm">
            {store.contactPhone && (
              <li className="flex items-start gap-2.5 text-[color:var(--shop-ink-muted,#6B7280)]">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--shop-primary,#FF5A6A)]" />
                <a
                  href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                  className="hover:text-[color:var(--shop-primary,#FF5A6A)]"
                >
                  {store.contactPhone}
                </a>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-start gap-2.5 text-[color:var(--shop-ink-muted,#6B7280)]">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--shop-primary,#FF5A6A)]" />
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="hover:text-[color:var(--shop-primary,#FF5A6A)] break-all"
                >
                  {store.contactEmail}
                </a>
              </li>
            )}
            {store.lineId && (
              <li className="flex items-start gap-2.5 text-[color:var(--shop-ink-muted,#6B7280)]">
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--shop-primary,#FF5A6A)]" />
                <span>LINE: {store.lineId}</span>
              </li>
            )}
            {hasAddress && (
              <li className="flex items-start gap-2.5 text-[color:var(--shop-ink-muted,#6B7280)]">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--shop-primary,#FF5A6A)]" />
                <div className="leading-relaxed">
                  {line1 && <div>{line1}</div>}
                  {line2 && <div>{line2}</div>}
                  {line3 && <div>{line3}</div>}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center gap-2 justify-between text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
          <p>© {new Date().getFullYear()} {store.name} · สงวนลิขสิทธิ์</p>
          <div className="flex flex-wrap gap-4">
            {availableSupportPages.includes('terms') && (
              <Link
                href={`/stores/${store.slug}/terms`}
                className="hover:text-[color:var(--shop-primary,#FF5A6A)]"
              >
                ข้อกำหนด
              </Link>
            )}
            {availableSupportPages.includes('privacy') && (
              <Link
                href={`/stores/${store.slug}/privacy`}
                className="hover:text-[color:var(--shop-primary,#FF5A6A)]"
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
