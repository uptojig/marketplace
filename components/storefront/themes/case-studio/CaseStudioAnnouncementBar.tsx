/**
 * CaseStudioAnnouncementBar — thin black trust strip displayed at the
 * very top of the case-studio homepage body.
 *
 * Per spec this CAN sit "above the ShopHeader" — but since the real
 * ShopHeader is rendered by the parent layout we follow the simpler
 * path the spec offered: render this as the first section inside
 * the page body, immediately below the real chrome header. Visually
 * it still reads as a high-up trust strip and avoids any prop-drill
 * into the layout file.
 *
 * 4 trust items separated by tiny dots:
 *   - Truck       → ส่งฟรีทั่วประเทศ ฿590+
 *   - Bolt        → ส่งวันนี้ ก่อน 14:00
 *   - RefreshCcw  → เปลี่ยน-คืน 14 วัน
 *   - MessageCircle (LINE) → LINE @casestudiothai
 *
 * Pure server component, no client state.
 */

import { Truck, Bolt, RefreshCcw, MessageCircle } from 'lucide-react';

const ITEMS: { Icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { Icon: Truck, label: 'ส่งฟรีทั่วประเทศ ฿590+' },
  { Icon: Bolt, label: 'ส่งวันนี้ ก่อน 14:00' },
  { Icon: RefreshCcw, label: 'เปลี่ยน-คืน 14 วัน' },
  { Icon: MessageCircle, label: 'LINE @casestudiothai' },
];

export function CaseStudioAnnouncementBar() {
  return (
    <div
      style={{ background: '#0A0A0F', color: '#FFFFFF' }}
      className="px-4 sm:px-6 py-2.5"
    >
      <div
        className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 sm:gap-x-8"
        style={{ fontSize: '12px', fontWeight: 500, maxWidth: '1280px' }}
      >
        {ITEMS.map(({ Icon, label }, i) => (
          <span
            key={label}
            className="inline-flex items-center"
            style={{ gap: '6px' }}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
            {i < ITEMS.length - 1 && (
              <span
                aria-hidden
                className="hidden sm:inline-block"
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)',
                  marginLeft: '14px',
                }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
