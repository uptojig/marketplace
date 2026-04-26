"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";

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
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h2 className="font-semibold">ข้อมูลสินค้า</h2>

        <Field label="ชื่อสินค้า (อังกฤษ/ภาษาเดิม)" required>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="ชื่อสินค้า (ภาษาไทย)" hint="เว้นว่าง = ใช้ชื่อด้านบน">
          <input
            value={form.titleTh}
            onChange={(e) => update("titleTh", e.target.value)}
            placeholder="ใส่ชื่อภาษาไทยที่ลูกค้าจะเห็น"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="หมวดหมู่">
          <input
            value={form.categoryName}
            onChange={(e) => update("categoryName", e.target.value)}
            placeholder="เช่น เสื้อผ้าผู้หญิง"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="คำอธิบาย (อังกฤษ)">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="คำอธิบาย (ภาษาไทย)" hint="ภาษาที่ลูกค้าเห็น">
          <textarea
            value={form.descriptionTh}
            onChange={(e) => update("descriptionTh", e.target.value)}
            rows={6}
            placeholder="รายละเอียดสินค้า ขนาด วัสดุ..."
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h2 className="font-semibold">ราคา</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ราคาขาย (฿)" required>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.priceTHB}
              onChange={(e) => update("priceTHB", parseFloat(e.target.value) || 0)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>
          <Field label="ราคาเดิม (฿)" hint="ใส่เพื่อแสดงเป็นราคาขีดฆ่า (sale)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.compareAtPriceTHB ?? ""}
              onChange={(e) =>
                update(
                  "compareAtPriceTHB",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h2 className="font-semibold">รูปภาพหลัก</h2>
        <Field label="URL รูปภาพ">
          <input
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border px-3 py-2 font-mono text-xs"
          />
        </Field>
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

      <div className="rounded-lg border bg-white p-5">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">
            <span className="font-medium">Active</span> — แสดงในหน้าร้าน
          </span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? "กำลังลบ..." : "ลบสินค้านี้"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
