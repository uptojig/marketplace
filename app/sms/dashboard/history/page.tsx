/**
 * SMSUP+ history — sent SMS log with filters + export.
 */

import {
  ArrowUpDown,
  Calendar,
  CheckCheck,
  Clock,
  Download,
  Filter,
  Search,
  XCircle,
} from 'lucide-react';
import { MOCK_MESSAGES, type SmsMessage } from '@/lib/sms-mock';

export const dynamic = 'force-static';

// Repeat mock data to fill the table
const ROWS: SmsMessage[] = [
  ...MOCK_MESSAGES,
  ...MOCK_MESSAGES.map((m, i) => ({ ...m, id: m.id + '-r' + i, sentAt: '2 วันก่อน' })),
  ...MOCK_MESSAGES.slice(0, 3).map((m, i) => ({ ...m, id: m.id + '-r2-' + i, sentAt: '3 วันก่อน' })),
];

export default function HistoryPage() {
  const stats = {
    total: ROWS.length,
    delivered: ROWS.filter((m) => m.status === 'delivered').length,
    pending: ROWS.filter((m) => m.status === 'pending').length,
    failed: ROWS.filter((m) => m.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="font-black text-3xl tracking-[-0.02em]"
            style={{ fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
          >
            ประวัติการส่ง
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--sms-muted)' }}>
            ข้อความทั้งหมดที่ส่งจากบัญชีของคุณ · sync real-time จาก gateway
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border"
          style={{ borderColor: 'var(--sms-line)' }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-4 gap-3">
        <StatPill label="ทั้งหมด" value={stats.total.toLocaleString('th-TH')} />
        <StatPill label="ส่งสำเร็จ" value={stats.delivered.toLocaleString('th-TH')} tint="good" />
        <StatPill label="กำลังส่ง" value={stats.pending.toLocaleString('th-TH')} tint="warn" />
        <StatPill label="ล้มเหลว" value={stats.failed.toLocaleString('th-TH')} tint="pop" />
      </div>

      {/* Filter bar */}
      <div
        className="rounded-2xl bg-white border p-3 flex flex-wrap gap-3 items-center"
        style={{ borderColor: 'var(--sms-line)' }}
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--sms-paper-2)] rounded-lg flex-1 min-w-[200px]">
          <Search className="w-4 h-4 opacity-60" />
          <input
            placeholder="ค้นเบอร์ปลายทาง / ข้อความ / sender name"
            className="bg-transparent outline-none text-sm flex-1 min-w-0"
          />
        </div>
        <Chip Icon={Calendar} label="7 วันล่าสุด" />
        <Chip Icon={Filter} label="ทุกสถานะ" />
        <Chip Icon={ArrowUpDown} label="ใหม่ → เก่า" />
      </div>

      {/* Table */}
      <div
        className="rounded-2xl bg-white border overflow-hidden"
        style={{ borderColor: 'var(--sms-line)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left font-mono text-xs uppercase tracking-[0.06em]"
                style={{ background: 'var(--sms-paper-2)', color: 'var(--sms-muted)' }}
              >
                <Th>เวลา</Th>
                <Th>สถานะ</Th>
                <Th>ปลายทาง</Th>
                <Th>Sender</Th>
                <Th>ข้อความ</Th>
                <Th>ประเภท</Th>
                <Th right>เครดิต</Th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((m) => (
                <Row key={m.id} m={m} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-t text-sm"
          style={{ borderColor: 'var(--sms-line)' }}
        >
          <span style={{ color: 'var(--sms-muted)' }}>
            แสดง 1-{ROWS.length} จาก 12,847 รายการ
          </span>
          <div className="flex gap-1">
            <PageBtn disabled>‹</PageBtn>
            <PageBtn active>1</PageBtn>
            <PageBtn>2</PageBtn>
            <PageBtn>3</PageBtn>
            <PageBtn>…</PageBtn>
            <PageBtn>92</PageBtn>
            <PageBtn>›</PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tint = 'default',
}: {
  label: string;
  value: string;
  tint?: 'default' | 'good' | 'warn' | 'pop';
}) {
  const colors = {
    default: 'var(--sms-ink)',
    good: 'var(--sms-good)',
    warn: '#F79009',
    pop: 'var(--sms-pop)',
  };
  return (
    <div className="rounded-xl bg-white border p-4" style={{ borderColor: 'var(--sms-line)' }}>
      <div className="font-mono text-[0.7rem] uppercase tracking-[0.06em]" style={{ color: 'var(--sms-muted)' }}>
        {label}
      </div>
      <div
        className="font-black text-2xl tracking-[-0.02em] mt-1"
        style={{ color: colors[tint], fontFamily: 'Inter, sans-serif' }}
      >
        {value}
      </div>
    </div>
  );
}

function Chip({ Icon, label }: { Icon: React.ElementType; label: string }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border bg-white"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`p-4 font-bold ${right ? 'text-right' : ''}`}>{children}</th>;
}

function Row({ m }: { m: SmsMessage }) {
  const statusMap = {
    delivered: { Icon: CheckCheck, color: 'var(--sms-good)', bg: '#D1FADF', label: 'ส่งสำเร็จ' },
    pending: { Icon: Clock, color: '#F79009', bg: '#FEF0C7', label: 'กำลังส่ง' },
    failed: { Icon: XCircle, color: 'var(--sms-pop)', bg: '#FEE4E2', label: 'ล้มเหลว' },
  } as const;
  const s = statusMap[m.status];
  const kindMap = { otp: 'OTP', tx: 'TX', marketing: 'MKT' } as const;
  return (
    <tr className="border-t hover:bg-[var(--sms-paper)] transition-colors" style={{ borderColor: 'var(--sms-line)' }}>
      <td className="p-4 font-mono text-xs" style={{ color: 'var(--sms-muted)' }}>
        {m.sentAt}
      </td>
      <td className="p-4">
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold"
          style={{ background: s.bg, color: s.color }}
        >
          <s.Icon className="w-3 h-3" />
          {s.label}
        </span>
      </td>
      <td className="p-4 font-mono">{m.to}</td>
      <td className="p-4 font-mono text-xs font-bold opacity-80">{m.senderName}</td>
      <td className="p-4 max-w-[260px]">
        <div className="truncate">{m.preview}</div>
      </td>
      <td className="p-4">
        <span
          className="font-mono text-[0.65rem] font-bold px-2 py-1 rounded"
          style={{ background: 'var(--sms-paper-2)', color: 'var(--sms-muted)' }}
        >
          {kindMap[m.kind]}
        </span>
      </td>
      <td className="p-4 text-right font-mono font-bold">{m.cost}</td>
    </tr>
  );
}

function PageBtn({
  active,
  disabled,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      className={`w-8 h-8 rounded-md text-sm font-bold ${active ? '' : 'hover:bg-[var(--sms-paper-2)]'} disabled:opacity-40`}
      style={
        active
          ? { background: 'var(--sms-ink)', color: 'white' }
          : { color: 'var(--sms-ink)' }
      }
    >
      {children}
    </button>
  );
}
