/**
 * Product-title translator.
 *
 * Why this exists:
 *   The landing-agent (lib/landing-agent.ts) translates product titles to
 *   Thai inside the generated HTML for the homepage, but does NOT persist
 *   `titleTh` back to the `Product` row. As a result every other surface
 *   (category page, PDP, search, related products) reads
 *   `p.titleTh ?? p.title` and falls through to the English `title`.
 *
 *   This module fills `titleTh` for every product in a store so the whole
 *   storefront — not just the homepage — reads in Thai.
 *
 * Behaviour:
 *   - Scans products with `titleTh IS NULL` for the given store.
 *   - Sends them to Claude Haiku in batches with a structured tool so the
 *     output is `{ id, titleTh }[]` (not free text we'd have to parse).
 *   - Writes the result back to the DB. Failures on a batch don't stop
 *     the run — we log and continue, so a single rate-limit hiccup
 *     doesn't poison the whole store.
 *   - Idempotent: re-running only touches rows that are still null.
 *
 * Triggered from:
 *   - `runLandingAgent` (best-effort, after the homepage HTML is written
 *     so a slow translate pass doesn't delay the user-visible flow).
 *   - `POST /api/admin/stores/[id]/translate-titles` (manual / backfill).
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { AGENT_MODEL } from "@/lib/agent/config";

export class TranslateNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY missing");
    this.name = "TranslateNotConfiguredError";
  }
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new TranslateNotConfiguredError();
  return new Anthropic({ apiKey });
}

const TRANSLATE_TOOL = {
  name: "emit_thai_titles",
  description:
    "Return a Thai-language rewrite for each input product title. Output ONE row per input id.",
  input_schema: {
    type: "object" as const,
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            titleTh: {
              type: "string",
              description:
                "Thai marketing-quality product title. Natural, concise, no English filler unless it's a brand name. Do NOT exceed 120 chars.",
            },
          },
          required: ["id", "titleTh"],
        },
      },
    },
    required: ["items"],
  },
};

const TRANSLATE_SYSTEM_PROMPT = `You are a Thai e-commerce copywriter rewriting English product titles into natural, sellable Thai titles.

Rules:
- Output Thai. Keep brand names / model numbers in Latin if they appear.
- Sound like a real Thai product listing, not a literal translation. Drop filler like "high quality", "wholesale", "drop shipping".
- Max ~80 Thai characters per title.
- Preserve material, color, size hints when useful (สี, ไซส์, ขนาด).
- Never invent specs that aren't in the source.
- Always call the emit_thai_titles tool — do NOT reply in plain text.`;

const BATCH_SIZE = 25;

interface PromptItem {
  id: string;
  title: string;
  categoryName: string | null;
}

async function translateBatch(
  client: Anthropic,
  batch: PromptItem[],
): Promise<Map<string, string>> {
  const lines = batch.map(
    (p, i) =>
      `${i + 1}. id="${p.id}" — ${p.title}` +
      (p.categoryName ? ` — category: ${p.categoryName}` : ""),
  );
  const userPrompt =
    `Rewrite these product titles into Thai. Return ONE row per id.\n\n` +
    lines.join("\n");

  const response = await client.messages.create({
    model: AGENT_MODEL,
    max_tokens: 4000,
    system: TRANSLATE_SYSTEM_PROMPT,
    tools: [TRANSLATE_TOOL],
    tool_choice: { type: "tool", name: TRANSLATE_TOOL.name },
    messages: [{ role: "user", content: userPrompt }],
  });

  const out = new Map<string, string>();
  for (const block of response.content) {
    if (block.type !== "tool_use" || block.name !== TRANSLATE_TOOL.name) continue;
    const input = block.input as { items?: Array<{ id?: string; titleTh?: string }> };
    if (!Array.isArray(input.items)) continue;
    for (const item of input.items) {
      if (typeof item?.id === "string" && typeof item.titleTh === "string") {
        const cleaned = item.titleTh.trim();
        if (cleaned) out.set(item.id, cleaned.slice(0, 200));
      }
    }
  }
  return out;
}

interface TranslateResult {
  scanned: number;
  translated: number;
  failed: number;
  skipped: number;
}

/**
 * Translate every product in `storeId` whose `titleTh` is null.
 *
 * Best-effort: on per-batch failure we log and keep going so one bad
 * batch doesn't block the rest of the store.
 *
 * Pass `force: true` to re-translate rows that already have `titleTh`
 * (used after a manual prompt tweak).
 */
export async function translateProductTitlesForStore(
  storeId: string,
  opts: { force?: boolean } = {},
): Promise<TranslateResult> {
  const client = getClient();

  const products = await prisma.product.findMany({
    where: {
      storeId,
      active: true,
      ...(opts.force ? {} : { titleTh: null }),
    },
    select: {
      id: true,
      title: true,
      titleTh: true,
      categoryName: true,
    },
  });

  const result: TranslateResult = {
    scanned: products.length,
    translated: 0,
    failed: 0,
    skipped: 0,
  };

  if (products.length === 0) {
    console.log(`[translate-titles] store=${storeId} nothing to translate`);
    return result;
  }

  console.log(
    `[translate-titles] store=${storeId} batch_count=${Math.ceil(
      products.length / BATCH_SIZE,
    )} products=${products.length}`,
  );

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const slice = products.slice(i, i + BATCH_SIZE);
    const batch: PromptItem[] = slice.map((p) => ({
      id: p.id,
      title: p.title,
      categoryName: p.categoryName,
    }));

    try {
      const translations = await translateBatch(client, batch);
      // Persist each translation. We do per-row updates instead of
      // updateMany because every row has a different value — Prisma
      // can't bulk-set per-row distinct columns in one call.
      await Promise.all(
        slice.map(async (p) => {
          const t = translations.get(p.id);
          if (!t) {
            result.skipped += 1;
            return;
          }
          await prisma.product.update({
            where: { id: p.id },
            data: { titleTh: t },
          });
          result.translated += 1;
        }),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown_error";
      console.error(
        `[translate-titles] batch ${i}-${i + slice.length} failed: ${msg}`,
      );
      result.failed += slice.length;
    }
  }

  console.log(
    `[translate-titles] store=${storeId} done translated=${result.translated} skipped=${result.skipped} failed=${result.failed}`,
  );
  return result;
}
