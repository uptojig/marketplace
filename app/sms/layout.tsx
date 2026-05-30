/**
 * SMSUP+ shell — scoped brand palette + sticky nav + footer.
 *
 * The marketplace root layout sets <html data-theme="marketplace-fantasy">
 * (pink primary + cyan secondary). SMSUP+ runs its own deep-navy + cyan +
 * yellow palette via CSS vars scoped to this subtree, so it can coexist
 * with the marketplace pages without polluting the global theme.
 */

import Link from 'next/link';
import { MessageSquare, Github, Mail } from 'lucide-react';

export const metadata = {
  title: 'SMSUP+ · บริการส่ง SMS สำหรับธุรกิจ',
  description:
    'ส่ง SMS ครบวงจร — OTP, แจ้งเตือน, การตลาด ส่งสำเร็จ 99.7% เชื่อมตรง AIS / TRUE / DTAC เริ่มต้น ฿0.20 ต่อข้อความ',
};

export default function SmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="smsup-scope min-h-dvh flex flex-col">
      <style>{`
        .smsup-scope {
          --sms-ink: #0B1220;
          --sms-paper: #FAFAFA;
          --sms-paper-2: #F1F3F8;
          --sms-line: #E5E9F0;
          --sms-muted: #5B6478;
          --sms-brand: #00D4FF;
          --sms-brand-deep: #0099C7;
          --sms-accent: #FFD60A;
          --sms-good: #00C48C;
          --sms-pop: #FF3D71;
          font-family: 'Noto Sans Thai Looped', 'Inter', ui-sans-serif, system-ui, sans-serif;
          background: var(--sms-paper);
          color: var(--sms-ink);
          letter-spacing: -0.005em;
        }
        .smsup-scope a { color: inherit; }
      `}</style>

      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: 'rgba(255,255,255,0.85)', borderColor: 'var(--sms-line)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Logo />
        <nav className="hidden md:flex gap-7 text-sm font-medium opacity-80">
          <Link href="/sms/pricing">ราคา</Link>
          <Link href="/sms#features">ฟีเจอร์</Link>
          <Link href="/sms#usecases">การใช้งาน</Link>
          <Link href="/sms/docs">API</Link>
          <Link href="/sms#faq">คำถาม</Link>
        </nav>
        <div className="ml-auto flex gap-2.5 items-center">
          <Link
            href="/sms/dashboard"
            className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold hover:bg-[var(--sms-paper-2)]"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/sms/pricing"
            className="inline-flex px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'var(--sms-ink)' }}
          >
            เริ่มใช้งานฟรี
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const ms = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl';
  const mark = size === 'lg' ? 'w-9 h-9' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <Link href="/sms" className={`inline-flex items-center gap-2 font-black tracking-tight ${ms}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      <span
        className={`inline-flex items-center justify-center rounded-lg ${mark}`}
        style={{ background: 'var(--sms-ink)', color: 'var(--sms-brand)' }}
      >
        <MessageSquare className="w-1/2 h-1/2" strokeWidth={2.5} />
      </span>
      SMSUP<span style={{ color: 'var(--sms-brand-deep)' }}>+</span>
    </Link>
  );
}

function Footer() {
  return (
    <footer style={{ background: 'var(--sms-paper-2)' }} className="pt-14 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
          <div>
            <Logo size="lg" />
            <p className="mt-3 max-w-xs" style={{ color: 'var(--sms-muted)' }}>
              บริการ SMS Gateway สำหรับธุรกิจในประเทศไทย — ส่งเร็ว ส่งถูก ส่งถึง
            </p>
            <div className="flex gap-2 mt-3.5">
              <SocialIcon href="#"><Github className="w-4 h-4" /></SocialIcon>
              <SocialIcon href="#"><Mail className="w-4 h-4" /></SocialIcon>
            </div>
          </div>
          <FooterCol title="ผลิตภัณฑ์" links={[
            ['SMS Gateway', '/sms'],
            ['OTP API', '/sms/docs'],
            ['Campaign Manager', '/sms/dashboard/send'],
            ['Sender Name', '/sms/account'],
          ]} />
          <FooterCol title="นักพัฒนา" links={[
            ['API Docs', '/sms/docs'],
            ['SDKs', '/sms/docs'],
            ['Status', '#'],
            ['Changelog', '#'],
          ]} />
          <FooterCol title="บริษัท" links={[
            ['เกี่ยวกับเรา', '#'],
            ['ติดต่อ', '#'],
            ['นโยบายความเป็นส่วนตัว', '#'],
            ['PDPA', '#'],
          ]} />
        </div>
        <div
          className="pt-6 flex flex-col md:flex-row justify-between gap-2 border-t"
          style={{ borderColor: 'var(--sms-line)', color: 'var(--sms-muted)' }}
        >
          <span>© 2569 SMSUP+ · ทุกสิทธิ์สงวน</span>
          <span>เลขจดทะเบียน 0105566012345 · ภพ.20</span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-white hover:bg-[var(--sms-line)]"
    >
      {children}
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h5 className="text-xs font-extrabold uppercase tracking-[0.1em] mb-3.5" style={{ color: 'var(--sms-muted)' }}>
        {title}
      </h5>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="opacity-80 hover:opacity-100">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
