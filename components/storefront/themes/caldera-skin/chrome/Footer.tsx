'use client';
import React from 'react';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import type { FooterProps } from '@/lib/templates/types';

export function CalderaSkinFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#0b3d4a] text-[#f4f8f9] border-t border-[#cdd9dc]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="md:col-span-1">
            <Link href={`/stores/${store.slug}`} className="flex items-center gap-2 mb-4">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <FlaskConical className="w-6 h-6 text-[#9cd6df]" />
                  <span className="font-[family:var(--font-kanit)] font-medium text-xl tracking-tight uppercase">
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            <p className="font-[family:var(--font-prompt)] text-sm text-[#9cd6df]/80 uppercase tracking-widest leading-relaxed">
              สกินแคร์สูตรเฉพาะ พัฒนาในห้องแล็บไทย
            </p>
          </div>
          
          <div>
            <h3 className="font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.12em] text-[#9cd6df] mb-6 border-b border-[#cdd9dc]/20 pb-2">
              Research Data
            </h3>
            <ul className="space-y-4 font-[family:var(--font-prompt)] text-sm font-light text-[#f4f8f9]/80">
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Clinical Trials</Link></li>
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Ingredient Glossary</Link></li>
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Safety Protocols</Link></li>
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Batch Lookup</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.12em] text-[#9cd6df] mb-6 border-b border-[#cdd9dc]/20 pb-2">
              Formulations
            </h3>
            <ul className="space-y-4 font-[family:var(--font-prompt)] text-sm font-light text-[#f4f8f9]/80">
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Serums</Link></li>
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Moisturizers</Link></li>
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Actives</Link></li>
              <li><Link href="#" className="hover:text-[#9cd6df] transition-colors">Cleansers</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.12em] text-[#9cd6df] mb-6 border-b border-[#cdd9dc]/20 pb-2">
              Lab Location
            </h3>
            <address className="not-italic font-[family:var(--font-prompt)] text-sm font-light text-[#f4f8f9]/80 space-y-4">
              <p>Chula Cosmetics Lab<br />Bangkok, Thailand</p>
              <p>Mon - Fri: 09:00 - 17:00</p>
              <p>contact@{store.slug}.com</p>
            </address>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-[#cdd9dc]/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-[family:var(--font-prompt)] text-xs text-[#f4f8f9]/60 font-light uppercase tracking-[0.12em]">
            &copy; {new Date().getFullYear()} {store.name} LAB. All rights reserved.
          </p>
          <div className="flex gap-4 font-[family:var(--font-prompt)] text-xs text-[#f4f8f9]/60 uppercase tracking-[0.12em]">
            <Link href="#" className="hover:text-[#9cd6df] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#9cd6df] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
