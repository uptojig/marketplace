"use client";

/**
 * Per-store enrich-products action button.
 *
 * Renders inside the admin stores table. Clicking opens a confirm
 * dialog explaining what will happen (translate + categorize + flag
 * low-image), then invokes the server action and shows a result
 * dialog with the counts + a list of low-image products + skipped
 * products. We use a Dialog rather than a toast because the result
 * is too rich for a single line — the operator needs to scan the
 * low-image list to decide which products to source images for.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { enrichStoreProducts, type EnrichResult } from "@/lib/admin/enrich-products";

interface Props {
  storeId: string;
  storeName: string;
}

export function EnrichProductsButton({ storeId, storeName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<EnrichResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleRun() {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await enrichStoreProducts(storeId);
        setConfirmOpen(false);
        setResult(res);
        // refresh the page so the quality column reflects the new counts.
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
          <Sparkles className="h-3 w-3" />
        )}
        เติมข้อมูล
      </Button>

      <Dialog open={confirmOpen} onOpenChange={(open) => !pending && setConfirmOpen(open)}>
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
                  กำลังดำเนินการ...
                </>
              ) : (
                "เริ่ม"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={result !== null} onOpenChange={(open) => !open && closeResult()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>ผลการเติมข้อมูล — {storeName}</DialogTitle>
            <DialogDescription>
              {result?.error
                ? errorLabel(result.error)
                : `สแกน ${result?.scanned ?? 0} สินค้า`}
            </DialogDescription>
          </DialogHeader>
          {result && !result.error && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="แปลไทยแล้ว" value={result.translated} tone="success" />
                <Stat label="จัด Category แล้ว" value={result.categorized} tone="success" />
                <Stat label="รูปน้อยกว่า 2" value={result.flaggedLowImage.length} tone="warn" />
              </div>

              {result.skipped.length > 0 && (
                <details className="rounded-md border bg-gray-50 p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    ข้ามไป {result.skipped.length} รายการ
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

              {result.flaggedLowImage.length > 0 && (
                <details className="rounded-md border bg-amber-50 p-3" open>
                  <summary className="cursor-pointer text-xs font-medium">
                    สินค้าที่ต้องเพิ่มรูป ({result.flaggedLowImage.length} รายการ)
                  </summary>
                  <ul className="mt-2 max-h-64 space-y-1 overflow-auto text-xs">
                    {result.flaggedLowImage.map((f) => (
                      <li key={f.productId} className="flex items-center justify-between gap-3">
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
            <Button type="button" onClick={closeResult}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function errorLabel(code: NonNullable<EnrichResult["error"]>): string {
  switch (code) {
    case "agent_not_configured":
      return "ANTHROPIC_API_KEY ยังไม่ได้ตั้งค่า — ไม่สามารถเรียก Claude API ได้";
    case "forbidden":
      return "ไม่มีสิทธิ์ — ต้องเป็น Admin เท่านั้น";
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
  tone: "success" | "warn";
}) {
  const cls =
    tone === "success" ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800";
  return (
    <div className={`rounded-md ${cls} p-3`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
