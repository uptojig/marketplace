"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Inline form for pulling a finished schema out of an Anthropic
 * managed-agent session whose generation outlived the request that
 * started it. Operator gets the session id from
 * https://platform.claude.com/workspaces/default/sessions/<sessionId>
 * (the URL of any open session in their workspace).
 */
export function RecoverFromSession({ storeId }: { storeId: string }) {
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
