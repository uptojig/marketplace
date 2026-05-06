"use client";

/**
 * Family D Customizer — Industrial Masculine signature feature.
 *
 * Engraving + material picker rendered on the PDP, shown only for
 * Family D themes (CSS-gated via `.theme-D [data-family-d-customizer]
 * { display: block; }`).  Other themes never see it.
 *
 * Captures:
 *   - Engraving text (0–20 chars, A-Z 0-9 . - and Thai chars)
 *   - Material choice (2 options that match Industrial palette:
 *     เหล็กดำ matte black / ทองเหลือง brushed brass)
 *
 * State persists per-product in localStorage so refresh survives.
 * The preview block below the input shows the captured customization
 * in monospace ALL-CAPS (Family D microcopy convention).
 *
 * NOTE: V1 is presentational — the customization is shown back to
 * the user but isn't yet wired into the cart payload.  The "Add to
 * Cart" CTA above this block still ships only the variant selection.
 * Wiring through to OrderItem requires a schema bump and is tracked
 * separately.  The microcopy here is honest about that ("ยืนยันที่
 * ขั้นตอนสุดท้าย").
 */
import { useEffect, useState } from "react";

interface Material {
  key: string;
  label: string;
  swatchHex: string;
  textOnSwatchHex: string;
}

const MATERIALS: Material[] = [
  {
    key: "matte-black",
    label: "เหล็กดำด้าน",
    swatchHex: "#1a1a1a",
    textOnSwatchHex: "#d4d4d4",
  },
  {
    key: "brushed-brass",
    label: "ทองเหลืองขัด",
    swatchHex: "#b08d57",
    textOnSwatchHex: "#1a1a1a",
  },
];

const MAX_ENGRAVING = 20;
const STORAGE_KEY = (productId: string) => `shop-customizer-${productId}`;

interface SavedCustomization {
  engraving: string;
  materialKey: string;
}

export function FamilyDCustomizer({
  productId,
}: {
  productId: string;
}) {
  const [engraving, setEngraving] = useState("");
  const [materialKey, setMaterialKey] = useState(MATERIALS[0].key);

  // Hydrate from localStorage on mount (per-product)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(productId));
      if (raw) {
        const parsed: SavedCustomization = JSON.parse(raw);
        if (typeof parsed.engraving === "string") {
          setEngraving(parsed.engraving.slice(0, MAX_ENGRAVING));
        }
        if (
          typeof parsed.materialKey === "string" &&
          MATERIALS.some((m) => m.key === parsed.materialKey)
        ) {
          setMaterialKey(parsed.materialKey);
        }
      }
    } catch {
      /* corrupt — ignore */
    }
  }, [productId]);

  // Persist on every change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: SavedCustomization = { engraving, materialKey };
      localStorage.setItem(STORAGE_KEY(productId), JSON.stringify(payload));
    } catch {
      /* quota — ignore */
    }
  }, [engraving, materialKey, productId]);

  const material = MATERIALS.find((m) => m.key === materialKey) ?? MATERIALS[0];
  const cleanEngraving = engraving.toUpperCase().trim();

  return (
    <div
      data-family-d-customizer
      className="hidden mt-6 border"
      style={{
        borderColor: "var(--shop-border)",
        borderRadius: 0,
        background: "var(--shop-card)",
      }}
    >
      {/* Header strip — Industrial label band */}
      <div
        className="px-4 py-2 border-b"
        style={{
          borderColor: "var(--shop-border)",
          background:
            "color-mix(in srgb, var(--shop-ink) 4%, transparent)",
        }}
      >
        <p
          className="text-[10px] font-mono font-bold uppercase tracking-[0.25em]"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          ปรับแต่งเฉพาะของคุณ · CUSTOM ORDER
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* ── Engraving ─────────────────────────────────────── */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-[0.18em] mb-2"
            style={{ color: "var(--shop-ink)" }}
          >
            สลักข้อความ <span style={{ color: "var(--shop-ink-muted)" }}>·</span>{" "}
            ENGRAVING
          </label>
          <input
            type="text"
            value={engraving}
            onChange={(e) =>
              setEngraving(e.target.value.slice(0, MAX_ENGRAVING))
            }
            maxLength={MAX_ENGRAVING}
            placeholder="A–Z 0–9 . -"
            className="w-full font-mono text-base font-bold uppercase tracking-[0.15em] bg-transparent outline-none px-3 py-2.5 border placeholder:opacity-40 placeholder:font-normal placeholder:tracking-normal placeholder:text-xs focus:ring-2 focus:ring-offset-1"
            style={{
              borderColor: "var(--shop-border)",
              borderRadius: 0,
              color: "var(--shop-ink)",
              // @ts-expect-error CSS custom var
              "--tw-ring-color": "var(--shop-primary)",
            }}
            aria-describedby="engraving-counter"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <p
              className="text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--shop-ink-muted)" }}
            >
              สูงสุด {MAX_ENGRAVING} อักขระ
            </p>
            <p
              id="engraving-counter"
              className="text-[10px] font-mono"
              style={{
                color:
                  engraving.length >= MAX_ENGRAVING - 2
                    ? "var(--shop-primary)"
                    : "var(--shop-ink-muted)",
              }}
            >
              {engraving.length} / {MAX_ENGRAVING}
            </p>
          </div>
        </div>

        {/* ── Material toggle ───────────────────────────────── */}
        <fieldset>
          <legend
            className="text-xs font-bold uppercase tracking-[0.18em] mb-2"
            style={{ color: "var(--shop-ink)" }}
          >
            วัสดุ <span style={{ color: "var(--shop-ink-muted)" }}>·</span>{" "}
            MATERIAL
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {MATERIALS.map((mat) => {
              const selected = mat.key === materialKey;
              return (
                <button
                  key={mat.key}
                  type="button"
                  onClick={() => setMaterialKey(mat.key)}
                  aria-pressed={selected}
                  className="group flex items-center gap-3 px-3 py-2.5 border transition-colors"
                  style={{
                    borderColor: selected
                      ? "var(--shop-primary)"
                      : "var(--shop-border)",
                    borderRadius: 0,
                    background: selected
                      ? "color-mix(in srgb, var(--shop-primary) 6%, transparent)"
                      : "transparent",
                    boxShadow: selected
                      ? "inset 0 0 0 1px var(--shop-primary)"
                      : "none",
                  }}
                >
                  <span
                    className="h-7 w-7 shrink-0 border"
                    style={{
                      background: mat.swatchHex,
                      borderColor:
                        "color-mix(in srgb, var(--shop-ink) 25%, transparent)",
                    }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">
                    <span
                      className="block text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
                      style={{
                        color: selected
                          ? "var(--shop-ink)"
                          : "var(--shop-ink-muted)",
                      }}
                    >
                      {mat.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* ── Preview block ─────────────────────────────────── */}
        <div
          className="px-4 py-4 border"
          style={{
            background: material.swatchHex,
            borderColor:
              "color-mix(in srgb, var(--shop-ink) 25%, transparent)",
            borderRadius: 0,
          }}
        >
          <p
            className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2"
            style={{
              color: `color-mix(in srgb, ${material.textOnSwatchHex} 60%, transparent)`,
            }}
          >
            ตัวอย่าง · PREVIEW
          </p>
          <p
            className="font-mono text-2xl font-bold uppercase tracking-[0.2em] break-all leading-tight"
            style={{
              color: material.textOnSwatchHex,
              minHeight: "1.5em",
            }}
          >
            {cleanEngraving || "—"}
          </p>
        </div>

        {/* Honest disclosure — V1 isn't wired into the cart yet */}
        <p
          className="text-[10px] font-mono uppercase tracking-[0.15em] leading-relaxed"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          * การปรับแต่งจะยืนยันที่ขั้นตอนสุดท้าย ก่อนชำระเงิน · CONFIRM AT CHECKOUT
        </p>
      </div>
    </div>
  );
}
