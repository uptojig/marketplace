"use client";

/**
 * Multi-filter toolbar for /admin/stores.
 *
 * Renders three cmdk-backed filter popovers on the same row as the
 * data table's built-in search/columns controls. We slot this whole
 * component into `<OperatorDataTable filters={...} />` so it lives
 * inside the toolbar grid without competing for layout space.
 *
 * Filter state lives in the URL (not React state) because:
 *   - The list page is `force-dynamic` and re-renders on URL changes.
 *   - Filters need to survive refresh + share-via-link.
 *   - Browser back/forward gives the operator free undo.
 *
 * Each filter is a Popover + cmdk Command list. Toggle works on click
 * (no second confirm step) and the popover updates the URL via
 * `router.replace` which kicks a fresh server fetch.
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Filter, X, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const APPROVAL_OPTIONS = [
  { value: "PENDING", label: "รอตรวจ" },
  { value: "APPROVED", label: "อนุมัติ" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "SUSPENDED", label: "ระงับ" },
] as const;

const TRISTATE_OPTIONS = [
  { value: "yes", label: "มี" },
  { value: "no", label: "ไม่มี" },
] as const;

const QUALITY_OPTIONS = [
  { value: "low", label: "เฉพาะคุณภาพต่ำ" },
] as const;

/**
 * Renders inline in OperatorDataTable's `filters` slot. Also returns
 * the active-filter chips row, which the page mounts BELOW the
 * OperatorDataTable's toolbar so it doesn't fight the columns dropdown
 * for space.
 */
export function StoreFilterPopovers() {
  const router = useRouter();
  const sp = useSearchParams();

  const statuses = (sp.get("status") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const domain = sp.get("domain") ?? "";
  const landing = sp.get("landing") ?? "";
  const quality = sp.get("quality") ?? "";

  function pushParam(key: string, value: string | string[] | null) {
    const next = new URLSearchParams(sp.toString());
    if (
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      next.delete(key);
    } else if (Array.isArray(value)) {
      next.set(key, value.join(","));
    } else {
      next.set(key, value);
    }
    const qs = next.toString();
    router.replace(qs ? `/admin/stores?${qs}` : "/admin/stores", {
      scroll: false,
    });
  }

  return (
    <>
      <MultiFilterPopover
        label="สถานะอนุมัติ"
        options={[...APPROVAL_OPTIONS]}
        selected={statuses}
        onChange={(next) => pushParam("status", next)}
      />
      <TristateFilterPopover
        label="Custom domain"
        value={domain}
        options={[...TRISTATE_OPTIONS]}
        onChange={(v) => pushParam("domain", v === "" ? null : v)}
      />
      <TristateFilterPopover
        label="Landing block"
        value={landing}
        options={[...TRISTATE_OPTIONS]}
        onChange={(v) => pushParam("landing", v === "" ? null : v)}
      />
      <TristateFilterPopover
        label="คุณภาพข้อมูล"
        value={quality}
        options={[...QUALITY_OPTIONS]}
        onChange={(v) => pushParam("quality", v === "" ? null : v)}
      />
    </>
  );
}

/**
 * Chips that summarize the currently-active filters with a 1-click
 * clear. Mounts BELOW the OperatorDataTable toolbar.
 */
export function ActiveFilterChips() {
  const router = useRouter();
  const sp = useSearchParams();

  const statuses = (sp.get("status") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const domain = sp.get("domain") ?? "";
  const landing = sp.get("landing") ?? "";
  const quality = sp.get("quality") ?? "";

  const items: { key: string; label: string; clear: () => void }[] = [];

  function pushParam(key: string, value: string | string[] | null) {
    const next = new URLSearchParams(sp.toString());
    if (
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      next.delete(key);
    } else if (Array.isArray(value)) {
      next.set(key, value.join(","));
    } else {
      next.set(key, value);
    }
    const qs = next.toString();
    router.replace(qs ? `/admin/stores?${qs}` : "/admin/stores", {
      scroll: false,
    });
  }

  for (const s of statuses) {
    const opt = APPROVAL_OPTIONS.find((o) => o.value === s);
    if (!opt) continue;
    items.push({
      key: `status:${s}`,
      label: `สถานะ: ${opt.label}`,
      clear: () =>
        pushParam(
          "status",
          statuses.filter((x) => x !== s),
        ),
    });
  }
  if (domain) {
    items.push({
      key: "domain",
      label: `Custom domain: ${domain === "yes" ? "มี" : "ไม่มี"}`,
      clear: () => pushParam("domain", null),
    });
  }
  if (landing) {
    items.push({
      key: "landing",
      label: `Landing block: ${landing === "yes" ? "มี" : "ไม่มี"}`,
      clear: () => pushParam("landing", null),
    });
  }
  if (quality === "low") {
    items.push({
      key: "quality",
      label: "คุณภาพต่ำเท่านั้น",
      clear: () => pushParam("quality", null),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        ตัวกรอง:
      </span>
      {items.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={f.clear}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground transition hover:border-primary hover:bg-background hover:text-primary"
        >
          {f.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.replace("/admin/stores", { scroll: false })}
        className="text-[11px] font-semibold text-primary hover:underline"
      >
        ล้างทั้งหมด
      </button>
    </div>
  );
}

function MultiFilterPopover({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(v: string) {
    const set = new Set(selected);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    onChange(Array.from(set));
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5",
            selected.length > 0 && "border-primary text-primary",
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          {label}
          {selected.length > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          <CommandInput placeholder={`ค้นหา ${label}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>ไม่พบตัวเลือก</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isOn = selected.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => toggle(opt.value)}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        isOn
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border",
                      )}
                    >
                      {isOn && <Check className="h-3 w-3" />}
                    </span>
                    <span className="flex-1">{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={() => onChange([])}
                    className="text-xs text-muted-foreground"
                  >
                    ล้างตัวกรอง ({selected.length})
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function TristateFilterPopover({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const active = value !== "";
  const currentLabel = options.find((o) => o.value === value)?.label ?? "";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-8 gap-1.5", active && "border-primary text-primary")}
        >
          <Filter className="h-3.5 w-3.5" />
          {label}
          {active && (
            <span className="inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {currentLabel}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem value="__all__" onSelect={() => onChange("")}>
                <span className="flex h-4 w-4 items-center justify-center text-primary">
                  {value === "" && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="flex-1">ทั้งหมด</span>
              </CommandItem>
              {options.map((opt) => {
                const isOn = opt.value === value;
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => onChange(isOn ? "" : opt.value)}
                  >
                    <span className="flex h-4 w-4 items-center justify-center text-primary">
                      {isOn && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1">{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
