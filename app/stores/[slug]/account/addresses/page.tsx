'use client';

// Per-store address book. Phase 1C wired the underlying data to the
// real /api/addresses endpoint (scoped by storeSlug → storeId).
// Each store now has its own address book — a buyer's address at
// store A doesn't appear at store B. Aligns with Q1=A architecture
// decision (each store owns its own customers, Shopify-style).

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit2, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// API shape — matches the Prisma Address model fields returned by
// /api/addresses. Distinct from lib/checkout/types' Address (which is
// the older mock shape using `fullName` / `subDistrict`).
interface ApiAddress {
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
  label: string | null;
  isDefault: boolean;
}

type AddressFormState = {
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  label: 'home' | 'office' | 'other';
};

const emptyForm: AddressFormState = {
  recipientName: '',
  phone: '',
  line1: '',
  line2: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
  label: 'home',
};

export default function AddressesPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? '';

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/addresses?storeSlug=${encodeURIComponent(slug)}`);
      if (res.status === 401) {
        // Bounce to /signin with a return URL so users come back here
        // after auth — same pattern as the checkout address picker.
        router.replace(
          `/stores/${slug}/signin?callbackUrl=${encodeURIComponent(`/stores/${slug}/account/addresses`)}`,
        );
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(typeof data.error === 'string' ? data.error : 'โหลดที่อยู่ไม่สำเร็จ');
      }
      const data = (await res.json()) as { addresses: ApiAddress[] };
      setAddresses(data.addresses);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดที่อยู่ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  // setDefault and edit are out-of-scope for Phase 1C (no PATCH route
  // yet) — Phase 1D will add the API and wire these up. Until then the
  // buttons are stubbed locally so the UI doesn't regress.
  const setDefault = (id: string) =>
    setAddresses((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));

  const remove = async (id: string) => {
    if (!confirm('ลบที่อยู่นี้?')) return;
    const prev = addresses;
    setAddresses((list) => list.filter((a) => a.id !== id));
    try {
      const res = await fetch(
        `/api/addresses/${id}?storeSlug=${encodeURIComponent(slug)}`,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
    } catch (e) {
      // Rollback on failure so the user can retry.
      setAddresses(prev);
      setError(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
    }
  };

  const create = async (data: Omit<AddressFormState, never>) => {
    setError(null);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, storeSlug: slug }),
      });
      const json = (await res.json()) as { address?: ApiAddress; error?: unknown };
      if (!res.ok || !json.address) {
        throw new Error(typeof json.error === 'string' ? json.error : 'บันทึกไม่สำเร็จ');
      }
      setAddresses((list) => [json.address!, ...list]);
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold lg:text-2xl">ที่อยู่จัดส่ง</h1>
        <Button onClick={() => setAdding(true)} disabled={adding}>
          <Plus className="mr-1 h-4 w-4" /> เพิ่มที่อยู่
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {adding && (
        <AddressForm
          onSave={(addr) => void create(addr)}
          onCancel={() => setAdding(false)}
        />
      )}

      {loading && (
        <div className="py-12 text-center text-sm text-muted-foreground">กำลังโหลด…</div>
      )}

      {!loading && (
        <div className="space-y-3">
          {addresses.map((a) =>
            editing === a.id ? (
              <AddressForm
                key={a.id}
                initial={a}
                onSave={(addr) => {
                  // Local-only edit until Phase 1D ships the PATCH route.
                  setAddresses((list) =>
                    list.map((x) => (x.id === a.id ? { ...x, ...addr } : x)),
                  );
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <Card key={a.id} className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.recipientName}</span>
                      <span className="text-sm text-muted-foreground">{a.phone}</span>
                      {a.isDefault && (
                        <Badge variant="secondary">
                          <Star className="mr-1 h-3 w-3" /> ค่าเริ่มต้น
                        </Badge>
                      )}
                      {a.label === 'home' && <Badge variant="outline">บ้าน</Badge>}
                      {a.label === 'office' && <Badge variant="outline">ที่ทำงาน</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.line1}
                      {a.line2 && `, ${a.line2}`}
                      <br />
                      {a.subdistrict} {a.district} {a.province} {a.postalCode}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {!a.isDefault && (
                        <Button variant="ghost" size="sm" onClick={() => setDefault(a.id)}>
                          ตั้งเป็นค่าเริ่มต้น
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setEditing(a.id)}>
                        <Edit2 className="mr-1 h-3 w-3" /> แก้ไข
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void remove(a.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> ลบ
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>
      )}

      {!loading && addresses.length === 0 && !adding && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          ยังไม่มีที่อยู่บันทึกไว้
        </div>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ApiAddress;
  onSave: (a: AddressFormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressFormState>(
    initial
      ? {
          recipientName: initial.recipientName,
          phone: initial.phone,
          line1: initial.line1,
          line2: initial.line2 ?? '',
          subdistrict: initial.subdistrict ?? '',
          district: initial.district ?? '',
          province: initial.province,
          postalCode: initial.postalCode,
          label: (initial.label as 'home' | 'office' | 'other') ?? 'home',
        }
      : emptyForm,
  );

  const handleSave = () => {
    if (
      !form.recipientName ||
      !form.phone ||
      !form.line1 ||
      !form.subdistrict ||
      !form.district ||
      !form.province ||
      !form.postalCode
    ) {
      alert('กรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    onSave(form);
  };

  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="ชื่อ-นามสกุล"
          value={form.recipientName}
          onChange={(v) => setForm({ ...form, recipientName: v })}
        />
        <Field
          label="เบอร์โทร"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
        <Field
          label="บ้านเลขที่ / ถนน"
          value={form.line1}
          onChange={(v) => setForm({ ...form, line1: v })}
          className="sm:col-span-2"
        />
        <Field
          label="อาคาร / หมู่บ้าน (ไม่บังคับ)"
          value={form.line2}
          onChange={(v) => setForm({ ...form, line2: v })}
          className="sm:col-span-2"
        />
        <Field
          label="ตำบล / แขวง"
          value={form.subdistrict}
          onChange={(v) => setForm({ ...form, subdistrict: v })}
        />
        <Field
          label="อำเภอ / เขต"
          value={form.district}
          onChange={(v) => setForm({ ...form, district: v })}
        />
        <Field
          label="จังหวัด"
          value={form.province}
          onChange={(v) => setForm({ ...form, province: v })}
        />
        <Field
          label="รหัสไปรษณีย์"
          value={form.postalCode}
          onChange={(v) => setForm({ ...form, postalCode: v })}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button onClick={handleSave}>บันทึก</Button>
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1 text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
    </div>
  );
}
