'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  RotateCw,
  Receipt,
  FileDown,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';

type LedgerType = 'TOPUP' | 'SPEND' | 'REFUND' | 'ADJUST';

interface LedgerEntry {
  id: string;
  type: LedgerType;
  amountTHB: number;
  balanceAfterTHB: number;
  orderId: string | null;
  topupId: string | null;
  /** Human-readable TOP-YYYYMMDD-XXXXXX. Present on TOPUP entries
   *  whose CreditTopup row carries a referenceNumber (server stamps
   *  this at intent creation; pre-evidence-pack rows may be NULL). */
  topupRef: string | null;
  note: string | null;
  createdAt: string;
}

interface CreditClientProps {
  storeSlug: string;
  storeName: string;
  initialBalanceTHB: number;
  initialLedger: LedgerEntry[];
  pendingTopupId: string | null;
}

const QUICK_PICKS = [100, 500, 1000, 2000, 5000];
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 30_000;

export function CreditClient({
  storeSlug,
  storeName,
  initialBalanceTHB,
  initialLedger,
  pendingTopupId,
}: CreditClientProps) {
  const [balanceTHB, setBalanceTHB] = useState(initialBalanceTHB);
  const [ledger, setLedger] = useState<LedgerEntry[]>(initialLedger);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  /** Per-top-up ToS acceptance — buyer must tick the checkbox each
   *  time. Server stamps the version + timestamp on the CreditTopup
   *  row for chargeback evidence. */
  const [tosAccepted, setTosAccepted] = useState(false);
  // Keep in sync with CURRENT_CREDIT_TOS_VERSION in
  // app/api/credit/topup/route.ts — the server rejects mismatches.
  const TOS_VERSION = "credit-2026-05-26";

  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const initialLedgerIdsRef = useRef(new Set(initialLedger.map((e) => e.id)));

  const effectiveAmount = useMemo(() => {
    if (customAmount.trim().length > 0) {
      const n = Number(customAmount);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
      if (n > 100_000) return null;
      return n;
    }
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const refreshBalance = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/credit/balance?storeSlug=${encodeURIComponent(storeSlug)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        balanceTHB: number;
        ledger: LedgerEntry[];
      };
      setBalanceTHB(data.balanceTHB);
      setLedger(data.ledger.slice(0, 20));
      return data;
    } catch {
      return null;
    }
  }, [storeSlug]);

  // Post-redirect polling: when the buyer returns from AnyPay with
  // ?topup=<id>, poll the balance every 2s until either a new ledger
  // row appears (webhook fired) or 30s elapse (slow gateway).
  useEffect(() => {
    if (!pendingTopupId) return;
    let cancelled = false;
    setPolling(true);
    const startedAt = Date.now();

    const tick = async () => {
      if (cancelled) return;
      const data = await refreshBalance();
      if (cancelled) return;
      const sawNew =
        data?.ledger.some(
          (e) =>
            e.topupId === pendingTopupId ||
            !initialLedgerIdsRef.current.has(e.id),
        ) ?? false;
      if (sawNew) {
        setPolling(false);
        return;
      }
      if (Date.now() - startedAt >= POLL_MAX_MS) {
        setPolling(false);
        setPollTimedOut(true);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [pendingTopupId, refreshBalance]);

  const handleCustomChange = (raw: string) => {
    setCustomAmount(raw);
    setSelectedAmount(null);
    if (raw.trim().length === 0) {
      setAmountError(null);
      return;
    }
    if (/[.,]/.test(raw)) {
      setAmountError('กรุณาใส่จำนวนเต็มเท่านั้น');
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      setAmountError('จำนวนต้องเป็นจำนวนเต็มบวก');
      return;
    }
    if (n > 100_000) {
      setAmountError('ยอดสูงสุดต่อครั้งคือ 100,000 บาท');
      return;
    }
    setAmountError(null);
  };

  const handleQuickPick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setAmountError(null);
  };

  const handleTopup = async () => {
    setTopupError(null);
    if (!effectiveAmount || amountError) {
      setTopupError('กรุณาเลือกหรือระบุยอดเติมที่ถูกต้อง');
      return;
    }
    if (!tosAccepted) {
      setTopupError('กรุณายอมรับเงื่อนไขก่อนทำรายการ');
      return;
    }
    setTopupLoading(true);
    try {
      const res = await fetch('/api/credit/topup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug,
          amountTHB: effectiveAmount,
          tosAccepted: true,
          tosVersion: TOS_VERSION,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.paymentUrl) {
        setTopupError(data?.error ?? 'ไม่สามารถเริ่มการเติมเครดิตได้');
        setTopupLoading(false);
        return;
      }
      window.location.href = data.paymentUrl as string;
    } catch {
      setTopupError('เกิดข้อผิดพลาด — กรุณาลองใหม่');
      setTopupLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--shop-bg,#fafafa)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href={`/stores/${storeSlug}/account`}
          className="inline-flex items-center gap-1 text-sm font-[family:var(--font-prompt)] mb-6"
          style={{ color: 'var(--shop-ink-muted,#71717a)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          กลับสู่บัญชี
        </Link>

        <header className="mb-8">
          <p
            className="text-xs uppercase tracking-[0.18em] font-[family:var(--font-prompt)] font-semibold mb-2"
            style={{ color: 'var(--shop-primary,#0a0a0a)' }}
          >
            Store Credit
          </p>
          <h1
            className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold mb-2"
            style={{ color: 'var(--shop-ink,#0a0a0a)' }}
          >
            เครดิตร้าน {storeName}
          </h1>
          <p
            className="text-sm font-[family:var(--font-prompt)] max-w-2xl"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            เติมเครดิตล่วงหน้าเพื่อชำระสินค้าได้รวดเร็วยิ่งขึ้น — เครดิตใช้ได้เฉพาะร้านนี้เท่านั้น
          </p>
        </header>

        {pendingTopupId && polling && (
          <div
            className="mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 font-[family:var(--font-prompt)] text-sm"
            style={{
              borderColor: 'var(--shop-border,#e5e5e5)',
              background: 'var(--shop-card,#ffffff)',
              color: 'var(--shop-ink,#0a0a0a)',
            }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            ตรวจสอบยอด...
          </div>
        )}
        {pendingTopupId && pollTimedOut && (
          <div
            className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 font-[family:var(--font-prompt)] text-sm"
            style={{
              borderColor: 'var(--shop-border,#e5e5e5)',
              background: 'var(--shop-card,#ffffff)',
              color: 'var(--shop-ink,#0a0a0a)',
            }}
          >
            <span className="flex-1">
              การชำระยังไม่ confirm — กดรีเฟรชเพื่อตรวจสอบอีกครั้ง
            </span>
            <button
              type="button"
              onClick={() => {
                setPollTimedOut(false);
                setPolling(true);
                refreshBalance().finally(() => {
                  setPolling(false);
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary,#0a0a0a))',
              }}
            >
              <RotateCw className="h-3.5 w-3.5" />
              รีเฟรช
            </button>
          </div>
        )}

        <section
          className="rounded-3xl border p-6 sm:p-8 mb-8"
          style={{
            borderColor: 'var(--shop-border,#e5e5e5)',
            background: 'var(--shop-card,#ffffff)',
          }}
        >
          <div className="flex items-center gap-2 mb-2 font-[family:var(--font-prompt)] text-xs uppercase tracking-wider"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            <Wallet className="h-4 w-4" />
            ยอดเครดิตคงเหลือ
          </div>
          <p
            className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-bold"
            style={{ color: 'var(--shop-ink,#0a0a0a)' }}
          >
            {formatTHB(balanceTHB)}
          </p>
        </section>

        <section
          className="rounded-3xl border p-6 sm:p-8 mb-10"
          style={{
            borderColor: 'var(--shop-border,#e5e5e5)',
            background: 'var(--shop-card,#ffffff)',
          }}
        >
          <h2
            className="font-[family:var(--font-kanit)] text-xl font-bold mb-1"
            style={{ color: 'var(--shop-ink,#0a0a0a)' }}
          >
            เติมเครดิต
          </h2>
          <p
            className="text-sm font-[family:var(--font-prompt)] mb-5"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            ชำระเงินออนไลน์ — เครดิตจะเข้าทันทีหลังการชำระเงินสำเร็จ
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {QUICK_PICKS.map((amount) => {
              const active =
                selectedAmount === amount && customAmount.trim().length === 0;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickPick(amount)}
                  className="rounded-full border px-3 py-2 text-sm font-semibold font-[family:var(--font-prompt)] transition-colors"
                  style={
                    active
                      ? {
                          borderColor:
                            'var(--shop-primary,#0a0a0a)',
                          background:
                            'var(--shop-primary-gradient, var(--shop-primary,#0a0a0a))',
                          color: '#ffffff',
                        }
                      : {
                          borderColor: 'var(--shop-border,#e5e5e5)',
                          background: 'transparent',
                          color: 'var(--shop-ink,#0a0a0a)',
                        }
                  }
                >
                  {formatTHB(amount)}
                </button>
              );
            })}
          </div>

          <label
            className="block text-xs font-[family:var(--font-prompt)] font-semibold mb-1.5"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            ระบุยอดเอง (บาท)
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={100000}
            step={1}
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="เช่น 1500"
            className="w-full rounded-xl border px-4 py-2.5 text-base font-[family:var(--font-prompt)] focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              borderColor: amountError
                ? '#dc2626'
                : 'var(--shop-border,#e5e5e5)',
              color: 'var(--shop-ink,#0a0a0a)',
              background: 'var(--shop-bg,#fafafa)',
            }}
          />
          {amountError && (
            <p className="mt-1.5 text-xs font-[family:var(--font-prompt)] text-red-600">
              {amountError}
            </p>
          )}
          {topupError && !amountError && (
            <p className="mt-3 text-sm font-[family:var(--font-prompt)] text-red-600">
              {topupError}
            </p>
          )}

          <label
            className="mt-4 flex items-start gap-2 text-xs font-[family:var(--font-prompt)] cursor-pointer select-none"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            <input
              type="checkbox"
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              ข้าพเจ้ายอมรับ{' '}
              <a
                href="/terms/credit"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70"
                style={{ color: 'var(--shop-primary,#0a0a0a)' }}
              >
                เงื่อนไขการเติมเครดิต
              </a>{' '}
              และเข้าใจว่าเครดิตที่เติมเข้าระบบแล้วไม่สามารถแลกเปลี่ยน
              หรือขอคืนเป็นเงินสดได้
            </span>
          </label>

          <button
            type="button"
            disabled={topupLoading || !effectiveAmount || !!amountError || !tosAccepted}
            onClick={handleTopup}
            className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary,#0a0a0a))',
            }}
          >
            {topupLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังเปิดหน้าชำระเงิน...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                เติมเครดิต {effectiveAmount ? formatTHB(effectiveAmount) : ''}
              </>
            )}
          </button>
        </section>

        <section>
          <h2
            className="font-[family:var(--font-kanit)] text-xl font-bold mb-4"
            style={{ color: 'var(--shop-ink,#0a0a0a)' }}
          >
            รายการล่าสุด
          </h2>

          {ledger.length === 0 ? (
            <div
              className="rounded-2xl border-2 border-dashed p-8 text-center font-[family:var(--font-prompt)] text-sm"
              style={{
                borderColor: 'var(--shop-border,#e5e5e5)',
                color: 'var(--shop-ink-muted,#71717a)',
              }}
            >
              ยังไม่มีรายการเครดิต — เติมเครดิตได้ที่ด้านบน
            </div>
          ) : (
            <ul
              className="rounded-2xl border divide-y overflow-hidden"
              style={{
                borderColor: 'var(--shop-border,#e5e5e5)',
                background: 'var(--shop-card,#ffffff)',
              }}
            >
              {ledger.map((entry) => (
                <LedgerRow
                  key={entry.id}
                  entry={entry}
                  storeSlug={storeSlug}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function LedgerRow({
  entry,
  storeSlug,
}: {
  entry: LedgerEntry;
  storeSlug: string;
}) {
  const isCredit = entry.type === 'TOPUP' || entry.type === 'REFUND';
  const isTopup = entry.type === 'TOPUP';
  const sign = isCredit ? '+' : '-';
  const amountColor = isTopup
    ? '#16a34a'
    : entry.type === 'REFUND'
      ? 'var(--shop-ink-muted,#71717a)'
      : entry.type === 'SPEND'
        ? '#b91c1c'
        : 'var(--shop-ink-muted,#71717a)';

  const label = labelFor(entry.type);

  const dateStr = new Date(entry.createdAt).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <li
      className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 font-[family:var(--font-prompt)]"
      style={{ color: 'var(--shop-ink,#0a0a0a)' }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: isCredit ? '#dcfce7' : '#fee2e2',
            color: isCredit ? '#15803d' : '#b91c1c',
          }}
        >
          {isCredit ? (
            <ArrowDownRight className="h-4 w-4" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{label}</p>
          {entry.note && (
            <p
              className="text-xs truncate"
              style={{ color: 'var(--shop-ink-muted,#71717a)' }}
            >
              {entry.note}
            </p>
          )}
          <p
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            {dateStr} · คงเหลือ {formatTHB(entry.balanceAfterTHB)}
          </p>
          {entry.orderId && (
            <Link
              href={`/stores/${storeSlug}/account/orders/${entry.orderId}`}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: 'var(--shop-primary,#0a0a0a)' }}
            >
              {entry.type === 'SPEND' ? (
                <Receipt className="h-3 w-3" />
              ) : (
                <FileDown className="h-3 w-3" />
              )}
              ดูออเดอร์
            </Link>
          )}
          {entry.type === 'TOPUP' && entry.topupRef && (
            <Link
              href={`/stores/${storeSlug}/account/credit/receipts/${entry.topupRef}`}
              className="mt-1 ml-3 inline-flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: 'var(--shop-primary,#0a0a0a)' }}
            >
              <Receipt className="h-3 w-3" />
              ดูใบเสร็จ
            </Link>
          )}
        </div>
      </div>
      <p
        className="text-base font-bold font-[family:var(--font-kanit)] shrink-0"
        style={{ color: amountColor }}
      >
        {sign}
        {formatTHB(Math.abs(entry.amountTHB))}
      </p>
    </li>
  );
}

function labelFor(type: LedgerType): string {
  switch (type) {
    case 'TOPUP':
      return 'เติมเครดิต';
    case 'SPEND':
      return 'ใช้เครดิตชำระสินค้า';
    case 'REFUND':
      return 'คืนเครดิต';
    case 'ADJUST':
      return 'ปรับยอดโดยร้าน';
  }
}
