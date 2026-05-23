"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Wand2, AlertCircle } from "lucide-react";

import { MIN_PRODUCTS_FOR_LANDING } from "@/lib/landing/min-products";
import { type StreamEvent } from "@/hooks/use-landing-status";

export type GenerateCardProps = {
  storeId: string;
  storeSlug: string;
  hasLandingPage: boolean;
  activeProductCount: number;
  /** True when the polling layer reports the server is mid-generation;
   *  used to disable inputs while a run is in flight. */
  isGenerating: boolean;
  /** Toggle local "generating" state in the parent so the polling
   *  hook knows a request just started. */
  onGeneratingChange: (g: boolean) => void;
  /** Consume the NDJSON stream from generate-landing — supplied by
   *  the parent's `useLandingStatus` instance. */
  consumeStream: (
    body: ReadableStream<Uint8Array>,
    onEvent: (evt: StreamEvent) => void,
  ) => Promise<void>;
};

/**
 * Primary "Generate with AI" surface — the headline UX. Owns the
 * brief textarea, the marketing/compliance mode buttons, the
 * managed-agent toggle, and the result message banner. Polling is
 * lifted to the orchestrator so the status snapshot can also drive
 * sibling components like StatusCard.
 */
export function GenerateCard({
  storeId,
  storeSlug,
  hasLandingPage,
  activeProductCount,
  isGenerating,
  onGeneratingChange,
  consumeStream,
}: GenerateCardProps) {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Engine: "local" = multi-step pipeline (default), "managed" =
  // single-shot via Anthropic Managed Agent.
  const [engine, setEngine] = useState<"local" | "managed">("local");

  async function handleGenerate(mode: "marketing" | "compliance" = "marketing") {
    setMsg(null);
    const briefForCall =
      mode === "compliance" && !brief.trim()
        ? `compliance pages for store: ${storeSlug}`
        : brief.trim();
    if (!briefForCall || briefForCall.length < 5) {
      setMsg({ ok: false, text: "ใส่ brief อย่างน้อย 5 ตัวอักษร" });
      return;
    }
    onGeneratingChange(true);
    try {
      const url =
        `/api/admin/stores/${storeId}/generate-landing` +
        (engine === "managed" ? "?engine=managed" : "");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: briefForCall, mode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg({
          ok: false,
          text: data.detail ?? data.error ?? `request_failed_${res.status}`,
        });
        onGeneratingChange(false);
        return;
      }
      setMsg({ ok: true, text: "เป็ดกำลังออกแบบ... รอสักครู่" });

      if (res.body) {
        await consumeStream(res.body, (evt) => {
          if (evt.type === "done") {
            setMsg({ ok: true, text: "ออกแบบเสร็จแล้ว ✅" });
          } else if (evt.type === "error") {
            setMsg({ ok: false, text: evt.message ?? "agent_error" });
          }
        });
      }

      onGeneratingChange(false);
      router.refresh();
    } catch (e) {
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : "network_error",
      });
      onGeneratingChange(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-amber-600" />
          <h3 className="font-semibold text-stone-900">Generate ด้วย AI</h3>
        </div>
        <p className="text-xs text-stone-600">
          บอกเป็ดว่าต้องการเว็บแบบไหน — เป็ดจะออกแบบหน้าเว็บ unique
          จากสินค้าที่ admin เลือกไว้แล้วให้อัตโนมัติ
        </p>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={3}
          maxLength={4000}
          disabled={isGenerating}
          placeholder='เช่น: "เว็บขายเก้าอี้ทำงาน เน้นคนปวดหลัง โทนมินิมอล" หรือ "ขายรองเท้า เด็ก 50 ชิ้น สวยๆตามใจเป็ด"'
          className="w-full rounded-md border px-3 py-2 text-sm disabled:bg-stone-50"
          aria-label="Brief for AI landing generation"
        />

        {activeProductCount < MIN_PRODUCTS_FOR_LANDING && (
          <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold">
                ต้องมีสินค้าอย่างน้อย {MIN_PRODUCTS_FOR_LANDING} ตัวก่อน Generate
              </p>
              <p className="mt-0.5 text-xs">
                ตอนนี้ร้านมี <strong>{activeProductCount}</strong> ตัว
                — agent จะเอาสินค้าจริงไปใส่ OfferGrid + CategoryBanner
                ถ้าน้อยเกินไปจะดูเป็น skeleton หรือซ้ำกัน
              </p>
              <Link
                href={`/admin/stores/${storeId}/products/new`}
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-400 bg-white px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
              >
                + เพิ่มสินค้า
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-stone-600">
            🎨 Design family — เป็ดเลือกให้อัตโนมัติจาก brief
          </p>
          <label className="flex items-center gap-1.5 text-xs text-stone-700">
            <input
              type="checkbox"
              checked={engine === "managed"}
              onChange={(e) => setEngine(e.target.checked ? "managed" : "local")}
              disabled={isGenerating}
              className="h-3.5 w-3.5 rounded border-stone-300"
            />
            <span title="ใช้ Anthropic Managed Agent (v3 landing-builder) — single-shot, prompt updated centrally">
              🤖 ใช้ Managed Agent
            </span>
          </label>
          <button
            type="button"
            onClick={() => handleGenerate("marketing")}
            disabled={
              isGenerating ||
              !brief.trim() ||
              activeProductCount < MIN_PRODUCTS_FOR_LANDING
            }
            title={
              activeProductCount < MIN_PRODUCTS_FOR_LANDING
                ? `ต้องมีสินค้า ≥ ${MIN_PRODUCTS_FOR_LANDING} (ตอนนี้ ${activeProductCount})`
                : undefined
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                เป็ดกำลังคิด...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                {hasLandingPage ? "Regenerate" : "ออกแบบให้เลย"}
              </>
            )}
          </button>
        </div>

        {/* Step 2 — compliance pages. Separate call so marketing pages
            stay fast and compliance can be regenerated independently. */}
        {hasLandingPage && engine === "managed" && (
          <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-3">
            <p className="text-xs text-stone-600">
              📋 ขั้นที่ 2 — สร้างหน้าระบบ (FAQ / นโยบายส่ง / คืนสินค้า / Privacy / Terms)
            </p>
            <button
              type="button"
              onClick={() => handleGenerate("compliance")}
              disabled={isGenerating}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border-2 border-amber-500 bg-white px-4 py-1.5 text-sm font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  สร้างหน้าเงื่อนไข
                </>
              )}
            </button>
          </div>
        )}

        {msg && (
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              msg.ok
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
            role={msg.ok ? "status" : "alert"}
          >
            {msg.text}
          </p>
        )}
    </div>
  );
}
