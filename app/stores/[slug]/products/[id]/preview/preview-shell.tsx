'use client';

/**
 * Fullscreen preview shell — fixed-position container that covers the
 * storefront layout. Top bar: back, device toggle, buy CTA.
 * Body: iframe of the demoUrl at viewport size.
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  ShoppingCart,
  ExternalLink,
} from 'lucide-react';

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<DeviceSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const DEVICE_LABEL: Record<DeviceSize, string> = {
  desktop: 'เดสก์ท็อป',
  tablet: 'แท็บเล็ต',
  mobile: 'มือถือ',
};

interface Props {
  demoUrl: string;
  productId: string;
  productTitle: string;
  storeSlug: string;
  storeName: string;
}

export function PreviewShell({
  demoUrl,
  productId,
  productTitle,
  storeSlug,
  storeName,
}: Props) {
  const [device, setDevice] = useState<DeviceSize>('desktop');

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-zinc-900 font-[family:var(--font-prompt)]"
      role="dialog"
      aria-label="พรีวิวเทมเพลต"
    >
      {/* Top bar */}
      <header className="sticky top-0 flex items-center justify-between gap-3 px-4 h-12 bg-white border-b border-zinc-200 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/stores/${storeSlug}/products/${productId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">กลับ</span>
          </Link>
          <span aria-hidden className="h-4 w-px bg-zinc-200 hidden sm:block" />
          <span className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
            {productTitle}
          </span>
          <span
            className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{
              background: '#F3F4F6',
              color: '#6B7280',
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            }}
          >
            LIVE PREVIEW
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Device toggle */}
          <div
            className="hidden sm:inline-flex items-center bg-zinc-100 rounded-md p-0.5"
            role="group"
            aria-label="ขนาดอุปกรณ์"
          >
            {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map((d) => {
              const Icon =
                d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
              const active = device === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  aria-label={DEVICE_LABEL[d]}
                  aria-pressed={active}
                  title={DEVICE_LABEL[d]}
                  className={
                    active
                      ? 'inline-flex items-center justify-center p-1.5 rounded bg-white text-zinc-900 shadow-sm'
                      : 'inline-flex items-center justify-center p-1.5 rounded text-zinc-500 hover:text-zinc-700'
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900"
            aria-label="เปิด demo ในแท็บใหม่"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/stores/${storeSlug}/products/${productId}`}
            className="inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-xs font-bold text-white"
            style={{ background: '#82B440' }}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ซื้อเทมเพลตนี้</span>
            <span className="sm:hidden">ซื้อ</span>
          </Link>
        </div>
      </header>

      {/* Iframe — fills remaining viewport */}
      <div
        className="flex-1 overflow-auto flex items-start justify-center"
        style={{
          background:
            device !== 'desktop'
              ? 'linear-gradient(135deg, #FAFBFC 0%, #F3F4F6 100%)'
              : '#FFFFFF',
        }}
      >
        <iframe
          src={demoUrl}
          title={`พรีวิวเต็มจอ · ${productTitle}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
          loading="lazy"
          className="border-0 bg-white"
          style={{
            width: DEVICE_WIDTH[device],
            height: '100%',
            minHeight: '100%',
            maxWidth: '100%',
            transition: 'width 0.25s ease-out',
          }}
        />
      </div>

      {/* Bottom hint band */}
      <footer className="hidden sm:flex items-center justify-between gap-3 px-4 h-8 bg-white border-t border-zinc-200 text-[11px] text-zinc-500 shrink-0">
        <span>
          ขนาดแสดงผล:{' '}
          <span className="font-semibold text-zinc-900">
            {DEVICE_LABEL[device]}
          </span>
        </span>
        <span className="truncate">
          {storeName} ·{' '}
          <span
            className="font-medium text-zinc-900"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            }}
          >
            {demoUrl}
          </span>
        </span>
      </footer>
    </div>
  );
}
