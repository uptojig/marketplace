'use client';
import React from 'react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
  };
  categories: string[];
  accent?: string;
}

export function Footer({ store, categories, accent }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#050505] text-[#737373] border-t border-[#1f1f1f] py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <span className="font-sans font-extrabold text-xl tracking-tighter text-[#fafafa] uppercase">
              {store.name}
            </span>
            <p className="mt-4 text-xs leading-relaxed text-[#525252]">
              สำนักแต่งและจำหน่ายอะไหล่ซิ่งเกรดพรีเมียม สไตล์ Street Racer มั่นใจในคุณภาพ บริการติดตั้งระดับมืออาชีพ
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
                  เกี่ยวกับเรา (18 ปีในลาดพร้าว)
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
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#fafafa] font-bold mb-4">ติดต่อเรา</h4>
            <p className="text-xs leading-relaxed text-[#525252]">
              ลาดพร้าว กรุงเทพมหานคร<br />
              เปิดให้บริการทุกวัน 09:00 - 20:00 น.
            </p>
          </div>

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
