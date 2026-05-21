"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardList } from "lucide-react";
import type { PaymentWhitelistStatus } from "@prisma/client";
import {
  Button,
  Textarea,
  OperatorCallout,
} from "@/components/operator/operator-primitives";

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
      <OperatorCallout tone="success">
        ✓ IP {publicIp} ถูก whitelist กับ Payment Provider แล้ว — ร้านพร้อมรับชำระเงิน
      </OperatorCallout>
    );
  }

  if (currentStatus === "REJECTED") {
    return (
      <OperatorCallout tone="danger">
        ✗ PG ปฏิเสธการ whitelist — ดู note ด้านซ้าย หรือกด confirm ใหม่หากเปลี่ยนสถานะ
      </OperatorCallout>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <OperatorCallout tone="warning" icon={ClipboardList} title="ขั้นตอน manual">
        <ol className="list-decimal space-y-0.5 pl-5 text-xs">
          <li>
            ส่ง IP <code className="rounded bg-card px-1">{publicIp ?? "—"}</code> ให้ PG
          </li>
          <li>รอ PG ยืนยัน (1-2 วันทำการ)</li>
          <li>กดปุ่ม &quot;Confirm&quot; ด้านล่างเมื่อเรียบร้อย</li>
        </ol>
      </OperatorCallout>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">
          Confirm note (optional)
        </label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น: ticket #12345 / confirmed by John on 11/05/2026"
          disabled={busy}
        />
        <Button onClick={() => call("confirm")} disabled={busy} className="w-full">
          <Check />
          Confirm whitelist
        </Button>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:underline">
          PG ปฏิเสธ?
        </summary>
        <div className="mt-2 space-y-2">
          <Textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="เหตุผลที่ PG ปฏิเสธ"
            disabled={busy}
          />
          <Button
            variant="destructive"
            onClick={() => call("reject")}
            disabled={busy || reason.trim().length < 2}
            className="w-full"
          >
            Reject
          </Button>
        </div>
      </details>

      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
