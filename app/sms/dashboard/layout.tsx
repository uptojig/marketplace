/**
 * SMSUP+ dashboard sub-shell — side nav for logged-in operators.
 */

import Link from 'next/link';
import {
  BarChart3,
  History,
  KeyRound,
  LayoutDashboard,
  Send,
  UserCircle2,
} from 'lucide-react';

const NAV = [
  { href: '/sms/dashboard', label: 'ภาพรวม', Icon: LayoutDashboard, exact: true },
  { href: '/sms/dashboard/send', label: 'ส่ง SMS', Icon: Send },
  { href: '/sms/dashboard/history', label: 'ประวัติส่ง', Icon: History },
  { href: '/sms/dashboard/api-keys', label: 'API Keys', Icon: KeyRound },
  { href: '/sms/account', label: 'บัญชี', Icon: UserCircle2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
      <aside className="lg:sticky lg:top-24 self-start">
        <nav
          className="rounded-2xl bg-white border p-2 flex lg:flex-col gap-1 overflow-x-auto"
          style={{ borderColor: 'var(--sms-line)' }}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap hover:bg-[var(--sms-paper-2)] transition-colors"
            >
              <n.Icon className="w-4 h-4 opacity-70" />
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
