'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentLayoutProps {
  kind: 'help' | 'legal';
  children: React.ReactNode;
}

const HELP_LINKS = [
  { href: '/help/how-to-order', label: 'วิธีการสั่งซื้อ' },
  { href: '/help/how-to-pay', label: 'วิธีการชำระเงิน' },
  { href: '/help/shipping', label: 'การจัดส่ง' },
  { href: '/help/returns', label: 'การคืน/เปลี่ยน' },
  { href: '/help/contact', label: 'ติดต่อเรา' },
  { href: '/help/faq', label: 'คำถามที่พบบ่อย' },
];

const LEGAL_LINKS = [
  { href: '/legal/terms', label: 'เงื่อนไขการใช้บริการ' },
  { href: '/legal/privacy', label: 'นโยบายความเป็นส่วนตัว (PDPA)' },
  { href: '/legal/cookies', label: 'นโยบายคุกกี้' },
  { href: '/legal/seller-agreement', label: 'ข้อตกลงผู้ขาย' },
];

export function ContentLayout({ kind, children }: ContentLayoutProps) {
  const pathname = usePathname();
  const links = kind === 'help' ? HELP_LINKS : LEGAL_LINKS;
  const root = kind === 'help' ? '/help' : '/legal';
  const rootLabel = kind === 'help' ? 'Help Center' : 'ข้อตกลง & นโยบาย';
  const currentLink = links.find((l) => l.href === pathname);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">หน้าแรก</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={root} className="hover:underline">{rootLabel}</Link>
        {currentLink && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{currentLink.label}</span>
          </>
        )}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {rootLabel}
          </h2>
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'block rounded-md px-3 py-1.5 text-sm transition',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'hover:bg-accent',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </aside>

        <article className="prose prose-sm max-w-none dark:prose-invert lg:prose-base prose-headings:font-semibold prose-h1:mt-0 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-primary">
          {children}
        </article>
      </div>
    </div>
  );
}
