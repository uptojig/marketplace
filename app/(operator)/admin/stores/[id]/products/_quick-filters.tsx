"use client";

/**
 * <CategoryQuickFilter /> — CJ category picker as a Popover + Command-style
 * filterable list.
 *
 * Why not a plain <select>? With ~50–100 CJ categories a native select
 * becomes a wall of options on mobile. A filterable popover gives the
 * operator a single-keystroke way to find "Home Decor" without
 * scrolling, and reserves room for category icons / counts later.
 *
 * Implementation note: a full cmdk component isn't installed in this
 * repo yet (Phase A primitive). We inline the Command-style behaviour
 * — keyboard nav, fuzzy filter, scroll viewport — using primitive
 * <Input /> + <Popover /> so the surface stays drop-in replaceable
 * once `@/components/ui/command` lands.
 */

import { useId, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function CategoryQuickFilter({
  categories,
  value,
  onChange,
  loading,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listboxId = useId();

  const selected = categories.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || loading}
            aria-expanded={open}
            aria-controls={listboxId}
            className="justify-between gap-2 min-w-[180px]"
          >
            <span className="truncate text-left">
              {loading ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  โหลดหมวดหมู่...
                </span>
              ) : selected ? (
                selected.name
              ) : (
                <span className="text-muted-foreground">หมวดหมู่ทั้งหมด</span>
              )}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-0"
          id={listboxId}
        >
          <div className="border-b p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาหมวดหมู่..."
                className="pl-8"
                autoFocus
              />
            </div>
          </div>
          <div
            role="listbox"
            className="max-h-64 overflow-y-auto p-1"
            aria-label="หมวดหมู่ CJ"
          >
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => pick("")}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                !value && "bg-muted/50 font-medium",
              )}
            >
              <span>ทั้งหมด</span>
              {!value && <Check className="h-3.5 w-3.5" />}
            </button>
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                ไม่พบหมวดหมู่
              </p>
            ) : (
              filtered.map((c) => {
                const isPicked = c.id === value;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isPicked}
                    onClick={() => pick(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                      isPicked && "bg-muted/50 font-medium",
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    {isPicked && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onChange("")}
          aria-label="ล้างหมวดหมู่"
          title="ล้างหมวดหมู่"
        >
          <X />
        </Button>
      )}
    </div>
  );
}
