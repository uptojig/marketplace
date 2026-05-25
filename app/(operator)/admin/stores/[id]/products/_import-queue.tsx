"use client";

/**
 * <ImportQueue /> — sticky bottom "review cart" for staged CJ items.
 *
 * Why a queue (vs. one-click import like the old picker)?
 *   - The old UI fired a POST per row → 50 imports = 50 network calls
 *     spread over ~minute, each one rate-limited at the CJ proxy.
 *   - With a queue the operator browses, stages 20 items at once, then
 *     hits "Import" — the orchestrator drives a serial batch import
 *     with progress so each request is properly throttled.
 *
 * Behavioural contract:
 *   - Hidden when `items.length === 0`.
 *   - Sticky to viewport bottom so it stays in reach while scrolling
 *     long result lists.
 *   - On Import, parent drives the actual POSTs and provides progress
 *     via the `progress` prop (current / total / lastError).
 *
 * This file also exports a tiny `ConfirmAction` primitive used to gate
 * destructive actions (Clear all). Once the Phase A
 * `@/components/ui/confirm-action` lands this local copy can be deleted
 * and callers swapped to the shared one.
 */

import { useState } from "react";
import { Loader2, Trash2, Upload, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, formatTHB } from "@/lib/utils";
import type { SearchResult } from "./_cj-search";

export interface ImportProgress {
  /** how many items have been processed (success or failure) */
  done: number;
  /** total in this run */
  total: number;
  /** last error message, if any (shown inline) */
  lastError: string | null;
  /** how many succeeded */
  success: number;
  /** how many failed */
  failed: number;
}

interface Props {
  items: SearchResult[];
  importing: boolean;
  progress: ImportProgress | null;
  onRemove: (externalProductId: string) => void;
  onClear: () => void;
  onImport: () => void;
}

/**
 * Local `ConfirmAction` primitive. Wraps a destructive trigger in a
 * confirmation Dialog so the action only fires after the operator
 * acknowledges. Same shape as the planned shared Phase A primitive.
 */
function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
  variant = "destructive",
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "destructive" | "default";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImportQueue({
  items,
  importing,
  progress,
  onRemove,
  onClear,
  onImport,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0 && !importing) return null;

  const totalCost = items.reduce((acc, r) => acc + r.priceTHB, 0);
  const pct = progress && progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  return (
    <div className="sticky bottom-0 z-20 -mx-1 mt-6">
      <div className="rounded-t-xl border border-b-0 bg-background shadow-lg">
        {/* Summary bar */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="h-6 px-2">
              {items.length}
            </Badge>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-sm font-semibold hover:underline"
              disabled={importing}
            >
              คิวเตรียม import
            </button>
            <span className="text-xs text-muted-foreground">
              รวม {formatTHB(totalCost)}
            </span>
          </div>

          {progress && (
            <div className="flex flex-1 items-center gap-2 px-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-all",
                    progress.failed > 0 ? "bg-amber-500" : "bg-emerald-500",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {progress.done}/{progress.total}
                {progress.failed > 0 && (
                  <span className="ml-1 text-amber-700">
                    ({progress.failed} fail)
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {!importing && items.length > 0 && (
              <ConfirmAction
                trigger={
                  <Button type="button" variant="ghost" size="sm">
                    <Trash2 />
                    ล้างคิว
                  </Button>
                }
                title={`ล้างคิว ${items.length} รายการ?`}
                description="รายการในคิวจะถูกลบทั้งหมด — ยังไม่ได้ import เข้าฐานข้อมูล"
                confirmLabel="ล้างคิว"
                onConfirm={onClear}
              />
            )}
            <Button
              type="button"
              size="sm"
              onClick={onImport}
              disabled={importing || items.length === 0}
            >
              {importing ? <Loader2 className="animate-spin" /> : <Upload />}
              {importing ? "กำลัง import..." : `Import ${items.length} รายการ`}
            </Button>
          </div>
        </div>

        {progress?.lastError && (
          <div className="border-b bg-destructive/10 px-4 py-2 text-xs text-destructive">
            ข้อผิดพลาดล่าสุด: {progress.lastError}
          </div>
        )}

        {/* Expandable details */}
        {expanded && items.length > 0 && (
          <ul className="max-h-56 divide-y overflow-y-auto">
            {items.map((r) => (
              <li
                key={r.externalProductId}
                className="flex items-center gap-3 px-4 py-2"
              >
                {r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className="h-8 w-8 rounded object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted" />
                )}
                <p className="line-clamp-1 flex-1 text-xs">{r.title}</p>
                <span className="text-xs text-muted-foreground">
                  {formatTHB(r.priceTHB)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(r.externalProductId)}
                  disabled={importing}
                  aria-label="เอาออกจากคิว"
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
