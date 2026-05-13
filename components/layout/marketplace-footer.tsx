import Link from 'next/link';

const FOOTER_SECTIONS = [
  {
    title: 'เกี่ยวกับ Basketplace',
    links: [
      { label: 'เกี่ยวกับเรา', href: '/about' },
      { label: 'ร่วมงานกับเรา', href: '/careers' },
      { label: 'ติดต่อเรา', href: '/help/contact' },
      { label: 'ข่าวสารและสื่อ', href: '/press' },
    ],
  },
  {
    title: 'ช่วยเหลือลูกค้า',
    links: [
      { label: 'วิธีการสั่งซื้อ', href: '/help/how-to-order' },
      { label: 'วิธีการชำระเงิน', href: '/help/how-to-pay' },
      { label: 'การจัดส่ง', href: '/help/shipping' },
      { label: 'การคืน/เปลี่ยน', href: '/help/returns' },
      { label: 'คำถามที่พบบ่อย', href: '/help/faq' },
    ],
  },
  {
    title: 'สำหรับผู้ขาย',
    links: [
      { label: 'เปิดร้านค้า', href: '/seller/onboarding' },
      { label: 'ศูนย์ผู้ขาย', href: '/seller' },
      { label: 'ข้อตกลงผู้ขาย', href: '/legal/seller-agreement' },
      { label: 'Anypay สำหรับผู้ขาย', href: '/help/anypay' },
    ],
  },
  {
    title: 'ข้อกำหนด & นโยบาย',
    links: [
      { label: 'เงื่อนไขการใช้บริการ', href: '/legal/terms' },
      { label: 'นโยบายความเป็นส่วนตัว (PDPA)', href: '/legal/privacy' },
      { label: 'นโยบายคุกกี้', href: '/legal/cookies' },
      { label: 'กฎของชุมชน', href: '/legal/community' },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/basketplace' },
  { label: 'Instagram', href: 'https://instagram.com/basketplace' },
  { label: 'TikTok', href: 'https://tiktok.com/@basketplace' },
  { label: 'LINE', href: 'https://line.me/R/ti/p/@basketplace' },
];

export function MarketplaceFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="text-sm font-semibold">Basketplace</span>
            <span className="text-xs text-muted-foreground">by TAS</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} TAS Co., Ltd. All rights reserved. ผู้ให้บริการการชำระเงินโดย
          Anypay
        </p>
      </div>
    </footer>
  );
}
