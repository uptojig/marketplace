'use client';

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    messengerUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
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

const SUPPORT_LABELS: Record<string, string> = {
  about: 'เกี่ยวกับเรา',
  faq: 'คำถามที่พบบ่อย',
  shipping: 'การจัดส่ง',
  returns: 'การคืนสินค้า',
  privacy: 'นโยบายความเป็นส่วนตัว',
  terms: 'ข้อกำหนดการใช้งาน',
};

export function Footer({ store, categories = [], availableSupportPages = [] }: Props) {
  const supportLinks = availableSupportPages.filter((s) => SUPPORT_LABELS[s]);
  const blurb =
    store.description?.trim() ||
    store.tagline?.trim() ||
    'รวมเทมเพลต Notion พร้อมใช้สำหรับการทำงาน บริหารโปรเจกต์ จัดการเวลา และฐานข้อมูลลูกค้า ดาวน์โหลดทันทีหลังชำระเงิน';

  return (
    <footer className="bg-white border-t border-[#E5E5E5] text-[#1A1A1A] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl} alt={store.name} className="h-9 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-8 w-8 rounded grid place-items-center text-white text-[14px] font-bold font-[family:var(--font-kanit)] bg-black">
                {store.name.trim().slice(0, 1).toUpperCase()}
              </span>
              <span className="font-[family:var(--font-kanit)] font-semibold text-[15px] text-[#1A1A1A]">{store.name}</span>
            </div>
          )}
          <p className="text-[12px] leading-relaxed text-[#6B6B6B]">{blurb}</p>
          <p className="inline-block text-[10px] tracking-[0.12em] uppercase font-[family:var(--font-kanit)] font-semibold text-[#6B6B6B] border border-[#E5E5E5] bg-[#F7F6F3] px-2 py-0.5 rounded">
            Notion · Templates · Workspace
          </p>
        </div>

        {categories.length > 0 && (
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-semibold text-[12px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-3">หมวดหมู่</h4>
            <ul className="space-y-1.5 text-[12.5px]">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`} className="text-[#1A1A1A] hover:text-[#2563EB] hover:underline underline-offset-2 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-[12px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-3">บริการลูกค้า</h4>
          <ul className="space-y-1.5 text-[12.5px]">
            <li><Link href={`/stores/${store.slug}/cart`} className="text-[#1A1A1A] hover:text-[#2563EB] hover:underline underline-offset-2 transition-colors">ตะกร้าของคุณ</Link></li>
            {supportLinks.map((slug) => (
              <li key={slug}><Link href={`/stores/${store.slug}/${slug}`} className="text-[#1A1A1A] hover:text-[#2563EB] hover:underline underline-offset-2 transition-colors">{SUPPORT_LABELS[slug]}</Link></li>
            ))}
            <li><Link href={`/stores/${store.slug}/contact`} className="text-[#1A1A1A] hover:text-[#2563EB] hover:underline underline-offset-2 transition-colors">ติดต่อเรา</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold text-[12px] uppercase tracking-[0.12em] text-[#6B6B6B] mb-3">ช่องทางติดต่อ</h4>
          <ul className="space-y-1.5 text-[12px] text-[#1A1A1A]">
            {store.contactPhone && (
              <li className="flex items-start gap-2">
                <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#6B6B6B]" aria-hidden />
                <a href={`tel:${store.contactPhone.replace(/\s+/g, '')}`} className="hover:text-[#2563EB] hover:underline underline-offset-2 break-all">{store.contactPhone}</a>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#6B6B6B]" aria-hidden />
                <a href={`mailto:${store.contactEmail}`} className="hover:text-[#2563EB] hover:underline underline-offset-2 break-all">{store.contactEmail}</a>
              </li>
            )}
            {store.lineId && (
              <li className="flex items-start gap-2">
                <MessageCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#6B6B6B]" aria-hidden />
                <span>LINE: {store.lineId}</span>
              </li>
            )}
          </ul>

          {(store.facebookUrl || store.instagramUrl || store.twitterUrl || store.messengerUrl) && (
            <div className="flex gap-1.5 mt-4">
              {store.facebookUrl && <SocialIcon href={store.facebookUrl} label="Facebook"><Facebook className="h-3.5 w-3.5" /></SocialIcon>}
              {store.instagramUrl && <SocialIcon href={store.instagramUrl} label="Instagram"><Instagram className="h-3.5 w-3.5" /></SocialIcon>}
              {store.twitterUrl && <SocialIcon href={store.twitterUrl} label="Twitter"><Twitter className="h-3.5 w-3.5" /></SocialIcon>}
              {store.messengerUrl && <SocialIcon href={store.messengerUrl} label="Messenger"><MessageCircle className="h-3.5 w-3.5" /></SocialIcon>}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#E5E5E5] bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#6B6B6B] font-[family:var(--font-kanit)] font-medium tabular-nums">
            © {new Date().getFullYear()} {store.name} · ทุกสิทธิ์สงวน
          </p>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">
            <ShieldCheck className="h-3 w-3 text-[#2563EB]" aria-hidden />
            <span>ดาวน์โหลดปลอดภัย · ลิงก์ส่วนตัว</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode; }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#2563EB] hover:border-[#2563EB] transition-colors">
      {children}
    </a>
  );
}
