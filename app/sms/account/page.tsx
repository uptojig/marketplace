/**
 * SMSUP+ account — profile, tax invoice, sender names, notifications, danger zone.
 */

import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  CircleDot,
  Mail,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  User,
} from 'lucide-react';
import { MOCK_ACCOUNT } from '@/lib/sms-mock';

export const dynamic = 'force-static';

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="font-black text-3xl tracking-[-0.02em]"
          style={{ fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
        >
          ตั้งค่าบัญชี
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sms-muted)' }}>
          ข้อมูลโปรไฟล์ · ใบกำกับภาษี · sender names · การแจ้งเตือน
        </p>
      </div>

      {/* Profile */}
      <Section title="โปรไฟล์" Icon={User}>
        <Field label="ชื่อ-สกุล" defaultValue="คุณตัวอย่าง ภูเขาไฟ" />
        <Field label="อีเมล" defaultValue="example@volcano.co" mono Icon={Mail} verified />
        <Field label="เบอร์โทร" defaultValue="0812345678" mono Icon={Phone} verified />
      </Section>

      {/* Company / Tax */}
      <Section title="ข้อมูลใบกำกับภาษี" Icon={Building2}>
        <Field label="ชื่อบริษัท" defaultValue="บริษัท ตัวอย่าง จำกัด" full />
        <Field label="เลขประจำตัวผู้เสียภาษี" defaultValue="0105566012345" mono />
        <Field label="สำนักงาน" defaultValue="สำนักงานใหญ่" />
        <Field
          label="ที่อยู่"
          defaultValue="123/456 ซอยรัชดา-ห้วยขวาง แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310"
          full
          multiline
        />
        <button
          className="sm:col-span-2 mt-2 self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold"
          style={{ background: 'var(--sms-ink)', color: 'white' }}
        >
          บันทึก
        </button>
      </Section>

      {/* Sender names */}
      <Section title="Sender Names" Icon={BadgeCheck}>
        <div className="sm:col-span-2 space-y-2">
          {MOCK_ACCOUNT.senderNames.map((s, i) => (
            <SenderRow key={s} name={s} approved={i < 2} usage={i === 0 ? 'OTP + Marketing' : i === 1 ? 'E-commerce' : 'Booking'} />
          ))}
          <button
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold border-[1.5px] border-dashed"
            style={{ borderColor: 'var(--sms-line)' }}
          >
            <Plus className="w-4 h-4" />
            ขออนุมัติ Sender Name ใหม่
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="การแจ้งเตือน" Icon={Bell}>
        <NotifRow
          label="แจ้งเตือนเครดิตเหลือน้อย"
          desc="ส่งอีเมลเมื่อเครดิตเหลือต่ำกว่า 500 SMS"
          on
        />
        <NotifRow
          label="รายงาน weekly summary"
          desc="ส่งสรุปการใช้งานทุกวันจันทร์ 9:00"
          on
        />
        <NotifRow
          label="แจ้งเตือนทุกการส่ง"
          desc="ไม่แนะนำ — อีเมลเข้าจำนวนมาก"
        />
        <NotifRow
          label="แจ้งเตือน webhook ล้มเหลว"
          desc="ส่งทันทีเมื่อ webhook callback fail"
          on
        />
      </Section>

      {/* Danger zone */}
      <div
        className="rounded-2xl bg-white border-[1.5px] p-6"
        style={{ borderColor: '#FEE4E2' }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <span
            className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
            style={{ background: '#FEE4E2' }}
          >
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--sms-pop)' }} />
          </span>
          <h2 className="font-extrabold text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
            Danger Zone
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--sms-muted)' }}>
          การกระทำในส่วนนี้ไม่สามารถย้อนกลับได้ — โปรดอ่านให้ละเอียดก่อนกด
        </p>
        <div className="mt-4 space-y-3">
          <DangerRow
            title="โอนบัญชีให้คนอื่น"
            desc="โอน ownership ให้ user อื่น พร้อมเครดิตคงเหลือ + sender names"
            label="โอนบัญชี"
          />
          <DangerRow
            title="ปิดบัญชีถาวร"
            desc="ลบบัญชี + ประวัติ + sender names · เครดิตที่เหลือถูกคืนตามนโยบาย refund"
            label="ปิดบัญชี"
            destructive
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-white border p-6"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <span
          className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
          style={{ background: 'var(--sms-paper-2)' }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--sms-brand-deep)' }} />
        </span>
        <h2 className="font-extrabold text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  mono,
  full,
  multiline,
  Icon,
  verified,
}: {
  label: string;
  defaultValue: string;
  mono?: boolean;
  full?: boolean;
  multiline?: boolean;
  Icon?: React.ElementType;
  verified?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-xs font-semibold flex items-center gap-1.5">
        {label}
        {verified && (
          <span
            className="inline-flex items-center gap-0.5 font-mono text-[0.6rem] font-bold px-1.5 py-px rounded"
            style={{ background: 'var(--sms-good)', color: 'white' }}
          >
            <BadgeCheck className="w-2.5 h-2.5" />
            ยืนยันแล้ว
          </span>
        )}
      </span>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="w-4 h-4 opacity-50" />
          </span>
        )}
        {multiline ? (
          <textarea
            rows={2}
            defaultValue={defaultValue}
            className={`w-full bg-[var(--sms-paper)] rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--sms-ink)] focus:bg-white ${mono ? 'font-mono' : ''}`}
            style={{ borderColor: 'var(--sms-line)' }}
          />
        ) : (
          <input
            defaultValue={defaultValue}
            className={`w-full bg-[var(--sms-paper)] rounded-lg border ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 text-sm outline-none focus:border-[var(--sms-ink)] focus:bg-white ${mono ? 'font-mono' : ''}`}
            style={{ borderColor: 'var(--sms-line)' }}
          />
        )}
      </div>
    </label>
  );
}

function SenderRow({ name, approved, usage }: { name: string; approved: boolean; usage: string }) {
  return (
    <div
      className="rounded-xl border p-3.5 flex items-center gap-3"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <span
        className="w-10 h-10 rounded-lg inline-flex items-center justify-center font-mono font-bold"
        style={{
          background: approved ? 'var(--sms-ink)' : 'var(--sms-paper-2)',
          color: approved ? 'var(--sms-brand)' : 'var(--sms-muted)',
        }}
      >
        {name.charAt(0)}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold">{name}</span>
          {approved ? (
            <span
              className="font-mono text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--sms-good)', color: 'white' }}
            >
              อนุมัติแล้ว
            </span>
          ) : (
            <span
              className="font-mono text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
              style={{ background: '#FEF0C7', color: '#93370D' }}
            >
              กำลังตรวจสอบ
            </span>
          )}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--sms-muted)' }}>
          ใช้สำหรับ · {usage}
        </div>
      </div>
      <button className="opacity-60 hover:opacity-100" aria-label="ลบ">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function NotifRow({ label, desc, on }: { label: string; desc: string; on?: boolean }) {
  return (
    <label className="sm:col-span-2 flex items-center justify-between gap-3 p-3 bg-[var(--sms-paper)] rounded-lg cursor-pointer">
      <div>
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs" style={{ color: 'var(--sms-muted)' }}>
          {desc}
        </div>
      </div>
      <span
        className="relative w-10 h-6 rounded-full transition-colors shrink-0"
        style={{ background: on ? 'var(--sms-good)' : 'var(--sms-line)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
          style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </span>
    </label>
  );
}

function DangerRow({
  title,
  desc,
  label,
  destructive,
}: {
  title: string;
  desc: string;
  label: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--sms-line)' }}>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs" style={{ color: 'var(--sms-muted)' }}>
          {desc}
        </div>
      </div>
      <button
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap"
        style={
          destructive
            ? { background: 'var(--sms-pop)', color: 'white', borderColor: 'var(--sms-pop)' }
            : { borderColor: 'var(--sms-line)' }
        }
      >
        {label}
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
