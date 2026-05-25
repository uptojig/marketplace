'use client';

import React from 'react';
import Link from 'next/link';
import type { FooterProps } from '@/lib/templates/types';
import { Mail, Instagram, Facebook } from 'lucide-react';

export function InkstonePaperFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#3a2e22] text-[#f7f1e3] py-16 border-t border-[#c9974b]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start space-y-4">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-[family:var(--font-kanit)] font-light tracking-widest text-[#c9974b]">
                {store.name}
              </span>
            )}
            <p className="text-[#e6dcc4] text-sm font-[family:var(--font-prompt)] font-light max-w-xs leading-relaxed">
              ปากกาหมึกซึม สมุดทำมือ และหมึกเฉพาะรุ่นนำเข้าจากญี่ปุ่น คัดเลือกจากร้านในเกียวโตและโตเกียว
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-sm uppercase tracking-[0.2em] font-[family:var(--font-prompt)] text-[#c9974b] mb-2">Explore</h3>
            <nav className="flex flex-col space-y-3 text-sm font-[family:var(--font-prompt)] font-light">
              <Link href={`/stores/${store.slug}`} className="hover:text-[#c9974b] transition-colors">
                คอลเลกชันทั้งหมด
              </Link>
              <Link href={`/stores/${store.slug}`} className="hover:text-[#c9974b] transition-colors">
                เรื่องราวของเรา
              </Link>
              <Link href={`/stores/${store.slug}`} className="hover:text-[#c9974b] transition-colors">
                การดูแลรักษา
              </Link>
              <Link href={`/stores/${store.slug}`} className="hover:text-[#c9974b] transition-colors">
                ติดต่อเรา
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-4">
            <h3 className="text-sm uppercase tracking-[0.2em] font-[family:var(--font-prompt)] text-[#c9974b] mb-2">Stay Connected</h3>
            <div className="flex space-x-6 mb-4">
              <a href="#" className="text-[#e6dcc4] hover:text-[#c9974b] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#e6dcc4] hover:text-[#c9974b] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#e6dcc4] hover:text-[#c9974b] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-[#e6dcc4]/60 font-[family:var(--font-prompt)] font-light mt-8">
              &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
