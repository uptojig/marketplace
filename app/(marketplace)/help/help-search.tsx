'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  HelpCircle, 
  Search,
  ArrowRight,
  Sparkles,
  LifeBuoy
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const HELP_CATEGORIES = [
  {
    title: 'การสั่งซื้อ',
    description: 'วิธีการเลือกซื้อสินค้า จัดการตะกร้าสินค้า และขั้นตอนทำรายการ',
    icon: ShoppingCart,
    color: 'bg-mp-coral/12 text-mp-coral',
    links: [
      { href: '/help/how-to-order', label: 'วิธีการสั่งซื้อ' },
      { href: '/help/how-to-pay', label: 'วิธีการชำระเงิน' },
    ],
  },
  {
    title: 'การจัดส่ง',
    description: 'อัตราค่าบริการขนส่ง ระยะเวลาการนำจ่าย และการเช็คสถานะ',
    icon: Truck,
    color: 'bg-mp-forest/12 text-mp-forest',
    links: [
      { href: '/help/shipping', label: 'ค่าจัดส่ง + เวลาส่ง' },
      { href: '/help/tracking', label: 'ติดตามพัสดุ' },
    ],
  },
  {
    title: 'หลังการขาย',
    description: 'นโยบายการคืนเงิน เปลี่ยนสินค้า และข้อกำหนดการยกเลิก',
    icon: RotateCcw,
    color: 'bg-mp-warning/15 text-mp-warning',
    links: [
      { href: '/help/returns', label: 'การคืน/เปลี่ยนสินค้า' },
      { href: '/help/cancellations', label: 'ยกเลิกคำสั่งซื้อ' },
    ],
  },
  {
    title: 'อื่นๆ',
    description: 'ช่องทางการติดต่อฝ่ายบริการลูกค้า และตอบคำถามยอดฮิต',
    icon: HelpCircle,
    color: 'bg-mp-cream-alt text-mp-ink',
    links: [
      { href: '/help/contact', label: 'ติดต่อเรา' },
      { href: '/help/faq', label: 'คำถามที่พบบ่อย' },
    ],
  },
];

export function HelpSearch() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return HELP_CATEGORIES;
    
    return HELP_CATEGORIES.map((cat) => {
      const matchingLinks = cat.links.filter((l) =>
        l.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, links: matchingLinks };
    }).filter((cat) => cat.links.length > 0);
  }, [searchQuery]);

  const totalMatches = React.useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.links.length, 0);
  }, [filteredCategories]);

  return (
    <div className="not-prose space-y-10">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-mp-border bg-mp-forest px-6 py-14 text-center text-mp-cream shadow-xl sm:py-20">
        {/* Decorative background blurs */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-mp-coral/20 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-mp-cream/12 blur-3xl" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-mp-cream/20 bg-mp-cream/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mp-cream">
            <Sparkles className="h-3 w-3" />
            ศูนย์ช่วยเหลือ & สนับสนุน
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            เราสามารถช่วยอะไรคุณได้บ้าง?
          </h1>
          
          <p className="mx-auto max-w-md text-sm leading-relaxed text-mp-cream/78 sm:text-base">
            ค้นหาข้อมูล คำแนะนำการสั่งซื้อ นโยบายการคืนสินค้า หรือติดต่อทีมงานบริการลูกค้าได้ง่ายๆ ที่นี่
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto pt-2">
            <Search className="absolute left-4 top-1/2 z-20 h-5 w-5 -translate-y-1/2 text-mp-ink-muted/80" />
            <Input
              type="search"
              placeholder="พิมพ์คำค้นหา เช่น วิธีชำระเงิน, คืนของ, ติดต่อเรา..."
              className="z-10 w-full rounded-2xl border border-mp-border bg-mp-cream py-6 pl-11 pr-4 text-base text-mp-ink shadow-lg placeholder:text-mp-ink-muted/70 focus-visible:border-mp-coral focus-visible:ring-2 focus-visible:ring-mp-coral/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-mp-ink">
            <LifeBuoy className="h-5 w-5 text-mp-coral" />
            {searchQuery ? 'ผลการค้นหา' : 'หมวดหมู่ความช่วยเหลือ'}
          </h2>
          {searchQuery && (
            <span className="rounded-full bg-mp-cream-alt px-2.5 py-1 text-xs text-mp-ink-muted">
              พบ {totalMatches} รายการ
            </span>
          )}
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="mp-card-lift flex flex-col justify-between rounded-2xl border border-mp-border bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-mp-coral/30 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className={`p-2.5 rounded-xl ${cat.color}`}>
                        <Icon className="h-5 w-5 shrink-0" />
                      </div>
                      <h3 className="text-lg font-bold text-mp-ink">{cat.title}</h3>
                    </div>
                    <p className="mb-5 text-sm leading-relaxed text-mp-ink-muted">
                      {cat.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-2.5">
                    {cat.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="group/link flex items-center justify-between rounded-xl border border-mp-border bg-mp-cream/45 p-3 text-sm transition-all duration-200 hover:border-mp-coral/25 hover:bg-mp-cream-alt/70"
                        >
                          <span className="font-semibold text-mp-ink/80 transition-colors group-hover/link:text-mp-coral">
                            {l.label}
                          </span>
                          <ArrowRight className="h-4 w-4 text-mp-ink-muted transition-all group-hover/link:translate-x-1 group-hover/link:text-mp-coral" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-mp-border bg-white py-16 text-center">
            <p className="font-medium text-mp-ink-muted">ไม่พบผลลัพธ์สำหรับ "{searchQuery}"</p>
            <p className="mt-1 text-xs text-mp-ink-muted">ลองใช้คำอื่น หรือติดต่อเราโดยตรงเพื่อรับความช่วยเหลือ</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 rounded-xl bg-mp-coral px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-mp-coral-dark"
            >
              แสดงทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
