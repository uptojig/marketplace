"use client";

/**
 * <UrlPasteImport /> — extracted from the standalone
 * /dashboard/products/import page so we can also embed it as a tab
 * in /dashboard/store/products/new.
 *
 * Props:
 *   onSaved — same contract as CatalogPicker.onSaved.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatTHB } from "@/lib/utils";

interface Props {
  onSaved?: (savedCount: number) => void;
  /** Same admin-only override as CatalogPicker — see that file for
   *  the precedence rules. */
  storeIdOverride?: string;
}

interface Preview {
  url: string;
  ok: boolean;
  supplier: string;
  externalProductId?: string;
  title?: string;
  description?: string;
  priceTHB?: number;
  imageUrl?: string;
  raw?: unknown;
  error?: string;
}

interface Row extends Preview {
  selected: boolean;
}

export function UrlPasteImport({ onSaved, storeIdOverride }: Props = {}) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  function parseUrls(input: string): string[] {
    return Array.from(
      new Set(
        input
          .split(/\s|,/g)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    );
  }

  async function fetchPreviews() {
    const urls = parseUrls(text);
    if (!urls.length) {
      setError("Paste at least one URL or product ID, one per line.");
      return;
    }
    if (urls.length > 50) {
      setError("Maximum 50 URLs per batch.");
      return;
    }
    setLoading(true);
    setError(null);
    setSavedCount(null);
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "preview", urls }),
      });
      const data = (await res.json()) as { items?: Preview[]; error?: string };
      if (!res.ok || !data.items) throw new Error(data.error ?? `Preview failed (${res.status})`);
      setRows(data.items.map((it) => ({ ...it, selected: it.ok })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleRow(idx: number) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)));
  }

  function setAll(selected: boolean) {
    setRows((prev) => prev.map((r) => ({ ...r, selected: selected && r.ok })));
  }

  function updatePrice(idx: number, value: number) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, priceTHB: value } : r)));
  }

  async function saveSelected() {
    const items = rows
      .filter((r) => r.selected && r.ok)
      .map((r) => ({
        url: r.url,
        externalProductId: r.externalProductId!,
        title: r.title!,
        description: r.description,
        priceTHB: Number(r.priceTHB ?? 0),
        imageUrl: r.imageUrl,
        supplier: r.supplier as "CJ" | "ALIEXPRESS" | "MOCK",
        raw: r.raw,
      }));
    if (!items.length) {
      setError("Pick at least one row to save.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "save",
          ...(storeIdOverride ? { storeId: storeIdOverride } : {}),
          items,
        }),
      });
      const data = (await res.json()) as { saved?: number; error?: string };
      if (!res.ok || data.saved === undefined) {
        throw new Error(data.error ?? `Save failed (${res.status})`);
      }
      setSavedCount(data.saved);
      setRows((prev) => prev.filter((r) => !(r.selected && r.ok)));
      onSaved?.(data.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const successCount = rows.filter((r) => r.ok).length;
  const selectedCount = rows.filter((r) => r.selected && r.ok).length;
  const allSelected = successCount > 0 && selectedCount === successCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bulk import products</h1>
        <p className="text-sm text-muted-foreground">
          Paste up to 50 product URLs or supplier IDs (one per line). Supports AliExpress and CJ Dropshipping; any
          other URL falls back to the MOCK supplier so you can still demo the flow.
        </p>
      </div>

      <textarea
        className="min-h-[140px] w-full rounded-md border bg-background p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder={`https://www.aliexpress.com/item/1005006...\nhttps://www.cjdropshipping.com/product/...\nMOCK-G009`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <Button onClick={fetchPreviews} disabled={loading || !text.trim()}>
          {loading ? "Fetching previews…" : "Preview all"}
        </Button>
        <span className="text-sm text-muted-foreground">{parseUrls(text).length} URL(s) detected</span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {savedCount !== null && (
        <p className="text-sm text-green-600">Saved {savedCount} product(s) to your store.</p>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => setAll(e.target.checked)}
                disabled={successCount === 0}
              />
              Select all ({selectedCount}/{successCount} ready, {rows.length - successCount} failed)
            </label>
            <Button onClick={saveSelected} disabled={saving || selectedCount === 0}>
              {saving ? "Saving…" : `Save ${selectedCount} selected`}
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="w-10 p-2"></th>
                  <th className="w-16 p-2"></th>
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-left">Supplier</th>
                  <th className="p-2 text-right">Price (THB)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => (
                  <tr key={`${r.url}-${i}`} className={r.ok ? "" : "bg-destructive/5"}>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={r.selected}
                        onChange={() => toggleRow(i)}
                        disabled={!r.ok}
                      />
                    </td>
                    <td className="p-2">
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.imageUrl} alt="" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted" />
                      )}
                    </td>
                    <td className="p-2">
                      {r.ok ? (
                        <>
                          <div className="line-clamp-1 font-medium">{r.title}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {r.externalProductId} · {r.url}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-destructive">Failed</div>
                          <div className="text-xs text-muted-foreground">{r.url}</div>
                          <div className="text-xs text-destructive">{r.error}</div>
                        </>
                      )}
                    </td>
                    <td className="p-2">{r.supplier}</td>
                    <td className="p-2 text-right">
                      {r.ok ? (
                        <input
                          type="number"
                          min={0}
                          value={r.priceTHB ?? 0}
                          onChange={(e) => updatePrice(i, parseFloat(e.target.value) || 0)}
                          className="w-24 rounded border px-2 py-1 text-right text-sm"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr>
                  <td colSpan={4} className="p-2 text-right text-xs text-muted-foreground">
                    Selected total
                  </td>
                  <td className="p-2 text-right font-semibold">
                    {formatTHB(
                      rows
                        .filter((r) => r.selected && r.ok)
                        .reduce((acc, r) => acc + Number(r.priceTHB ?? 0), 0),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
