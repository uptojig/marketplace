"use client";

/**
 * Bulk theme picker for /admin/stores — operator selects N stores via
 * checkboxes, picks a theme variant from the dropdown, hits apply.
 * Backed by POST /api/admin/stores/bulk-theme (admin-only).
 *
 * Renders a sticky bar above the stores table on /admin/stores so it
 * stays visible while scrolling. Sits ABOVE the existing
 * StoreRowActions per-row controls — no behavioural overlap.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Checkbox,
  OperatorCallout,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/operator/operator-primitives";

type StoreSlim = {
  id: string;
  slug: string;
  name: string;
  landingThemeVariant: string | null;
};

// Radix Select forbids an empty-string item value, so the "auto" option
// uses a sentinel that maps back to null when posting.
const AUTO = "__auto__";

const THEMES: { value: string; label: string }[] = [
  { value: AUTO, label: "— auto จาก templateId —" },
  { value: "everyday", label: "everyday · consumer retail" },
  { value: "taobao", label: "taobao · marketplace bold" },
  { value: "packaging", label: "packaging · pink/yellow/sky" },
  { value: "community", label: "community · live-commerce" },
  { value: "business-model", label: "business-model · B2B wholesale" },
  { value: "minimal", label: "minimal · legacy (A family)" },
  { value: "cute", label: "cute · legacy (I family)" },
];

export function BulkThemeBar({ stores }: { stores: StoreSlim[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<string>(AUTO);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [search, setSearch] = useState("");

  const visibleStores = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stores;
    return stores.filter(
      (s) => s.name.toLowerCase().includes(term) || s.slug.toLowerCase().includes(term),
    );
  }, [stores, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(visibleStores.map((s) => s.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function handleApply() {
    if (selected.size === 0) {
      setToast({ type: "err", msg: "เลือกอย่างน้อย 1 ร้าน" });
      return;
    }
    if (
      theme !== AUTO &&
      !confirm(
        `เปลี่ยน theme ของ ${selected.size} ร้านเป็น "${theme}" · ` +
          `จะลบ AI-generated landing JSON ของร้านเหล่านี้ออกด้วย (เพื่อให้ theme render แทน)\n\nยืนยัน?`,
      )
    ) {
      return;
    }
    setApplying(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/stores/bulk-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selected),
          landingThemeVariant: theme === AUTO ? null : theme,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ? JSON.stringify(err.error) : `HTTP ${res.status}`);
      }
      const data = await res.json();
      setToast({ type: "ok", msg: `อัปเดต ${data.updated} ร้านแล้ว` });
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      setToast({ type: "err", msg: err instanceof Error ? err.message : "Apply failed" });
    } finally {
      setApplying(false);
    }
  }

  return (
    <details className="rounded-lg border border-border bg-card shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium hover:bg-muted">
        <span className="inline-flex items-center gap-2">
          🎨 Bulk theme picker
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {selected.size} selected
          </span>
        </span>
      </summary>
      <div className="space-y-3 border-t border-border p-4">
        {toast && (
          <OperatorCallout tone={toast.type === "ok" ? "success" : "danger"}>
            {toast.msg}
          </OperatorCallout>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="text"
            placeholder="กรองร้าน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={selectAllVisible}>
            เลือกทุกร้านที่เห็น ({visibleStores.length})
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={clearAll}>
            ล้าง
          </Button>
        </div>

        <div className="max-h-60 overflow-y-auto rounded-md border border-border">
          {visibleStores.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">ไม่พบร้านที่ตรง</p>
          ) : (
            <ul className="divide-y divide-border">
              {visibleStores.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted">
                    <Checkbox
                      checked={selected.has(s.id)}
                      onCheckedChange={() => toggle(s.id)}
                    />
                    <span className="flex-1 truncate">
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-muted-foreground">· {s.slug}</span>
                    </span>
                    {s.landingThemeVariant && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {s.landingThemeVariant}
                      </span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-sm font-medium">เปลี่ยนเป็น:</span>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="min-w-[240px] flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={handleApply}
            disabled={applying || selected.size === 0}
          >
            {applying ? "กำลังบันทึก..." : `บันทึก (${selected.size})`}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 เลือก theme ที่ไม่ใช่ &quot;auto&quot; → ลบ AI-generated landing JSON
          ของร้านนั้นๆ ด้วยอัตโนมัติ (เหมือนหน้าตั้งค่าแต่ละร้าน)
        </p>
      </div>
    </details>
  );
}
