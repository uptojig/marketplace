"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Trash2,
  Sparkles,
  ExternalLink,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { MIN_PRODUCTS_FOR_LANDING } from "@/lib/landing/min-products";
// DESIGN_FAMILIES picker removed from the form on operator request —
// the agent now picks the family automatically from brief content
// (per v3 design-family decision tree). The store row still records
// whatever family the agent settled on so the storefront layout's
// color cascade keeps working.

interface Props {
  storeId: string;
  storeSlug: string;
  hasLandingPage: boolean;
  landingTitle: string | null;
  landingThemeVariant: string | null;
  landingGeneratedAt: string | null;
  blockCount: number;
  /** Number of active (active=true) products in the store. Drives
   *  the marketing-mode Generate gate — the agent's OfferGrids look
   *  empty/repetitive below MIN_PRODUCTS_FOR_LANDING. */
  activeProductCount: number;
}

type StatusSnapshot = {
  status: "generating" | "ready" | "failed" | null;
  error: string | null;
  brief: string | null;
  startedAt: string | null;
  generatedAt: string | null;
  blockCount: number;
  title: string | null;
  themeVariant: string | null;
};

const POLL_INTERVAL_MS = 4000;

export function LandingForm(props: Props) {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<StatusSnapshot | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Engine: "local" = multi-step pipeline (default), "managed" = single-shot
  // via Anthropic Managed Agent (landing-builder agent_011...). The
  // managed path goes through the v3 prompt centrally maintained on
  // Anthropic's side and reads agent_id from ANTHROPIC_AGENT_ID.
  const [engine, setEngine] = useState<"local" | "managed">("local");

  // Paste-fallback (slice-1 path, kept for hand-tuned overrides)
  const [json, setJson] = useState("");
  const [pasteTitle, setPasteTitle] = useState(props.landingTitle ?? "");
  const [busy, setBusy] = useState<"save" | "clear" | null>(null);

  /* ── Status polling ── */
  useEffect(() => {
    let stop = false;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/admin/stores/${props.storeId}/landing`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as StatusSnapshot;
        if (stop) return;
        setStatus(data);
        // Once a generation finishes (status moves out of "generating"),
        // refresh the server component so the parent picks up the new
        // landingBlocks / generatedAt + the page-level "has landing"
        // flag updates.
        if (data.status && data.status !== "generating" && generating) {
          setGenerating(false);
          router.refresh();
        }
      } catch {
        // ignore — keep polling
      }
    }

    void fetchStatus();
    const id = setInterval(() => {
      if (stop) return;
      void fetchStatus();
    }, POLL_INTERVAL_MS);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [props.storeId, generating, router]);

  /* ── Generate (the headline UX) ── */
  async function handleGenerate(mode: "marketing" | "compliance" = "marketing") {
    setMsg(null);
    const briefForCall =
      mode === "compliance" && !brief.trim()
        ? `compliance pages for store: ${props.storeSlug}`
        : brief.trim();
    if (!briefForCall || briefForCall.length < 5) {
      setMsg({ ok: false, text: "ใส่ brief อย่างน้อย 5 ตัวอักษร" });
      return;
    }
    setGenerating(true);
    try {
      const url =
        `/api/admin/stores/${props.storeId}/generate-landing` +
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
        setGenerating(false);
        return;
      }
      setMsg({ ok: true, text: "เป็ดกำลังออกแบบ... รอสักครู่" });

      // Read the NDJSON stream to keep connection alive
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const evt = JSON.parse(trimmed) as { type: string; message?: string };
                if (evt.type === "done") {
                  setMsg({ ok: true, text: "ออกแบบเสร็จแล้ว ✅" });
                } else if (evt.type === "error") {
                  setMsg({ ok: false, text: evt.message ?? "agent_error" });
                }
              } catch { /* skip malformed lines */ }
            }
          }
        } catch { /* stream closed */ }
      }

      setGenerating(false);
      router.refresh();
    } catch (e) {
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : "network_error",
      });
      setGenerating(false);
    }
  }

  /* ── Slice-1 paste fallback (kept) ── */
  async function handlePasteSave() {
    setMsg(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      setMsg({
        ok: false,
        text: `JSON ไม่ถูกต้อง: ${e instanceof Error ? e.message : "parse error"}`,
      });
      return;
    }
    const blocks = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { blocks?: unknown[] })?.blocks)
        ? (parsed as { blocks: unknown[] }).blocks
        : null;
    if (!blocks) {
      setMsg({
        ok: false,
        text: "ต้องเป็น array หรือ { blocks: [...] }",
      });
      return;
    }
    setBusy("save");
    try {
      const res = await fetch(`/api/admin/stores/${props.storeId}/landing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // themeVariant intentionally omitted — paste path doesn't
        // override the family the agent picked; advanced operators
        // who want to swap should regenerate with a different brief
        // or hand-edit the row.
        body: JSON.stringify({
          blocks,
          title: pasteTitle.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof data.error === "object"
            ? Object.values(data.error).flat().join(", ")
            : (data.error ?? `request_failed_${res.status}`);
        setMsg({ ok: false, text: String(detail) });
        return;
      }
      setMsg({ ok: true, text: `บันทึก ${data.blockCount} blocks แล้ว` });
      setJson("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleClear() {
    if (!confirm("ลบ landing page? — กลับเป็น product grid")) return;
    setBusy("clear");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/stores/${props.storeId}/landing`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg({ ok: false, text: data.error ?? "ลบไม่สำเร็จ" });
        return;
      }
      setMsg({ ok: true, text: "ลบ landing page แล้ว" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const isGenerating =
    generating || status?.status === "generating";

  return (
    <div className="rounded-lg border bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-amber-500" />
            🦆 Landing page (เป็ด)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            หน้าเว็บ unique จาก agent — render ที่ <code>/stores/{props.storeSlug}</code>
          </p>
        </div>
        <a
          href={`/stores/${props.storeSlug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          ดูหน้าร้าน <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* ── Status card ─────────────────────── */}
      <StatusCard status={status} fallback={props} />

      {/* ── PRIMARY: Generate ด้วย AI ────────── */}
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
        />
        {/* Marketing-mode product-count gate. Mirrors the server-side
            check in /api/admin/stores/[id]/generate-landing — kept on
            client too so the operator sees the message before they
            click and gets a direct link to the picker. Compliance
            mode (button further down) doesn't reference products and
            isn't gated. */}
        {props.activeProductCount < MIN_PRODUCTS_FOR_LANDING && (
          <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold">
                ต้องมีสินค้าอย่างน้อย {MIN_PRODUCTS_FOR_LANDING} ตัวก่อน Generate
              </p>
              <p className="mt-0.5 text-xs">
                ตอนนี้ร้านมี <strong>{props.activeProductCount}</strong> ตัว
                — agent จะเอาสินค้าจริงไปใส่ OfferGrid + CategoryBanner
                ถ้าน้อยเกินไปจะดูเป็น skeleton หรือซ้ำกัน
              </p>
              <Link
                href={`/admin/stores/${props.storeId}/products/new`}
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
              props.activeProductCount < MIN_PRODUCTS_FOR_LANDING
            }
            title={
              props.activeProductCount < MIN_PRODUCTS_FOR_LANDING
                ? `ต้องมีสินค้า ≥ ${MIN_PRODUCTS_FOR_LANDING} (ตอนนี้ ${props.activeProductCount})`
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
                {props.hasLandingPage ? "Regenerate" : "ออกแบบให้เลย"}
              </>
            )}
          </button>
        </div>
        {/* Step 2 — compliance pages (FAQ / Shipping / Returns / Privacy / Terms).
            Lives in a separate call so the marketing pages stay fast and the
            compliance pages can be regenerated without redoing the whole shop. */}
        {props.hasLandingPage && engine === "managed" && (
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
          >
            {msg.text}
          </p>
        )}
      </div>

      {/* ── Slice-1 paste fallback ───────────── */}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-stone-600 hover:text-stone-900">
          Advanced: วาง blocks JSON เอง (สำหรับ hand-tuned overrides) →
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            รับได้ทั้ง <code>[...]</code> ตรง ๆ หรือ <code>{`{ blocks: [...] }`}</code>{" "}
            (output จาก <code>/api/builder/preview</code>)
          </p>
          <input
            value={pasteTitle}
            onChange={(e) => setPasteTitle(e.target.value)}
            placeholder="Title (ไม่บังคับ)"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='{"blocks":[...]}'
            rows={8}
            className="w-full rounded-md border px-3 py-2 font-mono text-xs"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              title={
                isGenerating
                  ? "Reset stuck generation — clears all landing fields"
                  : "ลบ landing page — clears all landing fields"
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              {busy === "clear"
                ? "กำลังลบ..."
                : isGenerating
                  ? "Reset stuck generation"
                  : "ลบ / Reset landing page"}
            </button>
            <button
              type="button"
              onClick={handlePasteSave}
              disabled={busy !== null || !json.trim() || isGenerating}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {busy === "save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {busy === "save" ? "กำลังบันทึก..." : "บันทึก blocks"}
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}

function StatusCard({
  status,
  fallback,
}: {
  status: StatusSnapshot | null;
  fallback: Props;
}) {
  // Prefer live polling data; fall back to server-rendered props on
  // first paint before the first poll completes.
  const blockCount = status?.blockCount ?? fallback.blockCount;
  const themeVariant = status?.themeVariant ?? fallback.landingThemeVariant;
  const generatedAt = status?.generatedAt ?? fallback.landingGeneratedAt;
  const title = status?.title ?? fallback.landingTitle;
  const s = status?.status;

  if (s === "generating") {
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
              {isStale &&
                ` (${Math.floor(startedMs / 60000)} นาทีก่อน)`}
            </p>
          )}
          {isStale && <RecoverFromSession storeId={fallback.storeId} />}
        </div>
      </div>
    );
  }

  if (s === "failed") {
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
          <RecoverFromSession storeId={fallback.storeId} />
        </div>
      </div>
    );
  }

  if (blockCount > 0) {
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
            Anthropic session (e.g. operator iterated on the design
            in the Console and wants to ship that variant). The same
            <RecoverFromSession /> widget that handles the post-
            timeout recovery path serves double-duty as a "swap to
            a different design" tool. */}
        <RecoverFromSession storeId={fallback.storeId} />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
      <p>ยังไม่มี landing page — ร้านนี้ render product grid ปกติ</p>
      {/* Operator may already have a generated session in Anthropic
          Console they want to use as the initial landing. */}
      <RecoverFromSession storeId={fallback.storeId} />
    </div>
  );
}

/**
 * Inline form for pulling a finished schema out of an Anthropic
 * managed-agent session whose generation outlived the Vercel function
 * that started it. Operator gets the session id from
 * https://platform.claude.com/workspaces/default/sessions/<sessionId>
 * (the URL of any open session in their workspace).
 */
function RecoverFromSession({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleRecover() {
    const id = sessionId.trim();
    if (!id) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/admin/stores/${storeId}/landing/recover`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: id }),
        },
      );
      const data = (await res.json()) as
        | {
            ok: true;
            mode: string;
            designFamily: string | null;
            pageCount: number;
            syncedTitles: number;
            acked: boolean;
          }
        | { ok: false; error: unknown };
      if (!res.ok || !("ok" in data) || !data.ok) {
        const errText =
          "error" in data
            ? typeof data.error === "string"
              ? data.error
              : JSON.stringify(data.error)
            : `HTTP ${res.status}`;
        setMsg({ ok: false, text: `ดึงไม่ได้: ${errText}` });
        return;
      }
      setMsg({
        ok: true,
        text: `กู้สำเร็จ — ${data.pageCount} pages, family ${
          data.designFamily ?? "?"
        }, sync titleTh ${data.syncedTitles} ตัว`,
      });
      // Refresh server data so the StatusCard re-renders with the
      // newly-saved schema instead of staying in the failed/stuck state.
      router.refresh();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "network error",
      });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 rounded-md border border-current/20 bg-white/60 px-2.5 py-1 text-[11px] font-medium hover:bg-white"
      >
        🔄 Recover จาก Anthropic session
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-current/20 bg-white/60 p-2">
      <p className="text-[11px] opacity-80">
        วาง session id (จาก URL หน้า Console:
        <code className="ml-1 rounded bg-black/5 px-1">
          /sessions/sesn_011…
        </code>
        )
      </p>
      <div className="flex gap-1.5">
        <input
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="sesn_011…"
          className="flex-1 rounded-md border bg-white px-2 py-1 text-xs font-mono"
          disabled={busy}
        />
        <button
          type="button"
          onClick={handleRecover}
          disabled={busy || !sessionId.trim()}
          className="rounded-md bg-stone-900 px-3 py-1 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {busy ? "กำลังดึง…" : "ดึง"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMsg(null);
          }}
          disabled={busy}
          className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-stone-50"
        >
          ยกเลิก
        </button>
      </div>
      {msg && (
        <p
          className={`text-[11px] ${
            msg.ok ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
