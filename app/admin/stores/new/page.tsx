"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewStorePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    ownerEmail: "",
    ownerName: "",
    description: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" && !form.slug) {
      // auto-suggest slug from name
      const auto = value
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
      if (auto) setForm((f) => ({ ...f, slug: auto }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        typeof err.error === "object"
          ? Object.values(err.error).flat().join(", ")
          : (err.error ?? "บันทึกไม่สำเร็จ");
      setError(String(msg));
      setSaving(false);
      return;
    }
    const data = await res.json();
    router.push(`/admin/stores`);
    router.refresh();
    void data;
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/admin/stores"
        className="mb-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        กลับไปรายการร้าน
      </Link>

      <h1 className="text-2xl font-bold">สร้างร้านค้าใหม่</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        สร้างร้านพร้อมกำหนดเจ้าของ — ระบบจะสร้าง user ใหม่ให้อัตโนมัติถ้าอีเมลยังไม่มี
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Field label="ชื่อร้าน" required>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="My Awesome Shop"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <Field
          label="Slug (URL)"
          required
          hint={`จะอยู่ที่ /stores/${form.slug || "<slug>"}`}
        >
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value.toLowerCase())}
            placeholder="my-awesome-shop"
            pattern="^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
            required
            className="w-full rounded-md border px-3 py-2 font-mono text-sm"
          />
        </Field>

        <Field label="อีเมลเจ้าของร้าน" required hint="ถ้ายังไม่มี user — ระบบสร้างให้ + role VENDOR">
          <input
            type="email"
            value={form.ownerEmail}
            onChange={(e) => update("ownerEmail", e.target.value)}
            placeholder="vendor@example.com"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="ชื่อเจ้าของ (optional)">
          <input
            value={form.ownerName}
            onChange={(e) => update("ownerName", e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="คำอธิบายร้าน (optional)">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            placeholder="ขายอะไร เน้นกลุ่มลูกค้าไหน..."
            maxLength={500}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>

        <div className="flex justify-end gap-2">
          <Link
            href="/admin/stores"
            className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "กำลังสร้าง..." : "สร้างร้าน"}
          </button>
        </div>
      </form>
    </div>
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
