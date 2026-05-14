"use client";

/**
 * Per-store backfill-CJ-images action button.
 *
 * Sibling to `EnrichProductsButton` — both live on the /admin/stores
 * row toolbar. While `EnrichProductsButton` calls the Anthropic API
 * to translate + categorize, this button is a pure DB-only re-run of
 * the image extractor over each product's cached `externalPayload`.
 *
 * Same UX pattern: open a confirm dialog explaining what will happen,
 * fire the server action, then show a result dialog with the counts
 * and a skipped-products accordion for the operator to scan.
 *
 * Why a dialog vs a toast: the result is multi-line (scanned vs
 * updated vs per-product skip reasons) and operators tend to want to
 * audit the skip list, so the modal carries its weight.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Images, Loader2 } from "lucide-react";
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
  backfillCJImagesForStore,
  type BackfillResult,
} from "@/lib/admin/backfill-cj-images";

interface Props {
  storeId: string;
  storeName: string;
}

export function BackfillCJImagesButton({ storeId, storeName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<BackfillResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleRun() {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await backfillCJImagesForStore(storeId);
        setConfirmOpen(false);
        setResult(res);
        // Refresh so the quality column reflects the new image counts.
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
          <Images className="h-3 w-3" />
        )}
        เติมรูปภาพจาก CJ
      </Button>

      <Dialog open={confirmOpen} onOpenChange={(open) => !pending && setConfirmOpen(open)}>
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
          {errorMsg && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
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
                  กำลังเติมรูป...
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
            <DialogTitle>ผลการเติมรูปภาพ — {storeName}</DialogTitle>
            <DialogDescription>
              {result?.error
                ? errorLabel(result.error)
                : `สแกน ${result?.scanned ?? 0} สินค้า`}
            </DialogDescription>
          </DialogHeader>
          {result && !result.error && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="อัปเดตแล้ว" value={result.updated} tone="success" />
                <Stat label="ข้าม" value={result.skipped.length} tone="muted" />
              </div>

              {result.skipped.length > 0 && (
                <details className="rounded-md border bg-gray-50 p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    รายละเอียดสินค้าที่ข้าม ({result.skipped.length})
                  </summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
                    {result.skipped.map((s) => (
                      <li key={s.productId} className="font-mono">
                        <code className="text-muted-foreground">{s.productId}</code>{" "}
                        — {reasonLabel(s.reason)}
                      </li>
                    ))}
                  </ul>
                </details>
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

function errorLabel(code: NonNullable<BackfillResult["error"]>): string {
  switch (code) {
    case "unauthenticated":
      return "กรุณาเข้าสู่ระบบใหม่";
    case "forbidden":
      return "ไม่มีสิทธิ์ — ต้องเป็น Admin หรือเจ้าของร้านเท่านั้น";
    case "store_not_found":
      return "ไม่พบร้านค้า";
  }
}

function reasonLabel(reason: string): string {
  switch (reason) {
    case "no_external_payload":
      return "ไม่มี externalPayload (ลอง import ใหม่)";
    case "no_images_in_payload":
      return "ไม่มีรูปภาพใน payload";
    case "already_up_to_date":
      return "รูปอัปเดตแล้ว";
    default:
      return reason;
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
    tone === "success" ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700";
  return (
    <div className={`rounded-md ${cls} p-3`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
