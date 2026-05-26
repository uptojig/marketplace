'use client';

// Per-store account sidebar (Shopify-like — each store has its own
// customer view at /stores/[slug]/account/*). The caller (layout)
// passes `storeSlug` so this client component can build hrefs without
// reading the route params itself.

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
  Ticket,
  User,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemDef {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  /** Path under /stores/[slug]/account — leading slash, no slug. */
  to: string;
  soon?: boolean;
}

interface NavGroupDef {
  label: string;
  items: NavItemDef[];
}

const NAV_GROUPS: NavGroupDef[] = [
  {
    label: 'คำสั่งซื้อ',
    items: [{ icon: Package, label: 'คำสั่งซื้อของฉัน', to: '/orders' }],
  },
  {
    label: 'ข้อมูลของฉัน',
    items: [
      { icon: User, label: 'โปรไฟล์', to: '/profile' },
      { icon: MapPin, label: 'ที่อยู่', to: '/addresses' },
      { icon: CreditCard, label: 'วิธีชำระเงิน', to: '/payment-methods', soon: true },
      { icon: Wallet, label: 'Anypay Wallet', to: '/wallet', soon: true },
    ],
  },
  {
    label: 'ทำงานร่วมกับร้าน',
    items: [
      { icon: Heart, label: 'รายการโปรด', to: '/wishlist' },
      { icon: Star, label: 'รีวิวของฉัน', to: '/reviews', soon: true },
      { icon: Ticket, label: 'คูปองของฉัน', to: '/coupons' },
    ],
  },
  {
    label: 'การตั้งค่า',
    items: [
      { icon: Bell, label: 'การแจ้งเตือน', to: '/notifications', soon: true },
      { icon: ShieldCheck, label: 'ความปลอดภัย', to: '/security', soon: true },
    ],
  },
];

export function AccountSidebar({ storeSlug }: { storeSlug: string }) {
  const pathname = usePathname();
  const base = `/stores/${storeSlug}/account`;

  return (
    <aside className="space-y-5">
      <Link
        href={base}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
          pathname === base ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
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
              const href = `${base}${item.to}`;
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
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
