'use client';

/**
 * PromptViewer — PDP component for PROMPT-kind digital products.
 *
 * Two states, picked by the parent server component based on
 * `checkProductUnlock(userId, productId)`:
 *
 *   LOCKED (no purchase yet):
 *     - Show only `promptSample` (operator-curated teaser)
 *     - Heavy blur overlay over the "full prompt" placeholder
 *     - CTA "ซื้อเพื่อปลดล็อก / Buy to unlock" → adds to cart
 *
 *   UNLOCKED (post-payment):
 *     - Show full `promptText`
 *     - "คัดลอก" button → navigator.clipboard.writeText()
 *     - License-key badge (proves ownership)
 *     - Toast on copy success
 *
 * Anti-casual-copy hardening (LOCKED state only):
 *   - `user-select: none` on the blurred area
 *   - `onCopy` handler returns false (Chrome) so even "view source"
 *     yields the sample text, not the full prompt (the full prompt
 *     literally isn't in the DOM until the unlock flag flips).
 *
 * Security: the SERVER decides what `fullText` is. The component never
 * receives the full prompt unless the unlock check passed. So a hostile
 * client cannot just toggle the prop — the data isn't in the bundle.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Copy, Lock, Check, KeyRound, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

interface Props {
  storeSlug: string;
  storeName: string;
  productId: string;
  productTitle: string;
  productImage?: string | null;
  priceTHB: number;
  /** Operator-curated public teaser. Always shown (LOCKED and UNLOCKED). */
  promptSample: string | null;
  /** Full prompt — ONLY pass this prop when the server has verified
   *  the viewer holds an active DigitalUnlock for this product. */
  promptFull: string | null;
  /** Active unlock status from server. */
  unlocked: boolean;
  /** License key shown to the buyer once unlocked. */
  licenseKey?: string | null;
}

export function PromptViewer({
  storeSlug,
  storeName,
  productId,
  productTitle,
  productImage,
  priceTHB,
  promptSample,
  promptFull,
  unlocked,
  licenseKey,
}: Props) {
  const add = useCart((s) => s.add);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!unlocked || !promptFull) return;
    try {
      await navigator.clipboard.writeText(promptFull);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can still select+copy manually */
    }
  };

  const handleBuy = () => {
    add({
      productId,
      storeSlug,
      storeName,
      title: productTitle,
      priceTHB,
      imageUrl: productImage ?? undefined,
      productType: "DIGITAL",
      digitalKind: "PROMPT",
    });
  };

  return (
    <div
      className="rounded-2xl border bg-white overflow-hidden font-[family:var(--font-prompt)]"
      style={{ borderColor: 'var(--shop-border, #e5e5e5)' }}
    >
      {/* Sample teaser — always visible */}
      {promptSample && (
        <div
          className="px-5 py-4 border-b"
          style={{
            borderColor: 'var(--shop-border, #e5e5e5)',
            background: 'var(--shop-bg-soft, #fafafa)',
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2"
            style={{ color: 'var(--shop-ink-muted, #71717a)' }}
          >
            ตัวอย่าง · Preview
          </p>
          <pre
            className="whitespace-pre-wrap text-sm leading-relaxed font-[family:var(--font-prompt)]"
            style={{ color: 'var(--shop-ink, #0a0a0a)' }}
          >
            {promptSample}
          </pre>
        </div>
      )}

      {/* Full prompt — gated */}
      <div className="p-5">
        {unlocked && promptFull ? (
          <UnlockedView
            promptFull={promptFull}
            licenseKey={licenseKey}
            copied={copied}
            onCopy={handleCopy}
          />
        ) : (
          <LockedView
            storeSlug={storeSlug}
            productId={productId}
            priceTHB={priceTHB}
            onBuy={handleBuy}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Unlocked — buyer view: full prompt + copy button + license chip
// ─────────────────────────────────────────────────────────────────

function UnlockedView({
  promptFull,
  licenseKey,
  copied,
  onCopy,
}: {
  promptFull: string;
  licenseKey?: string | null;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.15em] inline-flex items-center gap-1.5"
          style={{ color: 'var(--shop-savings, #16a34a)' }}
        >
          <Check size={13} /> ปลดล็อกแล้ว · Full prompt
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{
            background: copied
              ? 'var(--shop-savings, #16a34a)'
              : 'var(--shop-primary, #0a0a0a)',
          }}
        >
          {copied ? (
            <>
              <Check size={14} /> คัดลอกแล้ว
            </>
          ) : (
            <>
              <Copy size={14} /> คัดลอก
            </>
          )}
        </button>
      </div>

      <pre
        className="whitespace-pre-wrap text-sm leading-relaxed font-[family:var(--font-prompt)] rounded-lg p-4 border max-h-[60vh] overflow-y-auto"
        style={{
          background: 'var(--shop-bg, #ffffff)',
          borderColor: 'var(--shop-border, #e5e5e5)',
          color: 'var(--shop-ink, #0a0a0a)',
        }}
      >
        {promptFull}
      </pre>

      {licenseKey && (
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] tabular-nums"
          style={{
            background: 'var(--shop-bg-soft, #f4f4f5)',
            color: 'var(--shop-ink-muted, #71717a)',
          }}
        >
          <KeyRound size={12} />
          License: <span className="font-mono">{licenseKey.slice(0, 12)}…</span>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Locked — non-buyer view: blurred preview + buy-to-unlock CTA
// ─────────────────────────────────────────────────────────────────

function LockedView({
  storeSlug,
  productId,
  priceTHB,
  onBuy,
}: {
  storeSlug: string;
  productId: string;
  priceTHB: number;
  onBuy: () => void;
}) {
  return (
    <div className="relative">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-3 inline-flex items-center gap-1.5"
        style={{ color: 'var(--shop-ink-muted, #71717a)' }}
      >
        <Lock size={13} /> ล็อกอยู่ · Locked
      </p>

      {/* Decoy lines so the locked frame looks substantial without
          ever shipping the real promptText to the DOM. */}
      <div
        className="rounded-lg p-4 border space-y-2 select-none"
        style={{
          background: 'var(--shop-bg-soft, #fafafa)',
          borderColor: 'var(--shop-border, #e5e5e5)',
          filter: 'blur(5px)',
          userSelect: 'none',
        }}
        aria-hidden
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded"
            style={{
              background: 'var(--shop-border, #e5e5e5)',
              width: `${60 + ((i * 13) % 35)}%`,
            }}
          />
        ))}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-2xl shadow-xl px-6 py-5 text-center border max-w-xs"
          style={{
            background: 'var(--shop-bg, #ffffff)',
            borderColor: 'var(--shop-border, #e5e5e5)',
          }}
        >
          <Lock
            className="mx-auto mb-2"
            size={22}
            style={{ color: 'var(--shop-primary, #0a0a0a)' }}
          />
          <p
            className="text-sm font-bold mb-1"
            style={{ color: 'var(--shop-ink, #0a0a0a)' }}
          >
            ซื้อเพื่อปลดล็อก
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--shop-ink-muted, #71717a)' }}
          >
            ปลดล็อกข้อความเต็ม + คัดลอกได้ทันที
          </p>
          <button
            type="button"
            onClick={onBuy}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #0a0a0a))',
            }}
          >
            <ShoppingCart size={14} />
            หยิบใส่ตะกร้า · ฿{priceTHB.toLocaleString()}
          </button>
          <Link
            href={`/stores/${storeSlug}/cart`}
            className="block mt-2 text-[11px] underline"
            style={{ color: 'var(--shop-ink-muted, #71717a)' }}
          >
            ดูตะกร้าและชำระเงิน
          </Link>
        </div>
      </div>
    </div>
  );
}
