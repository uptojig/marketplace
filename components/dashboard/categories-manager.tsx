"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ExternalLink,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

/* ─────────────────────────────────────────────────────────────────
 * CategoriesManager — single-screen control for vendor product
 * categories. Features:
 *
 *   1. List existing categories (banner thumb, name, slug, count)
 *   2. Create / rename / re-slug / re-banner / delete a Category
 *   3. Bulk-assign N selected products to one Category in one click
 *      (or detach them by selecting "ไม่ระบุหมวด").
 *
 * Three panes stacked top-to-bottom:
 *   A. Category list + edit drawer
 *   B. "เพิ่มหมวดหมู่ใหม่" inline form
 *   C. Product table with checkboxes + bulk action bar
 *
 * All mutations hit /api/store/categories[*] and refresh server data
 * via router.refresh() so the page re-renders with fresh counts.
 * ───────────────────────────────────────────────────────────────── */

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
  sortOrder: number;
  productCount: number;
};

type ProductRow = {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  active: boolean;
  categoryId: string | null;
  categoryName: string | null;
};

type Toast = { type: "ok" | "err"; msg: string };

function slugify(input: string): string {
  // Slugs must be ASCII for clean URLs. Strip everything that isn't
  // a-z/0-9/space/hyphen, then collapse whitespace to a single dash.
  // Operator can manually override the slug if they want a romanized
  // Thai (e.g. "rongthao" for "รองเท้า").
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatTHB(n: number) {
  return `฿${n.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`;
}

export function CategoriesManager({
  storeSlug,
  categories: initialCategories,
  products: initialProducts,
}: {
  storeSlug: string;
  categories: Category[];
  products: ProductRow[];
}) {
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(),
  );
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [productSearch, setProductSearch] = useState("");
  const [bulkTarget, setBulkTarget] = useState<string>("");
  const [bulkBusy, setBulkBusy] = useState(false);

  // We never mutate this client-side; router.refresh() re-fetches
  // the server data after each mutation, which re-mounts the page
  // with the new props. Keep them as constants for clarity.
  const categories = initialCategories;
  const products = initialProducts;

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    let out = products;
    if (filterCategoryId === "uncategorized") {
      out = out.filter((p) => !p.categoryId);
    } else if (filterCategoryId !== "all") {
      out = out.filter((p) => p.categoryId === filterCategoryId);
    }
    if (productSearch.trim()) {
      const q = productSearch.trim().toLowerCase();
      out = out.filter((p) => p.title.toLowerCase().includes(q));
    }
    return out;
  }, [products, filterCategoryId, productSearch]);

  function showToast(t: Toast) {
    setToast(t);
    window.setTimeout(() => setToast(null), 4000);
  }

  /* ── Create category ─────────────────────────────────────────── */
  async function handleCreate(values: {
    name: string;
    slug: string;
    description: string;
    bannerUrl: string;
  }) {
    const res = await fetch("/api/store/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        slug: values.slug,
        description: values.description,
        bannerUrl: values.bannerUrl,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail =
        typeof data.error === "object"
          ? Object.values(data.error).flat().join(", ")
          : data.error;
      showToast({ type: "err", msg: detail || "สร้างหมวดหมู่ไม่สำเร็จ" });
      return false;
    }
    showToast({ type: "ok", msg: "สร้างหมวดหมู่แล้ว" });
    setCreating(false);
    router.refresh();
    return true;
  }

  /* ── Update category ─────────────────────────────────────────── */
  async function handleUpdate(id: string, values: Partial<Category>) {
    const res = await fetch(`/api/store/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail =
        typeof data.error === "object"
          ? Object.values(data.error).flat().join(", ")
          : data.error;
      showToast({ type: "err", msg: detail || "อัปเดตไม่สำเร็จ" });
      return false;
    }
    showToast({ type: "ok", msg: "บันทึกแล้ว" });
    setEditingId(null);
    router.refresh();
    return true;
  }

  /* ── Delete category ─────────────────────────────────────────── */
  async function handleDelete(id: string) {
    const cat = categoryById.get(id);
    const productCount = cat?.productCount ?? 0;
    const confirmMsg =
      productCount > 0
        ? `ลบหมวด "${cat?.name}"? สินค้า ${productCount} รายการในหมวดนี้จะถูกย้ายไปอยู่ใน "ไม่ระบุหมวด"`
        : `ลบหมวด "${cat?.name}"?`;
    if (!window.confirm(confirmMsg)) return;
    const res = await fetch(`/api/store/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showToast({ type: "err", msg: "ลบไม่สำเร็จ" });
      return;
    }
    showToast({ type: "ok", msg: "ลบหมวดหมู่แล้ว" });
    router.refresh();
  }

  /* ── Bulk assign ─────────────────────────────────────────────── */
  async function handleBulkAssign() {
    if (selectedProductIds.size === 0) return;
    if (!bulkTarget) {
      showToast({ type: "err", msg: "เลือกหมวดหมู่ปลายทางก่อน" });
      return;
    }
    setBulkBusy(true);
    const categoryId = bulkTarget === "__none__" ? null : bulkTarget;
    const res = await fetch("/api/store/categories/bulk-assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productIds: Array.from(selectedProductIds),
        categoryId,
      }),
    });
    setBulkBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast({
        type: "err",
        msg: typeof data.error === "string" ? data.error : "ดำเนินการไม่สำเร็จ",
      });
      return;
    }
    const data = (await res.json()) as { ok: true; count: number };
    showToast({
      type: "ok",
      msg:
        categoryId === null
          ? `ย้ายออกจากหมวดหมู่ ${data.count} รายการ`
          : `จัดเข้าหมวด ${data.count} รายการ`,
    });
    setSelectedProductIds(new Set());
    setBulkTarget("");
    router.refresh();
  }

  function toggleAllVisible() {
    const visibleIds = filteredProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedProductIds.has(id));
    const next = new Set(selectedProductIds);
    if (allSelected) {
      visibleIds.forEach((id) => next.delete(id));
    } else {
      visibleIds.forEach((id) => next.add(id));
    }
    setSelectedProductIds(next);
  }

  function toggleOne(id: string) {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProductIds(next);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">หมวดหมู่สินค้า</h1>
          <p className="text-sm text-muted-foreground">
            สร้างหมวดหมู่เอง — ตั้งชื่อ ตั้ง URL อัปโหลดภาพแบนเนอร์
            แล้วจัดสินค้าเข้าหมวดแบบ bulk
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a
            href={`/stores/${storeSlug}/category`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent"
          >
            ดูหน้าร้าน
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มหมวดหมู่
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-md border px-4 py-2.5 text-sm ${
            toast.type === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Categories list ──────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">รายการหมวดหมู่</h2>
        {categories.length === 0 && !creating ? (
          <div className="rounded-lg border-2 border-dashed bg-gray-50 px-6 py-12 text-center">
            <h3 className="text-base font-medium text-gray-700">
              ยังไม่มีหมวดหมู่
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              เพิ่มหมวดหมู่แรกแล้วเริ่มจัดสินค้าได้ทันที
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่มหมวดหมู่แรก
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">แบนเนอร์</th>
                  <th className="px-4 py-3">ชื่อหมวด</th>
                  <th className="px-4 py-3">URL slug</th>
                  <th className="px-4 py-3 text-center">สินค้า</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {c.bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.bannerUrl}
                          alt={c.name}
                          className="h-12 w-24 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-24 items-center justify-center rounded-md border-2 border-dashed bg-gray-50 text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      {c.description && (
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                        /{c.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {c.productCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(c.id);
                            setCreating(false);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
                        >
                          <Pencil className="h-3 w-3" />
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Inline edit / create form ───────────────────────────── */}
        {creating && (
          <CategoryForm
            mode="create"
            initial={{
              name: "",
              slug: "",
              description: "",
              bannerUrl: "",
              sortOrder: 0,
            }}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        )}
        {editingId && (
          <CategoryForm
            mode="edit"
            initial={categoryById.get(editingId)!}
            onSubmit={(values) => handleUpdate(editingId, values)}
            onCancel={() => setEditingId(null)}
          />
        )}
      </section>

      {/* ── Bulk assign products ─────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">จัดสินค้าเข้าหมวดแบบ bulk</h2>
            <p className="text-sm text-muted-foreground">
              เลือกสินค้าหลายรายการแล้วจัดเข้าหมวดเดียวกันในคลิกเดียว
            </p>
          </div>
          {selectedProductIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-md border bg-amber-50 px-3 py-2 text-sm">
              <span className="font-medium">
                เลือก {selectedProductIds.size} รายการ
              </span>
              <select
                value={bulkTarget}
                onChange={(e) => setBulkTarget(e.target.value)}
                className="h-8 rounded-md border bg-white px-2 text-sm"
              >
                <option value="">— เลือกหมวดหมู่ปลายทาง —</option>
                <option value="__none__">ไม่ระบุหมวด (ย้ายออก)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkAssign}
                disabled={bulkBusy || !bulkTarget}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {bulkBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                จัดหมวด
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductIds(new Set())}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-xs hover:bg-accent"
              >
                <X className="h-3.5 w-3.5" />
                ยกเลิก
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-white p-2">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า..."
            className="h-9 flex-1 min-w-[180px] rounded-md border px-3 text-sm"
          />
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="h-9 rounded-md border bg-white px-2 text-sm"
          >
            <option value="all">หมวดทั้งหมด</option>
            <option value="uncategorized">ไม่ระบุหมวด</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.productCount})
              </option>
            ))}
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
            ไม่พบสินค้าตรงตามตัวกรอง
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        filteredProducts.every((p) =>
                          selectedProductIds.has(p.id),
                        )
                      }
                      onChange={toggleAllVisible}
                      aria-label="เลือกทั้งหมด"
                    />
                  </th>
                  <th className="px-4 py-3">สินค้า</th>
                  <th className="px-4 py-3">หมวดปัจจุบัน</th>
                  <th className="px-4 py-3 text-right">ราคา</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((p) => {
                  const checked = selectedProductIds.has(p.id);
                  const cat = p.categoryId
                    ? categoryById.get(p.categoryId)
                    : null;
                  return (
                    <tr
                      key={p.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        checked ? "bg-amber-50/50" : ""
                      }`}
                      onClick={() => toggleOne(p.id)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(p.id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`เลือก ${p.title}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="h-10 w-10 shrink-0 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 shrink-0 rounded-md border bg-gray-100" />
                          )}
                          <span className="line-clamp-1 font-medium text-gray-900">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cat ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                            {cat.name}
                          </span>
                        ) : p.categoryName ? (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                            {p.categoryName}{" "}
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              (legacy)
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatTHB(p.priceTHB)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            Hidden
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        URL ของหน้าหมวดในร้าน: <code className="rounded bg-gray-100 px-1.5 py-0.5">
          /stores/{storeSlug}/category/&lt;slug&gt;
        </code>{" "}
        — เปลี่ยน slug ได้ตลอด แต่อย่าลืมว่าลิงก์เก่าจะต้องเปลี่ยนตาม
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Inline create / edit form. Self-contained; the parent passes a
 * single onSubmit which handles success toasts + refresh.
 * ───────────────────────────────────────────────────────────────── */
function CategoryForm({
  mode,
  initial,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial: {
    name: string;
    slug: string;
    description: string;
    bannerUrl: string;
    sortOrder?: number;
  };
  onSubmit: (values: {
    name: string;
    slug: string;
    description: string;
    bannerUrl: string;
    sortOrder?: number;
  }) => Promise<boolean | void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description);
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl);
  const [sortOrder, setSortOrder] = useState(initial.sortOrder ?? 0);
  // While the operator hasn't edited the slug manually, mirror the
  // name field. As soon as they touch slug we stop the auto-fill so
  // we don't clobber their custom URL.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [busy, setBusy] = useState(false);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ name, slug, description, bannerUrl, sortOrder });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-lg border-2 border-primary/30 bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {mode === "create" ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 hover:bg-accent"
          aria-label="ปิด"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">ชื่อหมวดหมู่ *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="เช่น เสื้อยืด, รองเท้าผ้าใบ"
            maxLength={80}
            className="h-9 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">URL slug *</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">/category/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="t-shirts"
              pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
              maxLength={60}
              className="h-9 flex-1 rounded-md border px-3 font-mono text-sm"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น
          </p>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">คำอธิบายสั้น</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="โชว์ใต้แบนเนอร์ในหน้าหมวด (ไม่บังคับ)"
          rows={2}
          maxLength={500}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium">ภาพแบนเนอร์</span>
        <ImageUploadField
          value={bannerUrl}
          onChange={setBannerUrl}
          kind="category-banner"
          previewWidth={720}
          previewHeight={180}
          cover
        />
        <p className="text-xs text-muted-foreground">
          ขนาดที่แนะนำ 1440×360 px (อัตราส่วน 4:1) — แสดงเต็มความกว้างหน้าหมวด
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">ลำดับที่แสดงในเมนู</span>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(Math.max(0, parseInt(e.target.value, 10) || 0))
          }
          min={0}
          max={9999}
          className="h-9 w-32 rounded-md border px-3 text-sm"
        />
        <p className="text-xs text-muted-foreground">น้อย = ขึ้นก่อน</p>
      </label>

      <div className="flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-accent"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={busy || !name.trim() || !slug.trim()}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {mode === "create" ? "สร้างหมวดหมู่" : "บันทึก"}
        </button>
      </div>
    </form>
  );
}

