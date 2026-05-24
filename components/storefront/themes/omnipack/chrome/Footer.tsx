'use client';

/**
 * OmniPack — storefront footer.
 *
 * Renders the store's DB-backed address (addressLine1/addressLine2/
 * subdistrict/district/province/postalCode via the shared
 * formatStoreAddressLines helper), service / help columns wrapped in
 * `<Link>`, and a trust strip stating ANYPAY-only payments — no COD.
 */

import React from 'react';
import Link from 'next/link';
import {
  PackageOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Leaf,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { FooterProps } from '@/lib/templates/types';
import { formatStoreAddressLines } from '@/lib/format/storeAddress';

export function OmnipackFooter(props: FooterProps) {
  const { store, categories } = props;
  const homeUrl = `/stores/${store.slug}`;
  const shopUrl = `/stores/${store.slug}/category`;
  const cats = (categories ?? []).slice(0, 5);
  const addressLines = formatStoreAddressLines({
    addressLine1: store.addressLine1,
    addressLine2: store.addressLine2,
    subdistrict: store.subdistrict,
    district: store.district,
    province: store.province,
    postalCode: store.postalCode,
    country: store.country,
  });

  return (
    <footer
      className="font-[family:var(--font-prompt)] border-t mt-auto"
      style={{
        backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))',
        borderColor: 'var(--shop-border)',
        color: 'var(--shop-ink)',
      }}
    >
      {/* Trust strip — ANYPAY only, no COD */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <Leaf className="w-5 h-5" style={{ color: 'var(--shop-accent)' }} />
            <span>รีไซเคิลได้ 100%</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5" style={{ color: 'var(--shop-primary)' }} />
            <span>ส่งภายในวันเดียว</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              className="w-5 h-5"
              style={{ color: 'var(--shop-primary)' }}
            />
            <span>สั่งขั้นต่ำ 50 ชิ้น</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center justify-center text-[10px] font-bold tracking-wide px-2 py-1 rounded text-white"
              style={{ backgroundColor: 'var(--shop-primary)' }}
            >
              ANYPAY
            </span>
            <span>จ่ายผ่าน ANYPAY</span>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand + address */}
        <div className="space-y-4">
          <Link href={homeUrl} className="flex items-center gap-3">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-10 w-10 object-contain rounded-md"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-md flex items-center justify-center text-white"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary))',
                }}
              >
                <PackageOpen className="w-5 h-5" />
              </div>
            )}
            <span
              className="font-[family:var(--font-kanit)] font-medium text-xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              {store.name}
            </span>
          </Link>
          {store.tagline && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {store.tagline}
            </p>
          )}
          {addressLines.length > 0 && (
            <address
              className="not-italic flex items-start gap-2 text-sm leading-relaxed"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <MapPin
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: 'var(--shop-primary)' }}
              />
              <span>
                {addressLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </span>
            </address>
          )}
        </div>

        {/* Categories */}
        <div>
          <h3
            className="font-[family:var(--font-kanit)] font-medium text-base mb-4"
            style={{ color: 'var(--shop-ink)' }}
          >
            หมวดสินค้า
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href={shopUrl}
                className="hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                สินค้าทั้งหมด
              </Link>
            </li>
            {cats.map((c) => (
              <li key={c}>
                <Link
                  href={`${shopUrl}?cat=${encodeURIComponent(c)}`}
                  className="hover:opacity-80"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service */}
        <div>
          <h3
            className="font-[family:var(--font-kanit)] font-medium text-base mb-4"
            style={{ color: 'var(--shop-ink)' }}
          >
            บริการ
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href={`${homeUrl}/about`}
                className="hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                เกี่ยวกับเรา
              </Link>
            </li>
            <li>
              <Link
                href={`${homeUrl}/shipping`}
                className="hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                การจัดส่ง
              </Link>
            </li>
            <li>
              <Link
                href={`${homeUrl}/returns`}
                className="hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                การคืนสินค้า
              </Link>
            </li>
            <li>
              <Link
                href={`${homeUrl}/faq`}
                className="hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                คำถามที่พบบ่อย
              </Link>
            </li>
            <li>
              <Link
                href={`${homeUrl}/help`}
                className="hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ติดต่อฝ่ายขาย
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3
            className="font-[family:var(--font-kanit)] font-medium text-base mb-4"
            style={{ color: 'var(--shop-ink)' }}
          >
            ติดต่อฝ่ายขายส่ง
          </h3>
          <ul className="space-y-3 text-sm">
            {store.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--shop-primary)' }}
                />
                <a
                  href={`tel:${store.contactPhone}`}
                  className="hover:opacity-80"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {store.contactPhone}
                </a>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-center gap-2">
                <Mail
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--shop-primary)' }}
                />
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="hover:opacity-80 break-all"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {store.contactEmail}
                </a>
              </li>
            )}
          </ul>
          {(store.facebookUrl || store.instagramUrl) && (
            <div className="flex gap-3 mt-5">
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  className="p-2 rounded-full border hover:opacity-80"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink-muted)',
                  }}
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  className="p-2 rounded-full border hover:opacity-80"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink-muted)',
                  }}
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p style={{ color: 'var(--shop-ink-muted)' }}>
            © {new Date().getFullYear()} {store.name} · บรรจุภัณฑ์สำเร็จรูป
          </p>
          <p style={{ color: 'var(--shop-ink-muted)' }}>
            ชำระเงินผ่าน ANYPAY เท่านั้น
          </p>
        </div>
      </div>
    </footer>
  );
}
