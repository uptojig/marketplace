"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import {
  OperatorCard,
  OperatorCallout,
  OperatorField,
  Button,
  Input,
  Textarea,
  Checkbox,
} from "@/components/operator/operator-primitives";
import {
  DigitalAssetsManager,
  type DigitalAssetRow,
} from "./digital-assets-manager";

type ProductType = "PHYSICAL" | "DIGITAL";
type DigitalKind = "EBOOK" | "EXCEL" | "VECTOR" | "PROMPT" | "ARCHIVE" | "OTHER";

type FormValues = {
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string;
  categoryName: string;
  active: boolean;
  // ── Digital product fields ──
  productType: ProductType;
  digitalKind: DigitalKind | null;
  /** Full prompt text — only shown to buyers with an active unlock. */
  promptText: string;
  /** Public teaser — visible on PDP without purchase. */
  promptSample: string;
};

export function ProductEditForm({
  productId,
  defaultValues,
  initialDigitalAssets = [],
}: {
  productId: string;
  defaultValues: FormValues;
  initialDigitalAssets?: DigitalAssetRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setToast(null);
    try {
      const body = new FormData();
      body.append("productId", productId);
      body.append("file", file);
      const res = await fetch("/api/admin/products/image-upload", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setToast({ type: "err", msg: data?.error ?? "อัปโหลดภาพไม่สำเร็จ" });
        return;
      }
      update("imageUrl", data.url);
      setToast({ type: "ok", msg: "อัปโหลดภาพแล้ว — กด \"บันทึก\" เพื่อยืนยัน" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        compareAtPriceTHB: form.compareAtPriceTHB ?? null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        typeof err.error === "object"
          ? Object.values(err.error).flat().join(", ")
          : (err.error ?? "บันทึกไม่สำเร็จ");
      setToast({ type: "err", msg: String(msg) });
    } else {
      setToast({ type: "ok", msg: "บันทึกแล้ว" });
      router.refresh();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("ลบสินค้านี้ถาวร? — การกระทำนี้ย้อนกลับไม่ได้")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setToast({ type: "err", msg: "ลบไม่สำเร็จ" });
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {toast && (
        <OperatorCallout tone={toast.type === "ok" ? "success" : "danger"}>
          {toast.msg}
        </OperatorCallout>
      )}

      <OperatorCard title="ข้อมูลสินค้า">
        <div className="space-y-4">
          <OperatorField label="ชื่อสินค้า (อังกฤษ/ภาษาเดิม)" required>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
          </OperatorField>

          <OperatorField label="ชื่อสินค้า (ภาษาไทย)" hint="เว้นว่าง = ใช้ชื่อด้านบน">
            <Input
              value={form.titleTh}
              onChange={(e) => update("titleTh", e.target.value)}
              placeholder="ใส่ชื่อภาษาไทยที่ลูกค้าจะเห็น"
            />
          </OperatorField>

          <OperatorField label="หมวดหมู่">
            <Input
              value={form.categoryName}
              onChange={(e) => update("categoryName", e.target.value)}
              placeholder="เช่น เสื้อผ้าผู้หญิง"
            />
          </OperatorField>

          <OperatorField label="คำอธิบาย (อังกฤษ)">
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
            />
          </OperatorField>

          <OperatorField label="คำอธิบาย (ภาษาไทย)" hint="ภาษาที่ลูกค้าเห็น">
            <Textarea
              value={form.descriptionTh}
              onChange={(e) => update("descriptionTh", e.target.value)}
              rows={6}
              placeholder="รายละเอียดสินค้า ขนาด วัสดุ..."
            />
          </OperatorField>
        </div>
      </OperatorCard>

      <OperatorCard title="ราคา">
        <div className="grid gap-4 sm:grid-cols-2">
          <OperatorField label="ราคาขาย (฿)" required>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.priceTHB}
              onChange={(e) => update("priceTHB", parseFloat(e.target.value) || 0)}
              required
            />
          </OperatorField>
          <OperatorField label="ราคาเดิม (฿)" hint="ใส่เพื่อแสดงเป็นราคาขีดฆ่า (sale)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.compareAtPriceTHB ?? ""}
              onChange={(e) =>
                update("compareAtPriceTHB", e.target.value ? parseFloat(e.target.value) : null)
              }
            />
          </OperatorField>
        </div>
      </OperatorCard>

      <OperatorCard title="รูปภาพหลัก">
        <div className="space-y-4">
          <OperatorField
            label="อัปโหลดภาพใหม่"
            hint="JPG / PNG / WebP / GIF / AVIF — สูงสุด 10 MB"
          >
            <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm cursor-pointer hover:bg-muted w-fit">
              <Upload className="h-4 w-4" />
              {uploadingImage ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          </OperatorField>
          <OperatorField label="หรือวาง URL รูปภาพโดยตรง">
            <Input
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://..."
              className="font-mono text-xs"
            />
          </OperatorField>
          {form.imageUrl && /^https?:\/\//.test(form.imageUrl) && (
            <Image
              src={form.imageUrl}
              alt="Preview"
              width={200}
              height={200}
              className="rounded border object-cover"
              unoptimized
            />
          )}
        </div>
      </OperatorCard>

      <OperatorCard title="ประเภทสินค้า">
        <div className="space-y-4">
          <OperatorField label="ประเภท">
            <div className="flex gap-2">
              {(["PHYSICAL", "DIGITAL"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("productType", t)}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm transition-colors ${
                    form.productType === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {t === "PHYSICAL" ? "🚚 Physical (ส่งของจริง)" : "💾 Digital (ไฟล์/ปลดล็อก)"}
                </button>
              ))}
            </div>
          </OperatorField>

          {form.productType === "DIGITAL" && (
            <>
              <OperatorField label="ชนิดสินค้าดิจิทัล" required>
                <select
                  value={form.digitalKind ?? ""}
                  onChange={(e) =>
                    update("digitalKind", (e.target.value || null) as DigitalKind | null)
                  }
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— เลือกชนิด —</option>
                  <option value="PROMPT">PROMPT (ข้อความปลดล็อก คัดลอกได้)</option>
                  <option value="EBOOK">EBOOK (PDF/EPUB)</option>
                  <option value="EXCEL">EXCEL (XLSX/CSV)</option>
                  <option value="VECTOR">VECTOR (AI/SVG/EPS)</option>
                  <option value="ARCHIVE">ARCHIVE (ZIP bundle)</option>
                  <option value="OTHER">OTHER (อื่นๆ)</option>
                </select>
              </OperatorField>

              {form.digitalKind === "PROMPT" && (
                <>
                  <OperatorField
                    label="ตัวอย่าง Prompt (สาธารณะ)"
                    hint="ลูกค้าทุกคนเห็นก่อนซื้อ — ใส่เฉพาะส่วนน้ำจิ้ม"
                  >
                    <Textarea
                      value={form.promptSample}
                      onChange={(e) => update("promptSample", e.target.value)}
                      rows={4}
                      placeholder="เช่น 'You are a senior copywriter who...'  (5-10 บรรทัด)"
                    />
                  </OperatorField>
                  <OperatorField
                    label="Prompt เต็ม (ปลดล็อกหลังซื้อ)"
                    hint="เนื้อหาที่ผู้ซื้อได้คัดลอก — เก็บใน DB ตรง ๆ ผู้ซื้อกดปุ่ม 'คัดลอก' ใน /account/downloads"
                    required
                  >
                    <Textarea
                      value={form.promptText}
                      onChange={(e) => update("promptText", e.target.value)}
                      rows={10}
                      required
                      className="font-mono text-xs"
                      placeholder="ใส่ prompt ฉบับเต็มที่นี่..."
                    />
                  </OperatorField>
                </>
              )}

              {form.digitalKind && form.digitalKind !== "PROMPT" && (
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-semibold">ไฟล์ดิจิทัล</h4>
                  <p className="text-xs text-muted-foreground">
                    ผู้ซื้อจะเห็นไฟล์เหล่านี้ใน /account/downloads หลังชำระเงินสำเร็จ
                    (ผ่าน signed URL อายุ 10 นาที)
                  </p>
                  <DigitalAssetsManager
                    productId={productId}
                    initialAssets={initialDigitalAssets}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </OperatorCard>

      <OperatorCard>
        <label className="flex items-center gap-3">
          <Checkbox
            checked={form.active}
            onCheckedChange={(c) => update("active", c === true)}
          />
          <span className="text-sm">
            <span className="font-medium">Active</span> — แสดงในหน้าร้าน
          </span>
        </label>
      </OperatorCard>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? "กำลังลบ..." : "ลบสินค้านี้"}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </form>
  );
}
