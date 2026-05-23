"use client";

/**
 * <LocalProductsTable /> — in-store product listing with selection.
 *
 * Standalone primitive built around the shadcn <Table /> shell. Acts as
 * a lightweight `OperatorDataTable<LocalProduct>` until the shared
 * Phase A primitive lands — once it does this file becomes a thin
 * adapter that hands off `columns` + `data`.
 *
 * Responsibilities:
 *   - render every Product for a store with thumbnail + Thai title
 *   - toggle individual selection + select-all-visible via checkboxes
 *   - emit a `remove` event on bulk remove (handled by orchestrator)
 *   - filter rows client-side by search query + active-only toggle
 *
 * Non-goals:
 *   - server pagination (full local list is small enough to render)
 *   - editing rows in place (caller links out to the edit form)
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTHB } from "@/lib/utils";

export interface LocalProduct {
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

interface Props {
  products: LocalProduct[];
  storeSlug: string;
  selected: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onRemove: () => void;
  removing: boolean;
}

export function LocalProductsTable({
  products,
  storeSlug,
  selected,
  onToggleOne,
  onToggleAll,
  onRemove,
  removing,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (activeOnly && !p.active) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.titleTh ?? ""} ${p.categoryName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, activeOnly]);

  const visibleIds = filtered.filter((p) => p.active).map((p) => p.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => selected.has(id));

  return (
    <div className="space-y-3">
      {/* Toolbar: filter input + active toggle + bulk action */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="กรองตามชื่อ/หมวด"
            className="pl-8"
          />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs">
          <Checkbox
            checked={activeOnly}
            onCheckedChange={(v) => setActiveOnly(v === true)}
          />
          เฉพาะที่ active
        </label>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {filtered.length} / {products.length} แถว
          {selected.size > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={onRemove}
              disabled={removing}
            >
              {removing ? <Loader2 className="animate-spin" /> : <Trash2 />}
              เอาออก ({selected.size})
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {products.length === 0
              ? "ยังไม่มีสินค้าในร้าน — ไปแท็บ \"เพิ่มจาก CJ\" เพื่อ import"
              : "ไม่พบสินค้าตามคำค้นนี้"}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={() => onToggleAll(visibleIds)}
                    aria-label="เลือกทั้งหมดที่แสดง"
                  />
                </TableHead>
                <TableHead className="w-14">รูป</TableHead>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead className="text-right">ราคา</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="w-20">สถานะ</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const isSelected = selected.has(p.id);
                return (
                  <TableRow
                    key={p.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={p.active ? "" : "opacity-60"}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleOne(p.id)}
                        disabled={!p.active}
                        aria-label={`เลือก ${p.titleTh ?? p.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.titleTh ?? p.title}
                          className="h-10 w-10 rounded object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-xs font-medium whitespace-normal">
                        {p.titleTh ?? p.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.supplier}
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium">
                      {formatTHB(p.priceTHB)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.categoryName ?? "—"}
                    </TableCell>
                    <TableCell>
                      {p.active ? (
                        <Badge variant="secondary" className="text-[10px]">
                          active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          เอาออกแล้ว
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon-xs">
                        <Link
                          href={`/stores/${storeSlug}/products/${p.id}`}
                          target="_blank"
                          aria-label="ดูในหน้าร้าน"
                        >
                          <Eye />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
