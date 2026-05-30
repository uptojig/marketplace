/**
 * SMSUP+ dashboard — credits balance, activity, quick send.
 */

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCheck,
  Clock,
  CreditCard,
  History,
  Plus,
  Send,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { MOCK_ACCOUNT, MOCK_MESSAGES } from '@/lib/sms-mock';

export const dynamic = 'force-static';

export default function DashboardHome() {
  const acc = MOCK_ACCOUNT;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="font-black text-3xl tracking-[-0.02em]"
            style={{ fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
          >
            สวัสดีค่ะ 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--sms-muted)' }}>
            ภาพรวมการใช้งาน SMS ของบัญชีคุณ — ข้อมูล real-time
          </p>
        </div>
        <Link
          href="/sms/dashboard/send"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--sms-ink)', color: 'white' }}
        >
          <Send className="w-4 h-4" />
          ส่ง SMS ใหม่
        </Link>
      </div>

      {/* Balance card */}
      <div
        className="rounded-3xl p-8 text-white relative overflow-hidden"
        style={{ background: 'var(--sms-ink)' }}
      >
        <span
          aria-hidden
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.32), transparent 70%)' }}
        />
        <div className="relative grid sm:grid-cols-[1.4fr_1fr] gap-8 items-end">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.1em] opacity-60 mb-2">เครดิตคงเหลือ</div>
            <div
              className="font-black text-[3.4rem] tracking-[-0.04em] leading-none mb-2"
              style={{ color: 'var(--sms-brand)', fontFamily: 'Inter, sans-serif' }}
            >
              {acc.balance.toLocaleString('th-TH')}
              <span className="text-base opacity-60 ml-2 font-semibold">SMS</span>
            </div>
            <div className="text-sm opacity-75">≈ พอใช้ {Math.floor(acc.balance / 400)} วัน @ 400 SMS/วัน</div>
          </div>
          <div className="flex flex-col gap-3 items-stretch">
            <Link
              href="/sms/pricing"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm justify-center"
              style={{ background: 'var(--sms-brand)', color: 'var(--sms-ink)' }}
            >
              <Plus className="w-4 h-4" /> ซื้อเครดิตเพิ่ม
            </Link>
            <Link
              href="/sms/dashboard/history"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm justify-center border"
              style={{ borderColor: 'rgba(255,255,255,0.25)' }}
            >
              <History className="w-4 h-4" /> ดูประวัติการเติม
            </Link>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="ส่งเดือนนี้"
          value={acc.monthSent.toLocaleString('th-TH')}
          unit="SMS"
          trend="+12.4%"
          Icon={Send}
          tint="brand"
        />
        <StatCard
          label="ค่าใช้จ่ายเดือนนี้"
          value={`฿${acc.monthSpentTHB.toLocaleString('th-TH')}`}
          unit=""
          trend="-3.2%"
          trendDown
          Icon={CreditCard}
          tint="accent"
        />
        <StatCard
          label="อัตราส่งสำเร็จ"
          value={`${acc.deliveryRate}%`}
          unit=""
          trend="+0.2pp"
          Icon={CheckCheck}
          tint="good"
        />
      </div>

      {/* Recent activity */}
      <div
        className="rounded-2xl bg-white border overflow-hidden"
        style={{ borderColor: 'var(--sms-line)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--sms-line)' }}>
          <div>
            <h3 className="font-extrabold text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
              กิจกรรมล่าสุด
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--sms-muted)' }}>
              5 ข้อความล่าสุด — sync real-time จาก gateway
            </p>
          </div>
          <Link
            href="/sms/dashboard/history"
            className="inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--sms-brand-deep)' }}
          >
            ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div>
          {MOCK_MESSAGES.map((m) => (
            <ActivityRow key={m.id} m={m} />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickAction
          href="/sms/dashboard/send"
          Icon={Send}
          title="Compose"
          desc="ส่ง SMS ทันที"
          tint="brand"
        />
        <QuickAction
          href="/sms/dashboard/api-keys"
          Icon={Zap}
          title="API Keys"
          desc="สร้าง / ดู keys"
          tint="accent"
        />
        <QuickAction
          href="/sms/docs"
          Icon={ArrowUpRight}
          title="Docs"
          desc="เอกสาร API + SDK"
          tint="good"
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  trend,
  trendDown,
  Icon,
  tint,
}: {
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendDown?: boolean;
  Icon: React.ElementType;
  tint: 'brand' | 'accent' | 'good';
}) {
  const tints = {
    brand: 'var(--sms-brand)',
    accent: 'var(--sms-accent)',
    good: 'var(--sms-good)',
  };
  return (
    <div
      className="rounded-2xl bg-white border p-5"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
          style={{ background: 'var(--sms-paper-2)' }}
        >
          <Icon className="w-4 h-4" style={{ color: tints[tint] }} />
        </span>
        <span
          className="font-mono font-bold text-xs px-2 py-0.5 rounded-full"
          style={{
            background: trendDown ? '#FEE4E2' : '#D1FADF',
            color: trendDown ? '#B42318' : '#027A48',
          }}
        >
          {trend}
        </span>
      </div>
      <div className="font-mono text-[0.7rem] uppercase tracking-[0.06em] mb-1" style={{ color: 'var(--sms-muted)' }}>
        {label}
      </div>
      <div className="font-black text-2xl tracking-[-0.02em]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {value} {unit && <span className="text-sm opacity-60 font-semibold">{unit}</span>}
      </div>
    </div>
  );
}

function ActivityRow({ m }: { m: typeof MOCK_MESSAGES[number] }) {
  const statusMap = {
    delivered: { Icon: CheckCheck, color: 'var(--sms-good)', label: 'ส่งสำเร็จ' },
    pending: { Icon: Clock, color: '#F79009', label: 'กำลังส่ง' },
    failed: { Icon: XCircle, color: 'var(--sms-pop)', label: 'ส่งล้มเหลว' },
  } as const;
  const s = statusMap[m.status];
  const kindMap = {
    otp: 'OTP',
    tx: 'TX',
    marketing: 'MKT',
  } as const;
  return (
    <div
      className="flex items-center gap-4 px-6 py-3.5 border-t hover:bg-[var(--sms-paper)] transition-colors"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <div
        className="w-9 h-9 shrink-0 rounded-lg inline-flex items-center justify-center"
        style={{ background: 'var(--sms-paper-2)', color: s.color }}
      >
        <s.Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-xs font-bold opacity-70">{m.senderName}</span>
          <span
            className="font-mono text-[0.6rem] font-bold px-1.5 py-px rounded"
            style={{ background: 'var(--sms-paper-2)', color: 'var(--sms-muted)' }}
          >
            {kindMap[m.kind]}
          </span>
          <span className="text-xs" style={{ color: 'var(--sms-muted)' }}>
            → {m.to}
          </span>
        </div>
        <div className="text-sm truncate">{m.preview}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-xs font-bold" style={{ color: s.color }}>
          {s.label}
        </div>
        <div className="text-xs" style={{ color: 'var(--sms-muted)' }}>
          {m.sentAt}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  Icon,
  title,
  desc,
  tint,
}: {
  href: string;
  Icon: React.ElementType;
  title: string;
  desc: string;
  tint: 'brand' | 'accent' | 'good';
}) {
  const gradients = {
    brand: 'linear-gradient(135deg, var(--sms-brand), var(--sms-brand-deep))',
    accent: 'linear-gradient(135deg, var(--sms-accent), #FFA500)',
    good: 'linear-gradient(135deg, var(--sms-good), #007A56)',
  };
  const txt = tint === 'accent' ? 'var(--sms-ink)' : 'white';
  return (
    <Link
      href={href}
      className="rounded-2xl p-5 bg-white border flex items-center gap-4 hover:-translate-y-0.5 transition-all hover:shadow-lg"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <span
        className="w-12 h-12 rounded-xl inline-flex items-center justify-center"
        style={{ background: gradients[tint], color: txt }}
      >
        <Icon className="w-5 h-5" />
      </span>
      <div className="flex-1">
        <div className="font-extrabold" style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </div>
        <div className="text-xs" style={{ color: 'var(--sms-muted)' }}>
          {desc}
        </div>
      </div>
      <ArrowRight className="w-4 h-4" style={{ color: 'var(--sms-muted)' }} />
    </Link>
  );
}
