"use client";

/**
 * <TranslateTitlesButton /> — owner-facing manual trigger for the
 * Thai title backfill on /dashboard/store/products.
 *
 * Newly-imported products auto-translate via waitUntil hooks in
 * /api/products/import + /api/store/products. This button covers
 * the legacy case: stores that imported products before the hook
 * existed and now have rows with `titleTh = null` showing English
 * on category / PDP / search / related grids.
 *
 * UX: counter prop tells the operator how many rows actually need
 * translation. When zero, the button is dimmed but clickable (still
 * useful with `force` to re-translate after a prompt change).
 *
 * Single-click pattern: click → loading state → toast result.
 * Errors surface inline so the operator can re-run.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  /** Count of products with `titleTh = null` — drives the label. */
  untranslatedCount: number;
}

export function TranslateTitlesButton({ untranslatedCount }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleClick() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/store/products/translate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as
        | {
            ok: true;
            scanned: number;
            translated: number;
            failed: number;
            skipped: number;
          }
        | { ok: false; error: string };
      if (!res.ok || !data.ok) {
        const err = "error" in data ? data.error : `HTTP ${res.status}`;
        setMsg({ ok: false, text: `แปลไม่สำเร็จ: ${err}` });
        return;
      }
      const { translated, failed, skipped } = data;
      setMsg({
        ok: true,
        text:
          translated === 0 && skipped === 0
            ? "ไม่มีสินค้าที่ต้องแปล"
            : `แปลแล้ว ${translated} ตัว` +
              (skipped > 0 ? ` · ข้าม ${skipped}` : "") +
              (failed > 0 ? ` · ล้มเหลว ${failed}` : ""),
      });
      // Refresh the table so the rows show the new titleTh values.
      startTransition(() => router.refresh());
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "network error",
      });
    } finally {
      setBusy(false);
    }
  }

  const isWorking = busy || pending;
  const labelCount =
    untranslatedCount > 0 ? ` (${untranslatedCount})` : "";

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isWorking}
        title={
          untranslatedCount > 0
            ? `${untranslatedCount} สินค้ายังไม่มีชื่อภาษาไทย — กดเพื่อแปลด้วย AI`
            : "ทุกสินค้ามีชื่อภาษาไทยแล้ว — กดเพื่อแปลใหม่ด้วย force"
        }
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent disabled:opacity-50"
      >
        {isWorking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        แปลชื่อ TH{labelCount}
      </button>
      {msg && (
        <span
          className={`text-[11px] ${
            msg.ok ? "text-green-600" : "text-destructive"
          }`}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}
