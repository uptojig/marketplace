/**
 * CaseStudioFeaturesBar — full-width black trust strip.
 *
 * Server component. 4-col flex grid with shield/bolt/truck/refresh
 * icons in coral-tinted circles + bold title + muted descriptor.
 * Mirrors the .features-bar block from the design source.
 *
 * Used to break visual rhythm between Collections (gray surface) and
 * Bestsellers (white). The dark band reads as "promise / guarantee"
 * and the coral icon backgrounds pull the eye through the same
 * accent loop used in the hero kicker + CTAs.
 */

import { ShieldCheck, Bolt, Truck, RefreshCcw } from 'lucide-react';

const FEATURES: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  {
    Icon: ShieldCheck,
    title: 'กันกระแทก 3 เมตร',
    desc: 'ผ่านการทดสอบมาตรฐาน MIL-STD-810G · ตกได้ไม่กลัวเครื่องพัง',
  },
  {
    Icon: Bolt,
    title: 'MagSafe Compatible',
    desc: 'แม่เหล็กในตัว · ใช้กับชาร์จไร้สาย MagSafe และ accessories ทุกแบบ',
  },
  {
    Icon: Truck,
    title: 'ส่งฟรีทั่วประเทศ',
    desc: 'สั่งซื้อ ฿590+ ส่งฟรี · สั่งก่อนบ่าย 2 ได้ของวันนี้',
  },
  {
    Icon: RefreshCcw,
    title: 'เปลี่ยน-คืน 14 วัน',
    desc: 'ไม่พอใจ คืนได้เต็มจำนวน · ของแท้รับประกัน 1 ปี',
  },
];

export function CaseStudioFeaturesBar() {
  return (
    <section
      className="px-4 sm:px-6 py-14"
      style={{ background: '#0A0A0F', color: '#FFFFFF' }}
    >
      <div
        className="mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ maxWidth: '1100px' }}
      >
        {FEATURES.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                background: 'rgba(255,51,102,0.2)',
                color: '#FF3366',
              }}
            >
              <Icon className="h-[22px] w-[22px]" />
            </div>
            <div>
              <h4
                className="font-bold"
                style={{ fontSize: '14px', marginBottom: '4px' }}
              >
                {title}
              </h4>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
