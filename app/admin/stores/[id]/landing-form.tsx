"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Sparkles, ExternalLink } from "lucide-react";

interface Props {
  storeId: string;
  storeSlug: string;
  hasLandingPage: boolean;
  landingTitle: string | null;
  landingThemeVariant: string | null;
  landingGeneratedAt: string | null;
  blockCount: number;
}

/**
 * Landing-page admin form. Slice 1 — accepts raw blocks JSON via
 * paste. Slice 2 will replace this with a "🦆 Generate with AI"
 * prompt + theme picker that calls /api/admin/stores/<id>/generate.
 *
 * The paste UI is still useful long-term for hand-tuned overrides,
 * preview testing, and recovery if the agent flow breaks.
 */
export function LandingForm(props: Props) {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [title, setTitle] = useState(props.landingTitle ?? "");
  const [theme, setTheme] = useState<"minimal" | "cute">(
    props.landingThemeVariant === "cute" ? "cute" : "minimal",
  );
  const [busy, setBusy] = useState<"save" | "clear" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSave() {
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
    // Tolerant input: accept either a bare array OR a wrapper
    // { blocks: [...] } from /api/builder/preview output.
    const blocks = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { blocks?: unknown[] })?.blocks)
        ? (parsed as { blocks: unknown[] }).blocks
        : null;
    if (!blocks) {
      setMsg({
        ok: false,
        text: "ต้องเป็น array ของ blocks หรือ object { blocks: [...] }",
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
          title: title.trim() || undefined,
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
      setMsg({
        ok: true,
        text: `บันทึก ${data.blockCount} blocks แล้ว — ดูที่ /stores/${data.slug}`,
      });
      setJson("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleClear() {
    if (!confirm("ลบ landing page ของร้านนี้? — กลับเป็น product grid")) return;
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

      {props.hasLandingPage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <p>
            ✅ มี landing page อยู่ — <strong>{props.blockCount} blocks</strong>,
            theme <code>{props.landingThemeVariant}</code>
          </p>
          {props.landingTitle && (
            <p className="mt-0.5 text-xs">title: {props.landingTitle}</p>
          )}
          {props.landingGeneratedAt && (
            <p className="text-xs text-emerald-700/80">
              สร้างเมื่อ:{" "}
              {new Date(props.landingGeneratedAt).toLocaleString("th-TH")}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
          ยังไม่มี landing page — ร้านนี้ render product grid ปกติ
        </div>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-stone-700 hover:text-stone-900">
          วาง blocks JSON เพื่อทดสอบ render →
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            รับได้ทั้ง <code>[...]</code> ตรง ๆ หรือ <code>{`{ blocks: [...] }`}</code>{" "}
            (output จาก <code>/api/builder/preview</code> ของ PromptPage). Slice 2
            จะเปลี่ยนเป็นปุ่ม &ldquo;Generate ด้วย AI&rdquo; ที่เรียก agent โดยตรง
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">
                Title (ไม่บังคับ)
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น: ขายเก้าอี้ทำงาน 6 ตัว"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Theme</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "cute" | "minimal")}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="minimal">minimal</option>
                <option value="cute">cute</option>
              </select>
            </label>
          </div>

          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='{"blocks":[{"blockType":"Nav","content":{"brand":"..."}}, ...]}'
            rows={10}
            className="w-full rounded-md border px-3 py-2 font-mono text-xs"
          />

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

          <div className="flex items-center justify-between">
            {props.hasLandingPage && (
              <button
                type="button"
                onClick={handleClear}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {busy === "clear" ? "กำลังลบ..." : "ลบ landing page"}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={busy !== null || !json.trim()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {busy === "save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {busy === "save" ? "กำลังบันทึก..." : "บันทึก blocks"}
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
