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
  Download,
  Heart,
  Mail,
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
  /** Key into the per-item badge-count map (see AccountSidebar props). */
  badgeKey?: 'inbox';
}

interface NavGroupDef {
  label: string;
  items: NavItemDef[];
}

const NAV_GROUPS: NavGroupDef[] = [
  {
    label: 'คำสั่งซื้อ',
    items: [
      { icon: Package, label: 'คำสั่งซื้อของฉัน', to: '/orders' },
      { icon: Download, label: 'คลังสินค้าดิจิทัล', to: '/downloads' },
      { icon: Mail, label: 'กล่องข้อความ', to: '/inbox', badgeKey: 'inbox' },
    ],
  },
  {
    label: 'ข้อมูลของฉัน',
    items: [
      { icon: User, label: 'โปรไฟล์', to: '/profile' },
      { icon: MapPin, label: 'ที่อยู่', to: '/addresses' },
      { icon: Wallet, label: 'เครดิตในร้าน', to: '/credit' },
      { icon: CreditCard, label: 'วิธีชำระเงิน', to: '/payment-methods', soon: true },
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

export function AccountSidebar({
  storeSlug,
  digitalOnly = false,
  inboxUnread = 0,
}: {
  storeSlug: string;
  /** Drop entries that don't apply to digital-only stores (e.g.
   *  /addresses — nothing ever ships). */
  digitalOnly?: boolean;
  /** Unread inbox count — drives the badge on the กล่องข้อความ entry. */
  inboxUnread?: number;
}) {
  const pathname = usePathname();
  const base = `/stores/${storeSlug}/account`;
  const badgeCounts: Record<NonNullable<NavItemDef['badgeKey']>, number> = {
    inbox: inboxUnread,
  };
  const groups = digitalOnly
    ? NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.to !== '/addresses'),
      }))
    : NAV_GROUPS;

  return (
    <aside className="space-y-5">
      <Link
        href={base}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition text-[var(--shop-ink)]',
          pathname === base
            ? 'bg-[color-mix(in_srgb,var(--shop-primary)_14%,transparent)] font-semibold'
            : 'hover:bg-[color-mix(in_srgb,var(--shop-ink)_8%,transparent)]',
        )}
      >
        <User className="h-4 w-4" />
        แดชบอร์ด
      </Link>

      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--shop-ink-muted)]">
            {group.label}
          </h3>
          <nav className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const href = `${base}${item.to}`;
              const isActive = pathname === href || pathname.startsWith(href + '/');
              const badge = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition text-[var(--shop-ink)]',
                    isActive
                      ? 'bg-[color-mix(in_srgb,var(--shop-primary)_14%,transparent)] font-semibold'
                      : 'hover:bg-[color-mix(in_srgb,var(--shop-ink)_8%,transparent)]',
                    item.soon && 'cursor-not-allowed opacity-50',
                  )}
                  onClick={(e) => item.soon && e.preventDefault()}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                  {item.soon && (
                    <span className="text-[9px] text-[var(--shop-ink-muted)]">soon</span>
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
