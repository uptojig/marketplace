/**
 * Category-name translator + rewriter.
 *
 * Used by /api/store/categories/import when the operator adopts
 * legacy `Product.categoryName` values or supplier (CJ / AliExpress)
 * categories as proper Category rows. Goal: turn raw supplier
 * labels — which are often a mix of English ("Pet Supplies") or
 * literal-translated Thai ("อุปกรณ์สำหรับสัตว์เลี้ยง") — into
 * shop-friendly Thai display names, with matching ASCII URL slugs.
 *
 * Behaviour:
 *   - Calls Claude Haiku with a structured tool so the output is
 *     `{ original, displayName, slug }[]` rather than free text.
 *   - Fails open: if ANTHROPIC_API_KEY isn't set or the call errors
 *     out, returns each input as `{ displayName: name, slug: slugify(name) }`.
 *   - Slugs are normalized to a-z/0-9/hyphen and de-duplicated by
 *     suffixing -2, -3, ... so the caller can rely on uniqueness
 *     within the batch.
 */

import Anthropic from "@anthropic-ai/sdk";
import { AGENT_MODEL } from "@/lib/agent/config";

export interface RewrittenCategory {
  original: string;
  displayName: string;
  slug: string;
}

const REWRITE_TOOL: Anthropic.Tool = {
  name: "emit_thai_categories",
  description:
    "Return a shop-friendly Thai display name and an ASCII URL slug " +
    "for each input category label. The display name should be 1–4 " +
    "Thai words, idiomatic for a Thai e-commerce shopper, and the " +
    "slug should be a romanized lowercase form using a-z/0-9/hyphen.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            original: { type: "string" },
            displayName: { type: "string" },
            slug: { type: "string" },
          },
          required: ["original", "displayName", "slug"],
        },
      },
    },
    required: ["items"],
  },
};

function basicSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      // Strip combining marks so accented Latin collapses to ASCII.
      .replace(/[̀-ͯ]/g, "")
      // Anything outside a-z/0-9/space/hyphen → drop. Thai script
      // included since the basic fallback can't romanize it.
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function dedupeSlugs(items: RewrittenCategory[]): RewrittenCategory[] {
  // Bare-bones counter — second occurrence becomes "<slug>-2" and so
  // on. We don't try to detect collisions with the DB; the caller
  // does that via the @@unique([storeId, slug]) constraint and falls
  // back to manual rename on conflict.
  const seen = new Map<string, number>();
  return items.map((it) => {
    const base = it.slug || basicSlug(it.original) || "category";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return {
      ...it,
      slug: count === 0 ? base : `${base}-${count + 1}`,
    };
  });
}

export async function translateAndRewriteCategories(
  names: string[],
): Promise<RewrittenCategory[]> {
  const fallback = (): RewrittenCategory[] =>
    dedupeSlugs(
      names.map((name) => ({
        original: name,
        displayName: name,
        slug: basicSlug(name) || "category",
      })),
    );

  if (!process.env.ANTHROPIC_API_KEY) return fallback();
  if (names.length === 0) return [];

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 2048,
      tools: [REWRITE_TOOL],
      tool_choice: { type: "tool", name: REWRITE_TOOL.name },
      messages: [
        {
          role: "user",
          content:
            "Rewrite these category labels for a Thai online shop. " +
            "Keep brand names as-is. Prefer concise, natural Thai " +
            "(หรือคำทับศัพท์ที่คนไทยใช้จริง) over literal translation. " +
            "Generate a clean, lowercase URL slug for each.\n\n" +
            "Input:\n" +
            names.map((n, i) => `${i + 1}. ${n}`).join("\n"),
        },
      ],
    });

    const block = res.content.find((c) => c.type === "tool_use");
    if (!block || block.type !== "tool_use") return fallback();
    const input = block.input as { items?: RewrittenCategory[] };
    if (!Array.isArray(input.items) || input.items.length === 0) {
      return fallback();
    }

    // Re-key against the requested names so a model that drops a
    // row or reorders doesn't desync the caller's expectations.
    const byOriginal = new Map(input.items.map((it) => [it.original, it]));
    const output = names.map((name) => {
      const it = byOriginal.get(name);
      const display = it?.displayName?.trim() || name;
      const slug = (it?.slug ?? "").trim() || basicSlug(name) || "category";
      return {
        original: name,
        displayName: display.slice(0, 80),
        slug: basicSlug(slug).slice(0, 60) || basicSlug(name) || "category",
      };
    });
    return dedupeSlugs(output);
  } catch (err) {
    console.warn("[translate-categories] AI rewrite failed:", err);
    return fallback();
  }
}
