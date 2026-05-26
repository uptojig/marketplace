'use client';

/**
 * PDPA Cookie Consent Banner
 * --------------------------
 * Buyer-facing banner mounted once at the marketplace root layout. Renders
 * on storefronts and the marketplace home; uses pure localStorage (no
 * cookies) so it's safe to ship without any backend changes.
 *
 * PDPA framing: the banner is about *transparency* — we surface the four
 * standard categories (essential / functional / analytics / marketing),
 * default the optional three to OFF, and persist the user's choice with a
 * timestamp + schema version so downstream code can re-prompt if the policy
 * version is ever bumped.
 *
 * Other code should guard analytics/marketing pixel calls on
 * `getCookieConsent()?.categories.analytics` (or `.marketing`). Essential
 * is always true.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent.v1';
const SCHEMA_VERSION = 'v1' as const;
const MOUNT_DELAY_MS = 800;

export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsentChoice {
  decision: 'accept-all' | 'reject' | 'custom';
  categories: {
    essential: true;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  timestamp: string;
  version: typeof SCHEMA_VERSION;
}

/**
 * Read + parse the stored consent choice. Returns null if no decision
 * exists, the value is malformed, or the schema version doesn't match.
 *
 * Safe to call from both client and server; on the server (or before
 * hydration) it returns null because `window` is undefined.
 */
export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentChoice;
    if (parsed?.version !== SCHEMA_VERSION) return null;
    if (!parsed.categories || parsed.categories.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistChoice(choice: CookieConsentChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // localStorage may be disabled in private mode — fail silently;
    // the banner will simply re-prompt next session.
  }
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}

function ToggleRow({ label, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900">{label}</span>
          {disabled ? (
            <span className="text-[10px] uppercase tracking-wide text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              จำเป็น
            </span>
          ) : null}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-[var(--shop-primary,#107C41)]' : 'bg-gray-300',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export default function CookieConsent() {
  // `mounted` guards against hydration mismatch: server always renders null,
  // client flips to true on the first effect tick.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getCookieConsent();
    if (existing) return; // user already decided — stay hidden

    const t = window.setTimeout(() => setVisible(true), MOUNT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = useCallback((choice: CookieConsentChoice) => {
    persistChoice(choice);
    setClosing(true);
    // Let the slide-down transition play before unmounting.
    window.setTimeout(() => setVisible(false), 220);
  }, []);

  const handleAcceptAll = useCallback(() => {
    dismiss({
      decision: 'accept-all',
      categories: { essential: true, functional: true, analytics: true, marketing: true },
      timestamp: new Date().toISOString(),
      version: SCHEMA_VERSION,
    });
  }, [dismiss]);

  const handleReject = useCallback(() => {
    dismiss({
      decision: 'reject',
      categories: { essential: true, functional: false, analytics: false, marketing: false },
      timestamp: new Date().toISOString(),
      version: SCHEMA_VERSION,
    });
  }, [dismiss]);

  const handleSaveCustom = useCallback(() => {
    dismiss({
      decision: 'custom',
      categories: { essential: true, functional, analytics, marketing },
      timestamp: new Date().toISOString(),
      version: SCHEMA_VERSION,
    });
  }, [dismiss, functional, analytics, marketing]);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="การยินยอมการใช้คุกกี้ (PDPA)"
      className={[
        'fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg',
        'transform transition-transform duration-200 ease-out',
        closing ? 'translate-y-full' : 'translate-y-0',
      ].join(' ')}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              aria-hidden="true"
              className="shrink-0 mt-0.5 h-9 w-9 rounded-full bg-[var(--shop-primary,#107C41)]/10 flex items-center justify-center"
            >
              <Cookie className="h-5 w-5 text-[var(--shop-primary,#107C41)]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                เราใช้คุกกี้เพื่อให้บริการและพัฒนาประสบการณ์การใช้งานของคุณ — คุณสามารถจัดการการยินยอมได้ที่{' '}
                <button
                  type="button"
                  onClick={() => setShowSettings((s) => !s)}
                  className="font-medium text-[var(--shop-primary,#107C41)] underline-offset-2 hover:underline"
                >
                  &lsquo;ตั้งค่า&rsquo;
                </button>
                . การคลิก &lsquo;ยอมรับทั้งหมด&rsquo; ถือเป็นการยินยอมตาม PDPA{' '}
                <Link
                  href="/terms/cookies"
                  className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
                >
                  อ่านนโยบายคุกกี้
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:shrink-0">
            <button
              type="button"
              onClick={handleReject}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              ปฏิเสธ
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white rounded-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--shop-primary, #107C41)' }}
            >
              ยอมรับทั้งหมด
            </button>
          </div>

          <button
            type="button"
            onClick={handleReject}
            aria-label="ปิด"
            className="hidden sm:inline-flex shrink-0 items-center justify-center h-8 w-8 -mt-1 -mr-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showSettings ? (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              ตั้งค่าหมวดหมู่คุกกี้
            </h3>
            <div>
              <ToggleRow
                label="จำเป็น"
                description="คุกกี้ที่จำเป็นสำหรับการเข้าสู่ระบบ ตะกร้าสินค้า และการชำระเงิน — ไม่สามารถปิดได้"
                checked={true}
                disabled
              />
              <ToggleRow
                label="ฟังก์ชัน"
                description="จดจำการตั้งค่าร้านค้า ภาษา และสินค้าที่ดูล่าสุด เพื่อประสบการณ์ที่ราบรื่นขึ้น"
                checked={functional}
                onChange={setFunctional}
              />
              <ToggleRow
                label="วิเคราะห์"
                description="วัดการเข้าชมหน้าและอัตราการสั่งซื้อ ช่วยให้เราปรับปรุงเว็บไซต์"
                checked={analytics}
                onChange={setAnalytics}
              />
              <ToggleRow
                label="การตลาด"
                description="ใช้สำหรับโฆษณาที่ตรงกับความสนใจ (retargeting, ad pixels)"
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-2 text-sm font-semibold text-white rounded-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--shop-primary, #107C41)' }}
              >
                บันทึก
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
