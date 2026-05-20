'use client';
import React from 'react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
  };
  categories: string[];
}

export function Footer({ store, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#fff7ed] text-[#7f1d1d] border-t border-[#fdba74] py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Factory Stamp */}
          <div className="space-y-4">
            <span className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626] uppercase">
              {store.name}
            </span>
            <p className="text-xs leading-relaxed text-[#9a3412]">
              เราดีลโดยตรงกับผู้ผลิตรายใหญ่ นำเข้าสายชาร์จ หูฟัง และของตกแต่งโต๊ะทำงาน คุณภาพดี ราคาโรงงาน ส่งตรงถึงบ้านคุณ
            </p>
            <div className="bg-yellow-300 text-[#dc2626] text-[10px] font-[family:var(--font-kanit)] font-black border border-red-500 px-2 py-1 inline-block rotate-[-1deg] shadow-sm">
              ส่งเร็วพิเศษ · เก็บปลายทาง
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

          {/* Shipping info */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#dc2626] font-extrabold mb-4 font-[family:var(--font-kanit)]">การจัดส่งสินค้า</h4>
            <p className="text-xs leading-relaxed text-[#9a3412] font-[family:var(--font-prompt)]">
              ตัดรอบเวลา 14:00 น. จัดส่งผ่านเคอรี่เอ็กซ์เพรสและไปรษณีย์ไทย รอรับสินค้า 1-2 วันทำการ
            </p>
          </div>

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
