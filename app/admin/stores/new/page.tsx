"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Sparkles,
  Store as StoreIcon,
} from "lucide-react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type Layout = "left" | "center" | "right";

const LAYOUT_OPTIONS: { id: Layout; label: string; hint: string }[] = [
  { id: "left", label: "ข้อความซ้าย", hint: "ข้อความ ↔ รูป" },
  { id: "center", label: "ข้อความกลาง", hint: "ข้อความตรงกลาง" },
  { id: "right", label: "ข้อความขวา", hint: "รูป ↔ ข้อความ" },
];

const COLOR_PRESETS: { label: string; value: string }[] = [
  { label: "น้ำเงิน", value: "#2563eb" },
  { label: "ชมพู", value: "#ec4899" },
  { label: "เขียว", value: "#15803d" },
  { label: "ม่วง", value: "#7c3aed" },
  { label: "ส้ม", value: "#ea580c" },
  { label: "ทอง", value: "#D4AF37" },
  { label: "แดง", value: "#dc2626" },
  { label: "ดำ", value: "#0a0a0a" },
];

// hex → rgba string with given alpha, so we can derive a soft background
// tint from the operator's chosen primary color without bringing in a
// whole color library.
function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace("#", "");
  if (v.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function NewStorePage() {
  const router = useRouter();

  // — Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const slug = slugify(name);

  // — Design
  const [layout, setLayout] = useState<Layout>("left");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");

  // — Images
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  // — Contact (accordion, collapsed by default to keep the sidebar short)
  const [contactOpen, setContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [lineId, setLineId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (slug.length < 2) {
      setError("ชื่อร้านต้องมีตัวอักษรอย่างน้อย 2 ตัว");
      return;
    }
    setError(null);
    setSaving(true);

    // 1. Create the row with the fields the POST endpoint accepts.
    const createRes = await fetch("/api/admin/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description: description || undefined,
        logoPosition: layout === "right" ? "center" : "left",
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      const msg =
        typeof err.error === "object"
          ? Object.values(err.error).flat().join(", ")
          : (err.error ?? "บันทึกไม่สำเร็จ");
      setError(String(msg));
      setSaving(false);
      return;
    }
    const created = (await createRes.json()) as { id: string; slug: string };

    // 2. PATCH the rest (color / images / contact). The POST schema only
    //    covers the bare-minimum fields; everything else lives behind the
    //    edit endpoint, so push it in a second call instead of expanding
    //    the create schema.
    const hasExtras =
      primaryColor !== "#2563eb" ||
      logoUrl ||
      bannerUrl ||
      contactEmail ||
      contactPhone ||
      addressLine1 ||
      facebookUrl ||
      lineId;
    if (hasExtras) {
      await fetch(`/api/admin/stores/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor,
          logoUrl: logoUrl || undefined,
          bannerUrl: bannerUrl || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          addressLine1: addressLine1 || undefined,
          facebookUrl: facebookUrl || undefined,
          lineId: lineId || undefined,
        }),
      }).catch(() => {
        // Non-fatal — the store is already created, operator can edit
        // the rest from the detail page.
      });
    }

    router.push(`/admin/stores/${created.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/stores"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        กลับไปรายการร้าน
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">สร้างร้านค้าใหม่</h1>
          <p className="text-sm text-stone-500">
            กรอกข้อมูลในแผงด้านซ้าย — ฝั่งขวาจะพรีวิวให้แบบ real-time
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[380px_1fr]"
      >
        {/* ───────── Sidebar (left) ───────── */}
        <aside className="space-y-4">
          <Group title="ข้อมูลพื้นฐาน">
            <Field label="ชื่อร้าน" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ร้านขนมไทย"
                required
                autoFocus
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-stone-500">
                URL:{" "}
                <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px]">
                  /stores/{slug || "<slug>"}
                </code>
              </p>
            </Field>

            <Field label="คำอธิบาย" hint="โชว์ใต้ชื่อร้าน">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="ขายอะไร เน้นลูกค้ากลุ่มไหน..."
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>
          </Group>

          <Group title="ดีไซน์">
            <Field label="เลย์เอาต์เริ่มต้น">
              <div className="grid grid-cols-3 gap-2">
                {LAYOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLayout(opt.id)}
                    className={`rounded-md border px-2 py-2 text-xs transition ${
                      layout === opt.id
                        ? "border-black bg-black text-white"
                        : "bg-white hover:bg-stone-50"
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="mt-0.5 text-[10px] opacity-70">
                      {opt.hint}
                    </div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="โทนสีหลัก" hint="ปุ่ม / accent ในหน้าร้าน">
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setPrimaryColor(c.value)}
                    title={c.label}
                    aria-label={c.label}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      primaryColor === c.value
                        ? "border-black ring-2 ring-black/20"
                        : "border-white ring-1 ring-stone-200"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border"
                />
                <input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  pattern="^#[0-9a-fA-F]{6}$"
                  className="w-28 rounded-md border px-2 py-1.5 font-mono text-xs"
                />
              </div>
            </Field>
          </Group>

          <Group title="รูปภาพ">
            <Field label="โลโก้">
              <ImageUploadField
                value={logoUrl}
                onChange={setLogoUrl}
                kind="logo"
                previewWidth={200}
                previewHeight={64}
              />
            </Field>
            <Field label="แบนเนอร์" hint="อัตราส่วน ~3:1">
              <ImageUploadField
                value={bannerUrl}
                onChange={setBannerUrl}
                kind="banner"
                previewWidth={300}
                previewHeight={100}
                cover
              />
            </Field>
          </Group>

          {/* Accordion — ช่องทางติดต่อ collapsed by default */}
          <div className="overflow-hidden rounded-lg border bg-white">
            <button
              type="button"
              onClick={() => setContactOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-stone-50"
              aria-expanded={contactOpen}
            >
              <span>ช่องทางติดต่อและที่อยู่</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  contactOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {contactOpen && (
              <div className="space-y-3 border-t bg-stone-50/50 px-4 py-4">
                <Field label="Email">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="โทรศัพท์">
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="ที่อยู่ร้าน">
                  <input
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="364/99 ซอยศูนย์วิจัย 4"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="Facebook">
                  <input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full rounded-md border px-3 py-2 font-mono text-xs"
                  />
                </Field>
                <Field label="LINE ID">
                  <input
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    placeholder="@example"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </Field>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !slug}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                สร้างร้าน
              </>
            )}
          </button>
        </aside>

        {/* ───────── Live Preview (right) ───────── */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <div className="mb-2 flex items-center gap-2 text-xs text-stone-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            พรีวิวสด — อัพเดทตามที่เลือก
          </div>
          <PreviewPanel
            name={name || "ชื่อร้านของคุณ"}
            description={description || "คำอธิบายร้านจะแสดงตรงนี้"}
            layout={layout}
            primaryColor={primaryColor}
            logoUrl={logoUrl}
            bannerUrl={bannerUrl}
          />
        </div>
      </form>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
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
      <label className="mb-1 block text-xs font-medium text-stone-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-stone-500">{hint}</p>}
    </div>
  );
}

function PreviewPanel({
  name,
  description,
  layout,
  primaryColor,
  logoUrl,
  bannerUrl,
}: {
  name: string;
  description: string;
  layout: Layout;
  primaryColor: string;
  logoUrl: string;
  bannerUrl: string;
}) {
  // Soft tint of the primary color → readable bg without picking a
  // separate "bgColor" field.
  const bg = useMemo(() => hexToRgba(primaryColor, 0.08), [primaryColor]);
  const ring = useMemo(() => hexToRgba(primaryColor, 0.25), [primaryColor]);

  // Hero arrangement responds directly to the layout chip.
  const flexDir =
    layout === "center"
      ? "flex-col items-center text-center"
      : layout === "right"
        ? "md:flex-row-reverse"
        : "md:flex-row";

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* Mock browser chrome — sells the "this is your website" framing
          without needing an iframe. */}
      <div className="flex items-center gap-1.5 border-b bg-stone-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 truncate text-xs text-stone-400">
          /stores/{slugify(name) || "your-store"}
        </span>
      </div>

      {/* Storefront preview */}
      <div style={{ backgroundColor: bg }}>
        {/* Nav */}
        <div className="flex items-center justify-between border-b border-black/5 bg-white/60 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-7 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded"
                style={{ backgroundColor: primaryColor }}
              >
                <StoreIcon className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <span className="text-sm font-semibold text-stone-800">
              {name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>หน้าแรก</span>
            <span>สินค้า</span>
            <span>ติดต่อ</span>
          </div>
        </div>

        {/* Hero */}
        <div className="px-6 py-10 md:px-10 md:py-14">
          <div className={`flex ${flexDir} items-center gap-8`}>
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl font-bold leading-tight text-stone-900 md:text-3xl">
                {name}
              </h1>
              <p className="text-sm text-stone-600 md:text-base">
                {description}
              </p>
              <button
                type="button"
                className="rounded-md px-5 py-2 text-sm font-medium text-white shadow-md transition"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 8px 24px -8px ${ring}`,
                }}
              >
                เริ่มช้อปเลย
              </button>
            </div>

            {layout !== "center" && (
              <div className="flex-1">
                {bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bannerUrl}
                    alt=""
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="aspect-[4/3] w-full rounded-lg"
                    style={{
                      backgroundColor: hexToRgba(primaryColor, 0.18),
                      backgroundImage: `linear-gradient(135deg, ${hexToRgba(
                        primaryColor,
                        0.25,
                      )}, ${hexToRgba(primaryColor, 0.05)})`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product grid mock */}
        <div className="grid grid-cols-3 gap-3 px-6 pb-10 md:px-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-black/5 bg-white p-2 shadow-sm"
            >
              <div
                className="aspect-square w-full rounded"
                style={{ backgroundColor: hexToRgba(primaryColor, 0.1) }}
              />
              <div className="mt-2 h-2 w-3/4 rounded bg-stone-200" />
              <div className="mt-1 h-2 w-1/2 rounded bg-stone-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
