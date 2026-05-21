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
        <p className="text-[11px] font-medium uppercase tracking-wide text-mp-ink-muted">
          ขั้นที่ 1 · เอกลักษณ์แบรนด์
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          แนะนำร้านของคุณ
        </h2>
        <p className="text-sm text-mp-ink-muted">
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
          className="w-full rounded-lg border border-mp-border bg-white px-3 py-2.5 text-base outline-none transition focus:border-mp-coral focus:ring-2 focus:ring-mp-coral/20"
        />
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
          className="w-full resize-none rounded-lg border border-mp-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-mp-coral focus:ring-2 focus:ring-mp-coral/20"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="โลโก้">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-mp-border bg-white transition hover:border-zinc-500"
          >
            {identity.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={identity.logoDataUrl}
                alt="logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xs text-mp-ink-muted">+ อัปโหลด</span>
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
            className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-mp-border bg-white transition hover:border-zinc-500"
          >
            {identity.bannerDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={identity.bannerDataUrl}
                alt="banner"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-mp-ink-muted">+ อัปโหลด</span>
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

      <details
        className="rounded-lg border border-mp-border bg-white"
        open={contactOpen}
        onToggle={(e) => setContactOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-mp-ink">
          <span>ช่องทางติดต่อและที่อยู่</span>
          <span className="text-[11px] font-normal text-mp-ink-muted">
            ไม่บังคับ · ใส่ทีหลังก็ได้
          </span>
        </summary>
        <div className="space-y-3 border-t border-mp-border p-3">
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
              className="w-full resize-none rounded-lg border border-mp-border bg-white px-3 py-2 text-sm outline-none transition focus:border-mp-coral focus:ring-2 focus:ring-mp-coral/20"
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
      <span className="text-[11px] font-medium text-mp-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-mp-border bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-mp-coral focus:ring-2 focus:ring-mp-coral/20"
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
        <span className="text-sm font-medium text-mp-ink">{label}</span>
        {hint && (
          <span className="text-[11px] text-mp-ink-muted truncate">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
