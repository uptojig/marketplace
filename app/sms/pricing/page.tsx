/**
 * SMSUP+ pricing — full credit packages + volume calculator + comparison matrix.
 */

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, TrendingDown } from 'lucide-react';
import { SMS_PACKAGES } from '@/lib/sms-mock';
import { VolumeCalculator } from './VolumeCalculator';

export const dynamic = 'force-static';

export default function PricingPage() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="inline-block font-bold text-xs px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--sms-accent)', color: 'var(--sms-ink)' }}
          >
            💰 ราคาเครดิต
          </span>
          <h1
            className="font-black tracking-[-0.025em] leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
          >
            ซื้อเครดิต SMS{' '}
            <span style={{ background: 'linear-gradient(180deg, transparent 60%, var(--sms-brand) 60%)', padding: '0 4px' }}>
              ใช้ได้ตลอดไป
            </span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--sms-muted)' }}>
            ไม่มีค่ารายเดือน ไม่มีค่าแรกเข้า เครดิตเก็บถาวร — เลือกแพ็กเกจที่เหมาะ ยิ่งซื้อเยอะ ราคาต่อ SMS ยิ่งถูก
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {SMS_PACKAGES.map((p) => {
            const popular = p.isPopular;
            return (
              <div
                key={p.id}
                className={`relative p-7 rounded-2xl border-[1.5px] flex flex-col ${popular ? 'lg:scale-[1.04]' : ''}`}
                style={{
                  borderColor: popular ? 'var(--sms-ink)' : 'var(--sms-line)',
                  background: popular ? 'var(--sms-ink)' : 'white',
                  color: popular ? 'white' : undefined,
                  boxShadow: popular ? '0 20px 60px -20px rgba(11,18,32,0.3)' : undefined,
                }}
              >
                {popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 font-extrabold text-xs px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: 'var(--sms-accent)', color: 'var(--sms-ink)' }}
                  >
                    ⭐ ยอดนิยม
                  </span>
                )}
                <div className="font-extrabold text-xl tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {p.name}
                </div>
                <div className={`text-sm mt-1 mb-5 min-h-[2.6em] ${popular ? 'opacity-70' : ''}`} style={{ color: popular ? undefined : 'var(--sms-muted)' }}>
                  {p.tagline}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg opacity-60 font-semibold">฿</span>
                  <span className="font-black text-[2.6rem] tracking-[-0.04em] leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {p.priceTHB.toLocaleString('th-TH')}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold mb-5" style={{ color: popular ? 'var(--sms-brand)' : 'var(--sms-brand-deep)' }}>
                  ฿{p.pricePerSmsTHB.toFixed(2)} / SMS
                </div>

                <div
                  className="font-mono font-bold text-center rounded-lg py-3 mb-5"
                  style={{ background: popular ? 'rgba(255,255,255,0.1)' : 'var(--sms-paper-2)' }}
                >
                  {p.credits.toLocaleString('th-TH')} เครดิต
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 items-start text-sm">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--sms-good)' }} />
                      <span className={popular ? 'opacity-90' : ''}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/sms/checkout/${p.slug}`}
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={
                    popular
                      ? { background: 'var(--sms-brand)', color: 'var(--sms-ink)' }
                      : { background: 'white', color: 'var(--sms-ink)', border: '1.5px solid var(--sms-ink)' }
                  }
                >
                  เลือก {p.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Volume calculator */}
        <div className="mt-16">
          <VolumeCalculator />
        </div>

        {/* Comparison matrix */}
        <ComparisonTable />

        {/* Trust footer */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h3 className="font-extrabold text-xl mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            มั่นใจได้ทุกการสั่งซื้อ
          </h3>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm" style={{ color: 'var(--sms-muted)' }}>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--sms-good)' }} />
              ออก e-Tax invoice อัตโนมัติ
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--sms-good)' }} />
              คืนเงิน 100% ภายใน 7 วัน ถ้ายังไม่ใช้
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--sms-good)' }} />
              เครดิตไม่หมดอายุ
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--sms-good)' }} />
              SLA 99.7% Uptime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Comparison table ─────────────────────────────────────────────

function ComparisonTable() {
  const rows: [string, ...(string | true | false)[]][] = [
    ['ส่ง SMS ทั่วประเทศ', true, true, true, true],
    ['OTP API + Rate limit', false, true, true, true],
    ['Sender Name', '1', '3', 'ไม่จำกัด', 'ไม่จำกัด'],
    ['Webhook callback', false, true, true, true],
    ['Audience / Segmentation', false, true, true, true],
    ['Multi-user', '1', '2', '5', 'ไม่จำกัด'],
    ['SLA Uptime', '99.5%', '99.7%', '99.9%', '99.9% + DPA'],
    ['Support', 'Email', 'LINE + Email', 'Priority', 'Dedicated AM'],
  ];
  return (
    <div className="mt-20">
      <h2
        className="text-center font-black tracking-[-0.02em] mb-8"
        style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
      >
        เปรียบเทียบทุกแพ็กเกจ
      </h2>
      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--sms-line)' }}>
        <table className="w-full bg-white text-sm">
          <thead>
            <tr style={{ background: 'var(--sms-paper-2)' }}>
              <th className="text-left p-4 font-bold w-1/3">ฟีเจอร์</th>
              {SMS_PACKAGES.map((p) => (
                <th
                  key={p.id}
                  className="text-center p-4 font-bold"
                  style={p.isPopular ? { background: 'rgba(0,212,255,0.06)' } : undefined}
                >
                  {p.name}
                  {p.isPopular && (
                    <Sparkles className="inline w-3 h-3 ml-1" style={{ color: 'var(--sms-brand-deep)' }} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const [label, ...vals] = row;
              return (
                <tr key={label as string} className="border-t" style={{ borderColor: 'var(--sms-line)' }}>
                  <td className="p-4 font-semibold" style={{ background: 'var(--sms-paper)' }}>
                    {label as string}
                  </td>
                  {vals.map((v, vi) => (
                    <td
                      key={vi}
                      className="text-center p-4"
                      style={vi === 1 ? { background: 'rgba(0,212,255,0.04)' } : undefined}
                    >
                      {v === true ? (
                        <CheckCircle2 className="inline w-5 h-5" style={{ color: 'var(--sms-good)' }} />
                      ) : v === false ? (
                        <span style={{ color: 'var(--sms-line)' }}>—</span>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
