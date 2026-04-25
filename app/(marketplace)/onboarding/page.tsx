"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTHB } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface CatalogItem {
  externalProductId: string;
  title: string;
  description?: string;
  priceTHB: number;
  imageUrl?: string;
  raw?: unknown;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [account, setAccount] = useState({ email: "", name: "" });
  const [store, setStore] = useState({ name: "", slug: "", description: "", logoUrl: "" });
  const [supplier, setSupplier] = useState<"CJ" | "ALIEXPRESS">("CJ");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [picked, setPicked] = useState<Record<string, CatalogItem>>({});

  async function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(account),
      });
      const data = (await res.json()) as { hasStore?: boolean; storeSlug?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? `Sign-up failed (${res.status})`);
      if (data.hasStore && data.storeSlug) {
        router.push(`/stores/${data.storeSlug}`);
        return;
      }
      setStore((s) => ({ ...s, name: s.name || account.name + "'s shop", slug: s.slug || slugify(account.name) }));
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitStore(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/store", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(store),
      });
      const data = (await res.json()) as { slug?: string; error?: unknown };
      if (!res.ok || !data.slug) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : data.error
              ? Object.values(data.error as Record<string, string[]>)
                  .flat()
                  .join(", ")
              : `Save failed (${res.status})`;
        throw new Error(msg);
      }
      setStep(3);
      void loadCatalog(1, "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadCatalog(p: number, q: string) {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const params = new URLSearchParams({ supplier, page: String(p), pageSize: "12" });
      if (q) params.set("q", q);
      const res = await fetch(`/api/suppliers/catalog?${params.toString()}`);
      const data = (await res.json()) as {
        items?: CatalogItem[];
        hasMore?: boolean;
        error?: string;
      };
      if (!res.ok || !data.items) throw new Error(data.error ?? `Catalog failed (${res.status})`);
      setCatalogItems(data.items);
      setHasMore(!!data.hasMore);
      setPage(p);
      setAppliedSearch(q);
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : "Catalog failed");
    } finally {
      setCatalogLoading(false);
    }
  }

  function togglePick(item: CatalogItem) {
    setPicked((prev) => {
      const next = { ...prev };
      if (next[item.externalProductId]) delete next[item.externalProductId];
      else next[item.externalProductId] = item;
      return next;
    });
  }

  async function finish() {
    const items = Object.values(picked);
    setBusy(true);
    setError(null);
    try {
      if (items.length) {
        const res = await fetch("/api/products/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "save",
            items: items.map((it) => ({
              url: `${supplier}:${it.externalProductId}`,
              externalProductId: it.externalProductId,
              title: it.title,
              description: it.description,
              priceTHB: it.priceTHB,
              imageUrl: it.imageUrl,
              supplier,
              raw: it.raw,
            })),
          }),
        });
        const data = (await res.json()) as { saved?: number; error?: string };
        if (!res.ok) throw new Error(data.error ?? `Import failed (${res.status})`);
      }
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Stepper current={step} />
      {error && <p className="text-sm text-destructive">{error}</p>}

      {step === 1 && (
        <form onSubmit={submitAccount} className="space-y-4 rounded-lg border p-6">
          <h1 className="text-xl font-semibold">สมัครบัญชีร้านค้า</h1>
          <p className="text-sm text-muted-foreground">
            ใส่อีเมลอะไรก็ได้ — โหมดเดโมไม่ตรวจสอบจริง เปิด Google login ได้โดยตั้ง
            GOOGLE_CLIENT_ID/SECRET ใน <code>.env.local</code>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={account.email}
              onChange={(e) => setAccount({ ...account, email: e.target.value })}
            />
            <Input
              placeholder="ชื่อของคุณ"
              required
              value={account.name}
              onChange={(e) => setAccount({ ...account, name: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "กำลังสร้างบัญชี…" : "ถัดไป"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitStore} className="space-y-4 rounded-lg border p-6">
          <h1 className="text-xl font-semibold">ตั้งชื่อร้าน</h1>
          <div className="grid gap-3">
            <label className="text-sm">
              ชื่อร้าน
              <Input
                placeholder="ร้านของฉัน"
                required
                value={store.name}
                onChange={(e) =>
                  setStore({ ...store, name: e.target.value, slug: store.slug || slugify(e.target.value) })
                }
              />
            </label>
            <label className="text-sm">
              URL ของร้าน
              <div className="flex items-center">
                <span className="rounded-l-md border border-r-0 bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                  /stores/
                </span>
                <Input
                  required
                  className="rounded-l-none"
                  value={store.slug}
                  onChange={(e) => setStore({ ...store, slug: slugify(e.target.value) })}
                />
              </div>
            </label>
            <label className="text-sm">
              คำอธิบายร้าน
              <textarea
                className="mt-1 min-h-[80px] w-full rounded-md border bg-background p-2 text-sm"
                placeholder="ร้านของคุณขายอะไร?"
                value={store.description}
                onChange={(e) => setStore({ ...store, description: e.target.value })}
              />
            </label>
            <label className="text-sm">
              โลโก้ร้าน URL (ไม่บังคับ)
              <Input
                placeholder="https://…"
                value={store.logoUrl}
                onChange={(e) => setStore({ ...store, logoUrl: e.target.value })}
              />
            </label>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              ย้อนกลับ
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "กำลังบันทึก…" : "ถัดไป"}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <h1 className="text-xl font-semibold">เลือกสินค้าจะขาย</h1>
            <p className="text-sm text-muted-foreground">
              ติ๊กเลือกสินค้า 2-3 ชิ้นไว้เปิดร้าน เพิ่มทีหลังได้ที่ dashboard
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-md border">
              {(["CJ", "ALIEXPRESS"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSupplier(s);
                    void loadCatalog(1, "");
                  }}
                  className={`px-3 py-1.5 text-sm ${
                    supplier === s ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void loadCatalog(1, search.trim());
              }}
              className="flex flex-1 gap-2"
            >
              <Input
                placeholder="ค้นหาสินค้า…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="outline">
                ค้นหา
              </Button>
            </form>
          </div>

          {catalogError && (
            <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {catalogError}
            </div>
          )}
          {catalogLoading && <p className="text-sm text-muted-foreground">กำลังโหลด…</p>}

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {catalogItems.map((it) => {
              const checked = !!picked[it.externalProductId];
              return (
                <button
                  type="button"
                  key={it.externalProductId}
                  onClick={() => togglePick(it)}
                  className={`overflow-hidden rounded-md border text-left transition ${
                    checked ? "ring-2 ring-primary" : "hover:shadow"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {it.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    <div
                      className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                        checked ? "bg-primary text-primary-foreground" : "bg-background"
                      }`}
                    >
                      {checked ? "✓" : ""}
                    </div>
                  </div>
                  <div className="p-2 text-xs">
                    <div className="line-clamp-2 font-medium">{it.title}</div>
                    <div className="mt-1 font-semibold">{formatTHB(it.priceTHB)}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {catalogItems.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                หน้า {page}
                {appliedSearch ? ` · "${appliedSearch}"` : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => loadCatalog(page - 1, appliedSearch)}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasMore}
                  onClick={() => loadCatalog(page + 1, appliedSearch)}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between border-t pt-4">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              ย้อนกลับ
            </Button>
            <Button onClick={finish} disabled={busy}>
              {busy ? "กำลังบันทึก…" : Object.keys(picked).length ? `เปิดร้านพร้อมสินค้า ${Object.keys(picked).length} ชิ้น` : "ข้าม — เปิดร้านว่างไปก่อน"}
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rounded-lg border p-6 text-center">
          <h1 className="text-2xl font-semibold">🎉 ร้านของคุณเปิดแล้ว!</h1>
          <p className="text-sm text-muted-foreground">
            เข้าชมร้าน แชร์ หรือเข้า dashboard เพื่อจัดการออเดอร์
          </p>
          <div className="flex flex-col items-center gap-2">
            <Link
              href={`/stores/${store.slug}`}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              เปิดดูร้าน → /stores/{store.slug}
            </Link>
            <Link href="/dashboard" className="text-sm underline">
              เข้า Vendor Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "สมัคร" },
    { n: 2, label: "ตั้งร้าน" },
    { n: 3, label: "เลือกสินค้า" },
    { n: 4, label: "เปิดร้าน" },
  ];
  return (
    <ol className="flex items-center justify-between">
      {steps.map((s, i) => {
        const active = current === s.n;
        const done = current > s.n;
        return (
          <li key={s.n} className="flex flex-1 items-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary" : "text-muted-foreground"
              }`}
            >
              {done ? "✓" : s.n}
            </div>
            <span className={`ml-2 text-sm ${active ? "font-medium" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className={`mx-3 h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
