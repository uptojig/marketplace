/**
 * Shared PATCH helper for the per-tab section forms. Each section calls
 * patchStore() with only its own dirty fields so we never overwrite
 * unrelated columns. The API's update schema treats `undefined` as "no
 * change" and `null` as "clear", so empty strings are explicitly
 * converted to `null` for nullable fields and the special template
 * picker fields are stripped when the operator hasn't set them yet.
 *
 * Returns a shape compatible with <OperatorFormSection>'s onSubmit
 * contract: `{ ok: true, message? }` | `{ ok: false, message }`.
 */

import type { OperatorFormSectionSubmitResult } from "@/components/operator/operator-form-section";

export async function patchStore(
  storeId: string,
  body: Record<string, unknown>,
): Promise<OperatorFormSectionSubmitResult> {
  const res = await fetch(`/api/admin/stores/${storeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: unknown;
      detail?: string;
    };
    const fieldErrors =
      err && typeof err.error === "object" && err.error !== null
        ? Object.entries(err.error as Record<string, unknown>)
            .flatMap(([k, v]) =>
              Array.isArray(v) ? v.map((m) => `${k}: ${m}`) : [`${k}: ${v}`],
            )
            .join("; ")
        : null;
    const msg =
      fieldErrors ||
      err.detail ||
      (typeof err.error === "string" ? err.error : null) ||
      "บันทึกไม่สำเร็จ";
    return { ok: false, message: String(msg) };
  }
  const updated = (await res.json().catch(() => null)) as {
    warnings?: string[];
  } | null;
  const warnings = Array.isArray(updated?.warnings) ? updated.warnings : [];
  if (warnings.length) {
    return { ok: true, message: `บันทึกแล้ว (${warnings.join("; ")})` };
  }
  return { ok: true, message: "บันทึกแล้ว" };
}

/**
 * Strip empty strings from optional picker fields before PATCH so the
 * API treats them as "no change" instead of "clear to null". For other
 * nullable text fields the server-side trimNullable transform already
 * handles "" → null, so we leave those alone.
 */
export function dropEmptyPickers<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[],
): Partial<T> {
  const out: Partial<T> = { ...obj };
  for (const key of keys) {
    if (out[key] === "" || out[key] === undefined) delete out[key];
  }
  return out;
}
