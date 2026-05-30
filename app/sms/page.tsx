/**
 * SMSUP+ landing — credit-based SMS service.
 * Sections: Hero, Trust bar, Features, Use Cases, Pricing teaser, FAQ, Final CTA.
 */

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCheck,
  CheckCircle2,
  Code2,
  GitMerge,
  LockKeyhole,
  Megaphone,
  Package,
  Phone,
  Rocket,
  ShieldCheck,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';
import { SMS_PACKAGES } from '@/lib/sms-mock';

export const dynamic = 'force-static';

export default function SmsLandingPage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <UseCases />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 90% 20%, rgba(0,212,255,0.18), transparent 50%), radial-gradient(circle at 10% 80%, rgba(255,214,10,0.15), transparent 45%), linear-gradient(180deg, white, var(--sms-paper))',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
        <div>
          <span
            className="inline-flex items-center gap-2 bg-white border rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm mb-4"
            style={{ borderColor: 'var(--sms-line)' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--sms-good)', boxShadow: '0 0 0 4px rgba(0,196,140,0.2)' }}
            />
            ส่งสำเร็จ 99.7% · เครือข่าย AIS · TRUE · DTAC
          </span>
          <h1
            className="font-black leading-[1.05] tracking-[-0.03em] mb-5"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
          >
            ส่ง SMS ถึงลูกค้า
            <br />
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-1.5 h-3 -z-10 rounded"
                style={{ background: 'var(--sms-accent)' }}
              />
              <span style={{ color: 'var(--sms-brand-deep)' }}>ใน 3 วินาที</span>
            </span>
          </h1>
          <p className="text-lg mb-7 max-w-xl" style={{ color: 'var(--sms-muted)' }}>
            บริการส่ง SMS ครบวงจรสำหรับธุรกิจ — OTP, แจ้งเตือน, การตลาด ครบจบที่เดียว เริ่มต้น ฿0.20 ต่อข้อความ ไม่มีค่าแรกเข้า ไม่มีค่ารายเดือน
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-7">
            <Link
              href="/sms/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'var(--sms-brand)', color: 'var(--sms-ink)' }}
            >
              ดูราคาแพ็กเกจ
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sms/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold border-[1.5px] hover:bg-[var(--sms-ink)] hover:text-white transition-colors"
              style={{ borderColor: 'var(--sms-ink)' }}
            >
              ลองใช้ฟรี 50 SMS
            </Link>
          </div>
          <div className="flex gap-6 text-sm flex-wrap" style={{ color: 'var(--sms-muted)' }}>
            <TrustTick>ไม่ต้องใช้บัตรเครดิต</TrustTick>
            <TrustTick>ออก e-Tax invoice</TrustTick>
            <TrustTick>PDPA compliant</TrustTick>
          </div>
        </div>

        <PhoneMock />
      </div>
    </section>
  );
}

function TrustTick({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--sms-good)' }} />
      {children}
    </span>
  );
}

function PhoneMock() {
  return (
    <div className="relative flex justify-center">
      <div
        className="relative w-72 rounded-[38px] p-3"
        style={{ background: 'var(--sms-ink)', boxShadow: '0 20px 60px -20px rgba(11,18,32,0.4)' }}
      >
        <span
          aria-hidden
          className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 rounded-xl"
          style={{ background: 'var(--sms-ink)', zIndex: 2 }}
        />
        <div
          className="rounded-[28px] pt-16 pb-6 px-4 text-white"
          style={{
            background: 'linear-gradient(180deg, #1A2236, #0B1220)',
            minHeight: '540px',
          }}
        >
          <SmsCardMock from="SMSUP" when="เมื่อสักครู่" delay={0}>
            รหัส OTP ของคุณคือ <b style={{ color: 'var(--sms-brand)' }}>284917</b> ใช้งานภายใน 5 นาที
          </SmsCardMock>
          <SmsCardMock from="SHOPPLUS" when="2 นาทีก่อน" delay={0.2}>
            ออเดอร์ #ORD-29481 จัดส่งแล้ว ติดตาม: <b style={{ color: 'var(--sms-brand)' }}>bit.ly/x4k2</b>
          </SmsCardMock>
          <SmsCardMock from="BANKAPP" when="1 ชม.ก่อน" delay={0.4}>
            เงินเข้าบัญชี <b style={{ color: 'var(--sms-brand)' }}>+฿12,500.00</b> ยอดคงเหลือ <b style={{ color: 'var(--sms-brand)' }}>฿48,290.50</b>
          </SmsCardMock>
        </div>
      </div>

      <span
        className="absolute top-5 -right-5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white shadow-lg"
        style={{ background: 'var(--sms-good)' }}
      >
        <CheckCheck className="w-3.5 h-3.5" />
        ส่งสำเร็จ 1,247,392 ข้อความ
      </span>

      <div
        className="absolute bottom-10 -left-8 bg-white rounded-lg px-4 py-3 shadow-2xl border"
        style={{ borderColor: 'var(--sms-line)' }}
      >
        <div className="font-black text-2xl tracking-tighter" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          2.4<span className="text-sm opacity-50">s</span>
        </div>
        <div className="text-xs font-semibold" style={{ color: 'var(--sms-muted)' }}>
          เวลาเฉลี่ย
        </div>
      </div>
    </div>
  );
}

function SmsCardMock({ from, when, delay, children }: { from: string; when: string; delay: number; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-3.5 mb-3 backdrop-blur-md"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: `slideIn 0.4s ${delay}s both ease`,
      }}
    >
      <style>{`@keyframes slideIn { from { transform: translateY(10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
      <div className="flex justify-between text-[0.65rem] opacity-60 mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <span>{from}</span>
        <span>{when}</span>
      </div>
      <div className="text-sm leading-snug">{children}</div>
    </div>
  );
}

// ─── TRUST BAR ────────────────────────────────────────────────────

function TrustBar() {
  const logos = ['TrueMoney', 'LINE MAN', 'Lazada', 'FoodPanda', 'PromptPay', 'SCB EASY'];
  return (
    <section className="py-12 border-b" style={{ borderColor: 'var(--sms-line)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="text-center text-xs font-mono uppercase tracking-[0.1em] mb-6"
          style={{ color: 'var(--sms-muted)' }}
        >
          มากกว่า 3,200 ธุรกิจไว้ใจให้ส่ง SMS
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-55">
          {logos.map((l) => (
            <div key={l} className="text-center font-extrabold text-lg tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────

const FEATURES = [
  { Icon: Zap, title: 'ส่งใน 3 วินาที', desc: 'เชื่อมตรงกับ AIS · TRUE · DTAC ไม่มี middleman ลดเวลา + เพิ่มอัตราการส่งสำเร็จ', tint: 'brand' as const },
  { Icon: ShieldCheck, title: 'OTP API ปลอดภัย', desc: 'Rate-limit, IP whitelist, retry logic พร้อม template ใช้งานได้ทันที — ไม่ต้องเขียนเอง', tint: 'accent' as const },
  { Icon: Users, title: 'Audience & Segment', desc: 'กรองกลุ่มลูกค้าตามเงื่อนไข ตั้งเวลาส่ง A/B test — เพิ่ม conversion ของแคมเปญ', tint: 'pop' as const },
  { Icon: Code2, title: 'REST API + SDKs', desc: 'cURL, Node, PHP, Python, Go ส่ง SMS ด้วย code 3 บรรทัด · webhook callback ครบ', tint: 'good' as const },
  { Icon: BarChart3, title: 'รายงาน Real-time', desc: 'ส่งสำเร็จ/ล้มเหลว/ค้างคิว ดูได้ทันที พร้อม export CSV/Excel + Power BI connector', tint: 'brand' as const },
  { Icon: GitMerge, title: 'Integration พร้อม', desc: 'Make · n8n · Zapier · Shopify · WordPress · LINE OA · Hubspot — เชื่อมต่อในคลิกเดียว', tint: 'accent' as const },
];

function Features() {
  return (
    <section id="features" className="py-24" style={{ background: 'var(--sms-paper)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <SectionHead eyebrow="⚡ ฟีเจอร์" title="ครบเครื่อง" underline="พร้อมใช้ทันที" sub="ไม่ต้องตั้งค่าซับซ้อน Login → กรอกข้อความ → ส่ง เสร็จใน 30 วินาที" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  Icon, title, desc, tint,
}: { Icon: React.ElementType; title: string; desc: string; tint: 'brand' | 'accent' | 'pop' | 'good' }) {
  const gradients = {
    brand: 'linear-gradient(135deg, var(--sms-brand), var(--sms-brand-deep))',
    accent: 'linear-gradient(135deg, var(--sms-accent), #FFA500)',
    pop: 'linear-gradient(135deg, var(--sms-pop), #C2185B)',
    good: 'linear-gradient(135deg, var(--sms-good), #007A56)',
  };
  const txt = tint === 'accent' ? 'var(--sms-ink)' : 'white';
  return (
    <div
      className="p-8 rounded-2xl bg-white border transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderColor: 'var(--sms-line)' }}
    >
      <div
        className="w-12 h-12 rounded-xl inline-flex items-center justify-center mb-4"
        style={{ background: gradients[tint], color: txt }}
      >
        <Icon className="w-[22px] h-[22px]" />
      </div>
      <h3 className="font-extrabold text-lg tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--sms-muted)' }}>
        {desc}
      </p>
    </div>
  );
}

// ─── USE CASES ────────────────────────────────────────────────────

const USECASES = [
  { Icon: LockKeyhole, label: 'OTP / 2FA', desc: 'ยืนยันตัวตน · เปลี่ยนรหัสผ่าน · login ธนาคาร · checkout', bar: 'brand' as const },
  { Icon: Package, label: 'แจ้งสถานะคำสั่งซื้อ', desc: 'e-commerce · logistics · อัปเดตขั้นตอนทุกสถานะ', bar: 'accent' as const },
  { Icon: Megaphone, label: 'การตลาด / โปรโมชั่น', desc: 'แคมเปญ · คูปอง · ฟลาช sale · เพิ่ม conversion', bar: 'pop' as const },
  { Icon: Bell, label: 'แจ้งเตือน / Reminder', desc: 'นัดหมาย · ใบเสร็จ · payment · บริการ recurring', bar: 'good' as const },
];

function UseCases() {
  const bars = {
    brand: 'var(--sms-brand)',
    accent: 'var(--sms-accent)',
    pop: 'var(--sms-pop)',
    good: 'var(--sms-good)',
  };
  return (
    <section id="usecases" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHead eyebrow="🎯 การใช้งาน" title="ใช้ได้กับทุกธุรกิจ" underline="ทุกอุตสาหกรรม" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {USECASES.map((u) => (
            <div
              key={u.label}
              className="relative p-7 rounded-2xl bg-white border overflow-hidden"
              style={{ borderColor: 'var(--sms-line)' }}
            >
              <span aria-hidden className="absolute top-0 left-0 w-1 h-full" style={{ background: bars[u.bar] }} />
              <div
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center mb-3.5"
                style={{ background: 'var(--sms-paper-2)' }}
              >
                <u.Icon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                {u.label}
              </h4>
              <p className="text-sm" style={{ color: 'var(--sms-muted)' }}>
                {u.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING TEASER ───────────────────────────────────────────────

function PricingTeaser() {
  return (
    <section className="py-24" style={{ background: 'var(--sms-paper)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <SectionHead eyebrow="💰 ราคาแพ็กเกจ" title="ราคาเดียว ทุกเครือข่าย" underline="ไม่บวกเพิ่ม" sub="เลือกแพ็กเกจที่เหมาะ ยิ่งซื้อเยอะ ราคาต่อ SMS ยิ่งถูก เครดิตไม่หมดอายุ" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {SMS_PACKAGES.map((p) => (
            <div
              key={p.id}
              className={`relative p-7 rounded-2xl bg-white border-[1.5px] flex flex-col ${p.isPopular ? 'lg:scale-[1.04] text-white' : ''}`}
              style={{
                borderColor: p.isPopular ? 'var(--sms-ink)' : 'var(--sms-line)',
                background: p.isPopular ? 'var(--sms-ink)' : 'white',
                boxShadow: p.isPopular ? '0 20px 60px -20px rgba(11,18,32,0.3)' : undefined,
              }}
            >
              {p.isPopular && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 font-extrabold text-xs px-3 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: 'var(--sms-accent)', color: 'var(--sms-ink)' }}
                >
                  ⭐ ยอดนิยม
                </span>
              )}
              <div className="font-extrabold text-lg tracking-tight">{p.name}</div>
              <div className={`text-sm mt-1 mb-5 min-h-[2.6em] ${p.isPopular ? 'opacity-70' : ''}`} style={{ color: p.isPopular ? undefined : 'var(--sms-muted)' }}>
                {p.tagline}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-lg opacity-60 font-semibold">฿</span>
                <span className="font-black text-4xl tracking-[-0.04em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {p.priceTHB.toLocaleString('th-TH')}
                </span>
              </div>
              <div className="font-mono text-sm font-bold mb-5" style={{ color: p.isPopular ? 'var(--sms-brand)' : 'var(--sms-brand-deep)' }}>
                ฿{p.pricePerSmsTHB.toFixed(2)} / SMS
              </div>
              <div
                className="font-mono font-bold text-center rounded-lg py-2.5 mb-5"
                style={{ background: p.isPopular ? 'rgba(255,255,255,0.1)' : 'var(--sms-paper-2)' }}
              >
                {p.credits.toLocaleString('th-TH')} เครดิต
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 items-start text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--sms-good)' }} />
                    <span className={p.isPopular ? 'opacity-90' : ''}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/sms/checkout/${p.slug}`}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5"
                style={
                  p.isPopular
                    ? { background: 'var(--sms-brand)', color: 'var(--sms-ink)' }
                    : { background: 'white', color: 'var(--sms-ink)', border: '1.5px solid var(--sms-ink)' }
                }
              >
                เลือก {p.name}
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/sms/pricing" className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
            ดูตารางเปรียบเทียบแพ็กเกจเต็ม
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────

const FAQS: [string, string][] = [
  ['เครดิตหมดอายุไหม?', 'ไม่หมดอายุครับ — เครดิตที่ซื้ออยู่ในบัญชีตลอดไป ไม่ว่าจะเป็น Starter หรือ Enterprise tier ก็เก็บไว้ใช้ได้นานเท่าที่ต้องการ'],
  ['รองรับเครือข่ายไหนบ้าง?', 'เชื่อมต่อตรงกับ AIS, TRUE-DTAC, NT, และ MVNO ทุกราย — ส่งได้ครบทุกหมายเลขในไทย ราคาเท่ากันไม่ว่าจะเครือข่ายไหน'],
  ['ใช้ Sender Name แบบกำหนดเองได้มั้ย?', 'ได้ครับ — ส่งเอกสารจดทะเบียนบริษัทมา ภายใน 1-2 วันทำการเปิดให้ใช้ ใน Starter ได้ 1 ชื่อ Growth 3 ชื่อ Business+ ไม่จำกัด'],
  ['มี API documentation มั้ย?', 'มี — เปิด docs.smsup.co ดูได้ทันที พร้อม SDK สำหรับ Node.js, PHP, Python, Go, .NET และตัวอย่าง cURL'],
  ['ออกใบกำกับภาษีได้มั้ย?', 'ออก e-Tax invoice (xml + pdf) อัตโนมัติทุกออเดอร์ ส่งทาง email ภายใน 5 นาทีหลังชำระเงิน รองรับ ภพ.20 ครบทั้งระบบ'],
  ['ข้อมูลลูกค้าปลอดภัยมั้ย? (PDPA)', 'PDPA compliant — เก็บข้อมูลในไทย เข้ารหัส AES-256 มี Data Processing Agreement สำหรับลูกค้าองค์กร และจะลบข้อมูลเมื่อขอภายใน 7 วัน'],
  ['ถ้าส่งไม่สำเร็จ จะถูกเก็บเครดิตมั้ย?', 'ไม่ครับ — เก็บเครดิตเฉพาะที่ส่งสำเร็จและถึงปลายทางจริงเท่านั้น (delivery report จากเครือข่าย) ส่งล้มเหลวคืนเครดิตให้ภายใน 24 ชม.'],
];

function Faq() {
  return (
    <section id="faq" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHead eyebrow="💬 คำถามที่พบบ่อย" title="มีคำถาม" underline="เรามีคำตอบ" />
        <div className="max-w-3xl mx-auto mt-12 space-y-2.5">
          {FAQS.map(([q, a], i) => (
            <details
              key={q}
              {...(i === 0 ? { open: true } : {})}
              className="bg-white rounded-lg border group"
              style={{ borderColor: 'var(--sms-line)' }}
            >
              <summary className="cursor-pointer p-5 font-bold flex items-center justify-between list-none">
                {q}
                <span
                  className="text-2xl font-normal transition-transform group-open:rotate-45"
                  style={{ color: 'var(--sms-muted)' }}
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-[0.95rem] leading-relaxed" style={{ color: 'var(--sms-muted)' }}>
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section
      className="relative overflow-hidden py-24 text-white"
      style={{ background: 'var(--sms-ink)' }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 50%, rgba(0,212,255,0.18), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,214,10,0.12), transparent 40%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <h2
          className="font-black tracking-[-0.03em] mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
        >
          เริ่มส่ง SMS ฟรี 50 ข้อความวันนี้
        </h2>
        <p className="text-lg opacity-70 mb-8">ลงทะเบียนใช้เวลา 30 วินาที ไม่ต้องบัตรเครดิต — กรอก SMS ส่งได้ทันที</p>
        <div className="inline-flex flex-wrap gap-3 justify-center">
          <Link
            href="/sms/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold hover:-translate-y-0.5 transition-transform"
            style={{ background: 'var(--sms-brand)', color: 'var(--sms-ink)' }}
          >
            <Rocket className="w-4 h-4" />
            เริ่มใช้งานฟรี
          </Link>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold border-[1.5px]"
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <Phone className="w-4 h-4" />
            คุยกับทีมขาย
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Reusable section head ────────────────────────────────────────

function SectionHead({
  eyebrow, title, underline, sub,
}: { eyebrow: string; title: string; underline?: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span
        className="inline-block font-bold text-xs px-3.5 py-1.5 rounded-full mb-3.5"
        style={{ background: 'var(--sms-accent)', color: 'var(--sms-ink)' }}
      >
        {eyebrow}
      </span>
      <h2
        className="font-black tracking-[-0.02em] leading-tight mb-3.5"
        style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Inter, "Noto Sans Thai Looped", sans-serif' }}
      >
        {title}{' '}
        {underline && (
          <span style={{ background: 'linear-gradient(180deg, transparent 60%, var(--sms-brand) 60%)', padding: '0 4px' }}>
            {underline}
          </span>
        )}
      </h2>
      {sub && <p className="text-base sm:text-lg" style={{ color: 'var(--sms-muted)' }}>{sub}</p>}
    </div>
  );
}
