'use client';

/**
 * Top bar shown above any salepage preview. Fixed to top, ~44px tall,
 * with back-to-catalog, device-size toggle (desktop/tablet/mobile),
 * and an "Use This Template" CTA. The bar lives outside the salepage
 * itself so swapping templates doesn't require copy-pasting the chrome
 * into every component.
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Tablet, Smartphone, Sparkles } from 'lucide-react';

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<DeviceSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function PreviewBar({
  templateId,
  templateName,
  accentColor,
  children,
}: {
  templateId: string;
  templateName: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  const [device, setDevice] = useState<DeviceSize>('desktop');

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      {/* ─── Top bar ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 h-11 bg-white border-b border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/themes/${templateId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">กลับ</span>
          </Link>
          <span
            aria-hidden
            className="h-4 w-px bg-zinc-200 hidden sm:block"
          />
          <span className="text-xs font-semibold text-zinc-900 truncate">
            {templateName}
          </span>
          <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 uppercase tracking-wide">
            Preview
          </span>
        </div>

        {/* Device toggle */}
        <div className="hidden sm:flex items-center bg-zinc-100 rounded-md p-0.5">
          {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map((d) => {
            const Icon =
              d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                aria-label={d}
                aria-pressed={device === d}
                className={
                  device === d
                    ? 'inline-flex items-center justify-center p-1.5 rounded bg-white text-zinc-900 shadow-sm'
                    : 'inline-flex items-center justify-center p-1.5 rounded text-zinc-500 hover:text-zinc-700'
                }
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        <Link
          href={`/signup?template=${encodeURIComponent(templateId)}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
          style={{ background: accentColor }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          ใช้เทมเพลตนี้
        </Link>
      </header>

      {/* ─── Preview canvas ─── */}
      <div className="flex-1 overflow-auto py-4 px-2 sm:px-4 flex justify-center">
        <div
          className="bg-white shadow-2xl transition-all duration-300"
          style={{
            width: DEVICE_WIDTH[device],
            maxWidth: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
