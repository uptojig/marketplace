'use client';
import React from 'react';
import Link from 'next/link';
import { Shield, Truck, Package } from 'lucide-react';

export interface FooterProps {
  store: {
    id?: string;
    name: string;
    slug: string;
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
  };
  categories: string[];
}

/**
 * BlackWrapp — premium dark footer.
 *
 * Five compact columns on desktop, single column on mobile.
 * Address composed from individual `store.*` fields (no hardcoded
 * studio location). All info links wrapped in <Link> so client-side
 * navigation stays snappy.
 */
export function Footer({ store, categories }: FooterProps) {
  const year = new Date().getFullYear();

  const urls = {
    home: `/stores/${store.slug}`,
    shop: `/stores/${store.slug}/category`,
    cart: `/stores/${store.slug}/cart`,
    about: `/stores/${store.slug}/about`,
    contact: `/stores/${store.slug}/contact`,
    shipping: `/stores/${store.slug}/shipping`,
    returns: `/stores/${store.slug}/returns`,
    privacy: `/stores/${store.slug}/privacy`,
    terms: `/stores/${store.slug}/terms`,
  };

  // Compose address from individual store fields, dropping empties.
  const addressParts: string[] = [
    [store.addressLine1, store.addressLine2].filter(Boolean).join(' '),
    [store.subdistrict, store.district].filter(Boolean).join(' '),
    [store.province, store.postalCode].filter(Boolean).join(' '),
  ].filter((s) => s.trim().length > 0);

  return (
    <footer
      className="font-[family:var(--font-prompt)] border-t border-white/5"
      style={{ background: '#0A0A0A', color: '#A1A1AA' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 space-y-5">
            <Link
              href={urls.home}
              className="inline-flex items-center gap-2 group"
            >
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full font-[family:var(--font-kanit)] font-medium text-sm"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary))',
                  color: '#0A0A0A',
                  boxShadow: '0 0 18px var(--shop-primary, #00FF88)40',
                }}
              >
                {store.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-[family:var(--font-kanit)] font-medium text-lg tracking-[0.15em] text-white">
                {store.name}
              </span>
            </Link>
            {store.tagline ? (
              <p className="text-xs leading-relaxed text-white/55 max-w-sm">
                {store.tagline}
              </p>
            ) : null}
            {store.description ? (
              <p className="text-xs leading-relaxed text-white/55 max-w-sm">
                {store.description}
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-white/55 max-w-sm">
                ห่อพรีเมียมสำหรับสินค้าจัดส่ง — รับประกันคุณภาพทุกชิ้น
                ส่งทั่วประเทศ
              </p>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-white/70"
              >
                <Shield
                  size={11}
                  strokeWidth={2}
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                />
                DELIVERED
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-white/70"
              >
                <Truck
                  size={11}
                  strokeWidth={2}
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                />
                ส่งฟรี
              </span>
            </div>
          </div>

          {/* Shop */}
          <nav className="col-span-1 md:col-span-2" aria-label="ร้านค้า">
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white mb-5 font-medium">
              ร้านค้า
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                    className="text-xs text-white/55 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li>
                  <Link
                    href={urls.shop}
                    className="text-xs text-white/55 hover:text-white transition-colors"
                  >
                    สินค้าทั้งหมด
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Help */}
          <nav className="col-span-1 md:col-span-2" aria-label="ช่วยเหลือ">
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white mb-5 font-medium">
              ช่วยเหลือ
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={urls.shipping}
                  className="text-xs text-white/55 hover:text-white transition-colors"
                >
                  การจัดส่ง
                </Link>
              </li>
              <li>
                <Link
                  href={urls.returns}
                  className="text-xs text-white/55 hover:text-white transition-colors"
                >
                  การคืนสินค้า
                </Link>
              </li>
              <li>
                <Link
                  href={urls.privacy}
                  className="text-xs text-white/55 hover:text-white transition-colors"
                >
                  ความเป็นส่วนตัว
                </Link>
              </li>
              <li>
                <Link
                  href={urls.terms}
                  className="text-xs text-white/55 hover:text-white transition-colors"
                >
                  เงื่อนไขการใช้บริการ
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="col-span-2 md:col-span-4">
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white mb-5 font-medium">
              ติดต่อเรา
            </h4>
            <ul className="space-y-2.5">
              {store.contactPhone ? (
                <li className="text-xs text-white/55">
                  <a
                    href={`tel:${store.contactPhone}`}
                    className="hover:text-white transition-colors"
                  >
                    {store.contactPhone}
                  </a>
                </li>
              ) : null}
              {store.contactEmail ? (
                <li className="text-xs text-white/55">
                  <a
                    href={`mailto:${store.contactEmail}`}
                    className="hover:text-white transition-colors"
                  >
                    {store.contactEmail}
                  </a>
                </li>
              ) : null}
              {addressParts.length > 0 && (
                <li className="text-xs leading-relaxed text-white/55">
                  {addressParts.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </li>
              )}
              {store.lineId ? (
                <li className="text-xs text-white/55">LINE: {store.lineId}</li>
              ) : null}
            </ul>

            {/* Social */}
            {(store.facebookUrl || store.instagramUrl) && (
              <div className="flex gap-3 mt-5">
                {store.facebookUrl && (
                  <a
                    href={store.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {store.instagramUrl && (
                  <a
                    href={store.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] tracking-[0.15em] text-white/40">
            © {year} {store.name}
          </p>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-white/40">
            <Package
              size={11}
              strokeWidth={2}
              style={{ color: 'var(--shop-primary, #00FF88)' }}
            />
            <span>จ่ายผ่าน ANYPAY · DELIVERED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
