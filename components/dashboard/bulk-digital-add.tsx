"use client";

/**
 * <BulkDigitalAdd /> — add many digital products in one pass.
 *
 * Drop N files → one product per file. Shared defaults (digitalKind +
 * category) are set once at the top; per-row title + price are editable
 * (prices intentionally differ per item). On submit we run sequentially
 * — for each row: POST /api/store/products (DIGITAL) then upload the
 * file to /api/store/digital-assets/upload — with a live progress bar.
 * Sequential (not parallel) keeps the progress legible and avoids
 * hammering the upload route.
 *
 * Reuses the endpoints shipped with the self-serve digital-product
 * feature; no new backend.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UploadCloud, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  DIGITAL_KIND_LABELS,
  type DigitalKind,
} from "@/components/dashboard/product-form";

// PROMPT is text-only (no file) → excluded from the file-based bulk flow.
const FILE_KINDS = (Object.keys(DIGITAL_KIND_LABELS) as DigitalKind[]).filter(
  (k) => k !== "PROMPT",
);

interface Row {
  id: string;
  file: File;
  title: string;
  priceTHB: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

/** filename → human title: drop extension, _/- → space, collapse + trim. */
function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function BulkDigitalAdd({
  storeSlug,
  redirectTo,
}: {
  storeSlug?: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<DigitalKind>("EXCEL");
  const [categoryName, setCategoryName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ok: number; failed: number } | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next: Row[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      title: titleFromFilename(file.name),
      priceTHB: bulkPrice > 0 ? bulkPrice : 0,
      status: "pending",
    }));
    setRows((prev) => [...prev, ...next]);
    setDone(null);
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function applyBulkPrice() {
    if (bulkPrice <= 0) return;
    setRows((prev) => prev.map((r) => ({ ...r, priceTHB: bulkPrice })));
  }

  async function createOne(row: Row): Promise<{ ok: boolean; error?: string }> {
    // 1. Create the product row.
    const slugQuery = storeSlug
      ? `?storeSlug=${encodeURIComponent(storeSlug)}`
      : "";
    const createRes = await fetch(`/api/store/products${slugQuery}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: row.title,
        priceTHB: row.priceTHB,
        productType: "DIGITAL",
        digitalKind: kind,
        categoryName: categoryName || undefined,
        active: true,
        ...(storeSlug ? { storeSlug } : {}),
      }),
    });
    if (!createRes.ok) {
      const body = await createRes.json().catch(() => ({}));
      const msg =
        typeof body.error === "object"
          ? Object.values(body.error).flat().join(", ")
          : (body.error ?? "สร้างสินค้าไม่สำเร็จ");
      return { ok: false, error: String(msg) };
    }
    const { id: productId } = (await createRes.json()) as { id: string };

    // 2. Upload the file as the product's downloadable asset.
    const form = new FormData();
    form.append("productId", productId);
    form.append("file", row.file);
    const upRes = await fetch("/api/store/digital-assets/upload", {
      method: "POST",
      body: form,
    });
    if (!upRes.ok) {
      const body = await upRes.json().catch(() => ({}));
      return {
        ok: false,
        error: `สร้างสินค้าแล้วแต่อัปไฟล์ไม่สำเร็จ: ${body.error ?? upRes.status}`,
      };
    }
    return { ok: true };
  }

  async function handleSubmit() {
    setError(null);
    if (rows.length === 0) {
      setError("ยังไม่ได้เลือกไฟล์");
      return;
    }
    const invalid = rows.find((r) => !r.title.trim() || r.priceTHB <= 0);
    if (invalid) {
      setError("ทุกแถวต้องมีชื่อและราคามากกว่า 0");
      return;
    }

    setRunning(true);
    let ok = 0;
    let failed = 0;
    // Sequential — predictable progress + gentle on the upload route.
    for (const row of rows) {
      updateRow(row.id, { status: "uploading", error: undefined });
      const result = await createOne(row);
      if (result.ok) {
        ok += 1;
        updateRow(row.id, { status: "done" });
      } else {
        failed += 1;
        updateRow(row.id, { status: "error", error: result.error });
      }
    }
    setRunning(false);
    setDone({ ok, failed });
    if (failed === 0) {
      // Brief pause so the all-done state is visible, then bounce back.
      setTimeout(() => router.push(redirectTo), 1400);
    }
  }

  const allDone = done && done.failed === 0;
  const progress = rows.length
    ? Math.round(
        (rows.filter((r) => r.status === "done" || r.status === "error").length /
          rows.length) *
          100,
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Shared defaults */}
      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">ชนิดไฟล์ (ใช้กับทุกรายการ)</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DigitalKind)}
            disabled={running}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
          >
            {FILE_KINDS.map((k) => (
              <option key={k} value={k}>
                {DIGITAL_KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">หมวดหมู่ (ไม่บังคับ)</span>
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            disabled={running}
            placeholder="เช่น คณิตศาสตร์ ป.4"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </label>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!running) addFiles(e.dataTransfer.files);
        }}
        className="rounded-lg border-2 border-dashed p-8 text-center"
      >
        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          ลากไฟล์มาวางที่นี่ หรือ
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={running}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          เลือกไฟล์
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          แต่ละไฟล์ = 1 สินค้า · สูงสุด 100 MB ต่อไฟล์
        </p>
      </div>

      {rows.length > 0 && (
        <>
          {/* Quick-fill price */}
          <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                ตั้งราคาเริ่มต้น (บาท)
              </span>
              <input
                type="number"
                min={0}
                value={bulkPrice || ""}
                onChange={(e) => setBulkPrice(Number(e.target.value) || 0)}
                disabled={running}
                className="w-32 rounded-md border px-3 py-1.5 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={applyBulkPrice}
              disabled={running || bulkPrice <= 0}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              ใช้ราคานี้ทั้งหมด
            </button>
            <span className="text-xs text-muted-foreground">
              (แก้ราคาแต่ละแถวด้านล่างได้)
            </span>
          </div>

          {/* Progress */}
          {(running || done) && (
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {done
                  ? `เสร็จ — สำเร็จ ${done.ok}${done.failed ? ` · ล้มเหลว ${done.failed}` : ""}`
                  : `กำลังสร้าง… ${progress}%`}
              </p>
            </div>
          )}

          {/* Rows */}
          <ul className="divide-y rounded-lg border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-3">
                <div className="shrink-0">
                  {r.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : r.status === "error" ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : r.status === "uploading" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <span className="block h-2 w-2 rounded-full bg-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    value={r.title}
                    onChange={(e) => updateRow(r.id, { title: e.target.value })}
                    disabled={running}
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                  />
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {r.file.name} · {(r.file.size / 1024 / 1024).toFixed(2)} MB
                    {r.error && (
                      <span className="text-red-600"> — {r.error}</span>
                    )}
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={r.priceTHB || ""}
                  onChange={(e) =>
                    updateRow(r.id, { priceTHB: Number(e.target.value) || 0 })
                  }
                  disabled={running}
                  placeholder="฿"
                  className="w-24 shrink-0 rounded-md border px-2 py-1.5 text-right text-sm"
                />
                {!running && (
                  <button
                    type="button"
                    onClick={() => removeRow(r.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    aria-label="ลบรายการ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={running || allDone === true}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังสร้าง…
              </>
            ) : allDone ? (
              "เสร็จแล้ว — กำลังกลับไปหน้ารายการ"
            ) : (
              `สร้างทั้งหมด ${rows.length} รายการ`
            )}
          </button>
        </>
      )}
    </div>
  );
}
