"use client";

/**
 * <CjSearchPanel /> — CJ catalog search/browse with batch staging.
 *
 * Compared to the old right-column UI this panel:
 *   - replaces single-click import with a *staging* model — items added
 *     to the review queue are committed in a batch by <ImportQueue />
 *   - uses <CategoryQuickFilter /> (Command-style popover) for category
 *   - swaps the `<select>` for a sticky toolbar so search + filter +
 *     pagination always stay in view above the result grid
 *
 * The component is intentionally dumb about persistence — its parent
 * owns the staged-set + already-imported-set and renders the queue.
 */

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatTHB } from "@/lib/utils";
import { CategoryQuickFilter, type Category } from "./_quick-filters";

export interface SearchResult {
  externalProductId: string;
  title: string;
  titleTh?: string;
  priceTHB: number;
  imageUrl?: string;
  categoryName?: string;
}

interface Props {
  /** Set of externalProductId values that are already active in the store. */
  importedExternalIds: Set<string>;
  /** Set of externalProductId values staged in the review queue. */
  stagedExternalIds: Set<string>;
  onStage: (item: SearchResult) => void;
  onUnstage: (externalProductId: string) => void;
}

const PAGE_SIZE = 50;

export function CjSearchPanel({
  importedExternalIds,
  stagedExternalIds,
  onStage,
  onUnstage,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [browseMode, setBrowseMode] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Initial: fetch categories + auto-browse so the panel never shows
  // an empty state on first render.
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    fetch("/api/products/categories")
      .then((r) => r.json())
      .then((data: { categories?: Category[] }) => {
        if (!cancelled && Array.isArray(data?.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        /* swallow */
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Trigger browse-all on mount so operators see CJ catalog immediately.
  useEffect(() => {
    void fetchPage({ q: "", page: 1, browse: true, category: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPage(opts: {
    q: string;
    page: number;
    browse: boolean;
    category?: string;
  }) {
    setSearching(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams();
      if (opts.q) params.set("q", opts.q);
      const cat = opts.category ?? categoryId;
      if (cat) params.set("category", cat);
      params.set("page", String(opts.page));
      params.set("limit", String(PAGE_SIZE));
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
      await fetchPage({ q: "", page: 1, browse: true });
      return;
    }
    await fetchPage({ q, page: 1, browse: false });
  }

  async function selectCategory(newCategoryId: string) {
    setCategoryId(newCategoryId);
    await fetchPage({
      q: browseMode ? "" : query.trim(),
      page: 1,
      browse: browseMode || !query.trim(),
      category: newCategoryId,
    });
  }

  async function nextPage() {
    if (!hasMore || searching) return;
    await fetchPage({
      q: browseMode ? "" : query.trim(),
      page: page + 1,
      browse: browseMode,
    });
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  return (
    <div className="space-y-3">
      {/* Toolbar: search + category filter — sticky so it stays visible
          while the operator scrolls the result grid */}
      <div className="sticky top-0 z-10 -mx-1 space-y-2 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <form onSubmit={runSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาคำ (เว้นว่าง = ดูทั้งหมด)"
              className="pl-8"
              disabled={searching}
            />
          </div>
          <Button type="submit" size="sm" disabled={searching}>
            {searching ? <Loader2 className="animate-spin" /> : <Search />}
            ค้นหา
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery("");
              void fetchPage({ q: "", page: 1, browse: true });
            }}
            disabled={searching}
            title="ดูสินค้าทั้งหมดจาก CJ"
          >
            ดูทั้งหมด
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryQuickFilter
            categories={categories}
            value={categoryId}
            onChange={selectCategory}
            loading={categoriesLoading}
            disabled={searching}
          />
          {results.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {browseMode ? "ดูทั้งหมด" : `ผลค้นหา "${query}"`} ·
              หน้า {page}/{totalPages} ·
              {total.toLocaleString("th-TH")} ตัว
            </span>
          )}
        </div>
      </div>

      {searchError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {searchError}
        </div>
      )}

      <div
        id="cj-results-top"
        className="overflow-hidden rounded-lg border bg-background"
      >
        {results.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {searching ? "กำลังโหลด..." : "ไม่มีผลลัพธ์"}
          </div>
        ) : (
          <ul className="divide-y">
            {results.map((r) => {
              const alreadyIn = importedExternalIds.has(r.externalProductId);
              const staged = stagedExternalIds.has(r.externalProductId);
              return (
                <li
                  key={r.externalProductId}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 transition-colors",
                    staged && "bg-amber-50/60",
                    alreadyIn && "bg-emerald-50/40",
                  )}
                >
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="h-12 w-12 rounded object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      CJ · {formatTHB(r.priceTHB)}
                      {r.categoryName && ` · ${r.categoryName}`}
                    </p>
                  </div>
                  {alreadyIn ? (
                    <Badge
                      variant="secondary"
                      className="border border-emerald-300 bg-emerald-50 text-emerald-700"
                    >
                      <Check />
                      มีในร้าน
                    </Badge>
                  ) : staged ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onUnstage(r.externalProductId)}
                      className="border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    >
                      <Check />
                      อยู่ในคิว · ยกเลิก
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onStage(r)}
                    >
                      <Plus />
                      เพิ่มเข้าคิว
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={prevPage}
            disabled={page <= 1 || searching}
          >
            ← ก่อนหน้า
          </Button>
          <span className="text-muted-foreground">
            หน้า {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={nextPage}
            disabled={!hasMore || searching}
          >
            ถัดไป →
          </Button>
        </div>
      )}
    </div>
  );
}
