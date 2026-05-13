'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CreditCard,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Store,
  Ticket,
  User,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'คำสั่งซื้อ',
    items: [{ icon: Package, label: 'คำสั่งซื้อของฉัน', href: '/account/orders' }],
  },
  {
    label: 'ข้อมูลของฉัน',
    items: [
      { icon: User, label: 'โปรไฟล์', href: '/account/profile' },
      { icon: MapPin, label: 'ที่อยู่', href: '/account/addresses' },
      { icon: CreditCard, label: 'วิธีชำระเงิน', href: '/account/payment-methods', soon: true },
      { icon: Wallet, label: 'Anypay Wallet', href: '/account/wallet', soon: true },
    ],
  },
  {
    label: 'ทำงานร่วมกับร้าน',
    items: [
      { icon: Heart, label: 'รายการโปรด', href: '/account/favorites', soon: true },
      { icon: Store, label: 'ร้านที่ติดตาม', href: '/account/following', soon: true },
      { icon: Star, label: 'รีวิวของฉัน', href: '/account/reviews', soon: true },
      { icon: Ticket, label: 'คูปองของฉัน', href: '/account/coupons' },
    ],
  },
  {
    label: 'การตั้งค่า',
    items: [
      { icon: Bell, label: 'การแจ้งเตือน', href: '/account/notifications', soon: true },
      { icon: ShieldCheck, label: 'ความปลอดภัย', href: '/account/security', soon: true },
    ],
  },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="space-y-5">
      <Link
        href="/account"
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
          pathname === '/account' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
        )}
      >
        <User className="h-4 w-4" />
        แดชบอร์ด
      </Link>

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          <nav className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
                    isActive ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-accent',
                    item.soon && 'cursor-not-allowed opacity-50',
                  )}
                  onClick={(e) => item.soon && e.preventDefault()}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.soon && (
                    <span className="text-[9px] text-muted-foreground">soon</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
