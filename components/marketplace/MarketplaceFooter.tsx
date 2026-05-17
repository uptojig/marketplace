/**
 * MarketplaceFooter — forest-green brand-anchor footer for the
 * platform shell.
 *
 * Used by app/(marketplace)/layout.tsx. Sibling of vendor-side
 * `components/storefront/chrome/ShopFooter.tsx`, but scoped to the
 * platform-owned pages. Visual source: Stitch screen "Global Footer
 * (Desktop)" — forest #2C5F4F bg, cream text, 5-column grid,
 * newsletter signup top-right, payment icons bottom-right.
 *
 * Newsletter form is currently inert (no submit handler) — wire to
 * /api/newsletter/subscribe (TODO) once that endpoint lands.
 */
import Link from 'next/link';
import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

const COL_PRODUCT: ReadonlyArray<FooterLink> = [
  { label: 'ตัวอย่างร้านค้า', href: '/stores' },
  { label: 'เปิดร้านใหม่', href: '/apply' },
  { label: 'ราคา', href: '/#pricing' },
  { label: 'คุณสมบัติ', href: '/#why-us' },
];

const COL_START: ReadonlyArray<FooterLink> = [
  { label: 'วิธีใช้งาน', href: '/help/how-to-order' },
  { label: 'สมัครเป็นผู้ขาย', href: '/apply' },
  { label: 'เลือกธีมร้าน', href: '/#featured' },
  { label: 'ระบบจ่ายเงิน', href: '/help/how-to-pay' },
];

const COL_HELP: ReadonlyArray<FooterLink> = [
  { label: 'ศูนย์ช่วยเหลือ', href: '/help/how-to-order' },
  { label: 'ติดต่อทีมงาน', href: 'mailto:support@basketplace.co' },
  { label: 'วิธีการสั่งซื้อ', href: '/help/how-to-order' },
  { label: 'วิธีการชำระเงิน', href: '/help/how-to-pay' },
];

const LEGAL_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'นโยบายความเป็นส่วนตัว', href: '/legal/privacy' },
  { label: 'ข้อกำหนดการใช้งาน', href: '/legal/terms' },
  { label: 'นโยบายคุกกี้', href: '/legal/privacy' },
];

const PAYMENT_METHODS: ReadonlyArray<string> = [
  'PromptPay',
  'Visa',
  'Mastercard',
  'JCB',
];

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-mp-cream/70 mb-5">
      {children}
    </h4>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<FooterLink>;
}) {
  return (
    <div>
      <ColumnHeading>{title}</ColumnHeading>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-[15px] text-mp-cream/90 hover:text-mp-coral transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketplaceFooter() {
  return (
    <footer className="bg-mp-forest text-mp-cream">
      <div className="mp-container py-12 md:py-20">
        {/* Top row: brand + newsletter */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between pb-10 border-b border-mp-cream/15">
          <div>
            <Link
              href="/"
              className="block text-3xl font-bold text-mp-cream"
              style={{ fontFamily: 'var(--mp-font-display)' }}
            >
              Basketplace
            </Link>
          </div>

          <form
            className="flex flex-col sm:flex-row sm:items-end gap-3 sm:max-w-md w-full"
            // TODO: wire to /api/newsletter/subscribe once that endpoint lands.
            action="#"
            method="post"
            aria-label="สมัครรับข่าวสาร"
          >
            <div className="flex-1">
              <label
                htmlFor="newsletter-email"
                className="block text-[13px] text-mp-cream/70 mb-2"
              >
                รับข่าวสารร้านค้าใหม่และโปรโมชั่นทุกสัปดาห์
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-[10px] bg-transparent border border-mp-cream/30 text-mp-cream placeholder:text-mp-cream/40 focus:border-mp-coral focus:outline-none focus:ring-2 focus:ring-mp-coral/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-mp-coral text-white font-semibold text-[15px] hover:bg-mp-coral-dark transition-colors shrink-0"
            >
              สมัครรับข่าว
            </button>
          </form>
        </div>

        {/* 5-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 py-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <p className="text-[15px] leading-7 text-mp-cream/80 max-w-xs mb-6">
              แพลตฟอร์มสร้างร้านค้าออนไลน์สำหรับผู้ขายไทย พร้อม domain, payment,
              ดีไซน์ครบในที่เดียว
            </p>
            <div className="flex items-center gap-3">
              {[
                { label: 'Facebook', icon: Facebook, href: '#' },
                { label: 'LINE', icon: MessageCircle, href: '#' },
                { label: 'Instagram', icon: Instagram, href: '#' },
                { label: 'YouTube', icon: Youtube, href: '#' },
              ].map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-mp-cream/20 text-mp-cream/80 hover:text-mp-coral hover:border-mp-coral transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="ผลิตภัณฑ์" links={COL_PRODUCT} />
          <FooterColumn title="เริ่มต้น" links={COL_START} />
          <FooterColumn title="ช่วยเหลือ" links={COL_HELP} />

          {/* Contact column */}
          <div>
            <ColumnHeading>ติดต่อ</ColumnHeading>
            <ul className="space-y-3 text-[15px] text-mp-cream/90">
              <li>
                <a
                  href="mailto:support@basketplace.co"
                  className="hover:text-mp-coral transition-colors"
                >
                  support@basketplace.co
                </a>
              </li>
              <li>@basketplace (LINE OA)</li>
              <li>082-XXX-XXXX</li>
              <li className="leading-6 text-mp-cream/70 text-[14px]">
                888 อาคารตัวอย่าง ชั้น 12
                <br />
                ถ.สุขุมวิท แขวงคลองเตย
                <br />
                เขตคลองเตย กรุงเทพฯ 10110
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-mp-cream/15 text-[13px] text-mp-cream/60">
          <p>© 2026 Basketplace. สงวนลิขสิทธิ์.</p>
          <nav className="flex items-center gap-4">
            {LEGAL_LINKS.map((link, i) => (
              <span key={link.href + link.label} className="flex items-center gap-4">
                <Link href={link.href} className="hover:text-mp-coral transition-colors">
                  {link.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span aria-hidden="true" className="text-mp-cream/30">·</span>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 text-[11px] font-medium rounded border border-mp-cream/25 text-mp-cream/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
