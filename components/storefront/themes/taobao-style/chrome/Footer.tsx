'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Headphones, CreditCard, Flame } from 'lucide-react';
import { PaymentLogos } from '@/components/storefront/payment-logos';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
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

/**
 * taobao-style — marketplace-style footer.
 *
 * Mirrors the dense info architecture of a China e-commerce site:
 *   row 1   four trust strip icons (guarantee · shipping · service · pay)
 *   row 2   four-column link grid (categories · service · about · contact)
 *   row 3   copyright + payment methods + flash chip
 */
export function Footer({ store, categories }: FooterProps) {
  const year = new Date().getFullYear();

  const trustIcons = [
    { Icon: ShieldCheck, title: 'คัดสรรคุณภาพ', sub: 'ทุกออเดอร์ตรวจก่อนส่ง 100%' },
    { Icon: Truck, title: 'ส่งฟรีทั่วประเทศ', sub: 'เมื่อสั่งครบ ฿199.-' },
    { Icon: Headphones, title: 'แชทตอบไว 24 ชม.', sub: 'มีทีมงานคนไทยดูแล' },
    { Icon: CreditCard, title: 'จ่ายผ่าน ANYPAY', sub: 'พร้อมเพย์ · บัตรเครดิต · TrueMoney' },
  ];

  return (
    <footer
      className="font-[family:var(--font-prompt)]"
      style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Trust strip */}
      <div className="border-y" style={{ borderColor: 'var(--shop-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustIcons.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--shop-bg-soft)', color: 'var(--shop-primary)' }}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-[family:var(--font-kanit)] font-bold text-sm truncate">
                  {title}
                </p>
                <p
                  className="text-[11px] font-[family:var(--font-prompt)] truncate"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <span
                className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight inline-block"
                style={{ color: 'var(--shop-primary)' }}
              >
                {store.name}
              </span>
            )}
            <p
              className="text-xs leading-relaxed font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              มาร์เก็ตเพลสสไตล์เถาเป่า รวมสินค้าราคาโรงงาน แฟลชเซลล์ทุกวัน
              ส่งตรงจากผู้ขาย ไม่ผ่านคนกลาง
            </p>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-[family:var(--font-kanit)] font-extrabold uppercase"
              style={{
                background: 'var(--shop-accent)',
                color: 'var(--shop-ink)',
                border: `1px solid var(--shop-ink)`,
              }}
            >
              <Flame size={11} /> Flash Sale ทุกวัน
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4
              className="text-[11px] uppercase tracking-widest font-extrabold mb-3 font-[family:var(--font-kanit)]"
              style={{ color: 'var(--shop-primary)' }}
            >
              หมวดหมู่ยอดฮิต
            </h4>
            <ul
              className="space-y-2 text-xs font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {categories.slice(0, 6).map((c) => (
                <li key={c}>
                  <a
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(c)}`}
                    className="hover:text-[color:var(--shop-primary)] transition-colors"
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4
              className="text-[11px] uppercase tracking-widest font-extrabold mb-3 font-[family:var(--font-kanit)]"
              style={{ color: 'var(--shop-primary)' }}
            >
              บริการลูกค้า
            </h4>
            <ul
              className="space-y-2 text-xs font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <li>
                <Link href={`/stores/${store.slug}/help/order-guide`} className="hover:underline">
                  วิธีการสั่งซื้อ
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/help/shipping`} className="hover:underline">
                  การจัดส่ง · ค่าส่ง
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/help/refund`} className="hover:underline">
                  การคืนสินค้า · คืนเงิน
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/help/warranty`} className="hover:underline">
                  คัดสรรคุณภาพ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-[11px] uppercase tracking-widest font-extrabold mb-3 font-[family:var(--font-kanit)]"
              style={{ color: 'var(--shop-primary)' }}
            >
              ติดต่อร้านค้า
            </h4>
            <ul
              className="space-y-2 text-xs font-[family:var(--font-prompt)]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {store.contactPhone && <li>โทร: {store.contactPhone}</li>}
              {store.contactEmail && <li>อีเมล: {store.contactEmail}</li>}
              {store.lineId && <li>LINE: @{store.lineId}</li>}
              {(store.addressLine1 || store.subdistrict || store.district || store.province) && (
                <li className="pt-1">
                  ที่อยู่:&nbsp;
                  {[
                    store.addressLine1,
                    store.addressLine2,
                    store.subdistrict,
                    store.district,
                    store.province,
                    store.postalCode,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </li>
              )}
              <li>ตอบกลับใน 1-2 ชั่วโมง · 09:00 - 22:00</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'var(--shop-border)' }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-[family:var(--font-prompt)]"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <p>
            © {year} {store.name} · ทุกการสั่งซื้อปลอดภัย รับประกันคืนเงิน
          </p>
          <PaymentLogos compact only={['promptpay']} />

        </div>
      </div>
    </footer>
  );
}
