"use client";

import { useState } from "react";

type CtaContent = {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonHref?: string;
};

export function CtaForm({
  content,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState<CtaContent>(() => ({
    headline: typeof content.headline === "string" ? content.headline : "",
    subheadline:
      typeof content.subheadline === "string" ? content.subheadline : "",
    buttonText:
      typeof content.buttonText === "string" ? content.buttonText : "",
    buttonHref:
      typeof content.buttonHref === "string" ? content.buttonHref : "",
  }));

  function update<K extends keyof CtaContent>(key: K, value: CtaContent[K]) {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange({ ...content, ...next });
  }

  return (
    <div className="space-y-3" aria-label="CTA form">
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
