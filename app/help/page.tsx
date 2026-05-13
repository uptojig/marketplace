import Link from 'next/link';
import { Card } from '@/components/ui/card';

const HELP_CATEGORIES = [
  {
    title: 'การสั่งซื้อ',
    icon: '🛒',
    links: [
      { href: '/help/how-to-order', label: 'วิธีการสั่งซื้อ' },
      { href: '/help/how-to-pay', label: 'วิธีการชำระเงิน' },
    ],
  },
  {
    title: 'การจัดส่ง',
    icon: '📦',
    links: [
      { href: '/help/shipping', label: 'ค่าจัดส่ง + เวลาส่ง' },
      { href: '/help/tracking', label: 'ติดตามพัสดุ' },
    ],
  },
  {
    title: 'หลังการขาย',
    icon: '↩️',
    links: [
      { href: '/help/returns', label: 'การคืน/เปลี่ยน' },
      { href: '/help/cancellations', label: 'ยกเลิกคำสั่งซื้อ' },
    ],
  },
  {
    title: 'อื่นๆ',
    icon: '💬',
    links: [
      { href: '/help/contact', label: 'ติดต่อเรา' },
      { href: '/help/faq', label: 'คำถามที่พบบ่อย' },
    ],
  },
];

export default function HelpIndex() {
  return (
    <div className="not-prose">
      <h1 className="mb-2 text-2xl font-semibold">Help Center</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        คำตอบสำหรับคำถามที่พบบ่อย ครอบคลุมการสั่งซื้อ การชำระเงิน การจัดส่ง และอื่นๆ
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {HELP_CATEGORIES.map((cat) => (
          <Card key={cat.title} className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="font-semibold">{cat.title}</h2>
            </div>
            <ul className="space-y-1">
              {cat.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-primary hover:underline"
                  >
                    → {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Help Center — Basketplace',
};
