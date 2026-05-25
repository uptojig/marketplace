"use client";

/**
 * Two-phase create flow shared by the wizard's brief step.
 *
 *   1. POST /api/admin/stores            — creates the row, seeds template + style
 *   2. POST .../generate-landing (NDJSON) — streams the AI build
 *
 * Returning early after a successful create + failed generate is the
 * intentional behaviour: the operator can still open the just-created
 * store and retry from the edit page.
 */

import {
  serializeTemplateStyle,
  type TemplateStyleValues,
} from "@/components/store/template-style-picker";

export type CreateStoreInput = {
  name: string;
  slug: string;
  description: string;
  brief: string;
  engine: "local" | "managed";
  style: TemplateStyleValues;
};

export type CreateStoreCallbacks = {
  onStatus: (text: string) => void;
  onCreated: (storeId: string) => void;
};

export type CreateStoreResult =
  | { ok: true; storeId: string }
  | { ok: false; error: string };

export async function createStoreAndStream(
  input: CreateStoreInput,
  cb: CreateStoreCallbacks,
): Promise<CreateStoreResult> {
  cb.onStatus("กำลังสร้างร้าน...");

  const stylePayload = serializeTemplateStyle(input.style);
  const createRes = await fetch("/api/admin/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      slug: input.slug,
      description: input.description,
      ...stylePayload,
    }),
  });
  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    const msg =
      typeof err.error === "object"
        ? Object.values(err.error).flat().join(", ")
        : (err.error ?? "บันทึกไม่สำเร็จ");
    return { ok: false, error: String(msg) };
  }
  const created = (await createRes.json()) as { id: string };
  cb.onCreated(created.id);
  cb.onStatus("เป็ดกำลังออกแบบ... ใช้เวลา 30 วินาที – 3 นาที");

  const url =
    `/api/admin/stores/${created.id}/generate-landing` +
    (input.engine === "managed" ? "?engine=managed" : "");
  const genRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief: input.brief.trim() }),
  });
  if (!genRes.ok || !genRes.body) {
    return { ok: true, storeId: created.id };
  }

  await drainStream(genRes.body, cb.onStatus);
  return { ok: true, storeId: created.id };
}

async function drainStream(
  body: ReadableStream<Uint8Array>,
  onStatus: (text: string) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  try {
    // Drain the NDJSON stream so the connection stays alive until the
    // server signals done — we surface the last status line via onStatus.
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n").filter(Boolean)) {
        try {
          const evt = JSON.parse(line) as { type?: string; message?: string };
          if (evt.type === "done") onStatus("เสร็จ ✓ กำลังเปลี่ยนหน้า...");
          else if (evt.type === "error")
            onStatus(`ผิดพลาด: ${evt.message ?? "unknown"}`);
        } catch {
          /* ignore non-JSON */
        }
      }
    }
  } catch {
    /* connection ended */
  }
}
