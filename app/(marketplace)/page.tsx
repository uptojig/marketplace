/**
 * Marketplace home (basketplace.co/) — seller-acquisition landing page.
 *
 * Replaces the original 60-line scaffold with the full Editorial
 * Merchant landing (Stitch screen id 79df53f067484486965c5ea43d92c041,
 * "Basketplace Landing Page"). Sections in vertical order:
 *
 *   1. Hero — value prop + dual CTA + tilted store mockup
 *   2. Social proof strip — 5 launch stores in grayscale
 *   3. How it works — 3 numbered steps (KYC, AI design, custom domain)
 *   4. Featured stores — 4-up grid pulled live from Prisma
 *   5. Why us — 3 alternating image/text rows (domain, payment, AI)
 *   6. Pricing — Free / Pro (coming soon) / Enterprise
 *   7. Testimonials — 3 quote cards
 *   8. Final CTA strip — coral wash with single CTA
 *
 * All sections are static structural markup — no client state. Sticky
 * header + forest-green footer come from app/(marketplace)/layout.tsx.
 */
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Shield,
  Sparkles,
  Globe,
  CheckCircle2,
  Check,
  Star,
  QrCode,
  CreditCard,
  Palette,
  Monitor,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Image hosts seeded from the Stitch design — replace with real
// store screenshots once we run capture passes.
const STITCH_HERO_MOCKUP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ1kTEq6CNCi4GcQyv-NJKHDuefcnCjrzLKIg-SdMnH7WzJSumpWqtar9CoBc5GzvYnKsrYEpa20a1aH1d4D3W5cVNyrUYZRhuo15WKyqo_r-I2Ez0RVgg0mV9DYBdaLfqb3gWL0H5O404QFtfQ4ooqa9LHwLPG3lDZiwqtiyv49ehtBGq6suea1D1IeRBkrRqTNoJNzrnQDLEyV5pPRANtlEdBgp561hL36CvFUKRdl3bR3T8A4z_UcXGKV2-YSq11LC00Hj0l5I';

const STITCH_WHY_DOMAIN =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBc4pKTfZRj4oa8-8iqGXSgq2eVcaqjrIIvBWWtULoKzlWwKxqcRoJFrZjhOJevrCm9yCsb0_U0cJy6koQoHttc0IuzqF_Wk6Dc3Sy6weR8PBn3LZTZXM91v3ptFrGJoOrkunO9xtbxgU56svjZVXOzs9nRJsouiZ_1MvYu91scEofwsPezVivhwQTey-vGqa8wTk8mptnsOSUR0Ok3F3xrf1GWvkpVRQbEp1uiNWyO-ERU421Tgo1xgY0MF9GCMwyc1PqFjIvsUPY';

const STITCH_WHY_PAYMENT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCq_kXm19SCDbO24QMaZp4negK6qAOZelICD3Fq0fXXunF4ng8jDHzs8LtPqKCxboDTmmIMki_1oLBfrBpfH70QU7tBGyKniKcc2JvdTZgxxnkxU83DBQ7deCithLQFvMC3eIBifzjsZ9rmwzQmIIl36OPGQukkhQqqEHnJA3cphqXYnF6AS28Oo-uwApg3IwAfAsj8Cr8EfLo0L5NMwbzrSfedZgcv2QyEmtxTtvzQ511eaylJ65EFuTp4MJ0UkRhWraxDrl75kn8';

const STITCH_WHY_AI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCZX38aCq9ZS6q0wpnPB11543tHO3POUk_qTn9hjNY5r2WtUQjH1RMqGMIFy6oj9ylswdP7fJ2PGjHAkCxIA3adeXi9kObvU4ffFfNEwSIUsjzsnRADG80rcMrqqdHFxOBJGups0V8AAjvD64hBPDjYqF5I6E09phzBKEo9Jt2BLaRJa4xC9jU0LxLX2Ukd-mbTmvKHcXt5UOEVm4DZywk0s4KGUlVQitK1MMsEZ_RG7Vj5PvPekRpzdUDw-8t1_ghx1QV5pICn9Tc';

// Niche label shown under featured-store cards. Falls back gracefully
// if a store has no niche set; sourced from the Stitch design
// (which used hardcoded labels).
const NICHE_LABEL: Record<string, string> = {
  electronics: 'ไอที & แกดเจ็ต',
  fashion: 'แฟชั่น & เครื่องแต่งกาย',
  lifestyle: 'ไลฟ์สไตล์ & ของใช้ในบ้าน',
  beauty: 'สุขภาพ & ความงาม',
  food: 'อาหาร & เครื่องดื่ม',
  petcare: 'สัตว์เลี้ยง',
  toys: 'ของเล่นเด็ก',
};

export default async function Home() {
  // Launch stores curated for the featured grid — the 6 stores from
  // docs/six-store-golive-audit.md. Pull APPROVED + isActive only so
  // suspended stores never surface as "ตัวอย่างร้านค้า".
  const featuredStores = await prisma.store.findMany({
    where: {
      slug: {
        in: ['minimop24', 'zugarbox', 'ergobodies', 'casethep', 'bikini551'],
      },
      approvalStatus: 'APPROVED',
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      niche: true,
      customDomain: true,
      bannerUrl: true,
    },
    take: 4,
  });

  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="mp-container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start max-w-2xl">
            <span className="inline-block py-1 px-3 border border-mp-border rounded-full text-[13px] font-medium tracking-[0.08em] uppercase text-mp-ink-muted mb-6 bg-mp-surface-contrast/50">
              สำหรับร้านค้าออนไลน์ไทย
            </span>
            <h1 className="text-4xl md:text-[56px] leading-tight font-bold text-mp-ink mb-6">
              เปิดร้านบนโดเมนของคุณเอง ไม่ใช่เช่าพื้นที่ใน Shopee
            </h1>
            <p className="text-lg leading-relaxed text-mp-ink-muted mb-10">
              Basketplace ช่วยคุณเปิดร้านออนไลน์พร้อม domain, payment, KYC,
              และดีไซน์ — ภายใน 24 ชั่วโมง
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center h-11 px-8 bg-mp-coral text-white text-[15px] font-semibold rounded-xl shadow-sm hover:bg-mp-coral-dark hover:-translate-y-px transition-all"
              >
                เปิดร้านฟรี <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="#featured"
                className="inline-flex items-center justify-center h-11 px-8 bg-transparent border border-mp-forest text-mp-forest text-[15px] font-semibold rounded-xl hover:bg-mp-forest hover:text-white transition-colors"
              >
                ดูตัวอย่างร้านค้า
              </Link>
            </div>
            <p className="mt-6 text-[13px] text-mp-ink-muted">
              ใช้ฟรีช่วงเบต้า · ไม่ต้องใช้บัตรเครดิต · พร้อม domain ของคุณเอง
            </p>
          </div>

          <div className="relative w-full aspect-[4/5] lg:aspect-[5/6] rounded-xl overflow-hidden border border-mp-border shadow-md lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
            <Image
              src={STITCH_HERO_MOCKUP}
              alt="ตัวอย่างหน้าร้าน Basketplace"
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
            />
          </div>
        </div>
      </section>

      {/* ── 2. SOCIAL PROOF STRIP ────────────────────────────────── */}
      <section className="border-y border-mp-border bg-mp-surface-contrast/40">
        <div className="mp-container py-10">
          <p className="text-center text-[13px] font-medium uppercase tracking-[0.16em] text-mp-ink-muted mb-6">
            ร้านค้าที่เปิดกับเรา
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 md:gap-x-16 opacity-70">
            {['Minimop24', 'ZugarBox', 'ErgoBodies', 'CaseThep', 'Bikini551'].map(
              (name) => (
                <span
                  key={name}
                  className="text-xl font-bold text-mp-ink/60"
                  style={{ fontFamily: 'var(--mp-font-display)' }}
                >
                  {name}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ──────────────────────────────────────── */}
      <section className="mp-container py-12 md:py-20">
        <h2 className="text-2xl md:text-[28px] font-semibold text-center text-mp-ink mb-12 md:mb-16">
          จากสมัครถึงขายได้ ใน 24 ชั่วโมง
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: '1. ยื่นเอกสารยืนยันตัวตน',
              body:
                'ทำ KYC รวดเร็ว ปลอดภัย สร้างความน่าเชื่อถือให้ร้านค้าของคุณตั้งแต่เริ่มต้น',
            },
            {
              icon: Sparkles,
              title: '2. ออกแบบร้านด้วยตัวช่วย AI',
              body:
                'ได้ดีไซน์สวยระดับพรีเมียมโดยไม่ต้องมีความรู้เรื่องโค้ด ปรับแต่งง่ายดาย',
            },
            {
              icon: Globe,
              title: '3. เปิดร้านพร้อม domain ของคุณ',
              body:
                'รับ Custom Domain ของตัวเองทันที สร้างแบรนด์ที่น่าจดจำและเป็นเจ้าของ 100%',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="mp-card-lift bg-mp-surface-contrast border border-mp-border rounded-xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-mp-cream-alt rounded-full flex items-center justify-center mb-6 text-mp-coral">
                <Icon className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-mp-ink mb-3">{title}</h3>
              <p className="text-[15px] leading-relaxed text-mp-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. FEATURED STORES ───────────────────────────────────── */}
      <section
        id="featured"
        className="bg-mp-cream-alt/40 border-y border-mp-border"
      >
        <div className="mp-container py-12 md:py-20">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
            <h2 className="text-2xl md:text-[28px] font-semibold text-mp-ink">
              ดูร้านจริงที่ใช้ Basketplace
            </h2>
            <Link
              href="/stores"
              className="inline-flex items-center text-mp-coral text-[15px] font-semibold hover:underline"
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStores.length > 0 ? (
              featuredStores.map((store) => (
                <Link
                  key={store.id}
                  href={
                    store.customDomain
                      ? `https://${store.customDomain.replace(/^www\./, '')}`
                      : `/stores/${store.slug}`
                  }
                  className="group bg-mp-surface-contrast rounded-xl border border-mp-border overflow-hidden mp-card-lift block"
                >
                  <div className="aspect-[1.79] overflow-hidden bg-mp-cream-alt relative">
                    {store.bannerUrl ? (
                      <Image
                        src={store.bannerUrl}
                        alt={store.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl font-bold text-mp-ink/40"
                        style={{ fontFamily: 'var(--mp-font-display)' }}
                      >
                        {store.name}
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-mp-border">
                    <p className="text-lg font-semibold text-mp-ink truncate">
                      {store.name}
                    </p>
                    <p className="text-[13px] text-mp-ink-muted mt-0.5">
                      {(store.niche && NICHE_LABEL[store.niche]) ?? 'ร้านค้าออนไลน์'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center text-mp-ink-muted py-10">
                ยังไม่มีร้านค้าตัวอย่าง — ลอง <code>npm run db:seed</code>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. WHY US (alternating rows) ─────────────────────────── */}
      <section className="mp-container py-12 md:py-20 overflow-hidden">
        {[
          {
            title: 'domain ของคุณเอง',
            body:
              'สร้างความน่าเชื่อถือให้แบรนด์ด้วยโดเมนเนมของคุณเอง ลูกค้าจดจำง่าย ไม่ต้องพึ่งพาแพลตฟอร์มอื่น คุณเป็นเจ้าของหน้าร้าน 100%',
            bullets: [
              { icon: CheckCircle2, text: 'เชื่อมต่อ Custom Domain ฟรี', accent: 'coral' as const },
              { icon: CheckCircle2, text: 'ฟรี SSL Certificate ทุกโดเมน', accent: 'coral' as const },
            ],
            image: STITCH_WHY_DOMAIN,
            imageAlt: 'Custom domain ของร้านค้า',
            imageLeft: true,
          },
          {
            title: 'ระบบจ่ายเงินไทย',
            body:
              'รองรับการชำระเงินที่คนไทยคุ้นเคยครบวงจร ปิดการขายง่าย ลดอัตราการทิ้งตะกร้าสินค้า ปลอดภัยมาตรฐานสากล',
            bullets: [
              { icon: QrCode, text: 'พร้อมเพย์ QR Code อัตโนมัติ', accent: 'forest' as const },
              { icon: CreditCard, text: 'รับบัตรเครดิต และระบบผ่อนชำระ', accent: 'forest' as const },
            ],
            image: STITCH_WHY_PAYMENT,
            imageAlt: 'ระบบจ่ายเงินไทย',
            imageLeft: false,
          },
          {
            title: 'ออกแบบให้ฟรี ด้วย AI',
            body:
              'ไม่ต้องปวดหัวกับการจัดเลย์เอาต์ AI ของเราช่วยออกแบบหน้าร้านให้สวยงาม เหมาะกับสินค้าของคุณในไม่กี่คลิก',
            bullets: [
              { icon: Palette, text: 'ธีมสวยงามสไตล์มินิมอล ปรับแต่งง่าย', accent: 'coral' as const },
              { icon: Monitor, text: 'แสดงผลสมบูรณ์แบบบนมือถือ (Responsive)', accent: 'coral' as const },
            ],
            image: STITCH_WHY_AI,
            imageAlt: 'AI ออกแบบร้านอัตโนมัติ',
            imageLeft: true,
          },
        ].map((row, idx) => (
          <div
            key={row.title}
            className={
              'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ' +
              (idx < 2 ? 'mb-20 md:mb-24' : '')
            }
          >
            <div
              className={
                'rounded-xl overflow-hidden border border-mp-border bg-mp-surface-contrast p-4 ' +
                (row.imageLeft ? 'order-2 lg:order-1' : 'order-2 lg:order-2')
              }
            >
              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden">
                <Image
                  src={row.image}
                  alt={row.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 500px, 100vw"
                />
              </div>
            </div>
            <div className={row.imageLeft ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}>
              <h2 className="text-2xl md:text-[28px] font-semibold text-mp-ink mb-6">
                {row.title}
              </h2>
              <p className="text-lg leading-relaxed text-mp-ink-muted mb-6">
                {row.body}
              </p>
              <ul className="space-y-4">
                {row.bullets.map(({ icon: Icon, text, accent }) => (
                  <li key={text} className="flex items-start">
                    <Icon
                      className={
                        'w-5 h-5 mr-3 mt-0.5 shrink-0 ' +
                        (accent === 'coral' ? 'text-mp-coral' : 'text-mp-forest')
                      }
                      strokeWidth={2}
                    />
                    <span className="text-[15px] text-mp-ink">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* ── 6. PRICING ───────────────────────────────────────────── */}
      <section
        id="pricing"
        className="bg-mp-cream-alt/40 border-y border-mp-border"
      >
        <div className="mp-container py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-[28px] font-semibold text-mp-ink mb-4">
              เริ่มต้นฟรี ระหว่างเบต้า
            </h2>
            <p className="text-lg text-mp-ink-muted max-w-2xl mx-auto">
              ไม่มีค่าธรรมเนียมรายเดือนแอบแฝง จ่ายเมื่อคุณขายได้เท่านั้น
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free tier — highlighted */}
            <div className="mp-card-lift relative bg-mp-surface-contrast rounded-xl border-2 border-mp-coral p-8 flex flex-col">
              <div className="absolute top-0 right-0 bg-mp-coral text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
                ยอดนิยม
              </div>
              <h3 className="text-lg font-semibold text-mp-ink mb-2">เริ่มต้น</h3>
              <div className="mb-6 flex items-baseline">
                <span
                  className="text-4xl font-bold text-mp-ink"
                  style={{ fontFamily: 'var(--mp-font-display)' }}
                >
                  FREE
                </span>
                <span className="text-[15px] text-mp-ink-muted ml-2">/ ตลอดชีพ</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'ไม่จำกัดจำนวนสินค้า',
                  'Custom Domain',
                  'ระบบรับชำระเงินพื้นฐาน',
                  'AI ออกแบบร้าน',
                ].map((feat) => (
                  <li key={feat} className="flex items-start">
                    <Check className="w-5 h-5 text-mp-forest mr-2 mt-0.5 shrink-0" />
                    <span className="text-[15px] text-mp-ink-muted">{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="w-full inline-flex items-center justify-center h-11 bg-mp-coral text-white text-[15px] font-semibold rounded-xl hover:bg-mp-coral-dark transition-colors"
              >
                เปิดร้านฟรี
              </Link>
            </div>

            {/* Pro tier — coming soon */}
            <div className="bg-mp-surface rounded-xl border border-mp-border p-8 flex flex-col opacity-75">
              <h3 className="text-lg font-semibold text-mp-ink mb-2">เติบโต</h3>
              <div className="mb-6 flex items-baseline">
                <span
                  className="text-4xl font-bold text-mp-ink-muted"
                  style={{ fontFamily: 'var(--mp-font-display)' }}
                >
                  ฿490
                </span>
                <span className="text-[15px] text-mp-ink-muted ml-2">/ เดือน</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'ทุกฟีเจอร์ในแพ็กเกจเริ่มต้น',
                  'ค่าธรรมเนียมธุรกรรมพิเศษ',
                  'ระบบวิเคราะห์ข้อมูลเชิงลึก',
                ].map((feat) => (
                  <li key={feat} className="flex items-start opacity-70">
                    <Check className="w-5 h-5 text-mp-ink-muted mr-2 mt-0.5 shrink-0" />
                    <span className="text-[15px] text-mp-ink-muted">{feat}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center h-11 bg-mp-cream-alt text-mp-ink-muted text-[15px] font-semibold rounded-xl cursor-not-allowed"
              >
                เร็วๆ นี้
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-mp-surface rounded-xl border border-mp-border p-8 flex flex-col">
              <h3 className="text-lg font-semibold text-mp-ink mb-2">Enterprise</h3>
              <div className="mb-6 flex items-baseline">
                <span
                  className="text-2xl font-bold text-mp-ink"
                  style={{ fontFamily: 'var(--mp-font-display)' }}
                >
                  Custom
                </span>
              </div>
              <p className="text-[15px] text-mp-ink-muted mb-6 flex-1">
                สำหรับธุรกิจขนาดใหญ่ที่ต้องการการปรับแต่งพิเศษ และ API
                เชื่อมต่อกับระบบภายใน
              </p>
              <a
                href="mailto:support@basketplace.co"
                className="w-full inline-flex items-center justify-center h-11 bg-transparent border border-mp-border text-mp-ink text-[15px] font-semibold rounded-xl hover:bg-mp-cream-alt transition-colors"
              >
                ติดต่อฝ่ายขาย
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS ──────────────────────────────────────── */}
      <section className="mp-container py-12 md:py-20">
        <h2 className="text-2xl md:text-[28px] font-semibold text-center text-mp-ink mb-12 md:mb-16">
          ร้านที่ลองแล้วบอกอะไร
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'ย้ายมาจาก marketplace แล้วยอดไม่ตกเลย ลูกค้าชอบที่เว็บดูน่าเชื่อถือ และเราชอบที่ได้ฐานข้อมูลลูกค้ามาทำการตลาดต่อเองได้ 100%',
              name: 'คุณแอน',
              store: 'เจ้าของร้าน ErgoBodies',
              initial: 'A',
            },
            {
              quote:
                'ตอนแรกกังวลเรื่องการทำเว็บเพราะเขียนโค้ดไม่เป็น แต่ AI ของ Basketplace ช่วยจัดหน้าเว็บให้สวยมาก ใช้งานง่ายกว่าที่คิดเยอะเลย',
              name: 'คุณก้อง',
              store: 'เจ้าของร้าน Minimop24',
              initial: 'K',
            },
            {
              quote:
                'ระบบจ่ายเงินเนียนมาก ลูกค้าสแกน QR จ่ายได้เลย ไม่ต้องส่งสลิปให้แอดมินตรวจ ย่นเวลาทำงานได้เยอะ แถมดูเป็นมืออาชีพขึ้นมาก',
              name: 'คุณนุ่น',
              store: 'เจ้าของร้าน ZugarBox',
              initial: 'N',
            },
          ].map((t) => (
            <article
              key={t.name}
              className="bg-mp-surface-contrast border border-mp-border rounded-xl p-8 flex flex-col"
            >
              <div className="flex text-mp-warning mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-[15px] leading-relaxed text-mp-ink-muted flex-1 mb-6">
                “{t.quote}”
              </p>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 bg-mp-cream-alt rounded-full flex items-center justify-center mr-3 font-bold text-mp-ink"
                  aria-hidden="true"
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-mp-ink">{t.name}</p>
                  <p className="text-[13px] text-mp-ink-muted">{t.store}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 8. FINAL CTA STRIP ───────────────────────────────────── */}
      <section className="bg-mp-coral">
        <div className="mp-container py-16 md:py-20 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            style={{ fontFamily: 'var(--mp-font-display)' }}
          >
            พร้อมเปิดร้านเป็นของคุณเองหรือยัง?
          </h2>
          <Link
            href="/apply"
            className="inline-flex items-center justify-center h-14 px-10 bg-white text-mp-coral text-base font-semibold rounded-xl shadow-md hover:-translate-y-px hover:shadow-lg transition-all"
          >
            เริ่มเปิดร้านเลย <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
