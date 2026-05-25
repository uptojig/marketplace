'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  Facebook,
  Instagram,
} from 'lucide-react';

export interface PackagingSupplyFooterProps {
  storeName: string;
  storeSlug: string;
  logoUrl?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  province?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  lineId?: string | null;
  categories: string[];
}

/**
 * Packaging Supply — cheerful B2B-light footer.
 *
 * Soft pink wash background, three column grid (brand · catalog · contact)
 * with a tape-strip top border. Mirrors the trust signals B2B buyers
 * expect (MOQ, lead time, payment) while keeping the playful pink/yellow
 * accent of the family palette.
 */
export function Footer({
  storeName,
  storeSlug,
  logoUrl,
  description,
  contactEmail,
  contactPhone,
  addressLine1,
  addressLine2,
  province,
  facebookUrl,
  instagramUrl,
  lineId,
  categories,
}: PackagingSupplyFooterProps) {
  const year = new Date().getFullYear();
  const shopUrl = `/stores/${storeSlug}/category`;

  return (
    <footer className="bg-[var(--shop-bg-soft)] text-[var(--shop-ink)] font-[family:var(--font-prompt)] border-t-4 border-[var(--shop-primary)]">
      {/* Trust strip — yellow tape band */}
      <div className="bg-[var(--shop-accent)] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-[var(--shop-ink)]">
          {[
            { icon: Truck, label: 'ส่งฟรี ฿990+' },
            { icon: Package, label: 'สั่งขั้นต่ำ 50 ชิ้น' },
            { icon: ShieldCheck, label: 'รับประกันคุณภาพ' },
            { icon: Phone, label: 'ปรึกษาฟรี LINE' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Icon size={16} className="text-[var(--pks-pink-deep)] shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="space-y-4 lg:col-span-1">
            <Link href={`/stores/${storeSlug}`} className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="h-11 w-11 rounded-lg bg-[var(--shop-primary)] flex items-center justify-center text-white shadow-sm">
                    <Package size={22} strokeWidth={2.5} />
                  </div>
                  <span className="font-[family:var(--font-kanit)] font-extrabold text-xl tracking-tight">
                    {storeName}
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm leading-relaxed text-[var(--shop-ink-muted)]">
              {description ||
                'บรรจุภัณฑ์คุณภาพราคาขายส่ง · กล่องไปรษณีย์ · ถุงไปรษณีย์ · เทป · ซอง · เน้นร้านค้าออนไลน์และของชำ จัดส่งทั่วประเทศ'}
            </p>
            <div className="flex items-center gap-2">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-[var(--shop-bg)] flex items-center justify-center text-[var(--shop-ink-muted)] hover:bg-[var(--shop-primary)] hover:text-white border border-[var(--shop-border)] transition-colors"
                >
                  <Facebook size={16} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-[var(--shop-bg)] flex items-center justify-center text-[var(--shop-ink-muted)] hover:bg-[var(--shop-primary)] hover:text-white border border-[var(--shop-border)] transition-colors"
                >
                  <Instagram size={16} />
                </a>
              )}
              {lineId && (
                <span className="px-2.5 h-9 rounded-full bg-[#06C755] text-white text-[11px] font-bold flex items-center gap-1">
                  LINE @{lineId}
                </span>
              )}
            </div>
          </div>

          {/* Catalog links */}
          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-widest text-[var(--pks-pink-deep)] mb-4">
              หมวดหมู่
            </h3>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((c) => (
                <li key={c}>
                  <Link
                    href={`${shopUrl}?cat=${encodeURIComponent(c)}`}
                    className="text-sm text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors"
                  >
                    {c}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={shopUrl}
                  className="text-sm font-semibold text-[var(--shop-primary)] hover:underline"
                >
                  ดูสินค้าทั้งหมด →
                </Link>
              </li>
            </ul>
          </div>

          {/* Service column */}
          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-widest text-[var(--pks-pink-deep)] mb-4">
              บริการลูกค้า
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--shop-ink-muted)]">
              <li>
                <Link href={`/stores/${storeSlug}/cart`} className="hover:text-[var(--shop-primary)] transition-colors">
                  ตะกร้าและการสั่งซื้อ
                </Link>
              </li>
              <li>การชำระเงิน · COD · โอน · บัตร</li>
              <li>จัดส่ง · Kerry · Flash · ไปรษณีย์ไทย</li>
              <li>คืนสินค้าและรับประกัน</li>
              <li>คำถามที่พบบ่อย</li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-widest text-[var(--pks-pink-deep)] mb-4">
              ติดต่อสั่งซื้อ
            </h3>
            <ul className="space-y-3 text-sm">
              {contactPhone && (
                <li className="flex items-start gap-2.5 text-[var(--shop-ink)]">
                  <Phone size={16} className="text-[var(--shop-primary)] mt-0.5 shrink-0" />
                  <a href={`tel:${contactPhone}`} className="hover:text-[var(--shop-primary)] font-semibold">
                    {contactPhone}
                  </a>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-start gap-2.5 text-[var(--shop-ink-muted)]">
                  <Mail size={16} className="text-[var(--shop-primary)] mt-0.5 shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-[var(--shop-primary)]">
                    {contactEmail}
                  </a>
                </li>
              )}
              {(addressLine1 || province) && (
                <li className="flex items-start gap-2.5 text-[var(--shop-ink-muted)]">
                  <MapPin size={16} className="text-[var(--shop-primary)] mt-0.5 shrink-0" />
                  <span className="leading-relaxed">
                    {addressLine1}
                    {addressLine2 ? <><br />{addressLine2}</> : null}
                    {province ? <><br />{province}</> : null}
                  </span>
                </li>
              )}
              <li className="pt-1">
                <Link
                  href={`/stores/${storeSlug}/category`}
                  className="inline-flex items-center gap-1.5 bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white font-bold text-xs px-4 py-2 rounded-full transition-colors"
                >
                  ขอใบเสนอราคา
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--shop-border)] bg-[var(--shop-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--shop-ink-muted)]">
          <p>
            © {year} {storeName} · บรรจุภัณฑ์ราคาส่ง จัดส่งทั่วประเทศ
          </p>
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:text-[var(--shop-primary)]">ข้อตกลง</Link>
            <span aria-hidden>·</span>
            <Link href="#" className="hover:text-[var(--shop-primary)]">ความเป็นส่วนตัว</Link>
            <span aria-hidden>·</span>
            <span className="px-2 py-0.5 bg-[var(--shop-savings)]/10 text-[var(--shop-savings)] rounded-full font-bold uppercase tracking-wide">
              SSL Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
