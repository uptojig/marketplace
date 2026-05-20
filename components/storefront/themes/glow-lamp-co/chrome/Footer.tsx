'use client';
import React from 'react';
import Link from 'next/link';
import { Lightbulb, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  store: {
    name: string;
    slug: string;
  };
}

export function GlowLampCoFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#0f172a] text-[#e2e8f0] font-[family:var(--font-prompt)] pt-16 pb-8 border-t border-[#f59e0b]/20 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#f59e0b]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="space-y-4">
            <Link href={`/${store.slug}`} className="flex items-center gap-3 group inline-flex">
              <div className="w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.7)] transition-all">
                <Lightbulb className="w-5 h-5 text-[#0f172a]" />
              </div>
              <span className="text-xl font-bold tracking-wider text-[#f8fafc] font-[family:var(--font-kanit)]">{store.name}</span>
            </Link>
            <p className="text-sm opacity-80 mt-4 leading-relaxed max-w-xs">
              โคมไฟตั้งโต๊ะและโคมเพดาน ดีไซน์ตามแสง <br/>แสงที่ดี เริ่มที่หลอดที่ใช่
            </p>
          </div>
          
          <div>
            <h4 className="text-[#f8fafc] font-semibold mb-6 text-lg tracking-wide font-[family:var(--font-kanit)]">หมวดหมู่</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href={`/${store.slug}/category/desk`} className="hover:text-[#f59e0b] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/50"></span>โคมตั้งโต๊ะ</Link></li>
              <li><Link href={`/${store.slug}/category/ceiling`} className="hover:text-[#f59e0b] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/50"></span>โคมเพดาน</Link></li>
              <li><Link href={`/${store.slug}/category/bedside`} className="hover:text-[#f59e0b] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/50"></span>โคมข้างเตียง</Link></li>
              <li><Link href={`/${store.slug}/category/bulbs`} className="hover:text-[#f59e0b] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/50"></span>หลอดไฟ LED CRI 95+</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#f8fafc] font-semibold mb-6 text-lg tracking-wide font-[family:var(--font-kanit)]">บริการลูกค้า</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href={`/${store.slug}/contact`} className="hover:text-[#f59e0b] transition-colors">ติดต่อเรา</Link></li>
              <li><Link href={`/${store.slug}/shipping`} className="hover:text-[#f59e0b] transition-colors">การจัดส่งสินค้า</Link></li>
              <li><Link href={`/${store.slug}/returns`} className="hover:text-[#f59e0b] transition-colors">แลกหลอดเก่า/คืนสินค้า</Link></li>
              <li><Link href={`/${store.slug}/warranty`} className="hover:text-[#f59e0b] transition-colors">การรับประกัน</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#f8fafc] font-semibold mb-6 text-lg tracking-wide font-[family:var(--font-kanit)]">ติดต่อเรา</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <span className="opacity-80">123 ถ.สุขุมวิท กรุงเทพมหานคร 10110</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#f59e0b] shrink-0" />
                <span className="opacity-80">02-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#f59e0b] shrink-0" />
                <span className="opacity-80">hello@{store.slug}.com</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#f59e0b] hover:text-[#0f172a] transition-all shadow-[0_0_0_rgba(245,158,11,0)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#f59e0b] hover:text-[#0f172a] transition-all shadow-[0_0_0_rgba(245,158,11,0)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#f59e0b] hover:text-[#0f172a] transition-all shadow-[0_0_0_rgba(245,158,11,0)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-60">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href={`/${store.slug}/privacy`} className="hover:text-[#f59e0b] transition-colors">Privacy Policy</Link>
            <Link href={`/${store.slug}/terms`} className="hover:text-[#f59e0b] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
