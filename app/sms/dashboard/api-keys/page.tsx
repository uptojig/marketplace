/**
 * SMSUP+ API Keys — list, create, revoke, copy. Production / Staging tags.
 */

import {
  AlertTriangle,
  Copy,
  Eye,
  KeyRound,
  Plus,
  Trash2,
  Webhook,
} from 'lucide-react';
import { MOCK_API_KEYS } from '@/lib/sms-mock';

export const dynamic = 'force-static';

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="font-black text-3xl tracking-[-0.02em]"
            style={{ fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
          >
            API Keys
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--sms-muted)' }}>
            สร้างและจัดการ API keys สำหรับเชื่อมต่อ SMS gateway กับระบบของคุณ
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--sms-ink)', color: 'white' }}
        >
          <Plus className="w-4 h-4" />
          สร้าง API Key ใหม่
        </button>
      </div>

      {/* Warning */}
      <div
        className="rounded-2xl border p-4 flex gap-3"
        style={{ borderColor: '#FEDF89', background: '#FFFAEB' }}
      >
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#DC6803' }} />
        <div>
          <div className="font-bold text-sm" style={{ color: '#93370D' }}>
            เก็บ API Key เหมือนรหัสผ่าน
          </div>
          <p className="text-sm mt-1" style={{ color: '#93370D' }}>
            เราแสดงค่า full key เพียงครั้งเดียวตอนสร้าง — ห้ามแชร์ใน public repo ห้าม commit เข้า git
            ถ้าหลุดให้ <button className="underline font-bold">revoke ทันที</button> และสร้างใหม่
          </p>
        </div>
      </div>

      {/* Keys list */}
      <div className="space-y-3">
        {MOCK_API_KEYS.map((key, i) => (
          <KeyCard key={key.id} apiKey={key} isProd={i === 0} />
        ))}
      </div>

      {/* Webhook section */}
      <div
        className="rounded-2xl bg-white border p-6"
        style={{ borderColor: 'var(--sms-line)' }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span
            className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
            style={{ background: 'var(--sms-paper-2)' }}
          >
            <Webhook className="w-4 h-4" style={{ color: 'var(--sms-brand-deep)' }} />
          </span>
          <div>
            <h2 className="font-extrabold text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
              Webhook callback
            </h2>
            <p className="text-xs" style={{ color: 'var(--sms-muted)' }}>
              รับ delivery status push เข้า URL ของคุณทุกครั้งที่สถานะเปลี่ยน
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            defaultValue="https://api.example.com/webhooks/sms"
            className="flex-1 rounded-lg border px-3.5 py-2.5 text-sm font-mono outline-none focus:border-[var(--sms-ink)] bg-[var(--sms-paper)]"
            style={{ borderColor: 'var(--sms-line)' }}
          />
          <button
            className="px-4 py-2.5 rounded-lg text-sm font-bold border-[1.5px]"
            style={{ borderColor: 'var(--sms-ink)' }}
          >
            ทดสอบ
          </button>
          <button
            className="px-4 py-2.5 rounded-lg text-sm font-bold"
            style={{ background: 'var(--sms-ink)', color: 'white' }}
          >
            บันทึก
          </button>
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-2 text-xs">
          <Stat label="ส่งสำเร็จ" value="48,392" color="var(--sms-good)" />
          <Stat label="ล้มเหลว 24ชม" value="3" color="var(--sms-pop)" />
          <Stat label="เวลาเฉลี่ย" value="142ms" color="var(--sms-brand-deep)" />
        </div>
      </div>

      {/* Code example */}
      <CodeBlock />
    </div>
  );
}

function KeyCard({
  apiKey,
  isProd,
}: {
  apiKey: (typeof MOCK_API_KEYS)[number];
  isProd: boolean;
}) {
  return (
    <div
      className="rounded-2xl bg-white border p-5 flex items-center gap-4 flex-wrap"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <span
        className="w-11 h-11 rounded-xl inline-flex items-center justify-center shrink-0"
        style={{
          background: isProd ? 'var(--sms-ink)' : 'var(--sms-paper-2)',
          color: isProd ? 'var(--sms-brand)' : 'var(--sms-ink)',
        }}
      >
        <KeyRound className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-extrabold" style={{ fontFamily: 'Inter, sans-serif' }}>
            {apiKey.label}
          </span>
          {isProd ? (
            <span
              className="font-mono text-[0.6rem] font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--sms-pop)', color: 'white' }}
            >
              LIVE
            </span>
          ) : (
            <span
              className="font-mono text-[0.6rem] font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--sms-paper-2)', color: 'var(--sms-muted)' }}
            >
              TEST
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <code
            className="font-mono text-sm px-2.5 py-1 rounded"
            style={{ background: 'var(--sms-paper-2)' }}
          >
            {apiKey.prefix}_••••••••••••••••
          </code>
          <button title="คัดลอก" className="opacity-70 hover:opacity-100">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button title="แสดง" className="opacity-70 hover:opacity-100">
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="text-right text-xs" style={{ color: 'var(--sms-muted)' }}>
        <div>ใช้ล่าสุด {apiKey.lastUsedAt}</div>
        <div className="mt-0.5">สร้างเมื่อ {apiKey.createdAt}</div>
      </div>
      <button
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border"
        style={{ borderColor: '#FEE4E2', color: 'var(--sms-pop)' }}
      >
        <Trash2 className="w-3.5 h-3.5" />
        Revoke
      </button>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: 'var(--sms-paper-2)' }}>
      <div className="font-mono text-[0.65rem] uppercase tracking-[0.06em]" style={{ color: 'var(--sms-muted)' }}>
        {label}
      </div>
      <div className="font-mono font-bold text-base mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function CodeBlock() {
  const code = `// ส่ง SMS ด้วย curl
curl -X POST https://api.smsup.co/v1/messages \\
  -H "Authorization: Bearer sk_live_4f8a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "0812345678",
    "sender": "SMSUP",
    "body": "รหัส OTP ของคุณคือ 284917"
  }'`;
  return (
    <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: 'var(--sms-line)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--sms-line)' }}>
        <div className="font-bold text-sm">ตัวอย่างการเรียก API</div>
        <button className="inline-flex items-center gap-1.5 text-xs font-bold opacity-70 hover:opacity-100">
          <Copy className="w-3 h-3" /> คัดลอก
        </button>
      </div>
      <pre
        className="p-5 overflow-x-auto text-sm font-mono leading-relaxed"
        style={{ background: '#0B1220', color: '#E5E9F0' }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
