/**
 * SMSUP+ API docs — sticky TOC + code examples.
 */

import Link from 'next/link';
import { ArrowRight, Code2, Copy, Globe, KeyRound, Webhook, Zap } from 'lucide-react';

export const dynamic = 'force-static';

const SECTIONS = [
  { id: 'quickstart', label: 'Quickstart', Icon: Zap },
  { id: 'auth', label: 'Authentication', Icon: KeyRound },
  { id: 'send', label: 'Send SMS', Icon: ArrowRight },
  { id: 'otp', label: 'OTP API', Icon: Globe },
  { id: 'webhook', label: 'Webhook', Icon: Webhook },
  { id: 'sdk', label: 'SDKs', Icon: Code2 },
];

export default function DocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1
          className="font-black tracking-[-0.02em]"
          style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
        >
          API Documentation
        </h1>
        <p className="text-lg mt-2" style={{ color: 'var(--sms-muted)' }}>
          REST API + SDK สำหรับ Node.js · PHP · Python · Go · .NET · curl · Postman
        </p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Pill label="v1.4.2 stable" />
          <Pill label="Base URL" code="https://api.smsup.co/v1" />
        </div>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        {/* TOC */}
        <aside className="lg:sticky lg:top-24 self-start">
          <nav
            className="rounded-2xl bg-white border p-2 flex flex-col gap-0.5"
            style={{ borderColor: 'var(--sms-line)' }}
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--sms-paper-2)]"
              >
                <s.Icon className="w-4 h-4 opacity-60" />
                {s.label}
              </a>
            ))}
          </nav>
          <Link
            href="/sms/dashboard/api-keys"
            className="mt-3 block rounded-2xl p-4 text-white"
            style={{ background: 'var(--sms-ink)' }}
          >
            <div className="font-bold text-sm">รับ API Key</div>
            <p className="text-xs opacity-70 mt-1">เริ่ม integrate ใน 30 วินาที</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold" style={{ color: 'var(--sms-brand)' }}>
              สร้าง key <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </aside>

        {/* Content */}
        <main className="space-y-14 min-w-0">
          <Section id="quickstart" title="Quickstart" sub="3 ขั้นตอน จาก signup → ส่ง SMS แรก ใน 30 วินาที">
            <ol className="space-y-3" style={{ counterReset: 'item' }}>
              {[
                ['สมัครและรับเครดิตฟรี 50 SMS', '/sms/dashboard'],
                ['สร้าง API key ใน Dashboard', '/sms/dashboard/api-keys'],
                ['ก๊อปโค้ดด้านล่างไปรัน ✨', '#send'],
              ].map(([t, href], i) => (
                <li key={t} className="flex gap-3.5 items-start">
                  <span
                    className="w-7 h-7 rounded-lg shrink-0 inline-flex items-center justify-center font-mono font-bold text-xs"
                    style={{ background: 'var(--sms-ink)', color: 'var(--sms-brand)' }}
                  >
                    {i + 1}
                  </span>
                  <Link href={href} className="flex-1 font-medium hover:underline">
                    {t}
                  </Link>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="auth" title="Authentication" sub="Bearer token ใน Authorization header — เก็บ secret เหมือนรหัสผ่าน">
            <Code lang="bash" code={`curl https://api.smsup.co/v1/account \\
  -H "Authorization: Bearer sk_live_4f8a..."`} />
            <Note>
              ห้าม embed key ใน frontend / public repo — ใช้ใน server-side เท่านั้น ถ้าหลุดให้ revoke
              ทันทีใน <Link href="/sms/dashboard/api-keys" className="underline font-bold">Dashboard → API Keys</Link>
            </Note>
          </Section>

          <Section id="send" title="Send SMS" sub="POST /v1/messages — ส่ง SMS เดี่ยวหรือเป็น batch (สูงสุด 1,000 เบอร์ต่อ request)">
            <h3 className="font-bold mt-4 mb-2 text-sm">Request</h3>
            <Code
              lang="js"
              code={`import { Smsup } from '@smsup/node';

const client = new Smsup('sk_live_4f8a...');

const message = await client.messages.create({
  to: '0812345678',
  sender: 'SMSUP',
  body: 'รหัส OTP ของคุณคือ 284917',
});

console.log(message.id, message.status);
// → "msg_4F8AK2P9Z3", "queued"`}
            />
            <h3 className="font-bold mt-6 mb-2 text-sm">Response 200</h3>
            <Code
              lang="json"
              code={`{
  "id": "msg_4F8AK2P9Z3",
  "to": "+66812345678",
  "sender": "SMSUP",
  "body": "รหัส OTP ของคุณคือ 284917",
  "status": "queued",
  "parts": 1,
  "cost_credits": 1,
  "created_at": "2026-05-31T14:32:01.482Z"
}`}
            />
            <Table
              rows={[
                ['to', 'string', 'เบอร์โทรปลายทาง รองรับ 08x/09x/06x + 66 prefix'],
                ['sender', 'string', 'Sender Name (ต้องได้รับการอนุมัติแล้ว)'],
                ['body', 'string', 'ข้อความ — UTF-8 (160 ตัวอักษร / SMS)'],
                ['schedule_at', 'ISO 8601', 'optional — ตั้งเวลาส่ง (max +30 วัน)'],
                ['client_ref', 'string', 'optional — reference จาก client'],
              ]}
            />
          </Section>

          <Section id="otp" title="OTP API" sub="ออก verify code อัตโนมัติ + rate limit + IP whitelist พร้อมใช้">
            <Code
              lang="js"
              code={`// 1. สร้าง OTP
const otp = await client.otp.create({
  phone: '0812345678',
  length: 6,
  ttl: 300,         // วินาที
});

// 2. ตรวจสอบ
const result = await client.otp.verify({
  phone: '0812345678',
  code: '284917',
});

if (result.valid) {
  // log user in
}`}
            />
          </Section>

          <Section id="webhook" title="Webhook" sub="รับ delivery status push เข้า URL ของคุณทุกครั้งที่สถานะเปลี่ยน">
            <Code
              lang="json"
              code={`POST https://your-domain.com/webhooks/sms

{
  "event": "message.delivered",
  "message_id": "msg_4F8AK2P9Z3",
  "to": "+66812345678",
  "status": "delivered",
  "delivered_at": "2026-05-31T14:32:04.121Z",
  "operator": "AIS"
}`}
            />
            <Note>
              ตรวจ signature ด้วย header <code className="font-mono bg-[var(--sms-paper-2)] px-1.5 py-0.5 rounded">X-Smsup-Signature</code>
              {' '}— HMAC-SHA256 ของ payload + ของ webhook secret
            </Note>
          </Section>

          <Section id="sdk" title="SDKs" sub="Official libraries ครบทุกภาษาหลัก">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ['Node.js', 'npm install @smsup/node'],
                ['Python', 'pip install smsup'],
                ['PHP', 'composer require smsup/smsup'],
                ['Go', 'go get github.com/smsup/smsup-go'],
                ['.NET', 'dotnet add package Smsup'],
                ['Ruby', 'gem install smsup'],
              ].map(([lang, install]) => (
                <div
                  key={lang}
                  className="rounded-xl bg-white border p-4"
                  style={{ borderColor: 'var(--sms-line)' }}
                >
                  <div className="font-bold mb-2">{lang}</div>
                  <code className="font-mono text-xs px-2 py-1 rounded block" style={{ background: 'var(--sms-paper-2)' }}>
                    {install}
                  </code>
                </div>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Section({ id, title, sub, children }: { id: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-black text-2xl tracking-[-0.02em]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {title}
      </h2>
      <p className="mt-1 mb-5" style={{ color: 'var(--sms-muted)' }}>
        {sub}
      </p>
      {children}
    </section>
  );
}

function Code({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--sms-line)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--sms-line)', background: 'var(--sms-paper-2)' }}>
        <span className="font-mono text-xs font-bold opacity-70">{lang}</span>
        <button className="inline-flex items-center gap-1 text-xs font-bold opacity-70 hover:opacity-100">
          <Copy className="w-3 h-3" /> คัดลอก
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed" style={{ background: '#0B1220', color: '#E5E9F0' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-3.5 rounded-xl text-sm" style={{ background: 'var(--sms-paper-2)' }}>
      💡 {children}
    </div>
  );
}

function Pill({ label, code }: { label: string; code?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-white"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      {label}
      {code && <code className="font-mono opacity-70">{code}</code>}
    </span>
  );
}

function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="rounded-xl overflow-hidden border mt-4" style={{ borderColor: 'var(--sms-line)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--sms-paper-2)' }}>
            <th className="text-left p-3 font-bold w-1/4">Field</th>
            <th className="text-left p-3 font-bold w-1/6">Type</th>
            <th className="text-left p-3 font-bold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t" style={{ borderColor: 'var(--sms-line)' }}>
              <td className="p-3 font-mono font-bold">{r[0]}</td>
              <td className="p-3 font-mono text-xs" style={{ color: 'var(--sms-brand-deep)' }}>
                {r[1]}
              </td>
              <td className="p-3" style={{ color: 'var(--sms-muted)' }}>
                {r[2]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
