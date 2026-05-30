'use client';

/**
 * MotoFog — racing footer.
 *
 * Pit-lane inspired footer with store address, social rail, and an
 * AnyPay payment callout. Diagonal stripe accents repeat the racing
 * vibe established in the header.
 */

import React from 'react';
import Link from 'next/link';
import {
  Flag,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  CreditCard,
} from 'lucide-react';
import type { FooterProps } from '@/lib/templates/types';

export function MotoFogFooter({ store }: FooterProps) {
  const addressParts = [
    store.addressLine1,
    store.addressLine2,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ].filter(Boolean);
  const hasAddress = addressParts.length > 0;

  return (
    <footer
      className="relative"
      style={{
        backgroundColor: 'var(--shop-bg, #0F1417)',
        color: 'var(--shop-ink, #F5F7FA)',
      }}
    >
      {/* Top diagonal accent bar */}
      <div
        aria-hidden
        className="h-2 w-full"
        style={{
          background:
            'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="md:col-span-5 space-y-5">
            <Link href={`/stores/${store.slug}`} className="inline-flex items-center gap-3">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div
                    className="h-12 w-12 flex items-center justify-center rounded-md"
                    style={{
                      background:
                        'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                    }}
                  >
                    <Flag className="h-6 w-6 text-black" />
                  </div>
                  <span
                    className="font-[family:var(--font-kanit)] italic font-black text-2xl uppercase tracking-tight"
                    style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                  >
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            {store.tagline ? (
              <p
                className="font-[family:var(--font-prompt)] text-sm leading-relaxed max-w-md"
                style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
              >
                {store.tagline}
              </p>
            ) : (
              <p
                className="font-[family:var(--font-prompt)] text-sm leading-relaxed max-w-md"
                style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
              >
                อะไหล่แต่ง ชุดแข่ง หมวกกันน็อก คัดมาจากแบรนด์ดังทั่วโลก ส่งตรงถึงพิทคุณ
              </p>
            )}

            {/* AnyPay strip */}
            <div
              className="inline-flex items-center gap-3 rounded-md px-4 py-3"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <CreditCard
                className="h-5 w-5 shrink-0"
                style={{ color: 'var(--shop-accent, #FFC72C)' }}
              />
              <div className="flex flex-col leading-tight">
                <span
                  className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  ช่องทางชำระเงิน
                </span>
                <span
                  className="font-[family:var(--font-kanit)] italic font-black text-base uppercase tracking-wider"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  จ่ายออนไลน์
                </span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="h-10 w-10 rounded-md inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--shop-surface, #1A2128)',
                    border: '1px solid var(--shop-border, #2B3540)',
                    color: 'var(--shop-ink, #F5F7FA)',
                  }}
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-10 w-10 rounded-md inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--shop-surface, #1A2128)',
                    border: '1px solid var(--shop-border, #2B3540)',
                    color: 'var(--shop-ink, #F5F7FA)',
                  }}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Service links */}
          <div className="md:col-span-3">
            <h3
              className="font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest mb-4"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
            >
              บริการ
            </h3>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              <li>
                <Link
                  href={`/stores/${store.slug}/about`}
                  className="hover:underline"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link
                  href={`/stores/${store.slug}/help`}
                  className="hover:underline"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  ติดต่อ &amp; ช่วยเหลือ
                </Link>
              </li>
              <li>
                <Link
                  href={`/stores/${store.slug}/shipping`}
                  className="hover:underline"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  การจัดส่ง
                </Link>
              </li>
              <li>
                <Link
                  href={`/stores/${store.slug}/returns`}
                  className="hover:underline"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  คืน &amp; เปลี่ยนสินค้า
                </Link>
              </li>
              <li>
                <Link
                  href={`/stores/${store.slug}/faq`}
                  className="hover:underline"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  คำถามที่พบบ่อย
                </Link>
              </li>
            </ul>
          </div>

          {/* Address + contact */}
          <div className="md:col-span-4">
            <h3
              className="font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest mb-4"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
            >
              ที่อยู่ &amp; ติดต่อ
            </h3>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              {hasAddress && (
                <li className="flex items-start gap-3">
                  <MapPin
                    className="h-4 w-4 mt-0.5 shrink-0"
                    style={{ color: 'var(--shop-accent, #FFC72C)' }}
                  />
                  <span style={{ color: 'var(--shop-ink, #F5F7FA)' }}>
                    {addressParts.join(' ')}
                  </span>
                </li>
              )}
              {store.contactPhone && (
                <li className="flex items-center gap-3">
                  <Phone
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--shop-accent, #FFC72C)' }}
                  />
                  <span style={{ color: 'var(--shop-ink, #F5F7FA)' }}>
                    {store.contactPhone}
                  </span>
                </li>
              )}
              {store.contactEmail && (
                <li className="flex items-center gap-3">
                  <Mail
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--shop-accent, #FFC72C)' }}
                  />
                  <span style={{ color: 'var(--shop-ink, #F5F7FA)' }}>
                    {store.contactEmail}
                  </span>
                </li>
              )}
              {!hasAddress && !store.contactEmail && !store.contactPhone && (
                <li
                  className="text-xs"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  เปิดบริการ จ.-ส. 09:00-18:00 (หยุดวันอาทิตย์)
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-[family:var(--font-prompt)]"
          style={{
            borderTop: '1px solid var(--shop-border, #2B3540)',
            color: 'var(--shop-ink-muted, #94A3B0)',
          }}
        >
          <p>
            © {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์ทุกประการ
          </p>
          <p className="uppercase tracking-widest font-bold">
            Racing-Tested · Performance-Proven
          </p>
        </div>
      </div>
    </footer>
  );
}

export default MotoFogFooter;
