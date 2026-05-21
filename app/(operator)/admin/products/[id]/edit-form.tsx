"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import {
  OperatorCard,
  OperatorCallout,
  OperatorField,
  Button,
  Input,
  Textarea,
  Checkbox,
} from "@/components/operator/operator-primitives";

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
};

export function ProductEditForm({
  productId,
  defaultValues,
}: {
  productId: string;
  defaultValues: FormValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

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
          <OperatorField label="URL รูปภาพ">
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
