'use client';
import React from 'react';
import Link from 'next/link';

export interface FooterProps {
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
 * Casetify Clone — black 4-column footer.
 *
 * Brand column (logo + tagline), Shop column (categories), Support
 * column (legal links), Newsletter column (email + JOIN button).
 * Bottom rule shows copyright + secondary legal links — matches the
 * CASETiFY-clone Footer.tsx in the source zip.
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
    help: `/stores/${store.slug}/help`,
  };

  return (
    <footer className="bg-black text-white py-16 px-6 lg:px-12 mt-12 font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link href={urls.home} className="flex items-center">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="font-[family:var(--font-kanit)] font-black text-3xl tracking-tighter text-white uppercase">
                {store.name}
                <span
                  className="ml-0.5 text-4xl leading-none"
                  style={{ color: 'var(--shop-primary, #EA1C5C)' }}
                >
                  .
                </span>
              </span>
            )}
          </Link>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            {store.tagline ||
              store.description ||
              'Show your colors. แสดงตัวตนของคุณผ่านเคสมือถือและแอกเซสซอรี่ดีไซน์เฉพาะตัว.'}
          </p>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">ร้านค้า</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            {categories.slice(0, 5).map((cat) => (
              <li key={cat}>
                <Link
                  href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                  className="hover:text-white transition"
                >
                  {cat}
                </Link>
              </li>
            ))}
            {categories.length === 0 && (
              <li>
                <Link href={urls.shop} className="hover:text-white transition">
                  สินค้าทั้งหมด
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">ช่วยเหลือ</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link href={urls.contact} className="hover:text-white transition">
                ติดต่อเรา
              </Link>
            </li>
            <li>
              <Link href={urls.shipping} className="hover:text-white transition">
                การจัดส่ง
              </Link>
            </li>
            <li>
              <Link href={urls.returns} className="hover:text-white transition">
                การคืนสินค้า
              </Link>
            </li>
            <li>
              <Link href={urls.help} className="hover:text-white transition">
                คำถามที่พบบ่อย
              </Link>
            </li>
            <li>
              <Link href={urls.privacy} className="hover:text-white transition">
                ความเป็นส่วนตัว
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">รับข่าวสาร</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            สมัครรับจดหมายข่าวเพื่อรับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก
          </p>
          <form
            className="flex rounded-md overflow-hidden"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="กรอกอีเมล"
              className="bg-gray-800 text-white px-4 py-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-white"
              aria-label="อีเมล"
            />
            <button
              type="submit"
              className="font-bold uppercase text-xs px-4 py-2 transition hover:opacity-90"
              style={{
                background: 'var(--shop-primary-gradient, var(--shop-primary, #EA1C5C))',
                color: '#ffffff',
              }}
            >
              JOIN
            </button>
          </form>
          {(store.facebookUrl || store.instagramUrl || store.lineId) && (
            <div className="flex flex-wrap gap-4 mt-5 text-[11px] tracking-[0.2em] uppercase text-gray-400">
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Facebook
                </a>
              )}
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Instagram
                </a>
              )}
              {store.lineId && <span>LINE: {store.lineId}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs flex flex-col md:flex-row justify-between items-center gap-3">
        <p>© {year} {store.name}</p>
        <div className="flex space-x-4">
          <Link href={urls.privacy} className="hover:text-white transition">
            Privacy Policy
          </Link>
          <Link href={urls.terms} className="hover:text-white transition">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
