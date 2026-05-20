'use client';

import React from 'react';
import Link from 'next/link';

export function KeystrokeLabFooter({ store }: any) {
  return (
    <footer className="bg-[#020617] border-t border-[#1e293b] text-[#94a3b8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-[family:var(--font-prompt)] font-bold text-xl tracking-[0.12em] text-white uppercase mb-4 block">
              {store.name}
            </span>
            <p className="font-[family:var(--font-kanit)] text-sm max-w-sm mb-6 text-[#64748b]">
              คีย์บอร์ดและเมาส์สำหรับสายโปรแกรมเมอร์
            </p>
          </div>
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-medium text-[#22d3ee] mb-4 uppercase tracking-[0.12em] text-xs">
              สินค้า
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${store.slug}/products`} className="font-[family:var(--font-kanit)] text-sm hover:text-white transition-colors">
                  คีย์บอร์ด
                </Link>
              </li>
              <li>
                <Link href={`/${store.slug}/products`} className="font-[family:var(--font-kanit)] text-sm hover:text-white transition-colors">
                  สวิตช์
                </Link>
              </li>
              <li>
                <Link href={`/${store.slug}/products`} className="font-[family:var(--font-kanit)] text-sm hover:text-white transition-colors">
                  เมาส์
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-medium text-[#22d3ee] mb-4 uppercase tracking-[0.12em] text-xs">
              ช่วยเหลือ
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="font-[family:var(--font-kanit)] text-sm hover:text-white transition-colors">
                  ติดตามสถานะ
                </Link>
              </li>
              <li>
                <Link href="#" className="font-[family:var(--font-kanit)] text-sm hover:text-white transition-colors">
                  การรับประกัน
                </Link>
              </li>
              <li>
                <Link href="#" className="font-[family:var(--font-kanit)] text-sm hover:text-white transition-colors">
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#1e293b] flex flex-col md:flex-row items-center justify-between">
          <p className="font-[family:var(--font-prompt)] text-xs text-[#64748b] tracking-[0.12em]">
            &copy; {new Date().getFullYear()} {store.name}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
