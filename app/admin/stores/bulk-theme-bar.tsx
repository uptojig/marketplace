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

type StoreSlim = {
  id: string;
  slug: string;
  name: string;
  landingThemeVariant: string | null;
};

const THEMES: { value: string; label: string }[] = [
  { value: "", label: "— auto จาก templateId —" },
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
  const [theme, setTheme] = useState<string>("");
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const visibleStores = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stores;
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.slug.toLowerCase().includes(term),
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
      theme !== "" &&
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
          landingThemeVariant: theme === "" ? null : theme,
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
      setToast({
        type: "err",
        msg: err instanceof Error ? err.message : "Apply failed",
      });
    } finally {
      setApplying(false);
    }
  }

  return (
    <details className="rounded-lg border bg-white shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium hover:bg-gray-50">
        <span className="inline-flex items-center gap-2">
          🎨 Bulk theme picker
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
            {selected.size} selected
          </span>
        </span>
      </summary>
      <div className="space-y-3 border-t p-4">
        {toast && (
          <div
            className={`rounded-md px-3 py-2 text-sm ${
              toast.type === "ok"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.msg}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="กรองร้าน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-md border px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={selectAllVisible}
            className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            เลือกทุกร้านที่เห็น ({visibleStores.length})
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            ล้าง
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto rounded-md border">
          {visibleStores.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">ไม่พบร้านที่ตรง</p>
          ) : (
            <ul className="divide-y">
              {visibleStores.map((s) => (
                <li key={s.id}>
                  <label className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggle(s.id)}
                    />
                    <span className="flex-1 truncate">
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-gray-500">· {s.slug}</span>
                    </span>
                    {s.landingThemeVariant && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        {s.landingThemeVariant}
                      </span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <span className="text-sm font-medium">เปลี่ยนเป็น:</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="flex-1 min-w-[240px] rounded-md border bg-white px-3 py-1.5 text-sm"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying || selected.size === 0}
            className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {applying ? "กำลังบันทึก..." : `บันทึก (${selected.size})`}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          💡 เลือก theme ที่ไม่ใช่ "auto" → ลบ AI-generated landing JSON
          ของร้านนั้นๆ ด้วยอัตโนมัติ (เหมือนหน้าตั้งค่าแต่ละร้าน)
        </p>
      </div>
    </details>
  );
}
