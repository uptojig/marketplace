"use client";

/**
 * <ProductPicker /> — client-side store product curation.
 *
 * Two columns:
 *   - LEFT  "สินค้าในร้าน": every Product row scoped to this store, with
 *           checkbox + bulk soft-remove + per-row preview link.
 *   - RIGHT "ค้นหาจาก CJ": calls /api/products/search (existing CJ proxy),
 *           displays results with an "เพิ่ม" button per row that POSTs
 *           to /api/admin/stores/[id]/products/import.
 *
 * Imports are idempotent on the server side: re-clicking "เพิ่ม" for a
 * product the operator previously soft-deleted reactivates it. We
 * reflect that here via the `imported` flag on each search result so
 * the operator can see "✓ มีในร้านแล้ว" and avoid duplicate clicks.
 *
 * Counter at the top shows current active-product count vs the
 * 50-target so operators have a clear north star.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Search, Trash2, Eye } from "lucide-react";

interface LocalProduct {
  id: string;
  title: string;
  titleTh: string | null;
  priceTHB: number;
  imageUrl: string | null;
  supplier: "CJ" | "ALIEXPRESS" | "MOCK";
  externalProductId: string;
  categoryName: string | null;
  active: boolean;
  hasVariants: boolean;
}

interface SearchResult {
  externalProductId: string;
  title: string;
  titleTh?: string;
  priceTHB: number;
  imageUrl?: string;
  categoryName?: string;
}

interface Props {
  storeId: string;
  storeSlug: string;
  initialProducts: LocalProduct[];
}

const TARGET_COUNT = 50;

function formatTHB(n: number): string {
  return `฿${n.toLocaleString("th-TH")}`;
}

export function ProductPicker({ storeId, storeSlug, initialProducts }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<LocalProduct[]>(initialProducts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, startRemoving] = useTransition();

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Pagination state for the CJ catalog browser. We page in 50s (CJ's
  // hard cap per request) and let the operator click "ถัดไป" to keep
  // grazing — no infinite scroll because each request hits CJ which
  // is rate-limited at ~1 req/sec.
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [browseMode, setBrowseMode] = useState(false);
  // Per-result transient state ("importing" / "imported" / error msg).
  // Keyed by externalProductId since search doesn't give us a row id.
  const [importState, setImportState] = useState<
    Record<string, "idle" | "importing" | "imported" | string>
  >({});
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const activeCount = useMemo(
    () => products.filter((p) => p.active).length,
    [products],
  );
  const importedExternalIds = useMemo(
    () => new Set(products.filter((p) => p.active).map((p) => p.externalProductId)),
    [products],
  );

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function fetchPage(opts: { q: string; page: number; browse: boolean }) {
    setSearching(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams();
      if (opts.q) params.set("q", opts.q);
      params.set("page", String(opts.page));
      params.set("limit", String(pageSize));
      const res = await fetch(`/api/products/search?${params.toString()}`);
      const data = (await res.json()) as
        | {
            products: SearchResult[];
            page: number;
            pageSize: number;
            total: number;
            hasMore: boolean;
          }
        | { error: string; detail?: string };
      if (!res.ok || "error" in data) {
        setSearchError(("error" in data && data.error) || `HTTP ${res.status}`);
        setResults([]);
        setHasMore(false);
        setTotal(0);
        return;
      }
      setResults(data.products);
      setPage(data.page);
      setHasMore(data.hasMore);
      setTotal(data.total);
      setBrowseMode(opts.browse);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "search failed");
    } finally {
      setSearching(false);
    }
  }

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) {
      // Empty query → switch to browse mode and grab CJ's default
      // popular catalog so the operator isn't forced to type a
      // keyword before seeing anything.
      await fetchPage({ q: "", page: 1, browse: true });
      return;
    }
    await fetchPage({ q, page: 1, browse: false });
  }

  async function browseAll() {
    setQuery("");
    await fetchPage({ q: "", page: 1, browse: true });
  }

  async function nextPage() {
    if (!hasMore || searching) return;
    await fetchPage({
      q: browseMode ? "" : query.trim(),
      page: page + 1,
      browse: browseMode,
    });
    // Scroll the results panel back to top so the operator sees the
    // new batch from row 1 instead of mid-list.
    document
      .getElementById("cj-results-top")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function prevPage() {
    if (page <= 1 || searching) return;
    await fetchPage({
      q: browseMode ? "" : query.trim(),
      page: page - 1,
      browse: browseMode,
    });
    document
      .getElementById("cj-results-top")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleImport(r: SearchResult) {
    const key = r.externalProductId;
    setImportState((s) => ({ ...s, [key]: "importing" }));
    setToast(null);
    try {
      const res = await fetch(
        `/api/admin/stores/${storeId}/products/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplier: "CJ",
            externalProductId: r.externalProductId,
          }),
        },
      );
      const data = (await res.json()) as {
        ok?: boolean;
        productId?: string;
        reactivated?: boolean;
        priceTHB?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        const msg = data.error ?? `HTTP ${res.status}`;
        setImportState((s) => ({ ...s, [key]: msg }));
        setToast({ ok: false, text: `เพิ่มไม่ได้: ${msg}` });
        return;
      }
      setImportState((s) => ({ ...s, [key]: "imported" }));
      // Optimistic add — server is source of truth, but reflecting
      // the new row right away avoids a full router.refresh() on
      // every single click.
      const newRow: LocalProduct = {
        id: data.productId!,
        title: r.title,
        titleTh: r.titleTh ?? null,
        priceTHB: data.priceTHB ?? r.priceTHB,
        imageUrl: r.imageUrl ?? null,
        supplier: "CJ",
        externalProductId: r.externalProductId,
        categoryName: r.categoryName ?? null,
        active: true,
        hasVariants: false,
      };
      setProducts((prev) => {
        // Replace if exists (reactivation), else prepend.
        const i = prev.findIndex((p) => p.id === newRow.id);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = { ...prev[i], ...newRow };
          return copy;
        }
        return [newRow, ...prev];
      });
      setToast({
        ok: true,
        text: data.reactivated ? "เปิดใช้งานสินค้าเดิมแล้ว" : "เพิ่มเข้าร้านแล้ว",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      setImportState((s) => ({ ...s, [key]: msg }));
      setToast({ ok: false, text: `เพิ่มไม่ได้: ${msg}` });
    }
  }

  function handleRemove() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (
      !confirm(
        `เอาออก ${ids.length} สินค้า? — สินค้าจะถูก deactivate (ยังเก็บประวัติ order ไว้)`,
      )
    ) {
      return;
    }
    startRemoving(async () => {
      try {
        const res = await fetch(`/api/admin/stores/${storeId}/products`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        const data = (await res.json()) as { ok?: boolean; softDeleted?: number; error?: unknown };
        if (!res.ok || !data.ok) {
          setToast({ ok: false, text: `ลบไม่ได้: ${JSON.stringify(data.error)}` });
          return;
        }
        setProducts((prev) =>
          prev.map((p) => (selected.has(p.id) ? { ...p, active: false } : p)),
        );
        clearSelection();
        setToast({ ok: true, text: `เอาออก ${data.softDeleted ?? ids.length} สินค้า` });
        // Refresh server data eventually so a hard reload reflects it.
        router.refresh();
      } catch (err) {
        setToast({
          ok: false,
          text: err instanceof Error ? err.message : "network error",
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm">
        <div>
          <span className="font-semibold">{activeCount}</span> /{" "}
          <span className="text-muted-foreground">{TARGET_COUNT} ตัวเป้าหมาย</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {activeCount < TARGET_COUNT
              ? `ขาดอีก ${TARGET_COUNT - activeCount} ตัว`
              : activeCount === TARGET_COUNT
                ? "ถึงเป้าแล้ว 🎉"
                : `เกินเป้า ${activeCount - TARGET_COUNT} ตัว`}
          </span>
        </div>
        <Link
          href={`/admin/stores/${storeId}`}
          className="text-xs text-blue-600 hover:underline"
        >
          → กลับไป Regenerate Landing Page
        </Link>
      </div>

      {toast && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            toast.ok
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: existing in-store products */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">สินค้าในร้าน ({activeCount})</h2>
            {selected.size > 0 && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {removing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                เอาออก ({selected.size})
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border bg-white">
            {products.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                ยังไม่มีสินค้าในร้าน — ค้นหาจาก CJ ทางด้านขวาเพื่อเพิ่ม
              </div>
            ) : (
              <ul className="divide-y">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2 ${
                      p.active ? "" : "bg-gray-50 opacity-60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelected(p.id)}
                      disabled={!p.active}
                      className="h-4 w-4"
                    />
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.titleTh ?? p.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-200" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium">
                        {p.titleTh ?? p.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.supplier} · {formatTHB(p.priceTHB)}
                        {!p.active && <span className="ml-2 text-red-600">เอาออกแล้ว</span>}
                      </p>
                    </div>
                    <Link
                      href={`/stores/${storeSlug}/products/${p.id}`}
                      target="_blank"
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="ดู"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* RIGHT: CJ search */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">เลือกจาก CJ Dropshipping</h2>
            {results.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {browseMode ? "ดูสินค้าทั้งหมด" : `ผลค้นหา "${query}"`} ·
                หน้า {page} · ทั้งหมด {total.toLocaleString("th-TH")} ตัว
              </span>
            )}
          </div>

          <form
            onSubmit={runSearch}
            className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2"
          >
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาคำ (เว้นว่าง = ดูทั้งหมด)"
              className="flex-1 bg-transparent text-sm focus:outline-none"
              disabled={searching}
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : "ค้นหา"}
            </button>
            <button
              type="button"
              onClick={browseAll}
              disabled={searching}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-60"
              title="ดูสินค้าทั้งหมดจาก CJ — pagination ทีละ 50 ตัว"
            >
              📦 ดูทั้งหมด
            </button>
          </form>

          {searchError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
              {searchError}
            </div>
          )}

          <div id="cj-results-top" className="overflow-hidden rounded-lg border bg-white">
            {results.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                {searching
                  ? "กำลังค้นหา..."
                  : "ค้นหาคำ หรือกด \"📦 ดูทั้งหมด\" เพื่อ browse ทีละ 50 ตัวจาก CJ"}
              </div>
            ) : (
              <ul className="divide-y">
                {results.map((r) => {
                  const state = importState[r.externalProductId] ?? "idle";
                  const alreadyIn =
                    state === "imported" ||
                    importedExternalIds.has(r.externalProductId);
                  const busy = state === "importing";
                  const errorMsg =
                    state !== "idle" &&
                    state !== "importing" &&
                    state !== "imported"
                      ? state
                      : null;
                  return (
                    <li
                      key={r.externalProductId}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-medium">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          CJ · {formatTHB(r.priceTHB)}
                          {r.categoryName && ` · ${r.categoryName}`}
                        </p>
                        {errorMsg && (
                          <p className="text-[11px] text-red-600">{errorMsg}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={busy || alreadyIn}
                        onClick={() => handleImport(r)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium ${
                          alreadyIn
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        } disabled:opacity-60`}
                      >
                        {busy ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : alreadyIn ? (
                          "✓ มีในร้าน"
                        ) : (
                          <>
                            <Plus className="h-3 w-3" /> เพิ่ม
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {results.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-xs">
              <button
                type="button"
                onClick={prevPage}
                disabled={page <= 1 || searching}
                className="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← ก่อนหน้า
              </button>
              <span className="text-muted-foreground">
                หน้า {page} / {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasMore || searching}
                className="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ถัดไป →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
