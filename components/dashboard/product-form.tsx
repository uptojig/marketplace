"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, X, Wand2, Loader2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
 * ProductForm — single-page add/edit for store owners.
 * Mirrors the admin edit-form patterns (Field/Section/Toast) but
 * adds gallery, variants, and supplier-URL autofill.
 * ───────────────────────────────────────────────────────────────── */

export type VariantValues = {
  externalVariantId?: string;
  size: string;
  color: string;
  priceTHB: number;
  sku: string;
  inventory: number | null;
  imageUrl: string;
};

export type DigitalKind =
  | "EBOOK"
  | "EXCEL"
  | "VECTOR"
  | "PROMPT"
  | "ARCHIVE"
  | "OTHER";

export type ProductFormValues = {
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string;
  galleryUrls: string[];
  categoryName: string;
  active: boolean;
  hasVariants: boolean;
  variants: VariantValues[];
  productType?: "PHYSICAL" | "DIGITAL";
  digitalKind?: DigitalKind | null;
  promptText?: string;
  supplier?: "CJ" | "ALIEXPRESS" | "MOCK";
  externalProductId?: string;
  externalPayload?: unknown;
};

export const DIGITAL_KIND_LABELS: Record<DigitalKind, string> = {
  EXCEL: "ไฟล์ Excel / Google Sheets (.xlsx)",
  EBOOK: "อีบุ๊ก (PDF / EPUB)",
  VECTOR: "ไฟล์เวกเตอร์ (AI / SVG / PSD)",
  PROMPT: "Prompt (ข้อความ — ก๊อปไปใช้ได้เลย)",
  ARCHIVE: "ไฟล์รวม (.zip)",
  OTHER: "อื่น ๆ (เสียง / วิดีโอ / ฟอนต์)",
};

const EMPTY_VARIANT: VariantValues = {
  size: "",
  color: "",
  priceTHB: 0,
  sku: "",
  inventory: null,
  imageUrl: "",
};

export const EMPTY_PRODUCT: ProductFormValues = {
  title: "",
  titleTh: "",
  description: "",
  descriptionTh: "",
  priceTHB: 0,
  compareAtPriceTHB: null,
  imageUrl: "",
  galleryUrls: [],
  categoryName: "",
  active: true,
  hasVariants: false,
  variants: [],
  productType: "PHYSICAL",
  digitalKind: null,
  promptText: "",
};

export function ProductForm({
  mode,
  productId,
  defaultValues = EMPTY_PRODUCT,
}: {
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: ProductFormValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null,
  );

  // Dirty-form check — compares the working state against the initial
  // defaults via structural equality. JSON.stringify is fine here
  // because the shape is bounded (≤ 6 gallery URLs + a handful of
  // variants) and the keys are stable across renders. Used to gate
  // the beforeunload guard so vendors don't lose 5 minutes of edits
  // to an accidental tab close / refresh / back-button. In-app
  // navigation via <Link> is NOT caught by beforeunload — guarding
  // that would need Next's experimental router events; the tab-
  // close case is the most common data-loss vector and worth
  // covering on its own.
  const dirty = JSON.stringify(form) !== JSON.stringify(defaultValues);
  useEffect(() => {
    if (!dirty || saving || deleting) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue assignment to show the prompt;
      // the actual text is browser-controlled and can't be customised
      // for security reasons.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, saving, deleting]);

  function update<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* ── Gallery helpers ─────────────────────────────────────────── */
  function addGalleryUrl() {
    if (form.galleryUrls.length >= 6) return;
    update("galleryUrls", [...form.galleryUrls, ""]);
  }
  function updateGalleryUrl(idx: number, val: string) {
    const next = [...form.galleryUrls];
    next[idx] = val;
    update("galleryUrls", next);
  }
  function removeGalleryUrl(idx: number) {
    update(
      "galleryUrls",
      form.galleryUrls.filter((_, i) => i !== idx),
    );
  }

  /* ── Variant helpers ─────────────────────────────────────────── */
  function addVariant() {
    update("variants", [
      ...form.variants,
      { ...EMPTY_VARIANT, priceTHB: form.priceTHB },
    ]);
  }
  function updateVariant<K extends keyof VariantValues>(
    idx: number,
    key: K,
    value: VariantValues[K],
  ) {
    const next = [...form.variants];
    next[idx] = { ...next[idx], [key]: value };
    update("variants", next);
  }
  function removeVariant(idx: number) {
    update(
      "variants",
      form.variants.filter((_, i) => i !== idx),
    );
  }

  /* ── Supplier autofill via /api/products/import preview ──────── */
  async function handleImport() {
    if (!importUrl.trim()) return;
    setImporting(true);
    setToast(null);
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", urls: [importUrl.trim()] }),
      });
      const json = await res.json();
      if (!res.ok || !Array.isArray(json.items) || json.items.length === 0) {
        setToast({ type: "err", msg: "ดึงข้อมูลไม่สำเร็จ" });
        return;
      }
      const item = json.items[0];
      if (!item.ok) {
        setToast({ type: "err", msg: item.error ?? "ดึงข้อมูลไม่สำเร็จ" });
        return;
      }
      setForm((f) => ({
        ...f,
        title: item.title ?? f.title,
        description: item.description ?? f.description,
        priceTHB: item.priceTHB ?? f.priceTHB,
        imageUrl: item.imageUrl ?? f.imageUrl,
        supplier: item.supplier,
        externalProductId: item.externalProductId,
        externalPayload: item.raw,
      }));
      setToast({ type: "ok", msg: "ดึงข้อมูลสำเร็จ — แก้ไขรายละเอียดได้เลย" });
    } catch {
      setToast({ type: "err", msg: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setImporting(false);
    }
  }

  /* ── Submit ──────────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    const payload = {
      title: form.title,
      titleTh: form.titleTh,
      description: form.description,
      descriptionTh: form.descriptionTh,
      priceTHB: form.priceTHB,
      compareAtPriceTHB: form.compareAtPriceTHB ?? null,
      imageUrl: form.imageUrl,
      galleryUrls: form.galleryUrls.filter(
        (u) => u && /^https?:\/\//.test(u),
      ),
      categoryName: form.categoryName,
      active: form.active,
      productType: form.productType ?? "PHYSICAL",
      digitalKind: form.productType === "DIGITAL" ? (form.digitalKind ?? null) : null,
      promptText:
        form.productType === "DIGITAL" && form.digitalKind === "PROMPT"
          ? (form.promptText ?? "")
          : null,
      // Digital products never carry variants.
      hasVariants: form.productType === "DIGITAL" ? false : form.hasVariants,
      variants: form.productType !== "DIGITAL" && form.hasVariants
        ? form.variants.map((v) => ({
            externalVariantId: v.externalVariantId,
            attributes: {
              ...(v.size ? { Size: v.size } : {}),
              ...(v.color ? { Color: v.color } : {}),
            },
            priceTHB: v.priceTHB || form.priceTHB,
            sku: v.sku || undefined,
            inventory: v.inventory ?? null,
            imageUrl: v.imageUrl || undefined,
          }))
        : [],
      ...(mode === "create" && form.supplier
        ? {
            supplier: form.supplier,
            externalProductId: form.externalProductId,
            externalPayload: form.externalPayload,
          }
        : {}),
    };

    const url =
      mode === "create"
        ? "/api/store/products"
        : `/api/store/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          typeof err.error === "object"
            ? Object.values(err.error).flat().join(", ")
            : (err.error ?? "บันทึกไม่สำเร็จ");
        setToast({ type: "err", msg: String(msg) });
        return;
      }
      setToast({ type: "ok", msg: "บันทึกแล้ว" });
      if (mode === "create") {
        const json = await res.json();
        router.push(`/dashboard/store/products/${json.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setToast({ type: "err", msg: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete (edit mode only) ─────────────────────────────────── */
  async function handleDelete() {
    if (!productId) return;
    if (!confirm("ลบสินค้านี้ถาวร? — การกระทำนี้ย้อนกลับไม่ได้")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/store/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setToast({ type: "err", msg: err.error ?? "ลบไม่สำเร็จ" });
        return;
      }
      router.push("/dashboard/store/products");
      router.refresh();
    } catch {
      setToast({ type: "err", msg: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24">
      {toast && (
        <div
          className={`sticky top-2 z-10 rounded-md px-4 py-3 text-sm shadow-sm ${
            toast.type === "ok"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Quick fill (create-mode only) ──────────────────────── */}
      {mode === "create" && (
        <Section
          title="เริ่มจากลิงก์สินค้า (ไม่บังคับ)"
          hint="วาง URL จาก CJ / AliExpress เพื่อเติมข้อมูลให้อัตโนมัติ — แล้วแก้ราคา/หัวข้อตามใจ"
        >
          <div className="flex gap-2">
            <input
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://www.cjdropshipping.com/product/…"
              className="flex-1 rounded-md border px-3 py-2 text-sm font-mono"
              disabled={importing}
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !importUrl.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              {importing ? "กำลังดึง…" : "ดึงข้อมูล"}
            </button>
          </div>
        </Section>
      )}

      {/* ── Product type (physical vs digital) ─────────────────── */}
      <Section
        title="ประเภทสินค้า"
        hint="สินค้าดิจิทัลส่งเป็นไฟล์ดาวน์โหลด ไม่ต้องจัดส่ง"
      >
        <div className="grid grid-cols-2 gap-2">
          {(["PHYSICAL", "DIGITAL"] as const).map((t) => {
            const active = (form.productType ?? "PHYSICAL") === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => update("productType", t)}
                className={`rounded-md border py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-input hover:bg-muted"
                }`}
                aria-pressed={active}
              >
                {t === "PHYSICAL" ? "สินค้าทั่วไป (จัดส่ง)" : "สินค้าดิจิทัล (ดาวน์โหลด)"}
              </button>
            );
          })}
        </div>

        {form.productType === "DIGITAL" && (
          <div className="mt-4 space-y-4">
            <Field label="ชนิดไฟล์ดิจิทัล" required>
              <select
                value={form.digitalKind ?? ""}
                onChange={(e) =>
                  update("digitalKind", (e.target.value || null) as DigitalKind | null)
                }
                required
                className="w-full rounded-md border px-3 py-2 text-sm bg-white"
              >
                <option value="" disabled>
                  เลือกชนิดไฟล์…
                </option>
                {(Object.keys(DIGITAL_KIND_LABELS) as DigitalKind[]).map((k) => (
                  <option key={k} value={k}>
                    {DIGITAL_KIND_LABELS[k]}
                  </option>
                ))}
              </select>
            </Field>

            {form.digitalKind === "PROMPT" ? (
              <Field
                label="เนื้อหา Prompt"
                hint="ข้อความเต็มที่ผู้ซื้อจะปลดล็อก + ก๊อปไปใช้ได้หลังชำระเงิน"
              >
                <textarea
                  value={form.promptText ?? ""}
                  onChange={(e) => update("promptText", e.target.value)}
                  rows={6}
                  placeholder="วางข้อความ prompt ที่นี่…"
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                />
              </Field>
            ) : (
              <p className="rounded-md border border-dashed bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                {mode === "create"
                  ? "บันทึกสินค้าก่อน แล้วระบบจะพาไปหน้าอัปโหลดไฟล์ดาวน์โหลด"
                  : "อัปโหลดไฟล์ดาวน์โหลดได้ที่ส่วน “ไฟล์ดาวน์โหลด” ด้านล่างฟอร์มนี้"}
              </p>
            )}
          </div>
        )}
      </Section>

      {/* ── Product info ───────────────────────────────────────── */}
      <Section title="ข้อมูลสินค้า">
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
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="คำอธิบาย (ภาษาไทย)" hint="ภาษาที่ลูกค้าจะเห็น">
          <textarea
            value={form.descriptionTh}
            onChange={(e) => update("descriptionTh", e.target.value)}
            rows={5}
            placeholder="รายละเอียดสินค้า ขนาด วัสดุ…"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </Field>
      </Section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <Section title="ราคา">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ราคาขาย (฿)" required>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.priceTHB || ""}
              onChange={(e) =>
                update("priceTHB", parseFloat(e.target.value) || 0)
              }
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>
          <Field label="ราคาเดิม (฿)" hint="ใส่เพื่อแสดงราคาขีดฆ่า (sale)">
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
      </Section>

      {/* ── Images ─────────────────────────────────────────────── */}
      <Section title="รูปภาพ">
        <Field label="รูปหลัก (URL)">
          <input
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="https://…"
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

        <div className="space-y-2 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              รูปภาพเพิ่มเติม{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({form.galleryUrls.length}/6)
              </span>
            </p>
            <button
              type="button"
              onClick={addGalleryUrl}
              disabled={form.galleryUrls.length >= 6}
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              เพิ่มรูป
            </button>
          </div>
          {form.galleryUrls.length === 0 && (
            <p className="rounded-md border border-dashed bg-gray-50 px-3 py-3 text-center text-xs text-muted-foreground">
              ยังไม่มีรูปเพิ่มเติม
            </p>
          )}
          {form.galleryUrls.map((url, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <input
                value={url}
                onChange={(e) => updateGalleryUrl(idx, e.target.value)}
                placeholder="https://…"
                className="flex-1 rounded-md border px-3 py-2 font-mono text-xs"
              />
              {url && /^https?:\/\//.test(url) && (
                <Image
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded border object-cover"
                  unoptimized
                />
              )}
              <button
                type="button"
                onClick={() => removeGalleryUrl(idx)}
                className="shrink-0 rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
                aria-label="ลบรูป"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Variants (physical only) ───────────────────────────── */}
      {form.productType !== "DIGITAL" && (
      <Section title="ตัวเลือกสินค้า (Variants)">
        <label className="flex items-center gap-3 pb-3">
          <input
            type="checkbox"
            checked={form.hasVariants}
            onChange={(e) => update("hasVariants", e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">
            <span className="font-medium">เปิดใช้ Variants</span> — เช่น ขนาด
            สี ราคาต่างกัน
          </span>
        </label>

        {form.hasVariants && (
          <div className="space-y-3">
            {form.variants.length === 0 && (
              <p className="rounded-md border border-dashed bg-gray-50 px-3 py-4 text-center text-xs text-muted-foreground">
                ยังไม่มี variant — กด &quot;เพิ่ม variant&quot; ด้านล่าง
              </p>
            )}
            {form.variants.map((v, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Variant #{idx + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="rounded-md border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
                    aria-label="ลบ variant"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="ขนาด (Size)">
                    <input
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(idx, "size", e.target.value)
                      }
                      placeholder="เช่น M, L, XL"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="สี (Color)">
                    <input
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(idx, "color", e.target.value)
                      }
                      placeholder="เช่น ดำ, ขาว, แดง"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="ราคา (฿)">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={v.priceTHB || ""}
                      onChange={(e) =>
                        updateVariant(
                          idx,
                          "priceTHB",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="SKU">
                    <input
                      value={v.sku}
                      onChange={(e) =>
                        updateVariant(idx, "sku", e.target.value)
                      }
                      placeholder="(ไม่บังคับ)"
                      className="w-full rounded-md border px-3 py-2 font-mono text-xs"
                    />
                  </Field>
                  <Field label="สต็อก">
                    <input
                      type="number"
                      min="0"
                      value={v.inventory ?? ""}
                      onChange={(e) =>
                        updateVariant(
                          idx,
                          "inventory",
                          e.target.value ? parseInt(e.target.value, 10) : null,
                        )
                      }
                      placeholder="(ว่าง = ไม่จำกัด)"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="รูป variant (URL)">
                    <input
                      value={v.imageUrl}
                      onChange={(e) =>
                        updateVariant(idx, "imageUrl", e.target.value)
                      }
                      placeholder="https://… (ใช้รูปหลักถ้าเว้นว่าง)"
                      className="w-full rounded-md border px-3 py-2 font-mono text-xs"
                    />
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-400 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่ม variant
            </button>
          </div>
        )}
      </Section>
      )}

      {/* ── Status ─────────────────────────────────────────────── */}
      <Section title="สถานะ">
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
      </Section>

      {/* ── Sticky bottom bar ──────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {mode === "edit" ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "กำลังลบ…" : "ลบสินค้านี้"}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">
              สินค้าจะถูกแสดงในหน้าร้านทันทีหลังบันทึก (ถ้า Active)
            </span>
          )}
          <button
            type="submit"
            disabled={saving || deleting}
            className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก…" : mode === "create" ? "สร้างสินค้า" : "บันทึก"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Layout helpers (lifted from admin/products/[id]/edit-form.tsx
 * pattern — kept inline so this file stands alone)
 * ───────────────────────────────────────────────────────────────── */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-5 space-y-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {hint && (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
      {children}
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
