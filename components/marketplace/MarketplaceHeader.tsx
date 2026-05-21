/**
 * MarketplaceHeader — sticky public-visitor header for the brand shell.
 *
 * Used by app/(marketplace)/layout.tsx. Sibling of vendor-side
 * `components/storefront/chrome/ShopHeader.tsx`, but scoped to the
 * platform-owned pages (basketplace.co/, /apply, /signin, /signup,
 * /create-store). Visual source: Stitch landing-page header — coral
 * "เข้าสู่ระบบ" CTA + 4-item center nav. Public onboarding is
 * invite-link only, so there is no public "เปิดร้าน"/apply CTA.
 *
 * Mobile: hamburger opens a Sheet drawer from the right (matches
 * Stitch DESIGN.md — better thumb reach than top-down).
 *
 * Auth-aware variants (Seller / Admin) live as separate Stitch screens
 * — they ship as their own components when those dashboards consume
 * this chrome. Keep this one PUBLIC-only to avoid auth coupling in
 * the marketing pages.
 */
import Link from 'next/link';
import { MarketplaceMobileNav } from './MarketplaceMobileNav';
import { AccountMenu } from '@/components/account/account-menu';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'ตัวอย่างร้านค้า', href: '/stores' },
  { label: 'วิธีใช้งาน', href: '/help/how-to-order' },
  { label: 'ราคา', href: '/#pricing' },
  { label: 'ช่วยเหลือ', href: '/help/how-to-pay' },
];

export function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-mp-border bg-mp-cream/95 backdrop-blur supports-[backdrop-filter]:bg-mp-cream/80">
      <div className="mp-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-mp-coral-dark hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--mp-font-display)' }}
        >
          Basketplace
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="text-[15px] font-medium text-mp-ink-muted hover:text-mp-coral transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA — auth-aware: sign-in when logged out, account menu when logged in */}
        <div className="hidden md:flex items-center gap-3">
          <AccountMenu />
        </div>

        {/* Mobile hamburger — opens a Sheet drawer from the right */}
        <MarketplaceMobileNav items={NAV_ITEMS} />
      </div>
    </header>
  );
}
