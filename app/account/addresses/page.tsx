'use client';

import { useState } from 'react';
import { Edit2, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAddresses } from '@/lib/checkout/mock-data';
import type { Address } from '@/lib/checkout/types';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(getAddresses());
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const setDefault = (id: string) =>
    setAddresses((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));

  const remove = (id: string) => {
    if (!confirm('ลบที่อยู่นี้?')) return;
    setAddresses((list) => list.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold lg:text-2xl">ที่อยู่จัดส่ง</h1>
        <Button onClick={() => setAdding(true)} disabled={adding}>
          <Plus className="mr-1 h-4 w-4" /> เพิ่มที่อยู่
        </Button>
      </div>

      {adding && (
        <AddressForm
          onSave={(addr) => {
            setAddresses((list) => [
              ...list,
              { ...addr, id: `addr_${Date.now()}`, isDefault: list.length === 0 },
            ]);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="space-y-3">
        {addresses.map((a) =>
          editing === a.id ? (
            <AddressForm
              key={a.id}
              initial={a}
              onSave={(addr) => {
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
                    <span className="font-medium">{a.fullName}</span>
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
                    {a.subDistrict} {a.district} {a.province} {a.postalCode}
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
                      onClick={() => remove(a.id)}
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

      {addresses.length === 0 && !adding && (
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
  initial?: Address;
  onSave: (a: Omit<Address, 'id' | 'isDefault'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Address, 'id' | 'isDefault'>>({
    fullName: initial?.fullName ?? '',
    phone: initial?.phone ?? '',
    line1: initial?.line1 ?? '',
    line2: initial?.line2 ?? '',
    subDistrict: initial?.subDistrict ?? '',
    district: initial?.district ?? '',
    province: initial?.province ?? '',
    postalCode: initial?.postalCode ?? '',
    label: initial?.label ?? 'home',
  });

  const handleSave = () => {
    if (
      !form.fullName ||
      !form.phone ||
      !form.line1 ||
      !form.subDistrict ||
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
          value={form.fullName}
          onChange={(v) => setForm({ ...form, fullName: v })}
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
          value={form.line2 ?? ''}
          onChange={(v) => setForm({ ...form, line2: v })}
          className="sm:col-span-2"
        />
        <Field
          label="ตำบล / แขวง"
          value={form.subDistrict}
          onChange={(v) => setForm({ ...form, subDistrict: v })}
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
