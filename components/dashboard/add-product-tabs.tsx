"use client";

/**
 * <AddProductTabs /> — three ways to seed a store catalog, in one
 * place: pick from supplier catalogs, paste URLs, or hand-key a
 * product. Reachable via the "เพิ่มสินค้า" button on
 * /dashboard/store/products.
 *
 * Tab order is intentional:
 *   1. catalog (default) — fastest path: search → pick → save
 *   2. urls               — when the operator already has product
 *                           links in hand from a Facebook DM, etc.
 *   3. manual             — fallback when neither path fits
 *
 * On a successful save in any tab we toast + bounce back to the
 * product list page (the parent route) so the operator immediately
 * sees what they just added rather than staying on an empty form.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Link as LinkIcon, Pencil } from "lucide-react";
import { CatalogPicker } from "./catalog-picker";
import { UrlPasteImport } from "./url-paste-import";
import { ProductForm } from "./product-form";

type Tab = "catalog" | "urls" | "manual";

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "catalog", label: "เลือกจากซัพพลายเออร์", icon: Package },
  { id: "urls", label: "วาง URL", icon: LinkIcon },
  { id: "manual", label: "กรอกเอง", icon: Pencil },
];

export function AddProductTabs() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("catalog");
  const [toast, setToast] = useState<string | null>(null);

  function handleSaved(count: number) {
    setToast(`เพิ่ม ${count} สินค้าเข้าร้านแล้ว — กำลังกลับไปหน้ารายการ…`);
    // Brief pause so the toast is readable before the route changes.
    // The list page will re-fetch on its own server render.
    setTimeout(() => {
      router.push("/dashboard/store/products");
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {toast && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          ✅ {toast}
        </div>
      )}

      {/* Render-on-demand: keeping all 3 mounted with display:none would
          fire their network requests on tab open which is wasteful for
          the catalog query. The downside is losing tab-local state on
          switch — operators who want to draft a manual entry while
          browsing the catalog should finish one before switching. */}
      {tab === "catalog" && <CatalogPicker onSaved={handleSaved} />}
      {tab === "urls" && <UrlPasteImport onSaved={handleSaved} />}
      {tab === "manual" && <ProductForm mode="create" />}
    </div>
  );
}
