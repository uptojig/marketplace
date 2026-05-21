'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  CreditCard,
  Truck,
  MapPin,
  RotateCcw,
  Ban,
  Mail,
  HelpCircle,
  FileText,
  Shield,
  Cookie,
  FileSignature,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentLayoutProps {
  kind: 'help' | 'legal';
  children: React.ReactNode;
}

const HELP_LINKS = [
  { href: '/help/how-to-order', label: 'วิธีการสั่งซื้อ', icon: ShoppingCart },
  { href: '/help/how-to-pay', label: 'วิธีการชำระเงิน', icon: CreditCard },
  { href: '/help/shipping', label: 'ค่าจัดส่ง + เวลาส่ง', icon: Truck },
  { href: '/help/tracking', label: 'ติดตามพัสดุ', icon: MapPin },
  { href: '/help/returns', label: 'การคืน/เปลี่ยน', icon: RotateCcw },
  { href: '/help/cancellations', label: 'ยกเลิกคำสั่งซื้อ', icon: Ban },
  { href: '/help/contact', label: 'ติดต่อเรา', icon: Mail },
  { href: '/help/faq', label: 'คำถามที่พบบ่อย', icon: HelpCircle },
];

const LEGAL_LINKS = [
  { href: '/legal/terms', label: 'เงื่อนไขการใช้บริการ', icon: FileText },
  { href: '/legal/privacy', label: 'นโยบายความเป็นส่วนตัว (PDPA)', icon: Shield },
  { href: '/legal/cookies', label: 'นโยบายคุกกี้', icon: Cookie },
  { href: '/legal/seller-agreement', label: 'ข้อตกลงผู้ขาย', icon: FileSignature },
];

export function ContentLayout({ kind, children }: ContentLayoutProps) {
  const pathname = usePathname();
  const links = kind === 'help' ? HELP_LINKS : LEGAL_LINKS;
  const root = kind === 'help' ? '/help' : '/legal';
  const rootLabel = kind === 'help' ? 'Help Center' : 'ข้อตกลง & นโยบาย';
  const currentLink = links.find((l) => l.href === pathname);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-mp-ink-muted">
        <Link href="/" className="hover:underline transition">หน้าแรก</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={root} className="hover:underline transition">{rootLabel}</Link>
        {currentLink && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-mp-ink">{currentLink.label}</span>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-1">
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-mp-ink-muted/80">
            {rootLabel}
          </h2>
          <div className="space-y-1">
            {links.map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                    active
                      ? 'bg-mp-coral/10 font-semibold text-mp-coral shadow-sm'
                      : 'text-mp-ink-muted hover:bg-mp-cream-alt/70 hover:text-mp-ink',
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        'h-4.5 w-4.5 shrink-0 transition-colors',
                        active ? 'text-mp-coral' : 'text-mp-ink-muted/75'
                      )}
                    />
                  )}
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>

          {kind === 'help' && (
            <div className="mx-1 mt-8 rounded-xl border border-mp-forest/15 bg-mp-forest/[0.04] p-4">
              <p className="text-xs font-bold text-mp-forest">ต้องการความช่วยเหลือเพิ่มเติม?</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-mp-ink-muted">
                เจ้าหน้าที่ฝ่ายบริการลูกค้าของเราพร้อมให้บริการและตอบคำถามคุณทุกวัน
              </p>
              <Link
                href="/help/contact"
                className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-mp-coral hover:text-mp-coral-dark hover:underline transition-colors"
              >
                ติดต่อเราเลย
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </aside>

        <article
          className={cn(
            "w-full max-w-none text-mp-ink",
            pathname !== root && "rounded-3xl border border-mp-border bg-white p-6 shadow-sm sm:p-10"
          )}
        >
          {children}
        </article>
      </div>
    </div>
  );
}

