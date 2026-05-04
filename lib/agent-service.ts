/**
 * Server-side AI service that generates landing-page schemas directly from
 * the Claude API (Opus 4.7). Replaces the previous PromptPage proxy so all
 * usage and billing land in our own Anthropic account.
 *
 * The exposed shape is an async generator of typed events — the route
 * handler turns them into NDJSON for the browser.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const ALLOWED_BLOCK_TYPES = [
  "nav",
  "hero",
  "features",
  "productGrid",
  "cta",
  "footer",
] as const;

const BlockSchema = z.object({
  blockType: z.enum(ALLOWED_BLOCK_TYPES),
  content: z.record(z.unknown()),
});

const PageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  themeVariant: z.enum(["minimal", "cute"]),
  blocks: z.array(BlockSchema).min(1),
  reasoning: z.string(),
});

export type GeneratedPageSchema = z.infer<typeof PageSchema>;
export type AgentBlock = z.infer<typeof BlockSchema>;

export type AgentEvent =
  | { type: "_start"; model: string }
  | { type: "_thinking"; text: string }
  | { type: "_text"; text: string }
  | { type: "_schema"; schema: GeneratedPageSchema }
  | {
      type: "_usage";
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens: number;
      cache_creation_input_tokens: number;
    }
  | { type: "_done"; stop_reason: string }
  | { type: "_error"; message: string };

export interface RunAgentInput {
  prompt: string;
  title?: string;
  signal?: AbortSignal;
}

export class AgentNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set");
    this.name = "AgentNotConfiguredError";
  }
}

const MODEL = "claude-opus-4-7";

const SYSTEM_PROMPT = `You are a landing-page architect for an e-commerce marketplace. Given a brief about a store, you produce a JSON schema that the renderer turns into a Thai-language landing page.

# Available blockTypes (use only these)

Each block is { "blockType": string, "content": object }. Allowed blockTypes and their content shape:

1. nav — { "brand": string, "logoUrl"?: string, "links"?: [{ "label": string, "href": string }] }
2. hero — { "title": string, "subtitle"?: string, "ctaLabel"?: string, "ctaHref"?: string, "imageUrl"?: string, "bgColor"?: string }
3. features — { "heading": string, "features"?: [{ "icon"?: string (emoji), "title": string, "description": string }] }
4. productGrid — { "heading": string, "subheading"?: string, "products"?: [{ "title": string, "imageUrl"?: string, "priceTHB": number, "compareAtPriceTHB"?: number, "href"?: string, "badge"?: string }] }
5. cta — { "heading": string, "body"?: string, "ctaLabel"?: string, "ctaHref"?: string }
6. footer — { "brand": string, "tagline"?: string, "copyright"?: string }

# themeVariant guidance

- "cute" → pet shops, kids/baby products, food/dessert, lifestyle brands with a warm playful tone
- "minimal" → tech, B2B, professional services, fashion with a clean editorial tone

# Composition rules

- Every page MUST start with a "nav" block and end with a "footer" block.
- Include 4–6 blocks total. A typical order: nav → hero → features → productGrid → cta → footer.
- All user-visible copy in Thai unless the brief explicitly says otherwise.
- Prices are integers in THB (no decimals, no currency symbol).
- Image URLs should be plausible Unsplash photos (https://images.unsplash.com/photo-...?w=600&h=600&fit=crop). Do not invent CDN paths from other domains.
- "reasoning" is 2–3 sentences explaining your design choices (theme, block order, anything notable). Brief but specific — not "I made a nice page".

# Output

Return ONLY the JSON document; the API enforces the schema. Do not wrap it in code fences or add commentary.`;

const PAGE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" },
    themeVariant: { type: "string", enum: ["minimal", "cute"] },
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          blockType: { type: "string", enum: [...ALLOWED_BLOCK_TYPES] },
          content: { type: "object", additionalProperties: true },
        },
        required: ["blockType", "content"],
        additionalProperties: false,
      },
    },
    reasoning: { type: "string" },
  },
  required: ["title", "themeVariant", "blocks", "reasoning"],
  additionalProperties: false,
} as const;

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AgentNotConfiguredError();
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export async function* runAgent(input: RunAgentInput): AsyncGenerator<AgentEvent> {
  const client = getClient();

  yield { type: "_start", model: MODEL };

  const userContent = input.title
    ? `Title hint: ${input.title}\n\nBrief:\n${input.prompt}`
    : input.prompt;

  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive", display: "summarized" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: PAGE_JSON_SCHEMA },
      },
      messages: [{ role: "user", content: userContent }],
    },
    { signal: input.signal },
  );

  let accumulatedText = "";

  try {
    for await (const event of stream) {
      if (event.type !== "content_block_delta") continue;
      const delta = event.delta;
      if (delta.type === "text_delta") {
        accumulatedText += delta.text;
        yield { type: "_text", text: delta.text };
      } else if (delta.type === "thinking_delta") {
        yield { type: "_thinking", text: delta.thinking };
      }
    }

    const finalMessage = await stream.finalMessage();

    yield {
      type: "_usage",
      input_tokens: finalMessage.usage.input_tokens,
      output_tokens: finalMessage.usage.output_tokens,
      cache_read_input_tokens: finalMessage.usage.cache_read_input_tokens ?? 0,
      cache_creation_input_tokens:
        finalMessage.usage.cache_creation_input_tokens ?? 0,
    };

    if (finalMessage.stop_reason === "refusal") {
      yield { type: "_error", message: "model_refused" };
      return;
    }
    if (finalMessage.stop_reason === "max_tokens") {
      yield { type: "_error", message: "max_tokens_exceeded" };
      return;
    }

    let parsedRaw: unknown;
    try {
      parsedRaw = JSON.parse(accumulatedText);
    } catch (e) {
      yield {
        type: "_error",
        message: `invalid_json: ${e instanceof Error ? e.message : "unknown"}`,
      };
      return;
    }

    const result = PageSchema.safeParse(parsedRaw);
    if (!result.success) {
      yield {
        type: "_error",
        message: `schema_validation_failed: ${result.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      };
      return;
    }

    yield { type: "_schema", schema: result.data };
    yield { type: "_done", stop_reason: finalMessage.stop_reason ?? "end_turn" };
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      yield { type: "_error", message: `anthropic_${err.status}: ${err.message}` };
    } else {
      yield {
        type: "_error",
        message: err instanceof Error ? err.message : "unknown_error",
      };
    }
  }
}
