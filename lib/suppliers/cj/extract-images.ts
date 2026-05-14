/**
 * extractAllImages — collect every gallery URL a CJ payload contains.
 *
 * CJ's `/product/query` response is inconsistent across categories:
 *   - `productImage`        → cover. Sometimes a string, sometimes a
 *                              JSON-encoded array, sometimes a string[].
 *   - `productImageSet`     → gallery. Usually a string[] but documented
 *                              examples occasionally return a single
 *                              semicolon/comma-joined string.
 *   - `productImageList`    → older alias for the same gallery field.
 *
 * The PDP bug — "gallery shows only 1 image, the duplicate of the cover" —
 * was caused by reading ONLY `productImageSet` and falling back to a
 * single-image extraction. This helper merges every shape into a deduped
 * ordered string[] so the enrich step + backfill see the full gallery
 * regardless of which fields CJ populates.
 *
 * The helper is pure (no I/O) so it's reusable from:
 *   - lib/suppliers/cj/enrich.ts (during ingestion + per-product re-enrich)
 *   - lib/admin/backfill-cj-images.ts (admin button — works off the cached
 *     externalPayload, no CJ refetch needed)
 */

function parseImageField(raw: unknown): string[] {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    // JSON-encoded array (CJ returns these for some categories).
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (x): x is string => typeof x === "string" && x.trim().length > 0,
          );
        }
      } catch {
        // fall through to delimiter parsing
      }
    }
    // Semicolon/comma-joined fallback. Single URLs sail through this too
    // (they just produce a one-element array).
    return trimmed
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

/**
 * Pull every image URL from a CJ raw-product payload, deduped + ordered.
 *
 * Order semantics:
 *   1. `productImage` first — CJ treats this as the cover. By putting it
 *      first, callers can `.shift()` to get the cover OR
 *      `.filter(u => u !== cover)` to get just the secondary gallery.
 *   2. `productImageSet` / `productImageList` second — the "other angles".
 *
 * Dedup preserves first-occurrence order so a URL appearing in BOTH
 * fields (CJ does this often) still shows once.
 */
export function extractAllImages(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;

  const cover = parseImageField(r.productImage);
  const set = [
    ...parseImageField(r.productImageSet),
    ...parseImageField(r.productImageList),
  ];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const url of [...cover, ...set]) {
    if (!seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}
