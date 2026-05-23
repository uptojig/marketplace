"use client";

/**
 * Unified per-row dropdown menu for /admin/stores.
 *
 * Replaces the 5-inline-button toolbar that overflowed on smaller
 * viewports and made the table hard to scan. All actions live behind a
 * single kebab trigger so the row stays compact, plus we can surface
 * actions that previously had no UI (quick-approve, delete).
 *
 * Each "heavy" action (enrich / refetch / backfill / delete) has its
 * own confirm + result dialog. Dialog state lives at THIS component's
 * scope (not inside DropdownMenuContent) so the dialogs stay mounted
 * after the dropdown closes — Radix unmounts DropdownMenuContent on
 * close, which would clobber any state that lived in there.
 */
import { useState, useTransition } from "react";
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
  AlertTriangle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

type ActionKind = "enrich" | "backfill" | "refetch" | "delete" | null;

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
  const [openAction, setOpenAction] = useState<ActionKind>(null);
  const [pending, startTransition] = useTransition();
  const [approving, setApproving] = useState(false);
  const [topErr, setTopErr] = useState<string | null>(null);

  // Per-dialog result + error state. Kept here so dialogs survive the
  // dropdown closing (DropdownMenuContent unmounts on close).
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null);
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(
    null,
  );
  const [refetchResult, setRefetchResult] = useState<RefetchResult | null>(
    null,
  );
  const [dlgErr, setDlgErr] = useState<string | null>(null);

  function runEnrich() {
    setDlgErr(null);
    startTransition(async () => {
      try {
        const res = await enrichStoreProducts(storeId);
        setEnrichResult(res);
        router.refresh();
      } catch (e) {
        setDlgErr(e instanceof Error ? e.message : "unknown_error");
      }
    });
  }

  function runBackfill() {
    setDlgErr(null);
    startTransition(async () => {
      try {
        const res = await backfillCJImagesForStore(storeId);
        setBackfillResult(res);
        router.refresh();
      } catch (e) {
        setDlgErr(e instanceof Error ? e.message : "unknown_error");
      }
    });
  }

  function runRefetch() {
    setDlgErr(null);
    startTransition(async () => {
      try {
        const res = await refetchCJMissingPayloadForStore(storeId);
        setRefetchResult(res);
        router.refresh();
      } catch (e) {
        setDlgErr(e instanceof Error ? e.message : "unknown_error");
      }
    });
  }

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

  function runDelete() {
    setDlgErr(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/stores/${storeId}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setDlgErr(data?.error ?? "ลบไม่สำเร็จ");
          return;
        }
        setOpenAction(null);
        router.refresh();
      } catch (e) {
        setDlgErr(e instanceof Error ? e.message : "network error");
      }
    });
  }

  function closeResult(setter: (v: null) => void) {
    setter(null);
    setDlgErr(null);
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
              Slot can't attach the trigger ref and a handful of pointer
              events drop on the floor. Native <button> sidesteps that
              entirely. */}
          <button
            type="button"
            aria-label={`เมนูการจัดการร้าน ${storeName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            disabled={approving || pending}
          >
            {approving || pending ? (
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

          {approvalStatus !== "APPROVED" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={quickApprove} disabled={approving}>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                อนุมัติด่วน
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] tracking-wide uppercase">
            เติมข้อมูลสินค้า
          </DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setOpenAction("enrich")}>
            <Sparkles className="h-4 w-4 text-amber-500" />
            แปลไทย + จัด Category (AI)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenAction("backfill")}>
            <Images className="h-4 w-4 text-muted-foreground" />
            เติมรูปจาก CJ payload
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenAction("refetch")}>
            <CloudDownload className="h-4 w-4 text-muted-foreground" />
            Refetch CJ payload
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setOpenAction("delete")}
          >
            <Trash2 className="h-4 w-4" />
            ลบร้าน...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Enrich (AI translate + categorize) ─────────────────────── */}
      <Dialog
        open={openAction === "enrich" && enrichResult === null}
        onOpenChange={(o) => !pending && !o && setOpenAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เติมข้อมูลสินค้า — {storeName}</DialogTitle>
            <DialogDescription>
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
              ใช้เวลาประมาณ 1-2 นาทีต่อ 50 สินค้า ทำงานเฉพาะรายการที่ยังไม่มีข้อมูล (idempotent)
            </DialogDescription>
          </DialogHeader>
          {dlgErr && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dlgErr}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenAction(null)}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button type="button" onClick={runEnrich} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                "เริ่ม"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={enrichResult !== null}
        onOpenChange={(o) => {
          if (!o) {
            closeResult(setEnrichResult);
            setOpenAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>ผลการเติมข้อมูล — {storeName}</DialogTitle>
            <DialogDescription>
              {enrichResult?.error
                ? enrichErrorLabel(enrichResult.error)
                : `สแกน ${enrichResult?.scanned ?? 0} สินค้า`}
            </DialogDescription>
          </DialogHeader>
          {enrichResult && !enrichResult.error && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="แปลไทยแล้ว" value={enrichResult.translated} tone="success" />
                <Stat
                  label="จัด Category แล้ว"
                  value={enrichResult.categorized}
                  tone="success"
                />
                <Stat
                  label="รูปน้อยกว่า 2"
                  value={enrichResult.flaggedLowImage.length}
                  tone="warn"
                />
              </div>
              {enrichResult.skipped.length > 0 && (
                <details className="rounded-md border bg-muted p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    ข้ามไป {enrichResult.skipped.length} รายการ
                  </summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
                    {enrichResult.skipped.map((s) => (
                      <li key={s.productId} className="font-mono">
                        <code className="text-muted-foreground">
                          {s.productId}
                        </code>{" "}
                        — {s.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {enrichResult.flaggedLowImage.length > 0 && (
                <details className="rounded-md border bg-amber-50 p-3" open>
                  <summary className="cursor-pointer text-xs font-medium">
                    สินค้าที่ต้องเพิ่มรูป ({enrichResult.flaggedLowImage.length}{" "}
                    รายการ)
                  </summary>
                  <ul className="mt-2 max-h-64 space-y-1 overflow-auto text-xs">
                    {enrichResult.flaggedLowImage.map((f) => (
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
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                closeResult(setEnrichResult);
                setOpenAction(null);
              }}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Backfill CJ images ─────────────────────────────────────── */}
      <Dialog
        open={openAction === "backfill" && backfillResult === null}
        onOpenChange={(o) => !pending && !o && setOpenAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เติมรูปภาพจาก CJ — {storeName}</DialogTitle>
            <DialogDescription>
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
            </DialogDescription>
          </DialogHeader>
          {dlgErr && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dlgErr}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenAction(null)}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button type="button" onClick={runBackfill} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังเติมรูป...
                </>
              ) : (
                "เริ่ม"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={backfillResult !== null}
        onOpenChange={(o) => {
          if (!o) {
            closeResult(setBackfillResult);
            setOpenAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ผลการเติมรูปภาพ — {storeName}</DialogTitle>
            <DialogDescription>
              {backfillResult?.error
                ? backfillErrorLabel(backfillResult.error)
                : `สแกน ${backfillResult?.scanned ?? 0} สินค้า`}
            </DialogDescription>
          </DialogHeader>
          {backfillResult && !backfillResult.error && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="อัปเดตแล้ว" value={backfillResult.updated} tone="success" />
                <Stat
                  label="ข้าม"
                  value={backfillResult.skipped.length}
                  tone="muted"
                />
              </div>
              {backfillResult.skipped.length > 0 && (
                <details className="rounded-md border bg-muted p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    รายละเอียดสินค้าที่ข้าม ({backfillResult.skipped.length})
                  </summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
                    {backfillResult.skipped.map((s) => (
                      <li key={s.productId} className="font-mono">
                        <code className="text-muted-foreground">
                          {s.productId}
                        </code>{" "}
                        — {backfillReasonLabel(s.reason)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                closeResult(setBackfillResult);
                setOpenAction(null);
              }}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Refetch CJ missing payload ─────────────────────────────── */}
      <Dialog
        open={openAction === "refetch" && refetchResult === null}
        onOpenChange={(o) => !pending && !o && setOpenAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refetch CJ payload — {storeName}</DialogTitle>
            <DialogDescription>
              ดึงข้อมูลจาก CJ ใหม่สำหรับสินค้าที่ <code>externalPayload</code>{" "}
              เป็น null (legacy import):
              <br />
              <span className="mt-2 block text-foreground">
                1) เรียก CJ <code>/product/query</code> + variant query ทุกรายการ
                <br />
                2) บันทึก externalPayload + galleryUrls + rich fields (weight,
                materials, …)
                <br />
                3) เว้น 1.1 วินาทีระหว่างสินค้า (CJ rate limit)
              </span>
              <br />
              <strong>ช้ากว่าปุ่ม Backfill</strong> — ~2 นาทีต่อ 100 สินค้า
              เพราะต้องเรียก CJ API จริง รันทีเดียวก็พอ จากนั้นใช้ Backfill เร่งซ้ำๆ ได้
            </DialogDescription>
          </DialogHeader>
          {dlgErr && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dlgErr}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenAction(null)}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button type="button" onClick={runRefetch} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังดึงข้อมูล...
                </>
              ) : (
                "เริ่ม"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={refetchResult !== null}
        onOpenChange={(o) => {
          if (!o) {
            closeResult(setRefetchResult);
            setOpenAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ผลการ Refetch CJ — {storeName}</DialogTitle>
            <DialogDescription>
              {refetchResult?.error
                ? refetchErrorLabel(refetchResult.error)
                : `สแกน ${refetchResult?.scanned ?? 0} สินค้า (เฉพาะที่ externalPayload เป็น null)`}
            </DialogDescription>
          </DialogHeader>
          {refetchResult && !refetchResult.error && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="ดึงสำเร็จ" value={refetchResult.refetched} tone="success" />
                <Stat
                  label="ข้าม"
                  value={refetchResult.skipped.length}
                  tone="muted"
                />
              </div>
              {refetchResult.skipped.length > 0 && (
                <details className="rounded-md border bg-muted p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    รายละเอียดสินค้าที่ข้าม ({refetchResult.skipped.length})
                  </summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
                    {refetchResult.skipped.map((s) => (
                      <li key={s.productId} className="font-mono">
                        <code className="text-muted-foreground">
                          {s.productId}
                        </code>{" "}
                        — {s.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {refetchResult.refetched > 0 && (
                <p className="text-xs text-muted-foreground">
                  ขั้นถัดไป: คลิก &ldquo;เติมรูปจาก CJ payload&rdquo;
                  เพื่อเขียน galleryUrls จาก payload ใหม่
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                closeResult(setRefetchResult);
                setOpenAction(null);
              }}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ─────────────────────────────────────────── */}
      <Dialog
        open={openAction === "delete"}
        onOpenChange={(o) => !pending && !o && setOpenAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ลบร้าน — {storeName}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">
                การลบนี้จะถาวร —
                <strong className="ml-1">
                  สินค้า, คำสั่งซื้อ, และ deployment ทั้งหมดของร้านนี้จะถูกลบ
                </strong>
              </span>
              <span className="block">
                Droplet + DNS records ใน Provisioning จะถูก teardown ก่อน
                จากนั้น Store row จะถูกลบ (cascading)
              </span>
              <code className="mt-2 block break-all rounded bg-muted px-2 py-1 text-xs">
                /stores/{storeSlug}
              </code>
            </DialogDescription>
          </DialogHeader>
          {dlgErr && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {dlgErr}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenAction(null)}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={runDelete}
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1 h-4 w-4" />
                  ลบถาวร
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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

function refetchErrorLabel(
  code: NonNullable<RefetchResult["error"]>,
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
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
