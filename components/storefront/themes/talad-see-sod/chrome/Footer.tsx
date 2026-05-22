'use client';
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
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

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

export function Footer({ store, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const line1 = joinAddress([store.addressLine1, store.addressLine2]);
  const line2 = joinAddress([store.subdistrict, store.district]);
  const line3 = joinAddress([store.province, store.postalCode]);
  const hasAddress = line1 || line2 || line3;
  const hasContact = !!(store.contactEmail || store.contactPhone || hasAddress);
  const blurb = store.description?.trim() ||
    store.tagline?.trim() ||
    'เราดีลโดยตรงกับผู้ผลิตรายใหญ่ นำเข้าสายชาร์จ หูฟัง และของตกแต่งโต๊ะทำงาน คุณภาพดี ราคาโรงงาน ส่งตรงถึงบ้านคุณ';

  return (
    <footer className="bg-[#fff7ed] text-[#7f1d1d] border-t border-[#fdba74] py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 ${hasContact ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-8 mb-12`}>

          {/* Brand & Factory Stamp */}
          <div className="space-y-4 lg:col-span-2">
            <span className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626] uppercase">
              {store.name}
            </span>
            <p className="text-xs leading-relaxed text-[#9a3412]">
              {blurb}
            </p>
            <div className="bg-yellow-300 text-[#dc2626] text-[10px] font-[family:var(--font-kanit)] font-black border border-red-500 px-2 py-1 inline-block rotate-[-1deg] shadow-sm">
              ส่งเร็วพิเศษ · รับประกันของแท้
            </div>
          </div>

          {/* Catalog links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#dc2626] font-extrabold mb-4 font-[family:var(--font-kanit)]">หมวดหมู่แนะนำ</h4>
            <ul className="space-y-2 text-xs font-[family:var(--font-prompt)] font-semibold">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <a
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(category)}`}
                    className="hover:text-[#dc2626] transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop benefits */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#dc2626] font-extrabold mb-4 font-[family:var(--font-kanit)]">ทำไมต้องเลือกเรา?</h4>
            <ul className="space-y-2 text-xs font-[family:var(--font-prompt)]">
              <li>• ส่งของออกทุกวัน ไม่มีวันหยุด</li>
              <li>• ตรวจสอบสินค้าทุกชิ้นก่อนส่ง</li>
              <li>• รับประกันความพอใจ คืนเงินใน 7 วัน</li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#dc2626] font-extrabold mb-4 font-[family:var(--font-kanit)]">
              บริการลูกค้า
            </h4>
            <ul className="space-y-2 text-xs font-[family:var(--font-prompt)] font-semibold">
              <li><a href={`/stores/${store.slug}/help/order-guide`} className="hover:text-[#dc2626] transition-colors">วิธีสั่งซื้อ</a></li>
              <li><a href={`/stores/${store.slug}/shipping`} className="hover:text-[#dc2626] transition-colors">การจัดส่ง</a></li>
              <li><a href={`/stores/${store.slug}/returns`} className="hover:text-[#dc2626] transition-colors">เปลี่ยน / คืน</a></li>
              <li><a href={`/stores/${store.slug}/faq`} className="hover:text-[#dc2626] transition-colors">FAQ</a></li>
              <li><a href={`/stores/${store.slug}/terms`} className="hover:text-[#dc2626] transition-colors">ข้อกำหนด</a></li>
              <li><a href={`/stores/${store.slug}/privacy`} className="hover:text-[#dc2626] transition-colors">ความเป็นส่วนตัว</a></li>
              <li><a href={`/stores/${store.slug}/about`} className="hover:text-[#dc2626] transition-colors">เกี่ยวกับเรา</a></li>
            </ul>
          </div>

          {/* Contact + Address (operator-edited; hidden when empty) */}
          {hasContact && (
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#dc2626] font-extrabold mb-4 font-[family:var(--font-kanit)]">
                ที่อยู่ &amp; ช่องทาง
              </h4>
              <ul className="space-y-2 text-xs text-[#9a3412] font-[family:var(--font-prompt)]">
                {hasAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#dc2626] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      {line1 && <div>{line1}</div>}
                      {line2 && <div>{line2}</div>}
                      {line3 && <div>{line3}</div>}
                      {store.country && (
                        <div>
                          {store.country === 'TH' ? 'ประเทศไทย' : store.country}
                        </div>
                      )}
                    </div>
                  </li>
                )}
                {store.contactEmail && (
                  <li className="flex items-center gap-2">
                    <Mail size={14} className="text-[#dc2626] shrink-0" />
                    <a
                      href={`mailto:${store.contactEmail}`}
                      className="hover:text-[#dc2626] transition-colors break-all"
                    >
                      {store.contactEmail}
                    </a>
                  </li>
                )}
                {store.contactPhone && (
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="text-[#dc2626] shrink-0" />
                    <a
                      href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                      className="hover:text-[#dc2626] transition-colors"
                    >
                      {store.contactPhone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

        </div>

        {/* Bottom footer */}
        <div className="pt-8 border-t border-[#fdba74] text-center text-xs text-[#9a3412] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} {store.name}. จัดส่งจากกรุงเทพฯ ประเทศไทย.</p>
          <div className="flex gap-4">
            <span className="font-extrabold text-[10px] text-yellow-600 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded">KANIT BLACK DESIGN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
