"use client";

/**
 * DigitalAssetsManager — file picker + asset list for digital products.
 *
 * Mounted inside the admin product edit form when productType=DIGITAL
 * AND digitalKind !== 'PROMPT' (prompt kind uses promptText, no file
 * upload needed).
 *
 * Each row is one DigitalAsset. File picker POSTs multipart to
 * /api/admin/digital-assets/upload. Delete hits
 * /api/admin/digital-assets/[id]. Re-fetches the list after each
 * mutation so the UI stays in sync without an N+1 polling loop.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, FileCheck2 } from "lucide-react";
import {
  OperatorField,
  OperatorCallout,
  Button,
} from "@/components/operator/operator-primitives";

export interface DigitalAssetRow {
  id: string;
  fileName: string;
  fileFormat: string;
  fileSizeMB: number;
  isPreview: boolean;
}

interface Props {
  productId: string;
  initialAssets: DigitalAssetRow[];
}

export function DigitalAssetsManager({ productId, initialAssets }: Props) {
  const router = useRouter();
  const [assets, setAssets] = useState<DigitalAssetRow[]>(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("productId", productId);
      form.append("file", file);
      form.append("isPreview", isPreview ? "true" : "false");

      const res = await fetch("/api/admin/digital-assets/upload", {
        method: "POST",
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? "อัปโหลดไม่สำเร็จ");
        return;
      }
      setAssets((prev) => [...prev, body.asset]);
      router.refresh();
    } finally {
      setUploading(false);
      // Reset the input so the same filename can be re-uploaded.
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบไฟล์นี้? — ผู้ที่ซื้อแล้วยังคงดาวน์โหลดได้จนกว่า Spaces จะลบ object")) {
      return;
    }
    const res = await fetch(`/api/admin/digital-assets/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("ลบไม่สำเร็จ");
      return;
    }
    setAssets((prev) => prev.filter((a) => a.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <OperatorField
        label="อัปโหลดไฟล์ใหม่"
        hint="PDF / XLSX / AI / ZIP — สูงสุด 100 MB"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm cursor-pointer hover:bg-muted">
            <Upload className="h-4 w-4" />
            {uploading ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
            />
            ทำเป็นไฟล์ตัวอย่าง (ดาวน์โหลดฟรี ไม่ต้องซื้อ)
          </label>
        </div>
      </OperatorField>

      {error && <OperatorCallout tone="danger">{error}</OperatorCallout>}

      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          ยังไม่มีไฟล์ที่อัปโหลด — ผู้ซื้อจะไม่มีอะไรให้ดาวน์โหลด
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {assets.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileCheck2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    .{a.fileFormat} · {a.fileSizeMB.toFixed(2)} MB
                    {a.isPreview && (
                      <>
                        {" · "}
                        <span className="font-semibold text-amber-600">
                          PREVIEW (ฟรี)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDelete(a.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                ลบ
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
