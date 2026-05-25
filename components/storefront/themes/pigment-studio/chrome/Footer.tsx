'use client';

import React from 'react';
import Link from 'next/link';
import { Brush, Instagram, Twitter, Facebook, Paintbrush } from 'lucide-react';

interface PigmentStudioFooterProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export function PigmentStudioFooter({ store }: PigmentStudioFooterProps) {
  const isZugarbox = store.slug === 'zugarbox';

  if (isZugarbox) {
    return (
      <footer className="bg-[#782e11] text-[#fff7ed] relative overflow-hidden pt-16 pb-8 border-t border-[#fed7aa]/20">
        {/* Decorative paint splatters */}
        <div className="absolute top-0 left-10 w-32 h-32 bg-[#f97316] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#facc15] opacity-5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link href={`/stores/${store.slug}`} className="flex items-center gap-2 group mb-4">
                <Paintbrush className="w-8 h-8 text-[#facc15] group-hover:-rotate-12 transition-transform duration-300" />
                <span className="font-[family:var(--font-kanit)] font-bold text-2xl tracking-tight text-white">
                  {store.name}
                </span>
              </Link>
              <p className="font-[family:var(--font-prompt)] text-white font-bold text-lg leading-relaxed mb-4">
                ของใช้น่ารัก & ของแต่งบ้าน
              </p>
            <div className="font-[family:var(--font-prompt)] text-[#fed7aa]/80 space-y-1 text-sm md:text-base leading-relaxed">
                <p>แหล่งรวมของแต่งบ้านและของใช้สุดน่ารักสไตล์มินิมอลและโฮมมี่</p>
                <p>ที่จะช่วยแต่งแต้มความอบอุ่นและสร้างรอยยิ้มในทุกมุมห้องของคุณ</p>
              </div>
            </div>

            <div>
              <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-6 text-[#facc15] flex items-center gap-2">
                <Paintbrush className="w-4 h-4" /> ข้อมูลสินค้า
              </h3>
              <ul className="space-y-3 font-[family:var(--font-prompt)]">
                <li>
                  <Link href={`/stores/${store.slug}/category`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                    สินค้าทั้งหมด
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/category?sort=new`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                    คอลเลกชันใหม่
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/blog`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                    คอมมูนิตี้ของเรา
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/shipping`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                    ราคาค่าจัดส่ง
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-6 text-[#facc15] flex items-center gap-2">
                <Paintbrush className="w-4 h-4" /> ช่วยเหลือ
              </h3>
              <ul className="space-y-3 font-[family:var(--font-prompt)]">
                <li>
                  <Link href={`/stores/${store.slug}/contact`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                    ติดต่อเรา
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/help/order-guide`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                    ติดตามสถานะ
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/returns`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                    การคืนสินค้า
                  </Link>
                </li>
                <li>
                  <Link href={`/stores/${store.slug}/faq`} className="text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all font-semibold">
                    คำถามที่พบบ่อย
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#fed7aa]/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="font-[family:var(--font-prompt)] text-sm text-[#fed7aa]/60">
              สงวนลิขสิทธิ์ &copy; 2026 {store.name}. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#7c2d12] text-[#fff7ed] relative overflow-hidden pt-16 pb-8">
      {/* Decorative paint splatters */}
      <div className="absolute top-0 left-10 w-32 h-32 bg-[#f97316] opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#facc15] opacity-10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-2 group mb-4">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <Brush className="w-8 h-8 text-[#facc15] group-hover:-rotate-12 transition-transform duration-300" />
                  <span className="font-[family:var(--font-kanit)] font-bold text-2xl tracking-tight text-[#fff7ed]">
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            <p className="font-[family:var(--font-prompt)] text-[#fed7aa] max-w-md mt-4 text-lg leading-relaxed">
              สีน้ำ พู่กัน และกระดาษวาดภาพ
            </p>
            <p className="font-[family:var(--font-prompt)] text-[#fff7ed] opacity-80 mt-2">
              เติมสีสันให้กับจินตนาการของคุณด้วยอุปกรณ์ศิลปะที่เราคัดสรรมาอย่างดีที่สุดเพื่อนักวาดทุกระดับ
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="p-2 bg-white/10 hover:bg-[#f97316] hover:text-white rounded-full transition-colors text-[#fed7aa]">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-[#f97316] hover:text-white rounded-full transition-colors text-[#fed7aa]">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-[#f97316] hover:text-white rounded-full transition-colors text-[#fed7aa]">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-6 text-[#facc15] flex items-center gap-2">
              <Paintbrush className="w-4 h-4" /> สตูดิโอ
            </h3>
            <ul className="space-y-3 font-[family:var(--font-prompt)]">
              <li>
                <Link href={`/stores/${store.slug}/about`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/workshop`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                  เวิร์คช็อป
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/blog`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                  บทความศิลปะ
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/contact`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                  ติดต่อสตูดิโอ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-6 text-[#facc15] flex items-center gap-2">
              <Paintbrush className="w-4 h-4" /> ช่วยเหลือ
            </h3>
            <ul className="space-y-3 font-[family:var(--font-prompt)]">
              <li>
                <Link href={`/stores/${store.slug}/shipping`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                  การจัดส่ง
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/returns`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                  การคืนสินค้า
                </Link>
              </li>
              <li>
                <Link href={`/stores/${store.slug}/faq`} className="text-[#fed7aa] hover:text-white hover:underline decoration-[#f97316] decoration-2 underline-offset-4 transition-all">
                  คำถามที่พบบ่อย
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#fed7aa]/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-[family:var(--font-prompt)] text-sm text-[#fed7aa]/60">
            &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 font-[family:var(--font-prompt)] text-sm text-[#fed7aa]/60">
            สร้างด้วย ❤️ เพื่อคนรักศิลปะ
          </div>
        </div>
      </div>
    </footer>
  );
}
