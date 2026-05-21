'use client';

import React from 'react';
import Link from 'next/link';

export function WavelengthAudioHeader({ store }: { store: any }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#fafafa]/90 backdrop-blur-md border-b border-[#0a0a0a]/10 text-[#0a0a0a]">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        <Link href={`/stores/${store.slug}`} className="flex items-center gap-4">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
          ) : (
            <div className="h-10 w-10 bg-[#dc2626] rounded-sm" />
          )}
          <span className="font-[family:var(--font-prompt)] text-2xl tracking-[0.16em] uppercase font-bold">
            {store.name}
          </span>
        </Link>
        <nav className="hidden md:flex gap-10 font-[family:var(--font-kanit)] text-sm tracking-widest uppercase font-medium">
          <Link href={`/stores/${store.slug}`} className="hover:text-[#dc2626] transition-colors">
            ภาพรวม
          </Link>
          <Link href={`/stores/${store.slug}#specs`} className="hover:text-[#dc2626] transition-colors">
            ข้อมูลทางเทคนิค
          </Link>
        </nav>
      </div>
    </header>
  );
}
