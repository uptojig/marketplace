'use client';

import React from 'react';

export function HinokiFooter({ store }: { store: any }) {
  return (
    <footer className="bg-[#3f2e1e] text-[#e6d5b8] pt-20 pb-10 border-t border-[#3f2e1e]/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col space-y-6 md:pr-12 border-b md:border-b-0 md:border-r border-[#e6d5b8]/10 pb-12 md:pb-0">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <h2 className="text-2xl font-[family:var(--font-prompt)] text-[#f6efe2] font-light tracking-widest uppercase">
                {store.name}
              </h2>
            )}
            <p className="font-[family:var(--font-prompt)] text-sm font-light leading-relaxed opacity-80">
              น้ำหอมและเทียนหอมที่เริ่มจากเรื่องเล่า
              <br />ทุกกลิ่นออกแบบรอบเรื่องสั้น 1 เรื่อง
            </p>
            <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="email-address" className="sr-only">สมัครรับเรื่องเล่าใหม่</label>
              <div className="flex border-b border-[#e6d5b8]/30 pb-2">
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent border-0 px-0 py-1 text-sm text-[#f6efe2] placeholder-[#e6d5b8]/50 focus:ring-0 font-[family:var(--font-prompt)] focus:outline-none"
                  placeholder="อีเมลของคุณ"
                />
                <button
                  type="submit"
                  className="ml-4 flex-shrink-0 text-sm font-[family:var(--font-prompt)] text-[#a87a4b] hover:text-[#f6efe2] transition-colors uppercase tracking-widest"
                >
                  สมัครรับจดหมาย
                </button>
              </div>
            </form>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-semibold tracking-widest text-[#a87a4b] uppercase mb-4 font-[family:var(--font-prompt)]">บทประพันธ์</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm hover:text-[#f6efe2] transition-colors font-[family:var(--font-prompt)] font-light">เรื่องที่ 1-10</a></li>
                <li><a href="#" className="text-sm hover:text-[#f6efe2] transition-colors font-[family:var(--font-prompt)] font-light">เรื่องที่ 11-20</a></li>
                <li><a href="#" className="text-sm hover:text-[#f6efe2] transition-colors font-[family:var(--font-prompt)] font-light">ตอนพิเศษ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-widest text-[#a87a4b] uppercase mb-4 font-[family:var(--font-prompt)]">ร้านค้า</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm hover:text-[#f6efe2] transition-colors font-[family:var(--font-prompt)] font-light">น้ำหอม</a></li>
                <li><a href="#" className="text-sm hover:text-[#f6efe2] transition-colors font-[family:var(--font-prompt)] font-light">เทียนหอม</a></li>
                <li><a href="#" className="text-sm hover:text-[#f6efe2] transition-colors font-[family:var(--font-prompt)] font-light">ก้านไม้หอม</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#e6d5b8]/10 text-xs font-[family:var(--font-prompt)] font-light opacity-60">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#f6efe2] transition-colors">เงื่อนไข</a>
            <a href="#" className="hover:text-[#f6efe2] transition-colors">ความเป็นส่วนตัว</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
