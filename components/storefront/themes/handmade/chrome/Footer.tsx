'use client';

import React from 'react';
import Link from 'next/link';
import {
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Mail,
  Phone,
  Hand,
} from 'lucide-react';

/**
 * Handmade — Footer
 *
 * Four-column atelier footer:
 *   1. Brand block — wordmark, tagline, social row
 *   2. Categories — first 6 from props.categories
 *   3. Customer service — FAQ / shipping / returns
 *   4. Contact — address / email / phone (when present on the store row)
 *
 * Reads from the Specialty family CSS-var cascade (`--shop-*`). All
 * copy ships in Thai. Links to /faq, /shipping, /returns, /privacy,
 * /terms, /about are rendered unconditionally — the per-store router
 * gracefully falls back to schema-driven Help when the slug is missing.
 *
 * NOTE: The scaffold `FooterProps` doesn't ship an `availableSupportPages`
 * list today, so we render the canonical Thai-ecom set inline. When/if
 * the scaffold adds that field, the inline list can be filtered.
 */

export interface HandmadeFooterProps {
  store: {
    id?: string;
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
  };
  categories?: string[];
  accent?: string;
}

export function Footer({ store, categories, accent }: HandmadeFooterProps) {
  const accentColor = accent ?? 'var(--shop-primary, #ca8a04)';
  const base = `/stores/${store.slug}`;
  const tagline =
    store.tagline ??
    store.description ??
    'งานคราฟท์ทำมือ ทำทีละชิ้นด้วยความตั้งใจ · จากสตูดิโอเล็ก ๆ ของเราถึงบ้านของคุณ';

  const fullAddress = [
    store.addressLine1,
    store.addressLine2,
    [store.subdistrict, store.district].filter(Boolean).join(' '),
    [store.province, store.postalCode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <footer
      className="border-t pt-14 pb-8 font-[family:var(--font-prompt)]"
      style={{
        backgroundColor: 'var(--shop-card, #fbf9f3)',
        color: 'var(--shop-ink, #44403c)',
        borderColor: 'var(--shop-border, #e7e2d6)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: hand-drawn divider */}
        <div
          aria-hidden="true"
          className="h-px mb-10 opacity-50"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--shop-ink-muted,#78716c) 0 6px, transparent 6px 12px)',
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href={base} className="inline-flex items-center gap-2 mb-4">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <Hand className="h-5 w-5" style={{ color: accentColor }} aria-hidden="true" />
                  <span
                    className="text-xl tracking-wide font-[family:var(--font-specialty-display,var(--font-prompt))]"
                    style={{ fontWeight: 500 }}
                  >
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            <p
              className="text-sm leading-relaxed mb-5 max-w-xs"
              style={{ color: 'var(--shop-ink-muted, #78716c)' }}
            >
              {tagline}
            </p>

            {/* Social row */}
            <div className="flex items-center gap-3">
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {store.messengerUrl && (
                <a
                  href={store.messengerUrl}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Messenger"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3
              className="text-xs uppercase tracking-[0.18em] mb-5"
              style={{ color: 'var(--shop-ink, #44403c)' }}
            >
              หมวดหมู่สินค้า
            </h3>
            <ul className="space-y-3 text-sm">
              {(categories ?? []).slice(0, 6).map((category) => (
                <li key={category}>
                  <Link
                    href={`${base}/category?cat=${encodeURIComponent(category)}`}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                  >
                    {category}
                  </Link>
                </li>
              ))}
              {(!categories || categories.length === 0) && (
                <li>
                  <Link
                    href={`${base}/category`}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                  >
                    สินค้าทั้งหมด
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3
              className="text-xs uppercase tracking-[0.18em] mb-5"
              style={{ color: 'var(--shop-ink, #44403c)' }}
            >
              บริการลูกค้า
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={`${base}/faq`}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  คำถามที่พบบ่อย
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/shipping`}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  การจัดส่งสินค้า
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/returns`}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  การคืนสินค้า
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/about`}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/help`}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  ติดต่อสอบถาม
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-xs uppercase tracking-[0.18em] mb-5"
              style={{ color: 'var(--shop-ink, #44403c)' }}
            >
              ติดต่อสตูดิโอ
            </h3>
            <ul className="space-y-3 text-sm">
              {fullAddress && (
                <li
                  className="flex items-start gap-2"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  <MapPin
                    className="h-4 w-4 mt-0.5 flex-shrink-0"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <span className="whitespace-pre-line leading-relaxed">{fullAddress}</span>
                </li>
              )}
              {store.contactEmail && (
                <li
                  className="flex items-center gap-2"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  <Mail
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <a href={`mailto:${store.contactEmail}`} className="hover:opacity-70">
                    {store.contactEmail}
                  </a>
                </li>
              )}
              {store.contactPhone && (
                <li
                  className="flex items-center gap-2"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  <Phone
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <a href={`tel:${store.contactPhone}`} className="hover:opacity-70">
                    {store.contactPhone}
                  </a>
                </li>
              )}
              {store.lineId && (
                <li
                  className="flex items-center gap-2"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  <MessageCircle
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <span>LINE: {store.lineId}</span>
                </li>
              )}
              {!fullAddress && !store.contactEmail && !store.contactPhone && !store.lineId && (
                <li
                  className="text-sm"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  ติดต่อสตูดิโอผ่านช่องทางโซเชียลด้านบน
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderColor: 'var(--shop-border, #e7e2d6)',
            color: 'var(--shop-ink-muted, #78716c)',
          }}
        >
          <p>
            © {new Date().getFullYear()} {store.name} · งานทำมือทุกชิ้น สงวนลิขสิทธิ์
          </p>
          <div className="flex items-center gap-5">
            <Link href={`${base}/privacy`} className="hover:opacity-70 transition-opacity">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href={`${base}/terms`} className="hover:opacity-70 transition-opacity">
              ข้อตกลงการใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
