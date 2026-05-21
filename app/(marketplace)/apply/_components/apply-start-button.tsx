"use client";

/**
 * Start-KYC CTA used on the /apply landing screen.
 * POSTs to /api/wizard to create a fresh session, then router.refresh()
 * — the parent server component will then see a session in INIT/S1
 * state and render the wizard instead of the landing.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

interface ApplyStartButtonProps {
  agentLinkCode?: string;
}

export function ApplyStartButton({ agentLinkCode }: ApplyStartButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function startSession() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentLinkCode }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`เริ่ม session ไม่ได้ (${res.status}) ${text.slice(0, 120)}`);
      }
      const data = await res.json().catch(() => ({}));
      const sid = data.session_id ?? data.id;
      if (sid) {
        // Keep the ref parameter in the URL when transitioning to the wizard
        const queryParams = new URLSearchParams();
        queryParams.set("sid", sid);
        if (agentLinkCode) {
          queryParams.set("ref", agentLinkCode);
        }
        router.push(`/apply?${queryParams.toString()}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startSession}
        disabled={busy}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-mp-coral px-10 text-base font-semibold text-white shadow-md hover:bg-mp-coral-dark hover:-translate-y-px disabled:opacity-60 disabled:hover:transform-none transition-all"
      >
        {busy ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังเริ่ม...
          </>
        ) : (
          <>
            เริ่มยืนยันตัวตน <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
      {err && (
        <p className="mt-3 text-[13px] text-red-700">{err}</p>
      )}
    </div>
  );
}
