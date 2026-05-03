"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Plus, X } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutCart } from "@/components/shop/CheckoutCart";
import { formatTHB } from "@/lib/utils";

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
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotalTHB());

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
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">ตะกร้าว่าง</h1>
        <Button asChild>
          <Link href="/">กลับไปเลือกซื้อสินค้า</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <CheckoutCart editable storeSlug={params.slug} />

      <section className="space-y-4">
        {/* Status header */}
        <div className="flex items-center gap-3 rounded-2xl border p-4" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold">
              ยอดที่ต้องชำระ: <span className="font-bold">{formatTHB(subtotal)}</span>
            </div>
            <div className="text-xs text-muted-foreground">เลือกที่อยู่จัดส่ง</div>
          </div>
        </div>

        {/* Address selection */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">1. เลือกที่อยู่จัดส่ง</h2>
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

          {loading && <p className="mt-4 text-sm text-muted-foreground">กำลังโหลด…</p>}

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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong>{a.recipientName}</strong>
                        {idx === 0 && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: "var(--shop-primary)" }}>
                            ที่อยู่หลัก
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {[a.line1, a.line2, a.subdistrict, a.district].filter(Boolean).join(" ")}
                        <br />
                        {a.province} {a.postalCode} {a.country}
                        <br />
                        <span className="text-xs">โทร {a.phone}</span>
                      </div>
                    </div>
                    <MapPin className="h-5 w-5 text-muted-foreground" />
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
  );
}
