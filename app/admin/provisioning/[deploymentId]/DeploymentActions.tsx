"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  storeId: string;
  storeSlug: string;
  status: string;
};

export default function DeploymentActions({ storeId, storeSlug, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [showDestroy, setShowDestroy] = useState(false);

  async function resume() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/provisioner/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ? JSON.stringify(d.error) : `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function destroy() {
    if (confirmSlug !== storeSlug) {
      setErr("พิมพ์ slug ให้ตรงเพื่อยืนยัน");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/provisioner/deprovision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, confirmSlug }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ? JSON.stringify(d.error) : `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const canResume = status === "FAILED" || status === "PENDING";

  return (
    <div className="space-y-3 text-sm">
      {canResume && (
        <button
          onClick={resume}
          disabled={busy}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          ↻ Resume / Retry provisioning
        </button>
      )}

      {!showDestroy ? (
        <button
          onClick={() => setShowDestroy(true)}
          className="w-full rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
        >
          🗑 Destroy droplet…
        </button>
      ) : (
        <div className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-xs text-red-900">
            พิมพ์ slug <code className="rounded bg-white px-1">{storeSlug}</code> เพื่อยืนยัน — droplet จะถูกลบและ IP จะถูกปล่อย
          </p>
          <input
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
            placeholder={storeSlug}
            className="w-full rounded-md border px-3 py-1.5 text-xs"
            disabled={busy}
          />
          <div className="flex gap-2">
            <button
              onClick={destroy}
              disabled={busy || confirmSlug !== storeSlug}
              className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              ทำลาย Droplet
            </button>
            <button
              onClick={() => {
                setShowDestroy(false);
                setConfirmSlug("");
              }}
              className="rounded-md border bg-white px-3 py-1.5 text-xs"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {err && <p className="text-xs text-red-700">{err}</p>}
    </div>
  );
}
