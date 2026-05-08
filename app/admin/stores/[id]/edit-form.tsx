"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";

type StoreData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  tagline: string | null;
  primaryColor: string | null;
  customDomain: string | null;
  logoPosition: string | null;
  menuPosition: string | null;
  companyName: string | null;
  taxId: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  facebookUrl: string | null;
  messengerUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  lineId: string | null;
  platformEmail: string | null;
  platformEmailForwardTo: string | null;
  platformEmailVerified: boolean;
};

type FormValues = {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  tagline: string;
  primaryColor: string;
  customDomain: string;
  logoPosition: string;
  menuPosition: string;
  companyName: string;
  taxId: string;
  addressLine1: string;
  addressLine2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string;
  messengerUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  lineId: string;
  platformEmailForwardTo: string;
};

function toForm(s: StoreData): FormValues {
  return {
    name: s.name,
    slug: s.slug,
    description: s.description ?? "",
    logoUrl: s.logoUrl ?? "",
    bannerUrl: s.bannerUrl ?? "",
    tagline: s.tagline ?? "",
    primaryColor: s.primaryColor ?? "#2563eb",
    customDomain: s.customDomain ?? "",
    logoPosition: s.logoPosition ?? "left",
    menuPosition: s.menuPosition ?? "right",
    companyName: s.companyName ?? "",
    taxId: s.taxId ?? "",
    addressLine1: s.addressLine1 ?? "",
    addressLine2: s.addressLine2 ?? "",
    subdistrict: s.subdistrict ?? "",
    district: s.district ?? "",
    province: s.province ?? "",
    postalCode: s.postalCode ?? "",
    country: s.country ?? "TH",
    contactEmail: s.contactEmail ?? "",
    contactPhone: s.contactPhone ?? "",
    facebookUrl: s.facebookUrl ?? "",
    messengerUrl: s.messengerUrl ?? "",
    twitterUrl: s.twitterUrl ?? "",
    instagramUrl: s.instagramUrl ?? "",
    websiteUrl: s.websiteUrl ?? "",
    lineId: s.lineId ?? "",
    platformEmailForwardTo: s.platformEmailForwardTo ?? "",
  };
}

type TabId = "info" | "design" | "contact";
const TABS: { id: TabId; label: string }[] = [
  { id: "info", label: "ข้อมูลร้าน" },
  { id: "design", label: "ดีไซน์" },
  { id: "contact", label: "ที่อยู่ & ติดต่อ" },
];

export function StoreEditForm({ store }: { store: StoreData }) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(toForm(store));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<TabId>("info");
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    const res = await fetch(`/api/admin/stores/${store.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        typeof err.error === "object"
          ? Object.values(err.error).flat().join(", ")
          : (err.error ?? "บันทึกไม่สำเร็จ");
      setToast({ type: "err", msg: String(msg) });
    } else {
      const updated = await res.json().catch(() => null);
      const warnings: string[] = Array.isArray(updated?.warnings) ? updated.warnings : [];
      setToast({
        type: warnings.length ? "err" : "ok",
        msg: warnings.length ? `บันทึกแล้ว (มีข้อควรระวัง: ${warnings.join("; ")})` : "บันทึกแล้ว",
      });
      router.refresh();
      if (updated?.slug && updated.slug !== store.slug) {
        setForm((f) => ({ ...f, slug: updated.slug }));
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (
      !confirm(
        `ลบร้าน "${store.name}" ถาวร?\nสินค้าและออเดอร์ทั้งหมดที่อยู่ใน ProductVariant/OrderItem ของร้านนี้จะถูกลบตาม\nการกระทำนี้ย้อนกลับไม่ได้`,
      )
    ) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/admin/stores/${store.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/stores");
      router.refresh();
    } else {
      setToast({ type: "err", msg: "ลบไม่สำเร็จ" });
      setDeleting(false);
    }
  }

  const isImg = (s: string) => /^https?:\/\//.test(s);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {toast && (
        <div
          className={`sticky top-2 z-10 rounded-md px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-0 z-10 -mx-2 mb-1 flex gap-1 overflow-x-auto rounded-lg border bg-white p-1 shadow-sm sm:mx-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div hidden={tab !== "info"} className="space-y-5">
        <Section title="ข้อมูลพื้นฐาน">
          <Field label="ชื่อร้าน" required>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Slug (URL ของร้าน)" required hint={`/stores/${form.slug || "..."}`}>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase())}
              required
              pattern="^[a-z0-9฀-๿](?:[a-z0-9฀-๿-]*[a-z0-9฀-๿])?$"
              className="w-full rounded-md border px-3 py-2 font-mono text-sm"
            />
          </Field>

          <Field label="คำอธิบาย" hint="โชว์ในหน้าร้านและ meta description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Tagline" hint="ข้อความสั้นๆใต้ชื่อร้าน">
            <input
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="เช่น แฟชั่นนำเทรนด์ ส่งตรงจากโรงงาน"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>
        </Section>

        <Section title="โดเมน">
          <Field
            label="Custom Domain"
            hint="ถ้าตั้งไว้ ลูกค้าเข้าผ่านโดเมนนี้แทน /stores/[slug] (ต้องชี้ DNS มาที่ Vercel แยก)"
          >
            <input
              value={form.customDomain}
              onChange={(e) => update("customDomain", e.target.value.toLowerCase())}
              placeholder="shop.example.com"
              className="w-full rounded-md border px-3 py-2 font-mono text-sm"
            />
          </Field>
        </Section>

        <Section title="ข้อมูลนิติบุคคล / ภาษี">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อบริษัท / นิติบุคคล" hint='เช่น "บริษัท นิสิตสามย่าน จำกัด (สำนักงานใหญ่)"'>
              <input
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="บริษัท ___ จำกัด"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
            <Field label="เลขประจำตัวผู้เสียภาษี" hint="13 หลัก">
              <input
                value={form.taxId}
                onChange={(e) => update("taxId", e.target.value)}
                placeholder="0105564088661"
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
              />
            </Field>
          </div>
        </Section>
      </div>

      <div hidden={tab !== "design"} className="space-y-5">
        <Section title="แบรนด์ดิ้ง">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo URL">
              <input
                value={form.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              />
              {isImg(form.logoUrl) && (
                // Horizontal preview — most brand wordmarks are wider
                // than tall (e.g. ~3:1 aspect), so a square 80×80 well
                // crops the interesting parts. 240×80 + object-contain
                // shows the whole asset at the size the storefront
                // header will actually render it.
                <Image
                  src={form.logoUrl}
                  alt="Logo preview"
                  width={240}
                  height={80}
                  className="mt-2 rounded border bg-base-200 object-contain p-2"
                  unoptimized
                />
              )}
            </Field>

            <Field label="Banner URL" hint="รูปแบนเนอร์บนหน้าร้าน (อัตราส่วน ~3:1)">
              <input
                value={form.bannerUrl}
                onChange={(e) => update("bannerUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              />
              {isImg(form.bannerUrl) && (
                <Image
                  src={form.bannerUrl}
                  alt="Banner preview"
                  width={300}
                  height={100}
                  className="mt-2 rounded border object-cover"
                  unoptimized
                />
              )}
            </Field>
          </div>

          <Field label="Primary Color" hint="ใช้สำหรับปุ่ม / accent ในหน้าร้าน">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="h-9 w-14 cursor-pointer rounded border"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                placeholder="#2563eb"
                pattern="^#[0-9a-fA-F]{6}$"
                className="w-32 rounded-md border px-3 py-2 font-mono text-sm"
              />
            </div>
          </Field>
        </Section>

        <Section title="ส่วนหัวร้าน (Header)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ตำแหน่งโลโก้" hint="ซ้าย = ติดกับ search/menu, กลาง = อยู่ตรงกลางหัว">
              <select
                value={form.logoPosition}
                onChange={(e) => update("logoPosition", e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="left">ซ้าย (default)</option>
                <option value="center">กลาง</option>
              </select>
            </Field>
            <Field label="ตำแหน่งเมนู" hint="แนวการวาง nav links บน desktop">
              <select
                value={form.menuPosition}
                onChange={(e) => update("menuPosition", e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="right">ขวา (default)</option>
                <option value="center">กลาง</option>
                <option value="left">ซ้าย</option>
              </select>
            </Field>
          </div>
        </Section>
      </div>

      <div hidden={tab !== "contact"} className="space-y-5">
        <Section title="ที่อยู่ร้านค้า">
          <Field label="บ้านเลขที่ / ถนน">
            <input
              value={form.addressLine1}
              onChange={(e) => update("addressLine1", e.target.value)}
              placeholder="364/99 ซอยศูนย์วิจัย 4"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>
          <Field label="เพิ่มเติม (อาคาร / ชั้น)">
            <input
              value={form.addressLine2}
              onChange={(e) => update("addressLine2", e.target.value)}
              placeholder="ชั้น 2 อาคาร A (ไม่ใส่ก็ได้)"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="แขวง / ตำบล">
              <input
                value={form.subdistrict}
                onChange={(e) => update("subdistrict", e.target.value)}
                placeholder="บางกะปิ"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
            <Field label="เขต / อำเภอ">
              <input
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                placeholder="ห้วยขวาง"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
            <Field label="จังหวัด">
              <input
                value={form.province}
                onChange={(e) => update("province", e.target.value)}
                placeholder="กรุงเทพมหานคร"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
            <Field label="รหัสไปรษณีย์">
              <input
                value={form.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="10310"
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
              />
            </Field>
            <Field label="ประเทศ" hint="ISO code 2 ตัว เช่น TH, US">
              <input
                value={form.country}
                onChange={(e) => update("country", e.target.value.toUpperCase())}
                placeholder="TH"
                maxLength={2}
                className="w-24 rounded-md border px-3 py-2 font-mono text-sm uppercase"
              />
            </Field>
          </div>
        </Section>

        <Section title="ช่องทางติดต่อ">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                placeholder="contact@example.com"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
            <Field label="โทรศัพท์">
              <input
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                placeholder="0812345678"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Facebook Page URL">
              <input
                value={form.facebookUrl}
                onChange={(e) => update("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              />
            </Field>
            <Field label="Messenger URL" hint="m.me/... หรือลิงก์ Messenger">
              <input
                value={form.messengerUrl}
                onChange={(e) => update("messengerUrl", e.target.value)}
                placeholder="https://m.me/..."
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              />
            </Field>
            <Field label="X (Twitter) URL">
              <input
                value={form.twitterUrl}
                onChange={(e) => update("twitterUrl", e.target.value)}
                placeholder="https://x.com/..."
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              />
            </Field>
            <Field label="Instagram URL">
              <input
                value={form.instagramUrl}
                onChange={(e) => update("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              />
            </Field>
            <Field label="เว็บไซต์ (Website)">
              <input
                value={form.websiteUrl}
                onChange={(e) => update("websiteUrl", e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              />
            </Field>
            <Field label="LINE ID">
              <input
                value={form.lineId}
                onChange={(e) => update("lineId", e.target.value)}
                placeholder="@example"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </Section>

        <Section title="อีเมลของระบบ (Identity Verification)">
          <p className="text-xs text-muted-foreground">
            อีเมลกลางบนโดเมน platform — provision อัตโนมัติเมื่อร้านตั้งค่า Custom Domain
            ครั้งแรก ยืนยันตัวตนอัตโนมัติเมื่อ forward target = อีเมลที่ใช้ login (ไม่ต้อง OTP)
          </p>
          <Field label="อีเมลของระบบ" hint="ระบบสร้างให้เมื่อร้านตั้งค่า Custom Domain">
            <input
              value={store.platformEmail ?? "— ยังไม่มี —"}
              readOnly
              className="w-full rounded-md border bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700"
            />
          </Field>
          <Field
            label="ส่งต่อไปที่ (Forward target)"
            hint="ปลายทางที่อีเมลถูก forward ไป — ถ้าใส่อีเมลที่ตรงกับ owner.email (NextAuth verified) จะ verified อัตโนมัติ"
          >
            <input
              type="email"
              value={form.platformEmailForwardTo}
              onChange={(e) => update("platformEmailForwardTo", e.target.value)}
              placeholder="owner@gmail.com"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">สถานะ:</span>
            {store.platformEmailVerified ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                ยืนยันแล้ว ✓
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                ยังไม่ยืนยัน
              </span>
            )}
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? "กำลังลบ..." : "ลบร้านนี้"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
