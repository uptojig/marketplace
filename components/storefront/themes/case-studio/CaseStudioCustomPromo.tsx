/**
 * CaseStudioCustomPromo — DIY-studio promo card.
 *
 * Server component. Dark rounded card (linear-gradient #0A0A0F →
 * slate-800) with a coral radial bleed in the bottom-right. Two
 * columns:
 *   - Left: coral kicker → big H2 → muted paragraph → 4 check-list
 *     features → coral filled CTA "เริ่มออกแบบเลย"
 *   - Right: a rotated white "phone canvas" mockup with a dashed
 *     coral frame, a 📸 placeholder emoji, and a 4-tool row
 *
 * The CTA links to `/stores/<slug>/custom-design` but that route
 * doesn't exist yet — marked as a "coming soon" with a `disabled`
 * style? Per spec the link should still render (operator can drop
 * a real DIY studio route later); we use a plain Link with the URL
 * + a `data-coming-soon` attribute so future work can hook up a
 * tooltip / waitlist if desired. TODO: real DIY-studio route.
 */

import Link from 'next/link';
import { ArrowRight, Check, Pencil } from 'lucide-react';

interface Props {
  storeSlug: string;
}

const FEATURES = [
  'อัปโหลดรูปจากเครื่อง / Instagram',
  'เพิ่มข้อความ + 200+ ฟอนต์',
  'Preview แบบ 3D ก่อนสั่ง',
  'ส่งภายใน 3-5 วัน',
];

export function CaseStudioCustomPromo({ storeSlug }: Props) {
  return (
    <section className="px-4 sm:px-6 py-20" style={{ background: '#FFFFFF' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        <div
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #0A0A0F 0%, #1F2937 100%)',
            borderRadius: '20px',
            padding: 'clamp(40px, 6vw, 60px) clamp(28px, 5vw, 56px)',
            color: '#FFFFFF',
          }}
        >
          {/* Coral radial bleed (bottom-right) */}
          <span
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              right: -100,
              bottom: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,51,102,0.3) 0%, transparent 60%)',
            }}
          />

          <div className="relative grid gap-10 lg:grid-cols-2 items-center">
            {/* Left */}
            <div>
              <p
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '11px',
                  letterSpacing: '2.5px',
                  color: '#FF3366',
                }}
              >
                DIY Studio
              </p>
              <h2
                className="mb-4"
                style={{
                  fontSize: 'clamp(32px, 5vw, 44px)',
                  fontWeight: 900,
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                }}
              >
                ออกแบบเคสของคุณเอง
              </h2>
              <p
                className="mb-6"
                style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  lineHeight: 1.6,
                  maxWidth: '400px',
                }}
              >
                อัปโหลดรูปคุณ ใส่ตัวอักษร เลือกฟอนต์ พิมพ์ด้วยเทคโนโลยี UV ลายไม่ลอกไม่จาง
              </p>
              <div className="flex flex-col gap-2.5 mb-7">
                {FEATURES.map((f) => (
                  <div
                    key={f}
                    className="inline-flex items-center gap-2.5"
                    style={{ fontSize: '13px' }}
                  >
                    <Check className="h-[18px] w-[18px]" style={{ color: '#FF3366' }} />
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href={`/stores/${storeSlug}/custom-design`}
                data-coming-soon="true"
                className="inline-flex items-center gap-2 transition hover:opacity-90"
                style={{
                  background: '#FF3366',
                  color: '#FFFFFF',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                เริ่มออกแบบเลย <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right — mock canvas */}
            <div className="relative flex justify-center items-center">
              <div
                className="relative"
                style={{
                  width: 280,
                  maxWidth: '100%',
                  height: 320,
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px',
                  transform: 'rotate(3deg)',
                }}
              >
                <div className="flex justify-between items-center mb-3.5" style={{ color: '#0A0A0F' }}>
                  <b style={{ fontSize: '11px', fontWeight: 700 }}>YOUR DESIGN</b>
                  <Pencil className="h-4 w-4" style={{ color: '#FF3366' }} />
                </div>
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    aspectRatio: '9 / 16',
                    background:
                      'linear-gradient(135deg, #FFE5EC 0%, #F3E8FF 100%)',
                    borderRadius: '12px',
                    fontSize: '64px',
                  }}
                >
                  📸
                  <span
                    aria-hidden
                    className="absolute"
                    style={{
                      inset: 10,
                      border: '2px dashed rgba(255,51,102,0.5)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div className="flex gap-1.5 mt-3.5">
                  {['📷', 'T', '🎨', '✨'].map((tool, i) => (
                    <div
                      key={i}
                      className="flex-1 text-center"
                      style={{
                        padding: '8px',
                        background: '#F5F5F7',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#0A0A0F',
                      }}
                    >
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
