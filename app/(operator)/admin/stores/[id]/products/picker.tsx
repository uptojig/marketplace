"use client";

/**
 * <ProductPicker /> — orchestrator for store product curation.
 *
 * Two tabs:
 *   - "สินค้าในร้าน": <LocalProductsTable /> with bulk soft-remove
 *   - "เพิ่มจาก CJ": <CjSearchPanel /> with category filter; staged
 *     items collect in <ImportQueue /> at the bottom and import in a
 *     single batch when the operator clicks "Import".
 *
 * Batching the imports (vs the old per-row click) keeps the CJ proxy
 * rate-limit happy and lets the operator browse 50 items, queue 20,
 * commit once. We still optimistically update the local list on each
 * successful import so the in-store tab is accurate without a refresh.
 */

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalProductsTable, type LocalProduct } from "./_local-table";
import { CjSearchPanel, type SearchResult } from "./_cj-search";
import { ImportQueue, type ImportProgress } from "./_import-queue";

interface Props {
  storeId: string;
  storeSlug: string;
  initialProducts: LocalProduct[];
}

const TARGET_COUNT = 50;

/**
 * Walk the queue serially, POSTing each item to the import endpoint.
 * Serial (not parallel) because the upstream CJ proxy is rate-limited
 * at ~1 req/sec. Caller drives progress + final state via `onTick`.
 */
async function importQueueSerially(
  storeId: string,
  queue: SearchResult[],
  onTick: (
    item: SearchResult,
    result:
      | { ok: true; product: LocalProduct }
      | { ok: false; error: string },
  ) => void,
) {
  for (const r of queue) {
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
        priceTHB?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        onTick(r, { ok: false, error: data.error ?? `HTTP ${res.status}` });
        continue;
      }
      onTick(r, {
        ok: true,
        product: {
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
        },
      });
    } catch (err) {
      onTick(r, {
        ok: false,
        error: err instanceof Error ? err.message : "network error",
      });
    }
  }
}

export function ProductPicker({ storeId, storeSlug, initialProducts }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<LocalProduct[]>(initialProducts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, startRemoving] = useTransition();
  const [tab, setTab] = useState<"local" | "cj">("local");

  const [queue, setQueue] = useState<SearchResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const activeCount = useMemo(
    () => products.filter((p) => p.active).length,
    [products],
  );
  const importedExternalIds = useMemo(
    () =>
      new Set(
        products.filter((p) => p.active).map((p) => p.externalProductId),
      ),
    [products],
  );
  const stagedExternalIds = useMemo(
    () => new Set(queue.map((r) => r.externalProductId)),
    [queue],
  );

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const allChecked = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
      return next;
    });
  }, []);

  const stage = useCallback((item: SearchResult) => {
    setQueue((prev) =>
      prev.some((r) => r.externalProductId === item.externalProductId)
        ? prev
        : [...prev, item],
    );
  }, []);
  const unstage = useCallback((extId: string) => {
    setQueue((prev) => prev.filter((r) => r.externalProductId !== extId));
  }, []);
  const clearQueue = useCallback(() => setQueue([]), []);

  async function runImport() {
    if (queue.length === 0 || importing) return;
    setImporting(true);
    setProgress({ done: 0, total: queue.length, lastError: null, success: 0, failed: 0 });
    setToast(null);

    const importedNow: LocalProduct[] = [];
    const failedIds: string[] = [];

    await importQueueSerially(storeId, queue, (item, result) => {
      if (result.ok) {
        importedNow.push(result.product);
        setProgress((p) => p && { ...p, done: p.done + 1, success: p.success + 1 });
      } else {
        failedIds.push(item.externalProductId);
        setProgress((p) =>
          p && { ...p, done: p.done + 1, failed: p.failed + 1, lastError: result.error },
        );
      }
    });

    if (importedNow.length > 0) {
      setProducts((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        for (const row of importedNow) byId.set(row.id, { ...byId.get(row.id), ...row });
        return Array.from(byId.values());
      });
    }
    setQueue((prev) => prev.filter((r) => failedIds.includes(r.externalProductId)));

    setImporting(false);
    setToast({
      ok: failedIds.length === 0,
      text:
        failedIds.length === 0
          ? `Import สำเร็จ ${importedNow.length} รายการ`
          : `Import เสร็จ: สำเร็จ ${importedNow.length} / ล้มเหลว ${failedIds.length}`,
    });
    router.refresh();
  }

  function handleRemove() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (!confirm(`เอาออก ${ids.length} สินค้า? — จะถูก deactivate (ยังเก็บประวัติ order ไว้)`)) {
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
        setSelected(new Set());
        setToast({ ok: true, text: `เอาออก ${data.softDeleted ?? ids.length} สินค้า` });
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
      <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 text-sm">
        <div>
          <span className="text-lg font-semibold">{activeCount}</span>
          <span className="ml-1 text-muted-foreground">/ {TARGET_COUNT} ตัวเป้าหมาย</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {activeCount < TARGET_COUNT
              ? `ขาดอีก ${TARGET_COUNT - activeCount} ตัว`
              : activeCount === TARGET_COUNT
                ? "ถึงเป้าแล้ว"
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
          role="status"
          className={`rounded-md border px-3 py-2 text-sm ${
            toast.ok
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {toast.text}
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as "local" | "cj")} className="space-y-3">
        <TabsList className="w-fit">
          <TabsTrigger value="local">
            <Package />
            สินค้าในร้าน
            <Badge variant="secondary" className="ml-1">{activeCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cj">
            <ShoppingBag />
            เพิ่มจาก CJ
            {queue.length > 0 && (
              <Badge variant="default" className="ml-1">{queue.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local">
          <LocalProductsTable
            products={products}
            storeSlug={storeSlug}
            selected={selected}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            onRemove={handleRemove}
            removing={removing}
          />
        </TabsContent>

        <TabsContent value="cj">
          <CjSearchPanel
            importedExternalIds={importedExternalIds}
            stagedExternalIds={stagedExternalIds}
            onStage={stage}
            onUnstage={unstage}
          />
        </TabsContent>
      </Tabs>

      <ImportQueue
        items={queue}
        importing={importing}
        progress={progress}
        onRemove={unstage}
        onClear={clearQueue}
        onImport={runImport}
      />
    </div>
  );
}
