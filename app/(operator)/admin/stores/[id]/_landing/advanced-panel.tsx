"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { RecoverFromSession } from "./recover-from-session";

export type AdvancedPanelProps = {
  storeId: string;
  landingTitle: string | null;
  /** True when the polling layer reports generation is in flight —
   *  used to swap the Delete button copy to "Reset stuck generation". */
  isGenerating: boolean;
};

/**
 * Advanced surface (hidden inside a shadcn Accordion by default):
 *   1. Recover-from-session helper (also shown inline on status cards)
 *   2. Paste-JSON fallback for hand-tuned overrides
 *   3. Delete / reset button
 *
 * Operators don't need any of this for the happy path — the AI
 * Generate button above does everything. This drawer exists for
 * power-users iterating on schemas in the Anthropic Console.
 */
export function AdvancedPanel({
  storeId,
  landingTitle,
  isGenerating,
}: AdvancedPanelProps) {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [pasteTitle, setPasteTitle] = useState(landingTitle ?? "");
  const [busy, setBusy] = useState<"save" | "clear" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
      setMsg({ ok: false, text: "ต้องเป็น array หรือ { blocks: [...] }" });
      return;
    }
    setBusy("save");
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/landing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // themeVariant intentionally omitted — paste path doesn't
        // override the family the agent picked.
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
      const res = await fetch(`/api/admin/stores/${storeId}/landing`, {
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
    <Accordion type="single" collapsible className="text-sm">
      <AccordionItem value="advanced" className="border-b-0">
        <AccordionTrigger className="text-sm font-medium text-stone-600 hover:text-stone-900">
          Advanced — paste JSON / recover from session / reset
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Recover from session */}
            <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
              <p className="text-xs font-medium text-stone-700">
                Recover schema จาก Anthropic session
              </p>
              <p className="mt-0.5 text-[11px] text-stone-500">
                ใช้กรณี agent บน Anthropic ทำงานเสร็จแล้วแต่ฟังก์ชันฝั่งเรา timeout ก่อน save —
                หรือต้องการสลับไปใช้ design ที่ iterate ใน Console
              </p>
              <RecoverFromSession storeId={storeId} />
            </div>

            {/* Paste JSON */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-700">
                Paste blocks JSON (hand-tuned overrides)
              </p>
              <p className="text-[11px] text-muted-foreground">
                รับได้ทั้ง <code>[...]</code> ตรง ๆ หรือ{" "}
                <code>{`{ blocks: [...] }`}</code> (output จาก{" "}
                <code>/api/builder/preview</code>)
              </p>
              <input
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="Title (ไม่บังคับ)"
                className="w-full rounded-md border px-3 py-2 text-sm"
                aria-label="Landing title"
              />
              <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                placeholder='{"blocks":[...]}'
                rows={8}
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
                aria-label="Blocks JSON"
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
              {msg && (
                <p
                  className={`rounded-md px-3 py-2 text-xs ${
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
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
