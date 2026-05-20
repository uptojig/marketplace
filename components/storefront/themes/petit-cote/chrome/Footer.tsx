'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export function PetitCoteFooter({ store }: FooterProps) {
  return (
    <footer className="bg-[#fafafa] border-t border-[#f4f4f5] pt-16 pb-8 font-[family:var(--font-kanit)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <Link href={`/${store.slug}`} className="mb-8">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-12 w-auto" />
          ) : (
            <span className="text-3xl font-light text-[#27272a] tracking-widest">{store.name}</span>
          )}
        </Link>
        
        <p className="text-[#525252] text-sm mb-10 tracking-widest text-center">
          เสื้อผ้าและของใช้เด็กเล็ก สไตล์ฝรั่งเศส
        </p>

        <div className="flex space-x-6 mb-12">
          <a href="#" className="text-[#525252] hover:text-[#fbcfe8] uppercase text-sm tracking-wider">Instagram</a>
          <a href="#" className="text-[#525252] hover:text-[#fbcfe8] uppercase text-sm tracking-wider">Facebook</a>
          <a href="#" className="text-[#525252] hover:text-[#fbcfe8] uppercase text-sm tracking-wider">Line Official</a>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-center border-t border-[#f4f4f5] pt-8 text-xs text-[#525252] uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
