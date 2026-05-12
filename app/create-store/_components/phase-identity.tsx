"use client";

import { useRef, useState } from "react";
import {
  NICHES,
  PALETTES,
  slugify,
  type BrandVoice,
  type ContactInfo,
  type NicheId,
  type WizardState,
} from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
  onChange: (patch: Partial<WizardState["identity"]>) => void;
};

const BRAND_VOICES: { id: BrandVoice; label: string; hint: string }[] = [
  { id: "casual", label: "สบายๆ", hint: "เป็นกันเอง คุยเหมือนเพื่อน" },
  { id: "formal", label: "ทางการ", hint: "น่าเชื่อถือ มืออาชีพ" },
  { id: "playful", label: "สนุก", hint: "ขี้เล่น สดใส มีอารมณ์ขัน" },
];

export function PhaseIdentity({ state, onChange }: Props) {
  const { identity } = state;
  const slug = slugify(identity.name);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const patchContact = (p: Partial<ContactInfo>) =>
    onChange({ contact: { ...identity.contact, ...p } });

  const handleFile =
    (key: "logoDataUrl" | "bannerDataUrl") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => onChange({ [key]: reader.result as string });
      reader.readAsDataURL(file);
    };

  return (
    <div className="space-y-7">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          ขั้นที่ 1 · เอกลักษณ์แบรนด์
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          แนะนำร้านของคุณ
        </h2>
        <p className="text-sm text-zinc-600">
          ระบบจะใช้ข้อมูลนี้แนะนำเลย์เอาต์และโทนการเขียนสินค้าให้
        </p>
      </header>

      <Field label="ชื่อร้านค้า" hint={`URL: ${slug}.basketplace.co`}>
        <input
          type="text"
          autoFocus
          value={identity.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="เช่น Camping Shop"
          maxLength={40}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
        />
      </Field>

      <Field
        label="หมวดสินค้าหลัก (Niche)"
        hint="ใช้ในการแนะนำเลย์เอาต์และคัดสินค้าจากคลัง"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {NICHES.map((n) => {
            const active = identity.niche === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onChange({ niche: n.id as NicheId })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                <span aria-hidden>{n.emoji}</span>
                <span className="truncate">{n.label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="แนะนำร้านสั้นๆ"
        hint="2-3 ประโยค จะใช้ในหน้าแรกและ SEO (เว้นว่างก็ได้ ระบบจะช่วยร่างให้)"
      >
        <textarea
          value={identity.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          maxLength={240}
          placeholder="เช่น ร้านอุปกรณ์แคมป์ปิ้งคุณภาพดี ราคามิตร ส่งฟรีทั่วไทย"
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
        />
      </Field>

      <Field label="โทนการเขียน (Brand voice)">
        <div className="grid grid-cols-3 gap-2">
          {BRAND_VOICES.map((v) => {
            const active = identity.brandVoice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onChange({ brandVoice: v.id })}
                className={`rounded-lg border p-2.5 text-left transition ${
                  active
                    ? "border-zinc-900 ring-2 ring-zinc-900/10"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <p className="text-sm font-medium">{v.label}</p>
                <p className="text-[11px] leading-tight text-zinc-500">{v.hint}</p>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="โลโก้">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-white transition hover:border-zinc-500"
          >
            {identity.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={identity.logoDataUrl}
                alt="logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xs text-zinc-500">+ อัปโหลด</span>
            )}
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile("logoDataUrl")}
          />
        </Field>

        <Field label="แบนเนอร์ปก">
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-white transition hover:border-zinc-500"
          >
            {identity.bannerDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={identity.bannerDataUrl}
                alt="banner"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-zinc-500">+ อัปโหลด</span>
            )}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile("bannerDataUrl")}
          />
        </Field>
      </div>

      <Field label="โทนสี (Palette)">
        <div className="grid grid-cols-4 gap-2">
          {PALETTES.map((p) => {
            const active = identity.paletteId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ paletteId: p.id })}
                aria-label={p.name}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition ${
                  active
                    ? "border-zinc-900 ring-2 ring-zinc-900/10"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <div className="flex h-8 w-full overflow-hidden rounded-md">
                  <span className="h-full flex-1" style={{ backgroundColor: p.primary }} />
                  <span className="h-full flex-1" style={{ backgroundColor: p.accent }} />
                </div>
                <span className="text-[11px] text-zinc-700">{p.name}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <details
        className="rounded-lg border border-zinc-200 bg-white"
        open={contactOpen}
        onToggle={(e) => setContactOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-zinc-800">
          <span>ช่องทางติดต่อและที่อยู่</span>
          <span className="text-[11px] font-normal text-zinc-500">
            ไม่บังคับ · ใส่ทีหลังก็ได้
          </span>
        </summary>
        <div className="space-y-3 border-t border-zinc-100 p-3">
          <div className="grid grid-cols-2 gap-2">
            <ContactInput
              label="โทรศัพท์"
              type="tel"
              placeholder="08x-xxx-xxxx"
              value={identity.contact.phone}
              onChange={(v) => patchContact({ phone: v })}
            />
            <ContactInput
              label="อีเมล"
              type="email"
              placeholder="shop@example.com"
              value={identity.contact.email}
              onChange={(v) => patchContact({ email: v })}
            />
          </div>
          <ContactInput
            label="LINE ID"
            placeholder="@yourshop"
            value={identity.contact.lineId}
            onChange={(v) => patchContact({ lineId: v })}
          />
          <div className="grid grid-cols-3 gap-2">
            <ContactInput
              label="Facebook"
              placeholder="facebook.com/yourshop"
              value={identity.contact.facebook}
              onChange={(v) => patchContact({ facebook: v })}
            />
            <ContactInput
              label="Instagram"
              placeholder="@yourshop"
              value={identity.contact.instagram}
              onChange={(v) => patchContact({ instagram: v })}
            />
            <ContactInput
              label="TikTok"
              placeholder="@yourshop"
              value={identity.contact.tiktok}
              onChange={(v) => patchContact({ tiktok: v })}
            />
          </div>
          <Field
            label="ที่อยู่ร้าน / จุดส่งของ"
            hint="ใช้สำหรับใบกำกับและการรับคืน"
          >
            <textarea
              value={identity.contact.address}
              onChange={(e) => patchContact({ address: e.target.value })}
              rows={2}
              maxLength={200}
              placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
          </Field>
        </div>
      </details>
    </div>
  );
}

function ContactInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium text-zinc-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />
    </label>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-800">{label}</span>
        {hint && (
          <span className="text-[11px] text-zinc-500 truncate">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
