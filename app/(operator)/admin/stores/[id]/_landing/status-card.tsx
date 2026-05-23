"use client";

import { Loader2, AlertCircle } from "lucide-react";

import type { LandingStatusSnapshot } from "@/hooks/use-landing-status";

import { RecoverFromSession } from "./recover-from-session";

/** Fallback props read from the server component on first paint, before
 *  the first poll completes. After polling starts the live snapshot
 *  takes precedence. */
export type StatusCardFallback = {
  storeId: string;
  blockCount: number;
  landingThemeVariant: string | null;
  landingGeneratedAt: string | null;
  landingTitle: string | null;
};

/**
 * Renders one of four visual states (generating | failed | has-blocks
 * | empty) for the landing-page status section. Each branch ships its
 * own `<RecoverFromSession />` widget so the operator can pull a
 * finished Anthropic session at any point.
 */
export function StatusCard({
  status,
  fallback,
}: {
  status: LandingStatusSnapshot | null;
  fallback: StatusCardFallback;
}) {
  const blockCount = status?.blockCount ?? fallback.blockCount;
  const themeVariant = status?.themeVariant ?? fallback.landingThemeVariant;
  const generatedAt = status?.generatedAt ?? fallback.landingGeneratedAt;
  const title = status?.title ?? fallback.landingTitle;
  const s = status?.status;

  if (s === "generating") {
    return <GeneratingVariant status={status} storeId={fallback.storeId} />;
  }

  if (s === "failed") {
    return <FailedVariant status={status} storeId={fallback.storeId} />;
  }

  if (blockCount > 0) {
    return (
      <HasBlocksVariant
        blockCount={blockCount}
        themeVariant={themeVariant}
        generatedAt={generatedAt}
        title={title}
        storeId={fallback.storeId}
      />
    );
  }

  return <EmptyVariant storeId={fallback.storeId} />;
}

/* ── Variant 1: generating ─────────────────────────────────────────── */
function GeneratingVariant({
  status,
  storeId,
}: {
  status: LandingStatusSnapshot | null;
  storeId: string;
}) {
  // Detect stuck runs — Vercel Hobby maxDuration is 60s; if the
  // run has been "generating" longer than 5min it's almost
  // certainly killed mid-flight. Surface a stale warning so the
  // admin doesn't wait forever.
  const startedMs = status?.startedAt
    ? Date.now() - new Date(status.startedAt).getTime()
    : 0;
  const isStale = startedMs > 5 * 60 * 1000;
  return (
    <div
      className={`flex items-start gap-3 rounded-md border px-3 py-3 text-sm ${
        isStale
          ? "border-orange-300 bg-orange-50 text-orange-900"
          : "border-amber-300 bg-amber-50 text-amber-900"
      }`}
    >
      <Loader2
        className={`mt-0.5 h-4 w-4 shrink-0 animate-spin ${
          isStale ? "text-orange-600" : "text-amber-600"
        }`}
      />
      <div className="flex-1">
        <p className="font-semibold">
          {isStale
            ? "การออกแบบดูเหมือนค้าง — น่าจะ Vercel timeout"
            : "เป็ดกำลังออกแบบหน้าเว็บ..."}
        </p>
        <p className="mt-0.5 text-xs">
          {isStale
            ? "Agent run ใช้เวลานานกว่าที่ Vercel function อนุญาต (Hobby plan = 60s, Pro = 300s) — กด \"ลบ landing page\" ด้านล่างเพื่อ reset แล้วลองใหม่"
            : "ใช้เวลา 30 วินาที – 3 นาที (ขึ้นกับจำนวนสินค้า) — รอสักครู่ แล้วระบบจะอัปเดตให้เอง"}
        </p>
        {status?.startedAt && (
          <p className="text-[11px] opacity-70">
            เริ่มเมื่อ {new Date(status.startedAt).toLocaleTimeString("th-TH")}
            {isStale && ` (${Math.floor(startedMs / 60000)} นาทีก่อน)`}
          </p>
        )}
        {isStale && <RecoverFromSession storeId={storeId} />}
      </div>
    </div>
  );
}

/* ── Variant 2: failed ─────────────────────────────────────────────── */
function FailedVariant({
  status,
  storeId,
}: {
  status: LandingStatusSnapshot | null;
  storeId: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-900">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <div className="flex-1">
        <p className="font-semibold">การออกแบบล้มเหลว</p>
        <p className="mt-0.5 break-words text-xs">
          {status?.error ?? "unknown_error"}
        </p>
        <p className="mt-1 text-[11px] text-red-700/80">
          กด &ldquo;Regenerate&rdquo; เพื่อลองใหม่ — หรือถ้า agent บน
          Anthropic ทำงานเสร็จแล้วแต่ Vercel ตายก่อน save:
        </p>
        <RecoverFromSession storeId={storeId} />
      </div>
    </div>
  );
}

/* ── Variant 3: has blocks ─────────────────────────────────────────── */
function HasBlocksVariant({
  blockCount,
  themeVariant,
  generatedAt,
  title,
  storeId,
}: {
  blockCount: number;
  themeVariant: string | null;
  generatedAt: string | null;
  title: string | null;
  storeId: string;
}) {
  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
      <p>
        ✅ มี landing page อยู่ — <strong>{blockCount} blocks</strong>,
        theme <code>{themeVariant}</code>
      </p>
      {title && <p className="mt-0.5 text-xs">title: {title}</p>}
      {generatedAt && (
        <p className="text-xs text-emerald-700/80">
          สร้างเมื่อ {new Date(generatedAt).toLocaleString("th-TH")}
        </p>
      )}
      {/* Replace existing landing with the schema from a different
          Anthropic session (operator iterated in the Console). */}
      <RecoverFromSession storeId={storeId} />
    </div>
  );
}

/* ── Variant 4: empty ──────────────────────────────────────────────── */
function EmptyVariant({ storeId }: { storeId: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
      <p>ยังไม่มี landing page — ร้านนี้ render product grid ปกติ</p>
      {/* Operator may already have a generated session in Anthropic
          Console they want to use as the initial landing. */}
      <RecoverFromSession storeId={storeId} />
    </div>
  );
}
