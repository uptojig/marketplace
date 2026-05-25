'use client';
import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

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
 * CaseINW — deep charcoal mega-footer with acid-green section rules.
 *
 * Newsletter band sits above the four-column grid (brand / shop /
 * support / community). Payment badges + LINE/IG/FB social row sit
 * along the bottom rule with copyright.
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

  const addressLine = [
    store.addressLine1,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <footer className="bg-[#0E0E12] text-white mt-16 font-[family:var(--font-prompt)]">
      {/* Newsletter band */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="absolute -top-32 right-0 h-80 w-80 rounded-full blur-3xl opacity-30"
          style={{ background: 'var(--shop-primary, #8B5CF6)' }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 left-0 h-80 w-80 rounded-full blur-3xl opacity-20"
          style={{ background: '#A3E635' }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.32em] mb-3"
              style={{ color: '#A3E635' }}
            >
              ★ Drop List
            </p>
            <h3 className="font-[family:var(--font-kanit)] text-3xl md:text-4xl font-black uppercase tracking-tight">
              เป็นคนแรกที่รู้
              <br />
              <span
                style={{
                  backgroundImage:
                    'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                เมื่อมี Drop ใหม่
              </span>
            </h3>
            <p className="text-white/60 text-sm mt-3 max-w-md">
              สมัครรับ Drop List รับโค้ดส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก
            </p>
          </div>
          <form
            className="flex w-full rounded-full overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md p-1.5"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="คุณ@อีเมล.com"
              className="bg-transparent flex-1 px-5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-label="อีเมล"
            />
            <button
              type="submit"
              className="font-extrabold uppercase text-[11px] tracking-[0.22em] px-6 py-3 rounded-full transition hover:scale-[1.02]"
              style={{
                background:
                  'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                color: '#FFFFFF',
              }}
            >
              สมัคร →
            </button>
          </form>
        </div>
      </section>

      {/* Main 4-column grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-5 md:col-span-2 lg:col-span-1">
          <Link href={urls.home} className="inline-flex items-baseline">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="font-[family:var(--font-kanit)] font-black text-3xl uppercase tracking-[-0.02em] inline-flex items-baseline">
                <span
                  style={{
                    backgroundImage:
                      'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {store.name}
                </span>
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block w-2 h-2 rounded-full"
                  style={{ background: '#A3E635' }}
                />
              </span>
            )}
          </Link>
          <p className="text-white/55 text-sm leading-relaxed">
            {store.tagline ||
              store.description ||
              'เคสมือถือดีไซน์เฉพาะตัว · กันกระแทกระดับ military grade · พิมพ์ชื่อ-รูปคุณได้ทุกอัน'}
          </p>
          {(store.contactEmail || store.contactPhone) && (
            <div className="text-xs text-white/55 space-y-1">
              {store.contactEmail && <p>✉ {store.contactEmail}</p>}
              {store.contactPhone && <p>☎ {store.contactPhone}</p>}
            </div>
          )}
        </div>

        <div>
          <h3
            className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-5"
            style={{ color: '#A3E635' }}
          >
            ช้อป
          </h3>
          <ul className="space-y-3 text-sm text-white/65">
            {categories.slice(0, 6).map((cat) => (
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

        <div>
          <h3
            className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-5"
            style={{ color: '#A3E635' }}
          >
            ช่วยเหลือ
          </h3>
          <ul className="space-y-3 text-sm text-white/65">
            <li>
              <Link href={urls.shipping} className="hover:text-white transition">
                การจัดส่ง
              </Link>
            </li>
            <li>
              <Link href={urls.returns} className="hover:text-white transition">
                เปลี่ยน-คืน 30 วัน
              </Link>
            </li>
            <li>
              <Link href={urls.help} className="hover:text-white transition">
                คำถามที่พบบ่อย
              </Link>
            </li>
            <li>
              <Link href={urls.contact} className="hover:text-white transition">
                ติดต่อเรา
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3
            className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-5"
            style={{ color: '#A3E635' }}
          >
            ติดตาม
          </h3>
          <div className="flex flex-wrap gap-2">
            {store.instagramUrl && (
              <a
                href={store.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
            )}
            {store.facebookUrl && (
              <a
                href={store.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            )}
            {store.lineId && (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.18em] text-white/70">
                <MessageCircle size={14} /> LINE · {store.lineId}
              </span>
            )}
            {!store.instagramUrl && !store.facebookUrl && !store.lineId && (
              <p className="text-xs text-white/40">@{store.slug}</p>
            )}
          </div>
          {addressLine && (
            <p className="text-[11px] text-white/40 mt-5 leading-relaxed">{addressLine}</p>
          )}
        </div>
      </div>

      {/* Bottom rule */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-white/45">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {year} {store.name}</span>
            <span aria-hidden="true">·</span>
            <Link href={urls.privacy} className="hover:text-white transition">
              นโยบายความเป็นส่วนตัว
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={urls.terms} className="hover:text-white transition">
              เงื่อนไขการใช้บริการ
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/40">
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              PromptPay
            </span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              TrueMoney
            </span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">COD</span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              บัตรเครดิต
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
