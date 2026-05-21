'use client';
import React from 'react';
import Link from 'next/link';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
  };
  categories?: string[];
  accent?: string;
}

export function Footer({ store, categories = [], accent }: FooterProps) {
  return (
    <footer
      className="border-t py-10"
      style={{
        background: '#FAFAFA',
        borderColor: '#E5E5E5',
        color: '#0A0A0A',
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
              {store.name}
            </h3>
            <p className="text-sm opacity-50">
              ร้านค้าออนไลน์บน Basketplace
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
              ลิงก์
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/stores/${store.slug}`} className="opacity-60 hover:opacity-100">หน้าแรก</Link></li>
              <li><Link href={`/stores/${store.slug}/category`} className="opacity-60 hover:opacity-100">สินค้าทั้งหมด</Link></li>
              <li><Link href={`/stores/${store.slug}/about`} className="opacity-60 hover:opacity-100">เกี่ยวกับ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">
              ติดต่อ
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/stores/${store.slug}/help`} className="opacity-60 hover:opacity-100">ช่วยเหลือ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs opacity-40" style={{ borderColor: '#E5E5E5' }}>
          © {new Date().getFullYear()} {store.name}. Powered by Basketplace
        </div>
      </div>
    </footer>
  );
}
