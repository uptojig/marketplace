"use client";

import { useState } from "react";

type HeroContent = {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonHref?: string;
  imageUrl?: string;
};

export function HeroBannerForm({
  content,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  // Seed from incoming content but keep our own state so the user
  // can iterate without losing focus on each keystroke. Parent gets
  // notified on every change via onChange — same model as JSON edit.
  const [local, setLocal] = useState<HeroContent>(() => ({
    headline: typeof content.headline === "string" ? content.headline : "",
    subheadline:
      typeof content.subheadline === "string" ? content.subheadline : "",
    buttonText:
      typeof content.buttonText === "string" ? content.buttonText : "",
    buttonHref:
      typeof content.buttonHref === "string" ? content.buttonHref : "",
    imageUrl: typeof content.imageUrl === "string" ? content.imageUrl : "",
  }));

  function update<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    const next = { ...local, [key]: value };
    setLocal(next);
    // Spread back into the original content object so we don't
    // wipe unknown fields (e.g. agent-specific layout hints).
    onChange({ ...content, ...next });
  }

  return (
    <div className="space-y-3" aria-label="HeroBanner form">
      <Field label="Headline">
        <input
          value={local.headline ?? ""}
          onChange={(e) => update("headline", e.target.value)}
          disabled={disabled}
          className="w-full rounded border px-3 py-1.5 text-sm"
        />
      </Field>
      <Field label="Subheadline">
        <input
          value={local.subheadline ?? ""}
          onChange={(e) => update("subheadline", e.target.value)}
          disabled={disabled}
          className="w-full rounded border px-3 py-1.5 text-sm"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button text">
          <input
            value={local.buttonText ?? ""}
            onChange={(e) => update("buttonText", e.target.value)}
            disabled={disabled}
            className="w-full rounded border px-3 py-1.5 text-sm"
          />
        </Field>
        <Field label="Button href">
          <input
            value={local.buttonHref ?? ""}
            onChange={(e) => update("buttonHref", e.target.value)}
            disabled={disabled}
            placeholder="/products"
            className="w-full rounded border px-3 py-1.5 text-sm"
          />
        </Field>
      </div>
      <Field label="Image URL">
        <input
          value={local.imageUrl ?? ""}
          onChange={(e) => update("imageUrl", e.target.value)}
          disabled={disabled}
          placeholder="https://..."
          className="w-full rounded border px-3 py-1.5 text-sm font-mono"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-stone-600">
        {label}
      </span>
      {children}
    </label>
  );
}
