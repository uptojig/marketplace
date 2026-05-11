"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentWhitelistStatus } from "@prisma/client";

type Props = {
  deploymentId: string;
  currentStatus: PaymentWhitelistStatus;
  publicIp: string | null;
};

export default function WhitelistActions({ deploymentId, currentStatus, publicIp }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function call(action: "confirm" | "reject") {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/provisioner/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "confirm"
            ? { action, deploymentId, note: note || undefined }
            : { action, deploymentId, reason },
        ),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ? JSON.stringify(data.error) : `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (currentStatus === "CONFIRMED") {
    return (
      <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
        ✓ IP {publicIp} ถูก whitelist กับ Payment Provider แล้ว — ร้านพร้อมรับชำระเงิน
      </div>
    );
  }

  if (currentStatus === "REJECTED") {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
        ✗ PG ปฏิเสธการ whitelist — ดู note ด้านซ้าย หรือกด confirm ใหม่หากเปลี่ยนสถานะ
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-md bg-amber-50 p-3 text-amber-900">
        <p className="font-semibold mb-1">📋 ขั้นตอน manual</p>
        <ol className="list-decimal pl-5 space-y-0.5 text-xs">
          <li>ส่ง IP <code className="rounded bg-white px-1">{publicIp ?? "—"}</code> ให้ PG</li>
          <li>รอ PG ยืนยัน (1-2 วันทำการ)</li>
          <li>กดปุ่ม "Confirm" ด้านล่างเมื่อเรียบร้อย</li>
        </ol>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">
          Confirm note (optional)
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น: ticket #12345 / confirmed by John on 11/05/2026"
          className="w-full rounded-md border px-3 py-2 text-xs"
          disabled={busy}
        />
        <button
          onClick={() => call("confirm")}
          disabled={busy}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          ✓ Confirm whitelist
        </button>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:underline">
          PG ปฏิเสธ?
        </summary>
        <div className="mt-2 space-y-2">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="เหตุผลที่ PG ปฏิเสธ"
            className="w-full rounded-md border px-3 py-2 text-xs"
            disabled={busy}
          />
          <button
            onClick={() => call("reject")}
            disabled={busy || reason.trim().length < 2}
            className="w-full rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </details>

      {err && <p className="text-xs text-red-700">{err}</p>}
    </div>
  );
}
