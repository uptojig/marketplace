"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Trash2,
  Sparkles,
  ExternalLink,
  Wand2,
  AlertCircle,
} from "lucide-react";

interface Props {
  storeId: string;
  storeSlug: string;
  hasLandingPage: boolean;
  landingTitle: string | null;
  landingThemeVariant: string | null;
  landingGeneratedAt: string | null;
  blockCount: number;
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
  const [theme, setTheme] = useState<"minimal" | "cute">(
    props.landingThemeVariant === "cute" ? "cute" : "minimal",
  );
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<StatusSnapshot | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
  async function handleGenerate() {
    setMsg(null);
    if (!brief.trim() || brief.trim().length < 5) {
      setMsg({ ok: false, text: "ใส่ brief อย่างน้อย 5 ตัวอักษร" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/admin/stores/${props.storeId}/generate-landing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: brief.trim(), themeHint: theme }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({
          ok: false,
          text:
            data.detail ??
            data.error ??
            `request_failed_${res.status}`,
        });
        setGenerating(false);
        return;
      }
      setMsg({
        ok: true,
        text: "เริ่มออกแบบหน้าเว็บแล้ว เป็ดกำลังคิด — จะอัปเดตเองเมื่อเสร็จ",
      });
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
        body: JSON.stringify({
          blocks,
          title: pasteTitle.trim() || undefined,
          themeVariant: theme,
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
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs">
            <span className="mr-2 text-stone-700">Theme hint:</span>
            <select
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as "minimal" | "cute")
              }
              disabled={isGenerating}
              className="rounded border px-2 py-1 text-sm"
            >
              <option value="minimal">minimal</option>
              <option value="cute">cute</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !brief.trim()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-amber-600 disabled:opacity-50"
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
            {props.hasLandingPage && (
              <button
                type="button"
                onClick={handleClear}
                disabled={busy !== null || isGenerating}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {busy === "clear" ? "กำลังลบ..." : "ลบ landing page"}
              </button>
            )}
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
    return (
      <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-600" />
        <div className="flex-1">
          <p className="font-semibold">เป็ดกำลังออกแบบหน้าเว็บ...</p>
          <p className="mt-0.5 text-xs">
            ใช้เวลา 30 วินาที – 3 นาที (ขึ้นกับจำนวนสินค้า) — รอสักครู่
            แล้วระบบจะอัปเดตให้เอง
          </p>
          {status?.startedAt && (
            <p className="text-[11px] text-amber-700/80">
              เริ่มเมื่อ {new Date(status.startedAt).toLocaleTimeString("th-TH")}
            </p>
          )}
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
            กด &ldquo;Regenerate&rdquo; เพื่อลองใหม่
          </p>
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
      </div>
    );
  }

  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
      ยังไม่มี landing page — ร้านนี้ render product grid ปกติ
    </div>
  );
}
