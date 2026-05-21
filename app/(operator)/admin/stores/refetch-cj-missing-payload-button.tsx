"use client";

/**
 * Per-store "refetch CJ missing payload" admin button.
 *
 * Sibling to `BackfillCJImagesButton`. While that button works purely off
 * the cached `externalPayload` blob (DB-only, instant), THIS button hits
 * the CJ API for products whose `externalPayload IS NULL` — i.e. legacy
 * rows that were imported before we cached the raw payload (or whose
 * import failed mid-write).
 *
 * Sequence the operator usually wants:
 *   1. Run THIS first to populate `externalPayload` on all rows.
 *   2. Then run `BackfillCJImagesButton` (or the rich-data backfill) over
 *      the same store; both work off the cached payload after step 1.
 *
 * Rate limit: CJ throttles ~1 req/sec on /product/query — the server
 * action sleeps 1.1s between products. UI just shows a spinner.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudDownload, Loader2 } from "lucide-react";
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
  refetchCJMissingPayloadForStore,
  type RefetchResult,
} from "@/lib/admin/refetch-cj-missing-payload";

interface Props {
  storeId: string;
  storeName: string;
}

export function RefetchCJMissingPayloadButton({ storeId, storeName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<RefetchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleRun() {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await refetchCJMissingPayloadForStore(storeId);
        setConfirmOpen(false);
        setResult(res);
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown_error";
        setErrorMsg(msg);
      }
    });
  }

  function closeResult() {
    setResult(null);
    setErrorMsg(null);
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 gap-1 px-2 text-xs"
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CloudDownload className="h-3 w-3" />
        )}
        Refetch CJ payload
      </Button>

      <Dialog open={confirmOpen} onOpenChange={(open) => !pending && setConfirmOpen(open)}>
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
                2) บันทึก externalPayload + galleryUrls + rich fields (weight, materials, …)
                <br />
                3) เว้น 1.1 วินาทีระหว่างสินค้า (CJ rate limit)
              </span>
              <br />
              <strong>ช้ากว่าปุ่ม Backfill</strong> — ~2 นาทีต่อ 100 สินค้า เพราะต้องเรียก CJ API
              จริง. รันทีเดียวก็พอ จากนั้นใช้ Backfill เร่งซ้ำๆ ได้
            </DialogDescription>
          </DialogHeader>
          {errorMsg && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button type="button" onClick={handleRun} disabled={pending}>
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

      <Dialog open={result !== null} onOpenChange={(open) => !open && closeResult()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ผลการ Refetch CJ — {storeName}</DialogTitle>
            <DialogDescription>
              {result?.error
                ? errorLabel(result.error)
                : `สแกน ${result?.scanned ?? 0} สินค้า (เฉพาะที่ externalPayload เป็น null)`}
            </DialogDescription>
          </DialogHeader>
          {result && !result.error && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="ดึงสำเร็จ" value={result.refetched} tone="success" />
                <Stat label="ข้าม" value={result.skipped.length} tone="muted" />
              </div>

              {result.skipped.length > 0 && (
                <details className="rounded-md border bg-muted p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    รายละเอียดสินค้าที่ข้าม ({result.skipped.length})
                  </summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
                    {result.skipped.map((s) => (
                      <li key={s.productId} className="font-mono">
                        <code className="text-muted-foreground">{s.productId}</code> — {s.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {result.refetched > 0 && (
                <p className="text-xs text-muted-foreground">
                  ขั้นถัดไป: คลิกปุ่ม &ldquo;เติมรูปภาพจาก CJ&rdquo; เพื่อเขียน galleryUrls
                  จาก payload ใหม่
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={closeResult}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function errorLabel(code: NonNullable<RefetchResult["error"]>): string {
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
  tone: "success" | "muted";
}) {
  const cls =
    tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground";
  return (
    <div className={`rounded-md ${cls} p-3`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
