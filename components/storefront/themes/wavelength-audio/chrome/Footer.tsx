'use client';

import React from 'react';
import Link from 'next/link';

export function WavelengthAudioFooter({ store }: { store: any }) {
  return (
    <footer className="bg-[#f4f4f5] text-[#0a0a0a] py-24 pb-48">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-md">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain mb-6" />
            ) : (
              <h3 className="font-[family:var(--font-prompt)] text-3xl tracking-[0.16em] uppercase font-bold mb-6">
                {store.name}
              </h3>
            )}
            <p className="font-[family:var(--font-kanit)] text-[#0a0a0a]/60 text-lg leading-relaxed">
              หูฟัง over-ear รุ่นเดียว ทุกอย่างทำเพื่อเสียง
            </p>
          </div>
          <div className="grid grid-cols-2 gap-16 font-[family:var(--font-kanit)] text-sm">
            <div className="flex flex-col gap-5">
              <h4 className="text-[#0a0a0a]/40 tracking-widest uppercase mb-2 font-medium">นโยบาย</h4>
              <Link href="#" className="hover:text-[#dc2626] transition-colors font-medium">การรับประกัน</Link>
              <Link href="#" className="hover:text-[#dc2626] transition-colors font-medium">นโยบายความเป็นส่วนตัว</Link>
              <Link href="#" className="hover:text-[#dc2626] transition-colors font-medium">เงื่อนไขการให้บริการ</Link>
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="text-[#0a0a0a]/40 tracking-widest uppercase mb-2 font-medium">ติดต่อ</h4>
              <Link href="#" className="hover:text-[#dc2626] transition-colors font-medium">ศูนย์บริการลูกค้า</Link>
              <Link href="#" className="hover:text-[#dc2626] transition-colors font-medium">ตัวแทนจำหน่าย</Link>
            </div>
          </div>
        </div>
        <div className="mt-32 pt-10 border-t border-[#0a0a0a]/10 text-center font-[family:var(--font-kanit)] text-sm text-[#0a0a0a]/40 font-medium">
          &copy; {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์.
        </div>
      </div>
    </footer>
  );
}
