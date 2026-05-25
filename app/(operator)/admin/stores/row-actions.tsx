"use client";

/**
 * Per-row dropdown menu for /admin/stores.
 *
 * All 9 actions live behind a single kebab trigger so the row stays
 * compact:
 *
 *   - เปิดหน้าร้าน · Link target=_blank
 *   - แก้ไขข้อมูลร้าน · Link
 *   - จัดการสินค้า · Link
 *   - อนุมัติด่วน · inline PATCH (no extra confirm)
 *   - แปลไทย + จัด Category (AI) · OperatorConfirmAction → server action
 *   - เติมรูปจาก CJ payload · OperatorConfirmAction → server action
 *   - Refetch CJ payload · OperatorConfirmAction → server action
 *   - ลบร้าน... · OperatorConfirmAction (destructive)
 *   - เปลี่ยนเจ้าของ · Link to dedicated form
 *
 * Each "heavy" action delegates to OperatorConfirmAction, which owns
 * the confirm → submitting → result/error phases. That trims ~530
 * lines of bespoke dialog plumbing that used to live here.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Package,
  CheckCircle2,
  Sparkles,
  Images,
  CloudDownload,
  Trash2,
  Loader2,
  UserCog,
} from "lucide-react";
import type { StoreApprovalStatus } from "@prisma/client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OperatorConfirmAction } from "@/components/operator/operator-confirm-action";

import {
  enrichStoreProducts,
  type EnrichResult,
} from "@/lib/admin/enrich-products";
import {
  backfillCJImagesForStore,
  type BackfillResult,
} from "@/lib/admin/backfill-cj-images";
import {
  refetchCJMissingPayloadForStore,
  type RefetchResult,
} from "@/lib/admin/refetch-cj-missing-payload";

interface Props {
  storeId: string;
  storeSlug: string;
  storeName: string;
  approvalStatus: StoreApprovalStatus;
}

export function StoreRowActions({
  storeId,
  storeSlug,
  storeName,
  approvalStatus,
}: Props) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [topErr, setTopErr] = useState<string | null>(null);

  // ── Controlled-open state for each ConfirmAction dialog ──────────
  // We use controlled open so the trigger can live inside a
  // DropdownMenuItem (Radix unmounts DropdownMenuContent on close —
  // an UNCONTROLLED ConfirmAction inside it would never receive the
  // open event because its trigger is gone by then).
  const [enrichOpen, setEnrichOpen] = useState(false);
  const [backfillOpen, setBackfillOpen] = useState(false);
  const [refetchOpen, setRefetchOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function quickApprove() {
    setTopErr(null);
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTopErr(data?.detail ?? data?.error ?? "อนุมัติไม่สำเร็จ");
        return;
      }
      router.refresh();
    } catch (e) {
      setTopErr(e instanceof Error ? e.message : "network error");
    } finally {
      setApproving(false);
    }
  }

  return (
    <>
      {topErr && (
        <p className="absolute right-0 -mt-6 max-w-[260px] truncate rounded bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive shadow">
          {topErr}
        </p>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Plain <button> instead of the styled Button — the project's
              Button component isn't wrapped in forwardRef, so Radix
              Slot can't attach the trigger ref and a handful of
              pointer events drop on the floor. Native <button>
              sidesteps that entirely. */}
          <button
            type="button"
            aria-label={`เมนูการจัดการร้าน ${storeName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            disabled={approving}
          >
            {approving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">
            {storeName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={`/stores/${storeSlug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              เปิดหน้าร้าน
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/stores/${storeId}`}>
              <Pencil className="h-4 w-4" />
              แก้ไขข้อมูลร้าน
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/stores/${storeId}/products`}>
              <Package className="h-4 w-4" />
              จัดการสินค้า
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/stores/${storeId}?focus=owner`}>
              <UserCog className="h-4 w-4" />
              เปลี่ยนเจ้าของ
            </Link>
          </DropdownMenuItem>

          {approvalStatus !== "APPROVED" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={quickApprove} disabled={approving}>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                อนุมัติด่วน
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] tracking-wide uppercase">
            เติมข้อมูลสินค้า
          </DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(e) => {
              // Keep the menu from autoclose-stealing focus before we
              // open the dialog (Radix runs onSelect inside the
              // DropdownMenu's auto-close handler).
              e.preventDefault();
              setEnrichOpen(true);
            }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            แปลไทย + จัด Category (AI)
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setBackfillOpen(true);
            }}
          >
            <Images className="h-4 w-4 text-muted-foreground" />
            เติมรูปจาก CJ payload
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setRefetchOpen(true);
            }}
          >
            <CloudDownload className="h-4 w-4 text-muted-foreground" />
            Refetch CJ payload
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            ลบร้าน...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Enrich (AI translate + categorize) ─────────────────────── */}
      <OperatorConfirmAction
        // Hidden trigger — the dropdown item drives `open` directly.
        trigger={<span className="sr-only" aria-hidden="true" />}
        open={enrichOpen}
        onOpenChange={setEnrichOpen}
        title={`เติมข้อมูลสินค้า — ${storeName}`}
        description={
          <>
            ระบบจะเรียก Claude (Haiku 4.5) เพื่อ:
            <br />
            <span className="mt-2 block text-foreground">
              1) แปลชื่อ + รายละเอียดสินค้าเป็นภาษาไทย
              <br />
              2) จัด Category อัตโนมัติ (ใช้ของเดิมหรือสร้างใหม่)
              <br />
              3) แจ้งสินค้าที่มีรูปน้อยกว่า 2 รูป (ไม่ดึงรูปอัตโนมัติ)
            </span>
            <br />
            ใช้เวลาประมาณ 1-2 นาทีต่อ 50 สินค้า · ทำงานเฉพาะรายการที่ยังไม่มีข้อมูล (idempotent)
          </>
        }
        confirmLabel="เริ่ม"
        resultCloseLabel="ปิด"
        resultTitle={() => `ผลการเติมข้อมูล — ${storeName}`}
        onConfirm={async () => {
          const res = await enrichStoreProducts(storeId);
          router.refresh();
          if (res.error) {
            return { ok: false, message: enrichErrorLabel(res.error) };
          }
          return { ok: true, result: <EnrichResultPanel data={res} /> };
        }}
      />

      {/* ── Backfill CJ images ─────────────────────────────────────── */}
      <OperatorConfirmAction
        trigger={<span className="sr-only" aria-hidden="true" />}
        open={backfillOpen}
        onOpenChange={setBackfillOpen}
        title={`เติมรูปภาพจาก CJ — ${storeName}`}
        description={
          <>
            ดึงรูปภาพทั้งหมดที่เก็บไว้ใน externalPayload (ไม่เรียก CJ API):
            <br />
            <span className="mt-2 block text-foreground">
              1) อ่าน productImage + productImageSet + productImageList
              <br />
              2) บันทึกลง galleryUrls (กรองรูปปกออก — ไม่ซ้ำ)
              <br />
              3) เติม imageUrl เฉพาะเมื่อยังว่าง (ไม่ทับรูปที่เจ้าของอัปไว้)
            </span>
            <br />
            เร็วมาก — ไม่ต้องรอ CJ API ทำงานหลักร้อยสินค้าได้ในไม่กี่วินาที
          </>
        }
        confirmLabel="เริ่ม"
        resultCloseLabel="ปิด"
        resultTitle={() => `ผลการเติมรูปภาพ — ${storeName}`}
        onConfirm={async () => {
          const res = await backfillCJImagesForStore(storeId);
          router.refresh();
          if (res.error) {
            return { ok: false, message: backfillErrorLabel(res.error) };
          }
          return { ok: true, result: <BackfillResultPanel data={res} /> };
        }}
      />

      {/* ── Refetch CJ missing payload ─────────────────────────────── */}
      <OperatorConfirmAction
        trigger={<span className="sr-only" aria-hidden="true" />}
        open={refetchOpen}
        onOpenChange={setRefetchOpen}
        title={`Refetch CJ payload — ${storeName}`}
        description={
          <>
            ดึงข้อมูลจาก CJ ใหม่สำหรับสินค้าที่ <code>externalPayload</code>{" "}
            เป็น null (legacy import):
            <br />
            <span className="mt-2 block text-foreground">
              1) เรียก CJ <code>/product/query</code> + variant query ทุกรายการ
              <br />
              2) บันทึก externalPayload + galleryUrls + rich fields
              <br />
              3) เว้น 1.1 วินาทีระหว่างสินค้า (CJ rate limit)
            </span>
            <br />
            <strong>ช้ากว่าปุ่ม Backfill</strong> — ~2 นาทีต่อ 100 สินค้า เพราะต้องเรียก CJ API จริง
          </>
        }
        confirmLabel="เริ่ม"
        resultCloseLabel="ปิด"
        resultTitle={() => `ผลการ Refetch CJ — ${storeName}`}
        onConfirm={async () => {
          const res = await refetchCJMissingPayloadForStore(storeId);
          router.refresh();
          if (res.error) {
            return { ok: false, message: refetchErrorLabel(res.error) };
          }
          return { ok: true, result: <RefetchResultPanel data={res} /> };
        }}
      />

      {/* ── Delete (destructive) ───────────────────────────────────── */}
      <OperatorConfirmAction
        trigger={<span className="sr-only" aria-hidden="true" />}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`ลบร้าน — ${storeName}`}
        description={
          <>
            <span className="block">
              การลบนี้จะถาวร —{" "}
              <strong>
                สินค้า, คำสั่งซื้อ, และ deployment ทั้งหมดของร้านนี้จะถูกลบ
              </strong>
            </span>
            <span className="mt-2 block">
              Droplet + DNS records ใน Provisioning จะถูก teardown ก่อน จากนั้น
              Store row จะถูกลบ (cascading)
            </span>
            <code className="mt-2 block break-all rounded bg-muted px-2 py-1 text-xs">
              /stores/{storeSlug}
            </code>
          </>
        }
        confirmLabel="ลบถาวร"
        tone="destructive"
        onConfirm={async () => {
          const res = await fetch(`/api/admin/stores/${storeId}`, {
            method: "DELETE",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data?.error ?? "ลบไม่สำเร็จ");
          }
          router.refresh();
          // Returning nothing → ConfirmAction closes the dialog.
        }}
      />
    </>
  );
}

/* ── Result panels (still local — they're rendered via the
 * ConfirmAction `result` slot) ───────────────────────────────────── */

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warn" | "muted";
}) {
  const cls =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700"
        : "bg-muted text-muted-foreground";
  return (
    <div className={`rounded-md ${cls} p-3`}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

function EnrichResultPanel({ data }: { data: EnrichResult }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-muted-foreground">
        สแกน {data.scanned} สินค้า
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="แปลไทยแล้ว" value={data.translated} tone="success" />
        <Stat label="จัด Category แล้ว" value={data.categorized} tone="success" />
        <Stat
          label="รูปน้อยกว่า 2"
          value={data.flaggedLowImage.length}
          tone="warn"
        />
      </div>
      {data.skipped.length > 0 && (
        <details className="rounded-md border bg-muted p-3">
          <summary className="cursor-pointer text-xs font-medium">
            ข้ามไป {data.skipped.length} รายการ
          </summary>
          <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
            {data.skipped.map((s) => (
              <li key={s.productId} className="font-mono">
                <code className="text-muted-foreground">{s.productId}</code> —{" "}
                {s.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
      {data.flaggedLowImage.length > 0 && (
        <details className="rounded-md border bg-amber-50 p-3" open>
          <summary className="cursor-pointer text-xs font-medium">
            สินค้าที่ต้องเพิ่มรูป ({data.flaggedLowImage.length} รายการ)
          </summary>
          <ul className="mt-2 max-h-64 space-y-1 overflow-auto text-xs">
            {data.flaggedLowImage.map((f) => (
              <li
                key={f.productId}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate" title={f.title}>
                  {f.title}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {f.imageCount} รูป
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function BackfillResultPanel({ data }: { data: BackfillResult }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-muted-foreground">
        สแกน {data.scanned} สินค้า
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="อัปเดตแล้ว" value={data.updated} tone="success" />
        <Stat label="ข้าม" value={data.skipped.length} tone="muted" />
      </div>
      {data.skipped.length > 0 && (
        <details className="rounded-md border bg-muted p-3">
          <summary className="cursor-pointer text-xs font-medium">
            รายละเอียดสินค้าที่ข้าม ({data.skipped.length})
          </summary>
          <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
            {data.skipped.map((s) => (
              <li key={s.productId} className="font-mono">
                <code className="text-muted-foreground">{s.productId}</code> —{" "}
                {backfillReasonLabel(s.reason)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function RefetchResultPanel({ data }: { data: RefetchResult }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-xs text-muted-foreground">
        สแกน {data.scanned} สินค้า (เฉพาะที่ externalPayload เป็น null)
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="ดึงสำเร็จ" value={data.refetched} tone="success" />
        <Stat label="ข้าม" value={data.skipped.length} tone="muted" />
      </div>
      {data.skipped.length > 0 && (
        <details className="rounded-md border bg-muted p-3">
          <summary className="cursor-pointer text-xs font-medium">
            รายละเอียดสินค้าที่ข้าม ({data.skipped.length})
          </summary>
          <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
            {data.skipped.map((s) => (
              <li key={s.productId} className="font-mono">
                <code className="text-muted-foreground">{s.productId}</code> —{" "}
                {s.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
      {data.refetched > 0 && (
        <p className="text-xs text-muted-foreground">
          ขั้นถัดไป: คลิก &ldquo;เติมรูปจาก CJ payload&rdquo; เพื่อเขียน
          galleryUrls จาก payload ใหม่
        </p>
      )}
    </div>
  );
}

/* ── Error labels (kept verbatim from the old file) ──────────────── */

function enrichErrorLabel(code: NonNullable<EnrichResult["error"]>): string {
  switch (code) {
    case "agent_not_configured":
      return "ANTHROPIC_API_KEY ยังไม่ได้ตั้งค่า — ไม่สามารถเรียก Claude API ได้";
    case "forbidden":
      return "ไม่มีสิทธิ์ — ต้องเป็น Admin เท่านั้น";
    case "store_not_found":
      return "ไม่พบร้านค้า";
  }
}

function backfillErrorLabel(
  code: NonNullable<BackfillResult["error"]>,
): string {
  switch (code) {
    case "unauthenticated":
      return "กรุณาเข้าสู่ระบบใหม่";
    case "forbidden":
      return "ไม่มีสิทธิ์ — ต้องเป็น Admin หรือเจ้าของร้านเท่านั้น";
    case "store_not_found":
      return "ไม่พบร้านค้า";
  }
}

function backfillReasonLabel(reason: string): string {
  switch (reason) {
    case "no_external_payload":
      return "ไม่มี externalPayload (ลอง refetch ก่อน)";
    case "no_images_in_payload":
      return "ไม่มีรูปภาพใน payload";
    case "already_up_to_date":
      return "รูปอัปเดตแล้ว";
    default:
      return reason;
  }
}

function refetchErrorLabel(code: NonNullable<RefetchResult["error"]>): string {
  switch (code) {
    case "unauthenticated":
      return "กรุณาเข้าสู่ระบบใหม่";
    case "forbidden":
      return "ไม่มีสิทธิ์ — ต้องเป็น Admin หรือเจ้าของร้านเท่านั้น";
    case "store_not_found":
      return "ไม่พบร้านค้า";
  }
}
