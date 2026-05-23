"use client";

/**
 * Bulk-action buttons rendered inside OperatorDataTable's `bulkActions`
 * slot. The data table itself handles the sticky bottom bar layout +
 * "เลือก N รายการ" counter — we only render the per-action
 * buttons + their confirm dialogs.
 *
 * Replaces `bulk-theme-bar.tsx` which used a separate `<details>`
 * collapsible above the table with its own checkboxes (now redundant
 * since the table has built-in selection).
 *
 * Each destructive action is wrapped in `OperatorConfirmAction` so we
 * never fire a bulk PATCH without an explicit second click. The result
 * phase shows summary counts inside the same dialog so the operator
 * doesn't lose context between confirm and result.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Paintbrush,
  CheckCircle2,
  Ban,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OperatorConfirmAction } from "@/components/operator/operator-confirm-action";
import type { StoreRow } from "./_columns";

const THEMES: { value: string; label: string }[] = [
  { value: "", label: "— auto จาก templateId —" },
  { value: "everyday", label: "everyday · consumer retail" },
  { value: "taobao", label: "taobao · marketplace bold" },
  { value: "packaging", label: "packaging · pink/yellow/sky" },
  { value: "community", label: "community · live-commerce" },
  { value: "business-model", label: "business-model · B2B wholesale" },
  { value: "minimal", label: "minimal · legacy (A family)" },
  { value: "cute", label: "cute · legacy (I family)" },
];

interface BulkActionsProps {
  selected: StoreRow[];
}

export function BulkActions({ selected }: BulkActionsProps) {
  const router = useRouter();
  const ids = React.useMemo(() => selected.map((s) => s.id), [selected]);
  const count = selected.length;

  return (
    <>
      <BulkThemeDialog
        ids={ids}
        count={count}
        onSuccess={() => router.refresh()}
      />

      <OperatorConfirmAction
        trigger={
          <Button variant="outline" size="sm">
            <CheckCircle2 className="text-emerald-600" />
            อนุมัติ
          </Button>
        }
        title={`อนุมัติ ${count} ร้าน?`}
        description="ร้านที่ถูกเลือกจะถูกตั้งสถานะ APPROVED และเริ่ม provisioning อัตโนมัติ"
        confirmLabel="อนุมัติทั้งหมด"
        resultCloseLabel="ปิด"
        resultTitle={(r) =>
          r.ok ? `อนุมัติ ${count} ร้านสำเร็จ` : "อนุมัติบางส่วนล้มเหลว"
        }
        onConfirm={async () => {
          const r = await runStatusBulk(ids, "APPROVED");
          router.refresh();
          return {
            ok: r.failed.length === 0,
            result: <BulkResultSummary verb="อนุมัติ" {...r} />,
          };
        }}
      />

      <OperatorConfirmAction
        trigger={
          <Button variant="outline" size="sm">
            <Ban className="text-amber-600" />
            ระงับ
          </Button>
        }
        title={`ระงับ ${count} ร้าน?`}
        description="ร้านที่ถูกเลือกจะถูกตั้งสถานะ SUSPENDED · หน้าร้านจะถูกซ่อนแต่ droplet ยังทำงานอยู่"
        confirmLabel="ระงับทั้งหมด"
        tone="destructive"
        resultCloseLabel="ปิด"
        resultTitle={(r) =>
          r.ok ? `ระงับ ${count} ร้านสำเร็จ` : "ระงับบางส่วนล้มเหลว"
        }
        onConfirm={async () => {
          const r = await runStatusBulk(ids, "SUSPENDED");
          router.refresh();
          return {
            ok: r.failed.length === 0,
            result: <BulkResultSummary verb="ระงับ" {...r} />,
          };
        }}
      />

      <OperatorConfirmAction
        trigger={
          <Button variant="destructive" size="sm">
            <Trash2 />
            ลบ
          </Button>
        }
        title={`ลบ ${count} ร้านถาวร?`}
        description={
          <>
            <span className="block">
              การลบนี้จะถาวร —{" "}
              <strong>
                สินค้า, ออเดอร์, deployment ของร้านเหล่านี้จะถูกลบ
              </strong>
            </span>
            <span className="mt-2 block text-xs">
              ร้าน:{" "}
              {selected
                .slice(0, 5)
                .map((s) => s.name)
                .join(", ")}
              {selected.length > 5 && ` และอีก ${selected.length - 5} ร้าน`}
            </span>
          </>
        }
        confirmLabel="ลบถาวร"
        tone="destructive"
        resultCloseLabel="ปิด"
        resultTitle={(r) =>
          r.ok ? `ลบ ${count} ร้านสำเร็จ` : "ลบบางส่วนล้มเหลว"
        }
        onConfirm={async () => {
          const r = await runBulkDelete(ids);
          router.refresh();
          return {
            ok: r.failed.length === 0,
            result: <BulkResultSummary verb="ลบ" {...r} />,
          };
        }}
      />
    </>
  );
}

/* ── Bulk-theme picker keeps its own dialog because the action needs
 * a select control inside the dialog, which OperatorConfirmAction
 * doesn't accommodate (confirm dialogs render description only).
 */
function BulkThemeDialog({
  ids,
  count,
  onSuccess,
}: {
  ids: string[];
  count: number;
  onSuccess: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);

  function reset() {
    setOpen(false);
    setMsg(null);
  }

  function apply() {
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/stores/bulk-theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids,
            landingThemeVariant: theme === "" ? null : theme,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(
            j.error
              ? typeof j.error === "string"
                ? j.error
                : JSON.stringify(j.error)
              : `HTTP ${res.status}`,
          );
        }
        const data = await res.json();
        setMsg({ kind: "ok", text: `อัปเดต ${data.updated} ร้านแล้ว` });
        onSuccess();
        window.setTimeout(reset, 1200);
      } catch (e) {
        setMsg({
          kind: "err",
          text: e instanceof Error ? e.message : "ผิดพลาด",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Paintbrush />
        เปลี่ยนธีม
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เปลี่ยน theme — {count} ร้าน</DialogTitle>
          <DialogDescription>
            เลือก theme ที่จะใช้กับร้านที่เลือก · เลือก "auto จาก templateId"
            เพื่อย้อนกลับไปใช้ค่าจาก template (ลบ AI-generated landing JSON ของร้านเหล่านั้นด้วย)
          </DialogDescription>
        </DialogHeader>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          disabled={pending}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {msg && (
          <p
            className={
              msg.kind === "ok"
                ? "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                : "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            }
          >
            {msg.text}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              ยกเลิก
            </Button>
          </DialogClose>
          <Button onClick={apply} disabled={pending} aria-busy={pending}>
            {pending ? "กำลังบันทึก..." : `บันทึก (${count})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────── */

interface BulkOutcome {
  success: number;
  failed: { id: string; name: string; reason: string }[];
}

async function runStatusBulk(
  ids: string[],
  status: "APPROVED" | "SUSPENDED",
): Promise<BulkOutcome> {
  let success = 0;
  const failed: BulkOutcome["failed"] = [];
  // Per-store endpoint; bound concurrency so we don't dogpile the API.
  for (let i = 0; i < ids.length; i += 4) {
    const slice = ids.slice(i, i + 4);
    const outcomes = await Promise.all(
      slice.map(async (id) => {
        try {
          const res = await fetch(`/api/admin/stores/${id}/approval`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status,
              note: status === "SUSPENDED" ? "ระงับโดย bulk action" : undefined,
            }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            return {
              ok: false as const,
              id,
              reason: j.detail ?? j.error ?? `HTTP ${res.status}`,
            };
          }
          return { ok: true as const, id };
        } catch (e) {
          return {
            ok: false as const,
            id,
            reason: e instanceof Error ? e.message : "network error",
          };
        }
      }),
    );
    for (const o of outcomes) {
      if (o.ok) success += 1;
      else failed.push({ id: o.id, name: o.id, reason: o.reason });
    }
  }
  return { success, failed };
}

async function runBulkDelete(ids: string[]): Promise<BulkOutcome> {
  let success = 0;
  const failed: BulkOutcome["failed"] = [];
  for (let i = 0; i < ids.length; i += 4) {
    const slice = ids.slice(i, i + 4);
    const outcomes = await Promise.all(
      slice.map(async (id) => {
        try {
          const res = await fetch(`/api/admin/stores/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            return {
              ok: false as const,
              id,
              reason: j.error ?? `HTTP ${res.status}`,
            };
          }
          return { ok: true as const, id };
        } catch (e) {
          return {
            ok: false as const,
            id,
            reason: e instanceof Error ? e.message : "network error",
          };
        }
      }),
    );
    for (const o of outcomes) {
      if (o.ok) success += 1;
      else failed.push({ id: o.id, name: o.id, reason: o.reason });
    }
  }
  return { success, failed };
}

function BulkResultSummary({
  verb,
  success,
  failed,
}: {
  verb: string;
  success: number;
  failed: BulkOutcome["failed"];
}) {
  return (
    <div className="space-y-2 text-sm">
      <p>
        {verb}สำเร็จ <strong>{success}</strong> ร้าน
        {failed.length > 0 && (
          <>
            {" "}· ล้มเหลว <strong>{failed.length}</strong> ร้าน
          </>
        )}
      </p>
      {failed.length > 0 && (
        <details className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
          <summary className="cursor-pointer text-xs font-medium text-destructive">
            รายละเอียดที่ล้มเหลว ({failed.length})
          </summary>
          <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
            {failed.map((f) => (
              <li key={f.id} className="font-mono">
                <code className="text-muted-foreground">{f.id}</code> —{" "}
                {f.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
