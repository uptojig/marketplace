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
    facebookUrl?: string | null;
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
  categories: string[];
  accent?: string;
}

const DEFAULT_BRAND_COPY =
  'สินค้าคุณภาพ คัดสรรอย่างพิถีพิถัน พร้อมบริการที่ใส่ใจทุกขั้นตอน';

export function Footer({ store, categories, accent }: FooterProps) {
  const currentYear = new Date().getFullYear();
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
  ].filter((p): p is string => Boolean(p && p.trim()));
  const hasAddress = addressParts.length > 0;

  const hasAnyContact =
    hasAddress || Boolean(store.contactEmail) || Boolean(store.contactPhone) || Boolean(store.lineId);

  return (
    <footer className="bg-[#050505] text-[#737373] border-t border-[#1f1f1f] py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand Info */}
          <div className="md:col-span-1">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="font-sans font-extrabold text-xl tracking-tighter text-[#fafafa] uppercase">
                {store.name}
              </span>
            )}
            <p className="mt-4 text-xs leading-relaxed text-[#525252]">
              {brandCopy}
            </p>
            <div className="mt-4 flex gap-4">
              {store.facebookUrl && (
                <a href={store.facebookUrl} className="text-[#a3a3a3] hover:text-[#facc15] text-xs uppercase tracking-wider font-semibold">
                  FB
                </a>
              )}
              {store.instagramUrl && (
                <a href={store.instagramUrl} className="text-[#a3a3a3] hover:text-[#facc15] text-xs uppercase tracking-wider font-semibold">
                  IG
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#fafafa] font-bold mb-4">หมวดหมู่สินค้า</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <a
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(category)}`}
                    className="text-xs hover:text-[#facc15] transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#fafafa] font-bold mb-4">บริการลูกค้า</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href={`/stores/${store.slug}/about`} className="hover:text-[#facc15] transition-colors">
                  เกี่ยวกับเรา
                </a>
              </li>
              <li>
                <a href={`/stores/${store.slug}/shipping`} className="hover:text-[#facc15] transition-colors">
                  การจัดส่งและการคืนสินค้า
                </a>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          {hasAnyContact && (
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#fafafa] font-bold mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-xs leading-relaxed text-[#525252]">
                {hasAddress && <li>{addressParts.join(' ')}</li>}
                {store.contactPhone && (
                  <li>
                    <a href={`tel:${store.contactPhone}`} className="hover:text-[#facc15] transition-colors">{store.contactPhone}</a>
                  </li>
                )}
                {store.contactEmail && (
                  <li>
                    <a href={`mailto:${store.contactEmail}`} className="hover:text-[#facc15] transition-colors break-all">{store.contactEmail}</a>
                  </li>
                )}
                {store.lineId && <li>LINE {store.lineId}</li>}
              </ul>
            </div>
          )}

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#1f1f1f] text-center text-[10px] text-[#525252] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} {store.name}. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="font-semibold uppercase tracking-widest text-[#262626]">PROMPT SANS THAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
