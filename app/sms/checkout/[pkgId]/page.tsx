/**
 * SMSUP+ checkout — server-rendered package summary + tax invoice form +
 * PromptPay QR payment mock. After successful pay, credits added to balance.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  Receipt,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { SMS_PACKAGES } from '@/lib/sms-mock';

export const dynamic = 'force-static';

export default async function CheckoutPage({ params }: { params: Promise<{ pkgId: string }> }) {
  const { pkgId } = await params;
  const pkg = SMS_PACKAGES.find((p) => p.slug === pkgId);
  if (!pkg) notFound();

  const vat = Math.round(pkg.priceTHB * 0.07);
  const total = pkg.priceTHB + vat;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link
        href="/sms/pricing"
        className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 opacity-70 hover:opacity-100"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับไปดูแพ็กเกจอื่น
      </Link>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          <h1
            className="font-black text-3xl tracking-[-0.02em]"
            style={{ fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
          >
            ชำระเงิน
          </h1>

          <Card>
            <CardTitle Icon={Receipt}>ข้อมูลใบกำกับภาษี</CardTitle>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="ชื่อ-สกุล / ชื่อบริษัท" required defaultValue="บริษัท ตัวอย่าง จำกัด" />
              <Field label="เลขประจำตัวผู้เสียภาษี" required defaultValue="0105566012345" mono />
              <Field label="เบอร์โทร" required defaultValue="0812345678" mono />
              <Field label="Email" required type="email" defaultValue="billing@example.com" mono />
              <Field
                label="ที่อยู่ออกใบกำกับภาษี"
                required
                full
                defaultValue="123/456 ซอยรัชดา-ห้วยขวาง แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310"
                multiline
              />
              <Toggle label="ออกใบกำกับภาษีแบบเต็มรูป (ภพ.20)" checked />
            </div>
          </Card>

          <Card>
            <CardTitle Icon={CreditCard}>วิธีชำระเงิน</CardTitle>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <PaymentOption
                Icon={Smartphone}
                title="PromptPay QR"
                desc="สแกนจากแอปธนาคารทุกธนาคาร"
                badge="แนะนำ"
                selected
              />
              <PaymentOption
                Icon={CreditCard}
                title="บัตรเครดิต / เดบิต"
                desc="VISA · Mastercard · UnionPay · JCB"
              />
              <PaymentOption Icon={Building2} title="โอนผ่านธนาคาร" desc="SCB · KBank · Krungsri · BAY" />
              <PaymentOption Icon={Building2} title="หักบัญชี (Direct Debit)" desc="สำหรับลูกค้า Business ขึ้นไป" />
            </div>

            <PromptPayMock total={total} />
          </Card>

          <Card>
            <CardTitle Icon={ShieldCheck}>เงื่อนไข</CardTitle>
            <ul className="space-y-2 mt-3 text-sm" style={{ color: 'var(--sms-muted)' }}>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--sms-good)' }} />เครดิตเก็บถาวร · ไม่หมดอายุ</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--sms-good)' }} />คืนเงิน 100% ภายใน 7 วันถ้ายังไม่ใช้</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--sms-good)' }} />ส่ง e-Tax invoice ทาง email ภายใน 5 นาทีหลังชำระ</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--sms-good)' }} />ข้อมูลปลอดภัยตาม PDPA · เก็บใน server ไทย</li>
            </ul>
          </Card>
        </div>

        {/* Right: Order summary (sticky) */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div
            className="rounded-2xl bg-white border p-6"
            style={{ borderColor: 'var(--sms-line)' }}
          >
            <div className="font-mono text-xs uppercase tracking-[0.1em] opacity-60 mb-3">
              สรุปคำสั่งซื้อ
            </div>
            <div
              className="flex items-center gap-3 pb-5 mb-5 border-b"
              style={{ borderColor: 'var(--sms-line)' }}
            >
              <div
                className="w-12 h-12 rounded-xl inline-flex items-center justify-center"
                style={{ background: 'var(--sms-paper-2)' }}
              >
                <BadgeCheck className="w-6 h-6" style={{ color: 'var(--sms-brand-deep)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {pkg.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--sms-muted)' }}>
                  {pkg.credits.toLocaleString('th-TH')} เครดิต · ฿{pkg.pricePerSmsTHB.toFixed(2)}/SMS
                </div>
              </div>
            </div>

            <Row label="ราคาแพ็กเกจ" value={`฿${pkg.priceTHB.toLocaleString('th-TH')}`} />
            <Row label="VAT 7%" value={`฿${vat.toLocaleString('th-TH')}`} muted />
            <div className="my-3 border-t border-dashed" style={{ borderColor: 'var(--sms-line)' }} />
            <Row label="ยอดรวมที่ต้องชำระ" value={`฿${total.toLocaleString('th-TH')}`} big />

            <button
              type="button"
              className="w-full mt-5 inline-flex justify-center items-center gap-2 px-5 py-3.5 rounded-full font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'var(--sms-ink)', color: 'white' }}
            >
              ยืนยันชำระเงิน
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--sms-brand)' }} />
            </button>

            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ background: 'var(--sms-paper-2)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--sms-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--sms-muted)' }}>
                เครดิตจะเข้าบัญชีอัตโนมัติทันทีที่ชำระสำเร็จ
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border p-6" style={{ borderColor: 'var(--sms-line)' }}>
      {children}
    </div>
  );
}

function CardTitle({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-8 h-8 rounded-lg inline-flex items-center justify-center"
        style={{ background: 'var(--sms-paper-2)' }}
      >
        <Icon className="w-4 h-4" style={{ color: 'var(--sms-brand-deep)' }} />
      </span>
      <h2 className="font-extrabold text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
        {children}
      </h2>
    </div>
  );
}

function Field({
  label,
  required,
  defaultValue,
  full,
  multiline,
  type = 'text',
  mono,
}: {
  label: string;
  required?: boolean;
  defaultValue?: string;
  full?: boolean;
  multiline?: boolean;
  type?: string;
  mono?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-xs font-semibold flex items-center gap-1.5">
        {label}
        {required && (
          <span className="font-mono text-[0.6rem] font-bold px-1.5 py-px rounded bg-[var(--sms-paper-2)]">
            REQ
          </span>
        )}
      </span>
      {multiline ? (
        <textarea
          rows={2}
          defaultValue={defaultValue}
          className={`bg-[var(--sms-paper)] rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--sms-ink)] focus:bg-white transition-colors ${mono ? 'font-mono' : ''}`}
          style={{ borderColor: 'var(--sms-line)' }}
        />
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          className={`bg-[var(--sms-paper)] rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--sms-ink)] focus:bg-white transition-colors ${mono ? 'font-mono' : ''}`}
          style={{ borderColor: 'var(--sms-line)' }}
        />
      )}
    </label>
  );
}

function Toggle({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <label className="flex sm:col-span-2 items-center justify-between gap-3 px-3.5 py-3 bg-[var(--sms-paper)] rounded-lg border cursor-pointer" style={{ borderColor: 'var(--sms-line)' }}>
      <span className="text-sm font-medium">{label}</span>
      <span
        className="relative w-10 h-6 rounded-full transition-colors"
        style={{ background: checked ? 'var(--sms-good)' : 'var(--sms-line)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </span>
    </label>
  );
}

function PaymentOption({
  Icon,
  title,
  desc,
  selected,
  badge,
}: {
  Icon: React.ElementType;
  title: string;
  desc: string;
  selected?: boolean;
  badge?: string;
}) {
  return (
    <div
      className="rounded-xl border-[1.5px] p-4 cursor-pointer transition-all"
      style={{
        borderColor: selected ? 'var(--sms-ink)' : 'var(--sms-line)',
        background: selected ? 'var(--sms-paper)' : 'white',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
          style={{ background: selected ? 'var(--sms-ink)' : 'var(--sms-paper-2)', color: selected ? 'var(--sms-brand)' : 'var(--sms-ink)' }}
        >
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{title}</span>
            {badge && (
              <span
                className="font-mono text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'var(--sms-brand)', color: 'var(--sms-ink)' }}
              >
                {badge}
              </span>
            )}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--sms-muted)' }}>
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptPayMock({ total }: { total: number }) {
  return (
    <div
      className="mt-5 grid sm:grid-cols-[200px_1fr] gap-5 items-center p-5 rounded-xl border-[1.5px]"
      style={{ borderColor: 'var(--sms-ink)', background: 'var(--sms-paper)' }}
    >
      <div
        className="aspect-square w-full max-w-[200px] rounded-xl bg-white p-3 grid place-items-center"
        style={{ border: '1.5px solid var(--sms-line)' }}
      >
        <QrPattern />
      </div>
      <div>
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: 'var(--sms-good)', color: 'white' }}
        >
          PromptPay
        </div>
        <div className="font-mono text-xl font-bold mb-1">
          ฿{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-sm mb-3" style={{ color: 'var(--sms-muted)' }}>
          เปิดแอปธนาคาร → สแกน QR → ยืนยัน
        </div>
        <div className="text-xs space-y-1 font-mono" style={{ color: 'var(--sms-muted)' }}>
          <div>ผู้รับ: บจก.เอสเอ็มเอสอัพพลัส</div>
          <div>เลขอ้างอิง: TOP-20260531-X7K2A4</div>
          <div>หมดอายุ: 15 นาที</div>
        </div>
      </div>
    </div>
  );
}

function QrPattern() {
  // Decorative QR-ish grid (not a real QR — replaced with @ payment time)
  const cells = Array.from({ length: 21 * 21 }).map(() => Math.random() > 0.5);
  return (
    <div className="grid grid-cols-21 gap-px w-full h-full" style={{ gridTemplateColumns: 'repeat(21, 1fr)' }}>
      {cells.map((on, i) => {
        // Force the three position markers
        const row = Math.floor(i / 21);
        const col = i % 21;
        const inMarker =
          (row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7);
        return (
          <span
            key={i}
            className="aspect-square"
            style={{ background: inMarker || on ? '#0B1220' : 'transparent' }}
          />
        );
      })}
    </div>
  );
}

function Row({ label, value, muted, big }: { label: string; value: string; muted?: boolean; big?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-1">
      <span className={`text-sm ${muted ? 'opacity-60' : ''}`}>{label}</span>
      <span
        className={`font-mono font-bold ${big ? 'text-xl' : 'text-base'}`}
        style={{ color: big ? 'var(--sms-ink)' : undefined }}
      >
        {value}
      </span>
    </div>
  );
}
