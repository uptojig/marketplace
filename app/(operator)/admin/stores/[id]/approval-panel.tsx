"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import {
  OperatorCard,
  OperatorStatusBadge,
  OperatorCallout,
  Button,
  Textarea,
  type StatusTone,
} from "@/components/operator/operator-primitives";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

const STATUS_INFO: Record<Status, { label: string; tone: StatusTone; icon: LucideIcon }> = {
  PENDING: { label: "รอตรวจ", tone: "warning", icon: Shield },
  APPROVED: { label: "อนุมัติแล้ว", tone: "success", icon: CheckCircle2 },
  REJECTED: { label: "ปฏิเสธ", tone: "danger", icon: XCircle },
  SUSPENDED: { label: "ระงับชั่วคราว", tone: "neutral", icon: AlertTriangle },
};

export function ApprovalPanel({
  storeId,
  storeName,
  initialStatus,
  initialNote,
  approvedAt,
}: {
  storeId: string;
  storeName: string;
  initialStatus: Status;
  initialNote: string | null;
  approvedAt: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [note, setNote] = useState(initialNote ?? "");
  const [pending, setPending] = useState<Status | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function changeStatus(target: Status) {
    setErr(null);
    if ((target === "REJECTED" || target === "SUSPENDED") && !note.trim()) {
      setErr("ระบุเหตุผลก่อนกด — vendor จะเห็นข้อความนี้");
      return;
    }
    setPending(target);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target, note: note.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.detail ?? data?.error ?? "เปลี่ยนสถานะไม่สำเร็จ");
        return;
      }
      setStatus(data.store.approvalStatus);
      startTransition(() => router.refresh());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "network error");
    } finally {
      setPending(null);
    }
  }

  const info = STATUS_INFO[status];
  const Icon = info.icon;

  return (
    <OperatorCard
      title="การอนุมัติร้านค้า"
      actions={
        <OperatorStatusBadge tone={info.tone}>
          <span className="inline-flex items-center gap-1.5">
            <Icon className="size-3.5" />
            {info.label}
          </span>
        </OperatorStatusBadge>
      }
    >
      <p className="text-xs text-muted-foreground">
        ร้านที่ <strong>ไม่ได้</strong> อนุมัติจะไม่แสดงที่{" "}
        <code className="rounded bg-muted px-1">/stores/{storeName}</code> —
        ผู้เยี่ยมชมจะเห็น 404 (เฉพาะ admin คนอื่นเท่านั้นที่ preview ได้)
      </p>

      {approvedAt && status === "APPROVED" && (
        <p className="mt-2 text-xs text-muted-foreground">
          อนุมัติเมื่อ {new Date(approvedAt).toLocaleString("th-TH")}
        </p>
      )}

      <label className="mt-4 block">
        <span className="text-xs font-medium text-foreground">
          เหตุผล / หมายเหตุ (จำเป็นสำหรับ Reject / Suspend)
        </span>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="เช่น สินค้าซ้ำกับแบรนด์ดัง / รูปไม่ครบ / ละเมิดลิขสิทธิ์"
          className="mt-1"
        />
      </label>

      {err && (
        <OperatorCallout tone="danger" className="mt-2">
          {err}
        </OperatorCallout>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {status !== "APPROVED" && (
          <Button
            type="button"
            disabled={pending === "APPROVED"}
            onClick={() => changeStatus("APPROVED")}
          >
            {pending === "APPROVED" ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            อนุมัติ
          </Button>
        )}
        {status !== "REJECTED" && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending === "REJECTED"}
            onClick={() => changeStatus("REJECTED")}
          >
            {pending === "REJECTED" ? <Loader2 className="animate-spin" /> : <XCircle />}
            ปฏิเสธ
          </Button>
        )}
        {status === "APPROVED" && (
          <Button
            type="button"
            variant="outline"
            disabled={pending === "SUSPENDED"}
            onClick={() => changeStatus("SUSPENDED")}
          >
            {pending === "SUSPENDED" ? <Loader2 className="animate-spin" /> : <AlertTriangle />}
            ระงับชั่วคราว
          </Button>
        )}
      </div>
    </OperatorCard>
  );
}
