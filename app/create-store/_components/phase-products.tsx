"use client";

/**
 * Wizard Phase 3 — Real CJ product picker.
 *
 * Replaces the old static 10/20/50 placeholder with a real grid of
 * CJ products fetched from /api/wizard/cj-products. The merchant
 * checks the products they want imported into their store; on
 * wizard submit, createStoreFromWizard() runs enrichCJProduct() for
 * each selected externalProductId.
 *
 * Why real products + checkboxes (vs. the old "starterPack" picker):
 *   The old UI promised "12,400 items pre-translated and categorized"
 *   but createStoreFromWizard never actually imported anything — the
 *   store opened empty and the merchant got confused. This step now
 *   shows what they're actually getting.
 *
 * Search seeds from the niche label (e.g. niche=fashion → search
 * "clothing fashion") so the first page of results is roughly on
 * theme. The merchant can override with their own search term.
 *
 * Selection cap: STARTER_PACK_TARGETS.50 (50). The 10/20/50 starter
 * pack pills below the search bar are now visual targets — they don't
 * gate selection, just suggest a stopping point so the picker doesn't
 * feel open-ended. Each selection beyond 50 is allowed but the count
 * row turns amber as a soft warning.
 */

import { useEffect, useRef, useState } from "react";
import { getNiche, type WizardState } from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
  onChange: (patch: Partial<WizardState["products"]>) => void;
};

interface CjProduct {
  externalProductId: string;
  title: string;
  priceTHB: number;
  imageUrl: string | null;
}

const STARTER_PACK_TARGETS = {
  "10": 10,
  "20": 20,
  "50": 50,
} as const;

const NICHE_SEED_SEARCH: Record<string, string> = {
  electronics: "electronics gadget tech",
  fashion: "fashion clothing apparel",
  beauty: "beauty cosmetic makeup skincare",
  home: "home decor furniture",
  sport: "sport fitness outdoor",
  kids: "kids toys baby",
  food: "food snack drink",
  wholesale: "wholesale bulk",
  handmade: "handmade craft",
  vintage: "vintage retro",
  general: "popular gift",
};

const PAGE_SIZE = 20;

export function PhaseProducts({ state, onChange }: Props) {
  const niche = getNiche(state.identity.niche);
  const [search, setSearch] = useState<string>(() =>
    state.identity.niche ? NICHE_SEED_SEARCH[state.identity.niche] ?? "" : "",
  );
  const [pendingSearch, setPendingSearch] = useState(search);
  const [items, setItems] = useState<CjProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const initialLoaded = useRef(false);

  const selectedIds = new Set(
    state.products.selectedProducts.map((p) => p.externalProductId),
  );
  const target =
    state.products.starterPack !== null
      ? STARTER_PACK_TARGETS[state.products.starterPack]
      : 20;

  async function loadPage(reset: boolean, currentSearch: string, p: number) {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(PAGE_SIZE),
      });
      if (currentSearch) params.set("search", currentSearch);
      const res = await fetch(`/api/wizard/cj-products?${params}`);
      const data = (await res.json().catch(() => null)) as {
        items?: CjProduct[];
        hasMore?: boolean;
        error?: string;
        message?: string;
      } | null;
      if (!res.ok || !data?.items) {
        throw new Error(data?.message ?? "ดึงสินค้าไม่สำเร็จ");
      }
      setItems((prev) => (reset ? data.items! : [...prev, ...data.items!]));
      setHasMore(Boolean(data.hasMore));
      setPage(p);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ดึงสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch — once on mount with the niche-seeded search.
  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;
    void loadPage(true, search, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(p: CjProduct) {
    const has = selectedIds.has(p.externalProductId);
    const next = has
      ? state.products.selectedProducts.filter(
          (x) => x.externalProductId !== p.externalProductId,
        )
      : [...state.products.selectedProducts, p];
    onChange({ selectedProducts: next });
  }

  function setStarter(t: "10" | "20" | "50") {
    onChange({ starterPack: t });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(pendingSearch);
    setItems([]);
    void loadPage(true, pendingSearch, 1);
  }

  const overTarget = selectedIds.size > target;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-mp-ink-muted">
          ขั้นที่ 3 · เลือกสินค้า
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          เลือกสินค้าจริงจาก CJ Dropshipping
        </h2>
        <p className="text-sm text-mp-ink-muted">
          ติ๊กสินค้าที่อยากให้อยู่ในร้านของคุณ ระบบจะ import + แปลภาษาไทย
          ให้อัตโนมัติหลังเปิดร้าน
        </p>
      </header>

      {/* Niche / target hint */}
      <div className="flex flex-wrap items-center gap-2">
        {niche && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span aria-hidden>{niche.emoji}</span> หมวด {niche.label}
          </span>
        )}
        <span className="text-xs text-mp-ink-muted">เป้าหมาย:</span>
        {(["10", "20", "50"] as const).map((t) => {
          const active = state.products.starterPack === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setStarter(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-mp-coral bg-mp-ink text-white"
                  : "border-mp-border bg-white text-mp-ink hover:border-mp-coral/60"
              }`}
            >
              {t} ชิ้น
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <form onSubmit={submitSearch} className="flex gap-2">
        <input
          type="text"
          value={pendingSearch}
          onChange={(e) => setPendingSearch(e.target.value)}
          placeholder="ค้นหาสินค้า (ภาษาอังกฤษ — เช่น 'wireless earbuds')"
          className="flex-1 rounded-md border border-mp-border bg-white px-3 py-2 text-sm focus:border-mp-coral focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-mp-ink px-4 py-2 text-sm font-medium text-white hover:bg-mp-ink disabled:opacity-50"
        >
          ค้นหา
        </button>
      </form>

      {/* Selection counter */}
      <div
        className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${
          overTarget
            ? "border-amber-300 bg-amber-50 text-amber-900"
            : selectedIds.size === 0
              ? "border-mp-border bg-mp-cream-alt/40 text-mp-ink-muted"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        <span>
          เลือกแล้ว <strong>{selectedIds.size}</strong> / {target} ชิ้น
          {overTarget && " (เกินเป้าหมายเล็กน้อย — ใช้เวลา import นานขึ้น)"}
        </span>
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={() => onChange({ selectedProducts: [] })}
            className="font-medium underline-offset-2 hover:underline"
          >
            ล้างที่เลือก
          </button>
        )}
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((p) => {
          const isOn = selectedIds.has(p.externalProductId);
          return (
            <button
              key={p.externalProductId}
              type="button"
              onClick={() => toggle(p)}
              className={`group relative overflow-hidden rounded-lg border bg-white text-left transition ${
                isOn
                  ? "border-mp-coral ring-2 ring-mp-coral/25"
                  : "border-mp-border hover:border-mp-coral/60"
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-mp-cream-alt/60">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-mp-ink-muted/70">
                    ไม่มีรูป
                  </div>
                )}
                <span
                  className={`absolute left-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded border ${
                    isOn
                      ? "border-mp-coral bg-mp-ink text-white"
                      : "border-mp-border bg-white"
                  }`}
                  aria-hidden
                >
                  {isOn && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </div>
              <div className="space-y-0.5 p-2">
                <p className="line-clamp-2 text-[11px] leading-tight text-mp-ink">
                  {p.title}
                </p>
                <p className="text-xs font-semibold text-mp-ink">
                  ฿ {p.priceTHB.toLocaleString("th-TH")}
                </p>
              </div>
            </button>
          );
        })}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="animate-pulse rounded-lg border border-mp-border bg-white"
            >
              <div className="aspect-square w-full bg-mp-cream-alt/60" />
              <div className="space-y-1 p-2">
                <div className="h-2 w-3/4 rounded bg-mp-cream-alt/60" />
                <div className="h-2 w-1/3 rounded bg-mp-cream-alt/60" />
              </div>
            </div>
          ))}
      </div>

      {/* Empty + load-more controls */}
      {!loading && items.length === 0 && (
        <div className="rounded-md border border-dashed border-mp-border px-4 py-10 text-center text-sm text-mp-ink-muted">
          ไม่พบสินค้า — ลองคำค้นหาอื่น
        </div>
      )}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadPage(false, search, page + 1)}
            className="rounded-md border border-mp-border bg-white px-4 py-2 text-sm font-medium text-mp-ink hover:border-mp-coral/60"
          >
            โหลดเพิ่ม (หน้า {page + 1})
          </button>
        </div>
      )}

      <p className="text-[11px] text-mp-ink-muted">
        เพิ่ม / ลบ / แก้ไขสินค้าได้ใน Dashboard หลังจากเปิดร้าน — ระบบจะ
        import + แปลภาษาไทย + แยกหมวดสินค้าให้อัตโนมัติ (ใช้เวลา ~1 วินาที /
        ชิ้น)
      </p>
    </div>
  );
}
