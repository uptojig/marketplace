'use client';
import React from 'react';
import { Cpu, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  storeName: string;
}

export function SmartloopHomeFooter({ storeName }: FooterProps) {
  return (
    <footer className="bg-[#064e3b] text-white font-[family:var(--font-prompt)] pt-12 pb-6 border-t-4 border-[#34d399]">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4 font-[family:var(--font-kanit)]">
            <Cpu className="w-6 h-6 text-[#34d399]" />
            <span className="text-xl font-bold uppercase">{storeName}</span>
          </div>
          <p className="text-sm text-[#dcfce7] mb-6 font-[family:var(--font-kanit)]">
            อุปกรณ์สมาร์ทโฮม ครบทุกระบบในที่เดียว<br/>
            <span className="text-xs uppercase opacity-70 block mt-1 font-[family:var(--font-prompt)]">Smart Home Distributor</span>
          </p>
          <div className="space-y-3 text-sm text-[#dcfce7]">
            <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#34d399] mt-0.5 flex-shrink-0" /> <span>คลังสินค้า: ปทุมธานี,<br/>ประเทศไทย 12000</span></p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#34d399] flex-shrink-0" /> 02-XXX-XXXX</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#34d399] flex-shrink-0" /> sales@smartloop.co.th</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-[#34d399] mb-4 uppercase text-sm font-[family:var(--font-kanit)] tracking-wide">หมวดหมู่สินค้า</h4>
          <ul className="space-y-2 text-sm text-[#dcfce7]">
            <li><a href="#" className="hover:text-white transition-colors">สวิตช์และปลั๊กอัจฉริยะ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">ระบบแสงสว่าง</a></li>
            <li><a href="#" className="hover:text-white transition-colors">เซ็นเซอร์และกันขโมย</a></li>
            <li><a href="#" className="hover:text-white transition-colors">ระบบควบคุมและฮับ (Hub)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">เครือข่ายและเร้าเตอร์</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-[#34d399] mb-4 uppercase text-sm font-[family:var(--font-kanit)] tracking-wide">บริการลูกค้า</h4>
          <ul className="space-y-2 text-sm text-[#dcfce7]">
            <li><a href="#" className="hover:text-white transition-colors">เช็คสถานะการจัดส่ง</a></li>
            <li><a href="#" className="hover:text-white transition-colors">นโยบายการคืนสินค้า</a></li>
            <li><a href="#" className="hover:text-white transition-colors">ศูนย์ช่วยเหลือและคู่มือ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">ดาวน์โหลดซอฟต์แวร์</a></li>
            <li><a href="#" className="hover:text-white transition-colors">ติดต่อเคลมสินค้า (RMA)</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-[#34d399] mb-4 uppercase text-sm font-[family:var(--font-kanit)] tracking-wide">รับข่าวสาร</h4>
          <p className="text-sm text-[#dcfce7] mb-4">สมัครรับจดหมายข่าวเพื่อรับโปรโมชั่นและอัพเดทเทคโนโลยีใหม่ๆ</p>
          <div className="flex h-10">
            <input type="email" placeholder="อีเมลของคุณ..." className="px-3 py-2 text-[#064e3b] text-sm flex-1 outline-none font-[family:var(--font-prompt)] bg-[#f0fdf4]" />
            <button className="bg-[#059669] hover:bg-[#34d399] hover:text-[#064e3b] px-4 text-sm font-bold transition-colors">
              ติดตาม
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 pt-6 border-t border-[#047857] text-xs text-center text-[#dcfce7] flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">ข้อตกลงการใช้งาน</a>
          <a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
        </div>
      </div>
    </footer>
  );
}
