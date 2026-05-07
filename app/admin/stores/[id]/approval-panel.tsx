"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

const STATUS_INFO: Record<
  Status,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PENDING: { label: "รอตรวจ", color: "amber", icon: Shield },
  APPROVED: { label: "อนุมัติแล้ว", color: "green", icon: CheckCircle2 },
  REJECTED: { label: "ปฏิเสธ", color: "red", icon: XCircle },
  SUSPENDED: { label: "ระงับชั่วคราว", color: "gray", icon: AlertTriangle },
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

  const colorMap: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    green: "border-green-200 bg-green-50 text-green-900",
    red: "border-red-200 bg-red-50 text-red-900",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
  };

  return (
    <section className="rounded-lg border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">การอนุมัติร้านค้า</h2>
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colorMap[info.color]}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {info.label}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        ร้านที่ <strong>ไม่ได้</strong> อนุมัติจะไม่แสดงที่{" "}
        <code className="rounded bg-gray-100 px-1">/stores/{storeName}</code> —
        ผู้เยี่ยมชมจะเห็น 404 (เฉพาะ admin คนอื่นเท่านั้นที่ preview ได้)
      </p>

      {approvedAt && status === "APPROVED" && (
        <p className="mt-2 text-xs text-muted-foreground">
          อนุมัติเมื่อ {new Date(approvedAt).toLocaleString("th-TH")}
        </p>
      )}

      <label className="mt-4 block">
        <span className="text-xs font-medium text-stone-700">
          เหตุผล / หมายเหตุ (จำเป็นสำหรับ Reject / Suspend)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="เช่น สินค้าซ้ำกับแบรนด์ดัง / รูปไม่ครบ / ละเมิดลิขสิทธิ์"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
      </label>

      {err && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {err}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {status !== "APPROVED" && (
          <button
            type="button"
            disabled={pending === "APPROVED"}
            onClick={() => changeStatus("APPROVED")}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {pending === "APPROVED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            อนุมัติ
          </button>
        )}
        {status !== "REJECTED" && status !== "PENDING" && (
          <button
            type="button"
            disabled={pending === "REJECTED"}
            onClick={() => changeStatus("REJECTED")}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {pending === "REJECTED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            ปฏิเสธ
          </button>
        )}
        {status === "PENDING" && (
          <button
            type="button"
            disabled={pending === "REJECTED"}
            onClick={() => changeStatus("REJECTED")}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {pending === "REJECTED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            ปฏิเสธ
          </button>
        )}
        {status === "APPROVED" && (
          <button
            type="button"
            disabled={pending === "SUSPENDED"}
            onClick={() => changeStatus("SUSPENDED")}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {pending === "SUSPENDED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            ระงับชั่วคราว
          </button>
        )}
      </div>
    </section>
  );
}
