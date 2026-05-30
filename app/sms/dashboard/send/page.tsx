/**
 * SMSUP+ Send SMS composer — recipient + sender name + message + live cost.
 */

'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Eye,
  Send,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import { MOCK_ACCOUNT } from '@/lib/sms-mock';

const TEMPLATES = [
  { label: 'OTP', body: 'รหัส OTP ของคุณคือ {{otp}} ใช้งานภายใน 5 นาที' },
  { label: 'ใบเสร็จ', body: 'ขอบคุณสำหรับการสั่งซื้อ ออเดอร์ #{{order_id}} จัดส่งภายใน 2-3 วัน' },
  { label: 'นัดหมาย', body: 'แจ้งเตือน — นัดหมายของคุณวันที่ {{date}} เวลา {{time}}' },
  { label: 'โปรโมชั่น', body: 'พิเศษเฉพาะคุณ! ลด 20% สำหรับการซื้อครั้งหน้า ใช้โค้ด {{code}}' },
];

export default function SendSmsPage() {
  const [sender, setSender] = useState(MOCK_ACCOUNT.senderNames[0]);
  const [recipients, setRecipients] = useState('0812345678\n0998765432');
  const [body, setBody] = useState('รหัส OTP ของคุณคือ 284917 ใช้งานภายใน 5 นาที');
  const [schedule, setSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');

  const stats = useMemo(() => {
    const lines = recipients.split('\n').map((l) => l.trim()).filter(Boolean);
    const len = body.length;
    const partsPerSms = len === 0 ? 1 : Math.ceil(len / 160);
    return {
      recipients: lines.length,
      len,
      partsPerSms,
      totalCredits: lines.length * partsPerSms,
    };
  }, [recipients, body]);

  const insufficient = stats.totalCredits > MOCK_ACCOUNT.balance;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="font-black text-3xl tracking-[-0.02em]"
          style={{ fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
        >
          ส่ง SMS ใหม่
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sms-muted)' }}>
          กรอกผู้รับ ข้อความ แล้วกดส่ง — เห็น cost ก่อนส่ง ไม่มี surprise
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Compose */}
        <div className="space-y-5">
          {/* Sender + recipients */}
          <Card>
            <Label>ส่งจาก (Sender Name)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {MOCK_ACCOUNT.senderNames.map((s) => (
                <button
                  key={s}
                  onClick={() => setSender(s)}
                  className={`px-3 py-2.5 rounded-lg border-[1.5px] text-sm font-mono font-bold transition-colors ${sender === s ? '' : 'hover:bg-[var(--sms-paper-2)]'}`}
                  style={{
                    borderColor: sender === s ? 'var(--sms-ink)' : 'var(--sms-line)',
                    background: sender === s ? 'var(--sms-ink)' : 'white',
                    color: sender === s ? 'white' : undefined,
                  }}
                >
                  {s}
                </button>
              ))}
              <button
                className="px-3 py-2.5 rounded-lg border-[1.5px] border-dashed text-sm font-bold"
                style={{ borderColor: 'var(--sms-muted)', color: 'var(--sms-muted)' }}
              >
                + เพิ่ม Sender
              </button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <Label>ผู้รับ ({stats.recipients.toLocaleString('th-TH')} เบอร์)</Label>
              <div className="flex gap-2">
                <SmallBtn Icon={Users}>เลือกจาก Audience</SmallBtn>
                <SmallBtn Icon={Upload}>อัพโหลด CSV</SmallBtn>
              </div>
            </div>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              rows={6}
              placeholder="กรอกเบอร์โทร 1 เบอร์ต่อบรรทัด เช่น&#10;0812345678&#10;0998765432"
              className="w-full rounded-lg border px-4 py-3 text-sm font-mono outline-none focus:border-[var(--sms-ink)] resize-y bg-[var(--sms-paper)]"
              style={{ borderColor: 'var(--sms-line)' }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--sms-muted)' }}>
              💡 รองรับเบอร์ภายในประเทศ (08x, 09x, 06x) สูงสุด 10,000 เบอร์ต่อครั้ง
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <Label>ข้อความ</Label>
              <span className="text-xs font-mono" style={{ color: stats.len > 160 ? 'var(--sms-pop)' : 'var(--sms-muted)' }}>
                {stats.len} / 160 ตัวอักษร · {stats.partsPerSms} SMS
              </span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full rounded-lg border px-4 py-3 text-base outline-none focus:border-[var(--sms-ink)] resize-y bg-[var(--sms-paper)]"
              style={{ borderColor: 'var(--sms-line)' }}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs font-semibold opacity-70 self-center">เทมเพลต:</span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setBody(t.body)}
                  className="px-2.5 py-1 rounded-full text-xs font-bold border hover:bg-[var(--sms-paper-2)]"
                  style={{ borderColor: 'var(--sms-line)' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
                  style={{ background: 'var(--sms-paper-2)' }}
                >
                  <Calendar className="w-4 h-4" style={{ color: 'var(--sms-brand-deep)' }} />
                </span>
                <div>
                  <div className="font-bold text-sm">ตั้งเวลาส่ง</div>
                  <div className="text-xs" style={{ color: 'var(--sms-muted)' }}>
                    ส่งทันที (เริ่มต้น) หรือตั้งเวลาภายใน 30 วัน
                  </div>
                </div>
              </div>
              <input type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} className="w-5 h-5" />
            </label>
            {schedule && (
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="w-full mt-3 rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[var(--sms-ink)] bg-[var(--sms-paper)]"
                style={{ borderColor: 'var(--sms-line)' }}
              />
            )}
          </Card>
        </div>

        {/* Right: Preview + cost */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          {/* Phone preview */}
          <Card>
            <Label>ตัวอย่างที่ผู้รับเห็น</Label>
            <div
              className="mt-3 rounded-2xl p-4"
              style={{ background: 'linear-gradient(180deg, #1A2236, #0B1220)', color: 'white' }}
            >
              <div
                className="rounded-lg p-3.5 backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex justify-between text-[0.65rem] opacity-60 mb-1.5 font-mono">
                  <span>{sender}</span>
                  <span>เมื่อสักครู่</span>
                </div>
                <div className="text-sm leading-snug whitespace-pre-wrap">
                  {body || <span className="opacity-50">ข้อความจะแสดงที่นี่...</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Cost summary */}
          <Card>
            <Label>สรุปค่าส่ง</Label>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="จำนวนผู้รับ" value={`${stats.recipients.toLocaleString('th-TH')} เบอร์`} />
              <Row label="ความยาวข้อความ" value={`${stats.len} ตัวอักษร`} />
              <Row label="จำนวน SMS ต่อข้อความ" value={`${stats.partsPerSms} ส่วน`} />
              <div className="my-2 border-t border-dashed" style={{ borderColor: 'var(--sms-line)' }} />
              <Row label="เครดิตที่ใช้รวม" value={stats.totalCredits.toLocaleString('th-TH')} big />
              <Row label="เครดิตคงเหลือก่อนส่ง" value={MOCK_ACCOUNT.balance.toLocaleString('th-TH')} muted />
            </div>
            {insufficient && (
              <div
                className="mt-3 p-3 rounded-lg flex gap-2.5"
                style={{ background: '#FEE4E2', color: '#B42318' }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs">
                  เครดิตไม่พอ — ขาดอีก {(stats.totalCredits - MOCK_ACCOUNT.balance).toLocaleString('th-TH')} เครดิต
                </span>
              </div>
            )}
            <button
              type="button"
              disabled={insufficient || stats.recipients === 0 || stats.len === 0}
              className="w-full mt-4 inline-flex justify-center items-center gap-2 px-5 py-3 rounded-full font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: 'var(--sms-ink)', color: 'white' }}
            >
              <Send className="w-4 h-4" />
              {schedule ? 'ตั้งเวลาส่ง' : 'ส่งทันที'}
            </button>

            <button
              type="button"
              className="w-full mt-2 inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-[1.5px]"
              style={{ borderColor: 'var(--sms-line)' }}
            >
              <Eye className="w-4 h-4" /> ส่งทดสอบเข้ามือถือผม
            </button>
          </Card>

          <Card>
            <div className="flex gap-2.5">
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--sms-brand-deep)' }} />
              <div>
                <div className="font-bold text-sm mb-1">AI Optimize</div>
                <p className="text-xs" style={{ color: 'var(--sms-muted)' }}>
                  ให้ AI ช่วยปรับข้อความให้สั้นลง / น่าคลิกขึ้น โดยไม่เสียความหมาย
                </p>
                <button
                  className="mt-2 text-xs font-bold underline"
                  style={{ color: 'var(--sms-brand-deep)' }}
                >
                  ลองให้ AI ปรับ
                </button>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border p-5" style={{ borderColor: 'var(--sms-line)' }}>
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--sms-muted)' }}>
      {children}
    </div>
  );
}
function SmallBtn({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold border hover:bg-[var(--sms-paper-2)]"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <Icon className="w-3 h-3" />
      {children}
    </button>
  );
}
function Row({ label, value, big, muted }: { label: string; value: string; big?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={`text-sm ${muted ? 'opacity-60' : ''}`}>{label}</span>
      <span className={`font-mono font-bold ${big ? 'text-xl' : ''}`}>{value}</span>
    </div>
  );
}
