"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTHB } from "@/lib/utils";

interface CatalogItem {
  externalProductId: string;
  title: string;
  description?: string;
  priceTHB: number;
  imageUrl?: string;
  raw?: unknown;
}

interface CatalogResponse {
  supplier: string;
  items: CatalogItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  error?: string;
}

interface CategoriesResponse {
  supplier: string;
  categories?: Array<{ id: string; name: string; count?: number }>;
  error?: string;
}

const SUPPLIERS = ["CJ", "ALIEXPRESS"] as const;
type SupplierName = (typeof SUPPLIERS)[number];

export default function CatalogPage() {
  const [supplier, setSupplier] = useState<SupplierName>("CJ");

  // Filter form state (what the user is editing)
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [importLimit, setImportLimit] = useState<number>(20);

  // Applied filters (what's actually in the API call)
  const [applied, setApplied] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    pageSize: 20,
  });
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Record<string, CatalogItem>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Categories for the active supplier
  const categoriesQ = useQuery<CategoriesResponse>({
    queryKey: ["catalog-categories", supplier],
    queryFn: async () => {
      const res = await fetch(`/api/suppliers/categories?supplier=${supplier}`);
      const json = (await res.json()) as CategoriesResponse;
      if (!res.ok) throw new Error(json.error ?? `Categories failed (${res.status})`);
      return json;
    },
    retry: false,
  });

  const queryKey = useMemo(
    () => ["catalog", supplier, applied, page] as const,
    [supplier, applied, page],
  );

  const catalogQ = useQuery({
    queryKey,
    queryFn: async (): Promise<CatalogResponse> => {
      const params = new URLSearchParams({
        supplier,
        page: String(page),
        pageSize: String(applied.pageSize),
      });
      if (applied.search) params.set("q", applied.search);
      if (applied.category) params.set("category", applied.category);
      if (applied.minPrice) params.set("minPrice", applied.minPrice);
      if (applied.maxPrice) params.set("maxPrice", applied.maxPrice);
      const res = await fetch(`/api/suppliers/catalog?${params.toString()}`);
      const json = (await res.json()) as CatalogResponse;
      if (!res.ok) throw new Error(json.error ?? `Catalog request failed (${res.status})`);
      return json;
    },
    retry: false,
  });

  // Reset page + selection when filters or supplier change
  useEffect(() => {
    setPage(1);
    setSelected({});
  }, [applied, supplier]);

  function applyFilters(autoSelectAll: boolean) {
    const limit = Math.min(100, Math.max(1, Math.floor(Number(importLimit) || 20)));
    setApplied({
      search: search.trim(),
      category,
      minPrice,
      maxPrice,
      pageSize: limit,
    });
    if (autoSelectAll) {
      // Defer until next tick so the new query result is available
      setTimeout(() => {
        setSelected((prev) => {
          const next = { ...prev };
          (catalogQ.data?.items ?? []).forEach((it) => {
            next[it.externalProductId] = it;
          });
          return next;
        });
      }, 0);
    }
  }

  function autoFill() {
    // Apply current filters + select all returned items in one click
    applyFilters(false);
    // Re-fetch and then select all items from the new response.
    setTimeout(async () => {
      const params = new URLSearchParams({
        supplier,
        page: "1",
        pageSize: String(Math.min(100, Math.max(1, Math.floor(Number(importLimit) || 20)))),
      });
      if (search.trim()) params.set("q", search.trim());
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      const res = await fetch(`/api/suppliers/catalog?${params.toString()}`);
      if (!res.ok) return;
      const json = (await res.json()) as CatalogResponse;
      const next: Record<string, CatalogItem> = {};
      json.items.forEach((it) => {
        next[it.externalProductId] = it;
      });
      setSelected(next);
    }, 50);
  }

  function toggle(item: CatalogItem) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.externalProductId]) delete next[item.externalProductId];
      else next[item.externalProductId] = item;
      return next;
    });
  }

  async function addSelected() {
    const items = Object.values(selected);
    if (!items.length) return;
    setSaving(true);
    setSaveError(null);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "save",
          items: items.map((it) => ({
            url: `${supplier}:${it.externalProductId}`,
            externalProductId: it.externalProductId,
            title: it.title,
            description: it.description,
            priceTHB: it.priceTHB,
            imageUrl: it.imageUrl,
            supplier,
            raw: it.raw,
          })),
        }),
      });
      const data = (await res.json()) as { saved?: number; error?: string };
      if (!res.ok || data.saved === undefined) {
        throw new Error(data.error ?? `Save failed (${res.status})`);
      }
      setSavedMsg(`Added ${data.saved} product(s) to your store.`);
      setSelected({});
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const selectedCount = Object.keys(selected).length;
  const data = catalogQ.data;
  const isLoading = catalogQ.isLoading;
  const isError = catalogQ.isError;
  const error = catalogQ.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">เลือกสินค้าจากซัพพลายเออร์</h1>
        <p className="text-sm text-muted-foreground">
          เลือกหมวดหมู่ + ช่วงราคา + จำนวน → กด <strong>เลือกอัตโนมัติ</strong> เพื่อให้ระบบเลือกให้
          หรือ <strong>ใช้ตัวกรอง</strong> เพื่อค้นแล้วติ๊กเอง
        </p>
      </div>

      {/* Supplier tabs */}
      <div className="flex rounded-md border w-fit">
        {SUPPLIERS.map((s) => (
          <button
            key={s}
            onClick={() => setSupplier(s)}
            className={`px-3 py-1.5 text-sm transition ${
              supplier === s ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="space-y-1 text-xs">
          <span className="font-medium text-muted-foreground">คำค้นหา</span>
          <Input
            placeholder="ชื่อหรือรหัสสินค้า…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-xs">
          <span className="font-medium text-muted-foreground">หมวดหมู่</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
            disabled={categoriesQ.isLoading || categoriesQ.isError}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categoriesQ.data?.categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.count !== undefined ? ` (${c.count})` : ""}
              </option>
            ))}
          </select>
          {categoriesQ.isError && (
            <span className="text-[10px] text-destructive">
              {categoriesQ.error instanceof Error
                ? categoriesQ.error.message.slice(0, 80)
                : "โหลดหมวดหมู่ไม่สำเร็จ"}
            </span>
          )}
        </label>

        <label className="space-y-1 text-xs">
          <span className="font-medium text-muted-foreground">ราคาขั้นต่ำ (฿)</span>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-xs">
          <span className="font-medium text-muted-foreground">ราคาสูงสุด (฿)</span>
          <Input
            type="number"
            min={0}
            placeholder="ไม่จำกัด"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-xs">
          <span className="font-medium text-muted-foreground">จำนวนที่จะดึง</span>
          <Input
            type="number"
            min={1}
            max={100}
            value={importLimit}
            onChange={(e) => setImportLimit(parseInt(e.target.value, 10) || 1)}
          />
        </label>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <Button onClick={() => applyFilters(false)} variant="outline">
            ใช้ตัวกรอง
          </Button>
          <Button onClick={autoFill}>เลือกอัตโนมัติ {importLimit} ชิ้น</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setCategory("");
              setMinPrice("");
              setMaxPrice("");
              setImportLimit(20);
              setApplied({ search: "", category: "", minPrice: "", maxPrice: "", pageSize: 20 });
            }}
          >
            รีเซ็ต
          </Button>
        </div>
      </div>

      {isError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <div className="font-medium text-destructive">โหลดสินค้าจาก {supplier} ไม่สำเร็จ</div>
          <div className="mt-1 text-muted-foreground">
            {error instanceof Error ? error.message : "ไม่ทราบสาเหตุ"}
          </div>
          {supplier === "ALIEXPRESS" && (
            <div className="mt-2 text-xs text-muted-foreground">
              AliExpress ต้องผ่าน OAuth ก่อนถึงจะเรียก API ได้ — ตอนนี้ใช้ <strong>CJ</strong> ไปก่อนครับ
            </div>
          )}
          <Button size="sm" variant="outline" className="mt-3" onClick={() => catalogQ.refetch()}>
            ลองใหม่
          </Button>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</p>}

      {data && data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((it) => {
            const checked = !!selected[it.externalProductId];
            return (
              <button
                key={it.externalProductId}
                type="button"
                onClick={() => toggle(it)}
                className={`group flex flex-col overflow-hidden rounded-lg border text-left transition ${
                  checked ? "ring-2 ring-primary" : "hover:shadow"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                  ) : null}
                  <div
                    className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                      checked ? "bg-primary text-primary-foreground" : "bg-background"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <div className="line-clamp-2 text-sm font-medium">{it.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{it.externalProductId}</div>
                  <div className="mt-auto pt-2 text-sm font-semibold">{formatTHB(it.priceTHB)}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">ไม่พบสินค้าที่ตรงกับตัวกรอง</p>
      )}

      {data && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            หน้า {data.page} · แสดง {data.items.length} จาก {data.total} รายการ
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ก่อนหน้า
            </Button>
            <Button size="sm" variant="outline" disabled={!data.hasMore} onClick={() => setPage((p) => p + 1)}>
              ถัดไป
            </Button>
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-lg border bg-background p-4 shadow-lg">
          <div className="text-sm">
            เลือกแล้ว <strong>{selectedCount}</strong> ชิ้น ·{" "}
            {formatTHB(Object.values(selected).reduce((a, b) => a + b.priceTHB, 0))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setSelected({})}>
              ล้าง
            </Button>
            <Button onClick={addSelected} disabled={saving}>
              {saving ? "กำลังเพิ่ม…" : `เพิ่ม ${selectedCount} ชิ้นเข้าร้าน`}
            </Button>
          </div>
        </div>
      )}

      {savedMsg && <p className="text-sm text-green-600">{savedMsg}</p>}
      {saveError && <p className="text-sm text-destructive">{saveError}</p>}
    </div>
  );
}
