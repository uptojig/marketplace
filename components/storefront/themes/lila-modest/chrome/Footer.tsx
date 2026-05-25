'use client';
import React from 'react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    lineId?: string | null;
  };
  categories: string[];
  accent?: string;
}

export function Footer({ store, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const urls = {
    home: `/stores/${store.slug}`,
    shop: `/stores/${store.slug}/category`,
    about: `/stores/${store.slug}/about`,
    shipping: `/stores/${store.slug}/shipping`,
  };

  return (
    <footer className="bg-[#2a2118] text-[#c4b59b] font-[family:var(--font-prompt)]">
      {/* Top decorative line */}
      <div className="h-1 bg-gradient-to-r from-[#c9974b]/30 via-[#c9974b] to-[#c9974b]/30" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="font-[family:var(--font-kanit)] font-semibold text-xl text-[#f5efe6] tracking-tight">
                {store.name}
              </span>
            )}
            <p className="mt-3 text-xs leading-relaxed text-[#9b8b73] max-w-xs">
              ผ้าคลุมไหล่และเดรสยาว สำหรับผู้หญิงที่ชอบใส่สบาย — ออกแบบและผลิตในประเทศไทย ด้วยผ้าที่ระบายอากาศดี
            </p>

            {/* Social */}
            <div className="mt-5 flex gap-4 items-center">
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  className="text-xs text-[#9b8b73] hover:text-[#c9974b] transition-colors font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              )}
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  className="text-xs text-[#9b8b73] hover:text-[#c9974b] transition-colors font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
              {store.lineId && (
                <span className="text-xs text-[#9b8b73]">
                  LINE: {store.lineId}
                </span>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#f5efe6] font-semibold mb-4">
              หมวดสินค้า
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <a
                    href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                    className="text-xs hover:text-[#c9974b] transition-colors"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#f5efe6] font-semibold mb-4">
              ช่วยเหลือ
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href={urls.about} className="hover:text-[#c9974b] transition-colors">
                  เรื่องของเรา
                </a>
              </li>
              <li>
                <a href={urls.shipping} className="hover:text-[#c9974b] transition-colors">
                  การจัดส่งและคืนสินค้า
                </a>
              </li>
              <li>
                <a href={urls.shop} className="hover:text-[#c9974b] transition-colors">
                  สินค้าทั้งหมด
                </a>
              </li>
            </ul>
          </div>

          {/* Promise */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#f5efe6] font-semibold mb-4">
              สัญญาของเรา
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9b8b73]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9974b] flex-shrink-0" />
                ผ้าเรยอนผสมลินิน ระบายอากาศ
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9974b] flex-shrink-0" />
                ผลิตกับโรงทอผ้าในนครปฐม
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9974b] flex-shrink-0" />
                ส่งฟรีเมื่อสั่งครบ ฿1,500
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3a2f24]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[#6b5c47]">
            © {currentYear} {store.name} — ผ้าคลุมและเดรสยาว ออกแบบในไทย
          </p>
          <div className="flex gap-3 text-[10px] text-[#6b5c47]">
            <span className="font-semibold tracking-wider uppercase">Prompt · Kanit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
