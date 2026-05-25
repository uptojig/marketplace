'use client';

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Truck,
  Headphones,
  Sparkles,
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

const SUPPORT_LABELS: Record<string, string> = {
  about: 'เกี่ยวกับเรา',
  faq: 'คำถามที่พบบ่อย',
  shipping: 'การจัดส่ง',
  returns: 'การคืนสินค้า',
  privacy: 'นโยบายความเป็นส่วนตัว',
  terms: 'ข้อกำหนดการใช้งาน',
};

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

/**
 * Konvy — K-beauty marketplace footer.
 *
 * Soft pastel look:
 *   row 1 trust strip (premium / shipping / care / ANYPAY)
 *   row 2 brand · categories · service (Link-wrapped) · contact (full
 *         address pulled from store.addressLine1/.../postalCode)
 *   row 3 copyright + social
 *
 * Trust strip explicitly says "จ่ายผ่าน ANYPAY" — no COD per project rule.
 */
export function Footer({ store, categories = [], availableSupportPages = [] }: Props) {
  const supportLinks = availableSupportPages.filter((s) => SUPPORT_LABELS[s]);
  const year = new Date().getFullYear();

  const address = joinAddress([
    store.addressLine1,
    store.addressLine2,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]);

  const trustIcons = [
    { Icon: Sparkles, title: 'คัดสรรคุณภาพ', sub: 'ตรวจคุณภาพก่อนส่งทุกชิ้น' },
    { Icon: Truck, title: 'ส่งฟรีทั่วประเทศ', sub: 'เมื่อสั่งครบ ฿590' },
    { Icon: Headphones, title: 'ดูแลโดยทีมงานคนไทย', sub: 'แชทตอบไว 09:00-22:00' },
    { Icon: ShieldCheck, title: 'จ่ายผ่าน ANYPAY', sub: 'พร้อมเพย์ · บัตร · TrueMoney' },
  ];

  return (
    <footer
      className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
      style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
    >
      {/* Trust strip */}
      <div className="border-b border-[var(--shop-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {trustIcons.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full grid place-items-center shrink-0"
                style={{
                  background: 'var(--shop-bg, white)',
                  color: 'var(--shop-primary)',
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-[family:var(--font-kanit)] font-semibold text-sm truncate">
                  {title}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href={`/stores/${store.slug}`} className="inline-flex items-center gap-2">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span
                  className="font-[family:var(--font-kanit)] font-semibold text-xl tracking-tight"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {store.name}
                </span>
              )}
            </Link>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {store.tagline?.trim() ||
                store.description?.trim() ||
                'K-Beauty Marketplace · คัดสรรเครื่องสำอางและสกินแคร์เกาหลีของแท้ ส่งตรงจากแบรนด์'}
            </p>
            <div className="flex items-center gap-3">
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-white border border-[var(--shop-border)] hover:border-[var(--shop-primary)] transition-colors"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-white border border-[var(--shop-border)] hover:border-[var(--shop-primary)] transition-colors"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {store.lineId && (
                <span
                  aria-label="LINE"
                  title={`LINE: ${store.lineId}`}
                  className="p-2 rounded-full bg-white border border-[var(--shop-border)]"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  <MessageCircle className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h4
                className="text-[11px] uppercase tracking-[0.18em] font-[family:var(--font-kanit)] font-semibold mb-4"
                style={{ color: 'var(--shop-primary)' }}
              >
                หมวดหมู่ยอดฮิต
              </h4>
              <ul className="space-y-2.5 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                      className="hover:text-[var(--shop-primary)] transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Service — Link-wrapped */}
          <div>
            <h4
              className="text-[11px] uppercase tracking-[0.18em] font-[family:var(--font-kanit)] font-semibold mb-4"
              style={{ color: 'var(--shop-primary)' }}
            >
              บริการลูกค้า
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
              {supportLinks.length > 0 ? (
                supportLinks.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/stores/${store.slug}/${slug}`}
                      className="hover:text-[var(--shop-primary)] transition-colors"
                    >
                      {SUPPORT_LABELS[slug]}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href={`/stores/${store.slug}/help`}
                      className="hover:text-[var(--shop-primary)] transition-colors"
                    >
                      วิธีการสั่งซื้อ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/stores/${store.slug}/shipping`}
                      className="hover:text-[var(--shop-primary)] transition-colors"
                    >
                      การจัดส่ง · ค่าส่ง
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/stores/${store.slug}/returns`}
                      className="hover:text-[var(--shop-primary)] transition-colors"
                    >
                      การคืนสินค้า · คืนเงิน
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/stores/${store.slug}/help#authentic`}
                      className="hover:text-[var(--shop-primary)] transition-colors"
                    >
                      คัดสรรคุณภาพ
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact + address */}
          <div>
            <h4
              className="text-[11px] uppercase tracking-[0.18em] font-[family:var(--font-kanit)] font-semibold mb-4"
              style={{ color: 'var(--shop-primary)' }}
            >
              ติดต่อร้านค้า
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
              {store.contactPhone && <li>โทร: {store.contactPhone}</li>}
              {store.contactEmail && <li>อีเมล: {store.contactEmail}</li>}
              {store.lineId && <li>LINE: @{store.lineId}</li>}
              {address && (
                <li className="pt-1 leading-relaxed">
                  <span className="block text-[11px] uppercase tracking-[0.14em] mb-0.5 font-medium">
                    ที่อยู่
                  </span>
                  {address}
                </li>
              )}
              <li className="pt-1 text-[12px]">ตอบกลับใน 1-2 ชั่วโมง · 09:00-22:00</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--shop-border)]">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <p>
            © {year} {store.name} · ทุกการสั่งซื้อปลอดภัย รับประกันคืนเงิน 7 วัน
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {['Thai QR PromptPay'].map((m) => (
              <span
                key={m}
                className="px-2.5 py-1 text-[10px] font-medium uppercase rounded-full bg-white border border-[var(--shop-border)]"
                style={{ color: 'var(--shop-ink)' }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
