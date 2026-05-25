'use client';
import React from 'react';
import Link from 'next/link';
import type { FooterProps } from '@/lib/templates/types';

export function CarbonEraCamerasFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#0a0a0a] text-[#fafafa] border-t border-[#27272a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain mb-4" />
            ) : (
              <h3 className="font-[family:var(--font-kanit)] text-2xl font-black uppercase tracking-widest mb-4">
                {store.name}
              </h3>
            )}
            <p className="font-[family:var(--font-prompt)] text-[#a1a1aa] max-w-sm font-light">
              กล้องฟิล์มและเลนส์มือสองคัดเกรด ผ่านการตรวจสอบอย่างละเอียด 24 จุด พร้อมการรับประกัน 90 วัน
            </p>
          </div>
          <div>
            <h4 className="font-[family:var(--font-prompt)] font-bold mb-4 uppercase tracking-widest text-xs text-[#a1a1aa]">Explore</h4>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Leica</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Hasselblad</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Rolleiflex</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Lenses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-[family:var(--font-prompt)] font-bold mb-4 uppercase tracking-widest text-xs text-[#a1a1aa]">Support</h4>
            <ul className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Condition Grading</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Inspection Process</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Warranty Info</Link></li>
              <li><Link href={`/stores/${store.slug}`} className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#27272a] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-[family:var(--font-prompt)] text-[#52525b]">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-[#a1a1aa]">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#a1a1aa]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
