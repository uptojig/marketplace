'use client';
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export function KorakotHouseFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#3a2818] text-[#f5ede0] pt-16 pb-8 font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain mb-4" />
            ) : (
              <h3 className="font-[family:var(--font-kanit)] text-2xl font-semibold tracking-wider text-[#d7a86e] mb-4 uppercase">
                {store.name}
              </h3>
            )}
            <p className="text-[#e8d5b7] max-w-md leading-relaxed text-sm">
              เฟอร์นิเจอร์ไม้สักมิดเซนจูรี ผลิตในจังหวัดน่าน <br />
              ทุกชิ้นผลิตด้วยความใส่ใจและเคารพในธรรมชาติ ใช้วัสดุจากสวนป่าที่ได้รับการรับรอง FSC 
              เพื่อความยั่งยืนและความงามที่อยู่เหนือกาลเวลา
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-[#e8d5b7] hover:text-[#d7a86e] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#e8d5b7] hover:text-[#d7a86e] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#e8d5b7] hover:text-[#d7a86e] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-medium text-[#d7a86e] mb-4 text-lg">บริการลูกค้า</h4>
            <ul className="space-y-3 text-sm text-[#e8d5b7]">
              <li><Link href="#" className="hover:text-white transition-colors">การจัดส่งและประกอบ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">นโยบายการรับประกัน</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">คำแนะนำการดูแลไม้สัก</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-[family:var(--font-kanit)] font-medium text-[#d7a86e] mb-4 text-lg">บริษัท</h4>
            <ul className="space-y-3 text-sm text-[#e8d5b7]">
              <li><Link href="#" className="hover:text-white transition-colors">เรื่องราวของเรา</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">มาตรฐาน FSC</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">สตูดิโอออกแบบ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">ร่วมงานกับเรา</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#7c4a1e] flex flex-col md:flex-row justify-between items-center text-xs text-[#e8d5b7]">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
