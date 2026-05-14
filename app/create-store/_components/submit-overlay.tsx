"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  /** Total selected product count (pre-cap) */
  selectedCount: number;
};

const MAX_SYNC_IMPORT = 20;
const PER_PRODUCT_SECONDS = 1.1;
const BUFFER_SECONDS = 3;
const TICK_MS = 200;
const PROGRESS_CAP = 95;

export function SubmitOverlay({ selectedCount }: Props) {
  const syncCount = Math.min(selectedCount, MAX_SYNC_IMPORT);
  const expectedSeconds = syncCount * PER_PRODUCT_SECONDS + BUFFER_SECONDS;
  const stubBacklog = Math.max(0, selectedCount - MAX_SYNC_IMPORT);

  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(1, Math.ceil(expectedSeconds)),
  );

  useEffect(() => {
    const start = Date.now();
    const totalMs = expectedSeconds * 1000;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(PROGRESS_CAP, (elapsed / totalMs) * 100);
      setProgress(pct);
      const remaining = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      setSecondsLeft(remaining);
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [expectedSeconds]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            กำลังเตรียมร้านของคุณ...
          </h2>
        </div>

        <p className="mt-3 text-sm text-zinc-600">
          กำลัง import สินค้า {syncCount} ชิ้นจาก CJ Dropshipping
        </p>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900 transition-[width] duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{Math.round(progress)}%</span>
            <span>~{secondsLeft}s เหลือ</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-600">
          <p className="font-medium text-zinc-800">ระบบกำลัง:</p>
          <p className="mt-1">
            ดึงข้อมูลสินค้า, แปลภาษาไทย, แยกหมวดหมู่ — โปรดอย่าปิดหน้านี้
          </p>
        </div>

        {stubBacklog > 0 && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
            อีก {stubBacklog} ชิ้นจะเป็น stub — เติมข้อมูลผ่าน /admin/stores
          </div>
        )}
      </div>
    </div>
  );
}
