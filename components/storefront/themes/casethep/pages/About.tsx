'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck, Heart, ChevronRight } from 'lucide-react';

interface AboutProps {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
  };
}

const DEFAULT_DESCRIPTION =
  'เราเชื่อว่าเคสมือถือดีๆ ไม่ใช่แค่ฟังก์ชัน แต่คือสไตล์และตัวตนของคุณ — Casethep คัดสรรเคสคุณภาพจากผู้ผลิตชั้นนำ ทุกชิ้นออกแบบใส่ใจ ดูดี และทนทานต่อการใช้งานจริง พร้อมจัดส่งทั่วประเทศและบริการดูแลลูกค้าที่ใส่ใจในทุกขั้นตอน';

const VALUES = [
  { icon: ShieldCheck, title: 'คุณภาพดีจริง', desc: 'ของแท้ 100% รับประกันคืนเงิน' },
  { icon: Truck, title: 'ส่งไว เก็บเงิน', desc: 'จัดส่ง 1–3 วันทำการ ปลอดภัย' },
  { icon: Heart, title: 'แพ็คด้วยใจ', desc: 'ทุกออเดอร์ใส่ใจในรายละเอียด' },
  { icon: Sparkles, title: 'ลายใหม่ทุกเดือน', desc: 'เติมคอลเลกชันสีและลายอย่างต่อเนื่อง' },
];

export function About({ store }: AboutProps) {
  const desc = store.description?.trim() || store.tagline?.trim() || DEFAULT_DESCRIPTION;

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              'radial-gradient(50% 60% at 70% 30%, rgba(255,90,106,0.15) 0%, rgba(255,90,106,0) 60%), radial-gradient(45% 50% at 20% 80%, rgba(255,213,128,0.25) 0%, rgba(255,213,128,0) 65%)',
          }}
        />
        <div className="max-w-5xl mx-auto">
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-wide mb-4"
            style={{
              background: 'rgba(255,90,106,0.10)',
              color: 'var(--shop-primary, #FF5A6A)',
            }}
          >
            About us
          </span>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-semibold tracking-tight">
            เรื่องราวของ {store.name}
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div
          className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 20px 40px -10px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
                aria-hidden
              >
                {store.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight">
              {store.name}
            </h2>
          </div>
          <p className="text-base leading-relaxed text-[color:var(--shop-ink,#1A1A1F)]/90 whitespace-pre-line">
            {desc}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight mb-6 text-center">
            สิ่งที่เรายึดมั่น
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl bg-white p-5"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: 'rgba(255,90,106,0.10)',
                    color: 'var(--shop-primary, #FF5A6A)',
                  }}
                >
                  <v.icon className="w-4 h-4" />
                </div>
                <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 text-center text-white"
          style={{
            background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
            boxShadow: '0 20px 40px -10px rgba(255,90,106,0.30)',
          }}
        >
          <h3 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight mb-5">
            พร้อมหาเคสคู่ใจของคุณแล้ว?
          </h3>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-7 text-sm font-medium bg-white text-[color:var(--shop-primary,#FF5A6A)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            ดูสินค้าทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
