/**
 * Rewrite agent-emitted relative links inside a v12 schema to be
 * store-scoped (`/stores/<slug>/...`).
 *
 * Why this exists:
 *   GlobalHeader / GlobalFooter run their own `resolveHref()` so
 *   header + footer nav stays correct, but block components like
 *   CTA / CategoryBanner / Banner render links from agent-emitted
 *   content (e.g. `ctaLink: "/contact"`) as-is. The agent has no
 *   way to know the store slug at generation time, so it emits
 *   bare `/contact`, `/products`, `/about` URLs that 404 when the
 *   store lives at `/stores/<slug>/contact`.
 *
 *   Rather than thread storeSlug through every block component
 *   (cta, banner, category-banner, ...) and add resolveHref calls
 *   in each one, we rewrite at the schema level once, before render.
 *
 * What we rewrite:
 *   - Any string field whose key suggests a URL (case-insensitive
 *     match on Link / Href / Url / LinkTo) AND whose value starts
 *     with "/" but NOT "/stores/" or "/_next/" or "/#".
 *   - Recursively: dives into nested objects, arrays, and the
 *     pages[] / blocks[] / content / items / etc. tree.
 *
 * What we don't touch:
 *   - Absolute URLs (http:, https:)
 *   - mailto: / tel: / # anchors
 *   - Already-scoped /stores/ paths
 *   - Asset paths (/_next/, /icons/, /uploads/)
 *   - Non-string values
 */

const ABSOLUTE_OR_SPECIAL =
  /^(?:https?:|mailto:|tel:|sms:|#|\/_next\/|\/icons\/|\/uploads\/|\/static\/|\/favicon|\/stores\/)/i;

const URL_KEY_PATTERN = /(link(?:to)?|href|url)$/i;

function isUrlKey(key: string): boolean {
  return URL_KEY_PATTERN.test(key);
}

function rewriteValue(value: string, storeSlug: string): string {
  if (!value) return value;
  if (ABSOLUTE_OR_SPECIAL.test(value)) return value;
  if (!value.startsWith("/")) return value;
  // "/" alone → store homepage. Otherwise scope under the slug.
  return value === "/"
    ? `/stores/${storeSlug}`
    : `/stores/${storeSlug}${value}`;
}

function walk(node: unknown, storeSlug: string): unknown {
  if (Array.isArray(node)) {
    let touched = false;
    const next = node.map((item) => {
      const r = walk(item, storeSlug);
      if (r !== item) touched = true;
      return r;
    });
    return touched ? next : node;
  }
  if (node && typeof node === "object") {
    let touched = false;
    const obj = node as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "string" && isUrlKey(key)) {
        const rewritten = rewriteValue(val, storeSlug);
        if (rewritten !== val) {
          touched = true;
          next[key] = rewritten;
          continue;
        }
      }
      const recursed = walk(val, storeSlug);
      if (recursed !== val) touched = true;
      next[key] = recursed;
    }
    return touched ? next : node;
  }
  return node;
}

export function rewriteStoreLinksInSchema<T extends Record<string, unknown>>(
  schema: T,
  storeSlug: string,
): T {
  if (!schema || typeof schema !== "object") return schema;
  if (!storeSlug) return schema;
  return walk(schema, storeSlug) as T;
}
