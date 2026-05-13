"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Plus, X, Check, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutCart } from "@/components/shop/CheckoutCart";
import { formatTHB } from "@/lib/utils";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string;
  postalCode: string;
  country: string;
}

export default function CheckoutAddressPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  // Per-store scope — only this store's items + subtotal show up
  // during its checkout flow.
  const allLines = useCart((s) => s.lines);
  const lines = allLines.filter((l) => l.storeSlug === params.slug);
  const subtotal = lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    line1: "",
    line2: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
    country: "TH",
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/addresses");
      // /api/addresses returns 401 when the visitor isn't signed in.
      // We previously fell through and rendered addresses from a shared
      // guest user — a data leak between anonymous visitors. Bounce to
      // /signin with a return URL so they come back here after auth.
      if (res.status === 401) {
        const next = `/stores/${params.slug}/checkout/address`;
        router.replace(`/signin?callbackUrl=${encodeURIComponent(next)}`);
        return;
      }
      const data = (await res.json()) as { addresses: Address[] };
      setAddresses(data.addresses);
      if (data.addresses[0] && !selectedId) setSelectedId(data.addresses[0].id);
      if (data.addresses.length === 0) setShowForm(true);
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { address?: Address; error?: unknown };
      if (!res.ok || !data.address) {
        throw new Error(typeof data.error === "string" ? data.error : "บันทึกไม่สำเร็จ");
      }
      setAddresses((prev) => [data.address!, ...prev]);
      setSelectedId(data.address.id);
      setShowForm(false);
      setForm({
        recipientName: "",
        phone: "",
        line1: "",
        line2: "",
        subdistrict: "",
        district: "",
        province: "",
        postalCode: "",
        country: "TH",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function proceed() {
    if (!selectedId) {
      setError("กรุณาเลือกที่อยู่จัดส่ง");
      return;
    }
    sessionStorage.setItem("checkout.addressId", selectedId);
    router.push(`/stores/${params.slug}/checkout/confirm`);
  }

  const selected = useMemo(() => addresses.find((a) => a.id === selectedId), [addresses, selectedId]);

  if (lines.length === 0) {
    return (
      <div className="bg-[var(--shop-bg)] min-h-screen">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--shop-ink)' }}>ตะกร้าว่าง</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
            ยังไม่มีสินค้าในตะกร้า เริ่มเลือกสินค้าได้เลย
          </p>
          <Link
            href={`/stores/${params.slug}/category`}
            className="mt-6 inline-flex items-center px-6 py-2.5 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--shop-primary)" }}
          >
            เลือกซื้อสินค้า
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-10 sm:pt-14">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: "หน้าแรก", href: `/stores/${params.slug}` },
              { label: "ตะกร้า", href: `/stores/${params.slug}/cart` },
              { label: "ชำระเงิน" },
            ]}
          />
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
          style={{ color: "var(--shop-ink)" }}
        >
          ชำระเงิน
        </h1>

        {/* Step indicator */}
        <CheckoutSteps current={1} storeSlug={params.slug} />

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] mt-8">
          <CheckoutCart editable storeSlug={params.slug} />

      <section className="space-y-4">
        {/* Status header */}
        <div className="flex items-center gap-3 rounded-2xl border p-4" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--shop-primary)', color: '#fff', opacity: 0.9 }}>
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold" style={{ color: 'var(--shop-ink)' }}>
              ยอดที่ต้องชำระ: <span className="font-bold">{formatTHB(subtotal)}</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--shop-ink-muted)' }}>เลือกที่อยู่จัดส่ง</div>
          </div>
        </div>

        {/* Address selection */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold" style={{ color: 'var(--shop-ink)' }}>1. เลือกที่อยู่จัดส่ง</h2>
            <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
              {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
              {showForm ? "ปิด" : "เพิ่มที่อยู่ใหม่"}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={saveAddress} className="mt-4 grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
              <Input placeholder="ชื่อผู้รับ" required value={form.recipientName} onChange={update("recipientName")} />
              <Input placeholder="เบอร์โทรศัพท์" required value={form.phone} onChange={update("phone")} />
              <Input className="sm:col-span-2" placeholder="ที่อยู่ (บ้านเลขที่ ซอย ถนน)" required value={form.line1} onChange={update("line1")} />
              <Input className="sm:col-span-2" placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" value={form.line2} onChange={update("line2")} />
              <Input placeholder="ตำบล / แขวง" value={form.subdistrict} onChange={update("subdistrict")} />
              <Input placeholder="อำเภอ / เขต" value={form.district} onChange={update("district")} />
              <Input placeholder="จังหวัด" required value={form.province} onChange={update("province")} />
              <Input placeholder="รหัสไปรษณีย์" required value={form.postalCode} onChange={update("postalCode")} />
              <Button type="submit" className="sm:col-span-2" disabled={saving}>
                {saving ? "กำลังบันทึก…" : "บันทึกที่อยู่"}
              </Button>
            </form>
          )}

          {loading && <p className="mt-4 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>กำลังโหลด…</p>}

          {!loading && (
            <div className="mt-4 space-y-3">
              {addresses.map((a, idx) => (
                <label
                  key={a.id}
                  className={`block cursor-pointer rounded-xl border p-4 transition ${
                    selectedId === a.id ? "ring-2" : "hover:border-gray-300"
                  }`}
                  style={selectedId === a.id ? { borderColor: "var(--shop-primary)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--shop-primary) 20%, transparent)" } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedId === a.id}
                      onChange={() => setSelectedId(a.id)}
                      className="mt-1"
                    />
                    <div className="flex-1" style={{ color: 'var(--shop-ink)' }}>
                      <div className="flex items-center gap-2">
                        <strong>{a.recipientName}</strong>
                        {idx === 0 && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: "var(--shop-primary)" }}>
                            ที่อยู่หลัก
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
                        {[a.line1, a.line2, a.subdistrict, a.district].filter(Boolean).join(" ")}
                        <br />
                        {a.province} {a.postalCode} {a.country}
                        <br />
                        <span className="text-xs">โทร {a.phone}</span>
                      </div>
                    </div>
                    <MapPin className="h-5 w-5" style={{ color: 'var(--shop-ink-muted)' }} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={proceed}
          disabled={!selected}
          className="w-full py-6 text-base font-semibold text-white hover:opacity-90"
          style={{ backgroundColor: "var(--shop-primary, #16a34a)" }}
        >
          จัดส่งตามที่อยู่นี้
        </Button>
        </section>
        </div>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Checkout step indicator — 3-step progress bar
 *   [1] ที่อยู่   →   [2] ชำระเงิน   →   [3] ยืนยัน
 * Active step uses shop-primary; completed = filled circle with check;
 * upcoming = outline. Tailwind UI Plus checkout-form pattern.
 * ────────────────────────────────────────────────────────────── */
function CheckoutSteps({
  current,
  storeSlug,
}: {
  current: 1 | 2 | 3;
  storeSlug: string;
}) {
  const steps = [
    { id: 1, label: "ที่อยู่จัดส่ง", href: `/stores/${storeSlug}/checkout/address` },
    { id: 2, label: "ชำระเงิน", href: `/stores/${storeSlug}/checkout/confirm` },
    { id: 3, label: "ยืนยัน", href: undefined },
  ] as const;

  return (
    <nav aria-label="ขั้นตอนการชำระเงิน">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => {
          const completed = current > s.id;
          const active = current === s.id;
          const Body = (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors"
                style={{
                  borderColor: completed || active
                    ? "var(--shop-primary)"
                    : "var(--shop-border)",
                  background: completed
                    ? "var(--shop-primary)"
                    : "transparent",
                  color: completed
                    ? "white"
                    : active
                      ? "var(--shop-primary)"
                      : "var(--shop-ink-muted)",
                }}
              >
                {completed ? <Check className="h-3.5 w-3.5" /> : s.id}
              </span>
              <span
                className="hidden sm:inline text-sm font-medium"
                style={{
                  color: active || completed
                    ? "var(--shop-ink)"
                    : "var(--shop-ink-muted)",
                }}
              >
                {s.label}
              </span>
            </span>
          );
          return (
            <li
              key={s.id}
              className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-initial"
            >
              {s.href && completed ? (
                <Link href={s.href} className="hover:opacity-80">
                  {Body}
                </Link>
              ) : (
                Body
              )}
              {i < steps.length - 1 && (
                <div
                  className="h-px flex-1"
                  style={{
                    background: completed
                      ? "var(--shop-primary)"
                      : "var(--shop-border)",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
