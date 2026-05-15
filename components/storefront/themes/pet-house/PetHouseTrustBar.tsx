/**
 * PetHouseTrustBar — 4-column trust strip under the hero.
 *
 * Static copy. Uses lucide-react icons inside mint circle badges to match
 * the mockup's mint #F0F7E5 + green #5BA033 palette. Server component.
 */

import { Truck, Package, RefreshCcw } from 'lucide-react';

interface TrustItem {
  Icon: typeof Truck;
  title: string;
  subtitle: string;
}

const ITEMS: TrustItem[] = [
  { Icon: Truck, title: 'ส่งฟรี ฿1,500+', subtitle: 'ทั่วประเทศ' },
  { Icon: Package, title: 'จัดส่งเร็ว', subtitle: 'ภายใน 1-3 วัน' },
  { Icon: RefreshCcw, title: 'คืน/เปลี่ยน 7 วัน', subtitle: 'ฟรีค่าส่งคืน' },
];

export function PetHouseTrustBar() {
  return (
    <section
      className="px-6 sm:px-8 py-4"
      style={{
        background: 'white',
        borderTop: '0.5px solid #EDE5DF',
        borderBottom: '0.5px solid #EDE5DF',
      }}
    >
      <div className="mx-auto max-w-[1100px] grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-0">
        {ITEMS.map(({ Icon, title, subtitle }, i) => (
          <div
            key={title}
            className="flex items-center gap-3 px-2 md:px-3.5 py-1.5"
            style={{
              borderRight:
                i < ITEMS.length - 1 ? '0.5px solid #EDE5DF' : 'none',
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#F0F7E5',
                color: '#5BA033',
              }}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div
                className="font-semibold"
                style={{ fontSize: '12px', color: '#3B2F1F' }}
              >
                {title}
              </div>
              <div style={{ fontSize: '10px', color: '#8A7B6A' }}>
                {subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
