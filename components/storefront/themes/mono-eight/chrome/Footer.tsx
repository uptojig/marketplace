'use client';
import React from 'react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    lineId?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  categories: string[];
}

const DEFAULT_BRAND_COPY =
  'เสื้อผ้าคุณภาพ ออกแบบและตัดเย็บใส่ใจทุกขั้นตอน';

export function Footer({ store, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const urls = {
    home: `/stores/${store.slug}`,
    shop: `/stores/${store.slug}/category`,
  };

  const brandCopy =
    store.description?.trim() ||
    store.tagline?.trim() ||
    DEFAULT_BRAND_COPY;

  const addressParts = [
    store.addressLine1,
    store.addressLine2,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
    store.country,
  ].filter((p): p is string => Boolean(p && p.trim()));

  const hasAnyContact =
    addressParts.length > 0 ||
    Boolean(store.contactEmail) ||
    Boolean(store.contactPhone) ||
    Boolean(store.lineId);

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1c1c1c]">

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Brand column */}
          <div className="md:col-span-5 space-y-5">
            <a href={urls.home}>
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <span className="font-[family:var(--font-kanit)] font-black text-lg uppercase tracking-[0.2em] text-[#e8e2d4]">
                  {store.name}
                </span>
              )}
            </a>
            <p className="font-[family:var(--font-prompt)] text-xs leading-relaxed text-[#e8e2d4]/50 max-w-sm">
              {brandCopy}
            </p>
          </div>

          {/* Categories */}
          <div className="md:col-span-3">
            <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/40 block mb-4">
              หมวดหมู่
            </span>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((c) => (
                <li key={c}>
                  <a
                    href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
                    className="font-[family:var(--font-prompt)] text-xs text-[#e8e2d4]/60 hover:text-[#e8e2d4] transition-colors duration-300"
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/40 block mb-4">
              ข้อมูล
            </span>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`/stores/${store.slug}/about`}
                  className="font-[family:var(--font-prompt)] text-xs text-[#e8e2d4]/60 hover:text-[#e8e2d4] transition-colors duration-300"
                >
                  เกี่ยวกับเรา
                </a>
              </li>
              <li>
                <a
                  href={`/stores/${store.slug}/help`}
                  className="font-[family:var(--font-prompt)] text-xs text-[#e8e2d4]/60 hover:text-[#e8e2d4] transition-colors duration-300"
                >
                  วิธีสั่งซื้อ
                </a>
              </li>
              <li>
                <a
                  href={`/stores/${store.slug}/help?page=shipping`}
                  className="font-[family:var(--font-prompt)] text-xs text-[#e8e2d4]/60 hover:text-[#e8e2d4] transition-colors duration-300"
                >
                  การจัดส่ง
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          {hasAnyContact && (
            <div className="md:col-span-2">
              <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/40 block mb-4">
                ติดต่อ
              </span>
              <ul className="font-[family:var(--font-prompt)] text-xs text-[#e8e2d4]/60 leading-relaxed space-y-1.5">
                {addressParts.length > 0 && <li>{addressParts.join(' ')}</li>}
                {store.contactPhone && (
                  <li>
                    <a href={`tel:${store.contactPhone}`} className="hover:text-[#e8e2d4] transition-colors">{store.contactPhone}</a>
                  </li>
                )}
                {store.contactEmail && (
                  <li>
                    <a href={`mailto:${store.contactEmail}`} className="hover:text-[#e8e2d4] transition-colors break-all">{store.contactEmail}</a>
                  </li>
                )}
                {store.lineId && <li>LINE {store.lineId}</li>}
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-[family:var(--font-prompt)] text-[10px] text-[#e8e2d4]/30 tracking-wider">
            © {currentYear} {store.name}
          </span>
          <span className="font-[family:var(--font-kanit)] text-[9px] font-black uppercase tracking-[0.3em] text-[#e8e2d4]/20">
            MONO EIGHT
          </span>
        </div>
      </div>

    </footer>
  );
}
