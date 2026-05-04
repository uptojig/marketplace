/**
 * Standalone store-builder agent — calls Claude Messages API directly.
 *
 * Instead of proxying through PromptPage or using Anthropic Managed
 * Agents, this module embeds the full system prompt and tool definitions,
 * then streams Claude's response with tool-use handling.
 *
 * Flow:
 *   1. Enrich brief with CJ products (lib/agent/enrich-brief.ts)
 *   2. Send to Claude with system prompt + generate_page_schema tool
 *   3. Stream events back as NDJSON for the client UI
 *   4. When agent calls generate_page_schema → validate → yield _schema
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  AGENT_MODEL,
  SYSTEM_PROMPT,
  GENERATE_PAGE_SCHEMA_TOOL,
} from "@/lib/agent/config";
import {
  enrichBriefWithProducts,
  NoProductsError,
} from "@/lib/agent/enrich-brief";

export interface AgentBlock {
  blockType: string;
  content: Record<string, unknown>;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  favicon?: { imageUrl: string; size?: string };
  ogImage?: {
    imageUrl: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  language?: string;
  themeColor?: string;
}

export type DesignFamily =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I";

export interface GeneratedPageSchema {
  title: string;
  slug?: string;
  description?: string;
  designFamily?: DesignFamily;
  themeVariant?: "minimal" | "cute";
  metadata?: PageMetadata;
  blocks: AgentBlock[];
  reasoning: string;
}

export type AgentEvent =
  | { type: "_session"; id: string }
  | { type: "_schema"; schema: GeneratedPageSchema }
  | { type: "_done"; terminal_via_tool?: boolean }
  | { type: "_error"; message: string }
  | { type: string; [key: string]: unknown };

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

export class AgentUpstreamError extends Error {
  constructor(
    public status: number,
    public bodyText: string,
  ) {
    super(`Claude API returned ${status}`);
    this.name = "AgentUpstreamError";
  }
}

type DesignFamilyType =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I";

type Block = {
  blockType: string;
  content: Record<string, unknown>;
};

/** v12 multi-page schema */
type MultiPageSchema = {
  schemaVersion: "12";
  metadata: Record<string, unknown>;
  designFamily: DesignFamilyType;
  globalHeader: Record<string, unknown>;
  globalFooter: Record<string, unknown>;
  pages: Array<{
    slug: string;
    isHomepage?: boolean;
    metadata?: Record<string, unknown>;
    blocks: Block[];
  }>;
  reasoning: string;
};

/** v11 single-page schema (legacy) */
type SinglePageSchema = {
  title: string;
  slug?: string;
  description?: string;
  designFamily?: DesignFamilyType;
  themeVariant?: "minimal" | "cute";
  metadata?: Record<string, unknown>;
  blocks: Block[];
  reasoning: string;
};

/**
 * Validate schema from generate_page_schema tool call.
 * Accepts both v12 (multi-page) and v11 (single-page) formats.
 */
function validateSchema(
  input: unknown,
):
  | { ok: true; schema: GeneratedPageSchema; version: "v11" | "v12" }
  | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "schema_must_be_object" };
  }
  // eslint-disable-next-line
  const s = input as any;

  const validFamilies = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  // Strip stray quotes from designFamily/schemaVersion
  if (typeof s.designFamily === "string") {
    s.designFamily = s.designFamily.replace(/^["']+|["']+$/g, "").trim();
  }
  if (typeof s.schemaVersion === "string") {
    s.schemaVersion = s.schemaVersion.replace(/^["']+|["']+$/g, "").trim();
  }

  // Detect v12 multi-page schema
  const looksV12 =
    Array.isArray(s.pages) &&
    (s.schemaVersion === "12" ||
      s.schemaVersion === 12 ||
      s.globalHeader ||
      s.globalFooter);

  if (looksV12) {
    s.schemaVersion = "12";
    if (
      !validFamilies.includes(s.designFamily)
    ) {
      s.designFamily = "A";
    }
    if (!Array.isArray(s.pages) || s.pages.length < 1) {
      return { ok: false, error: "v12_requires_at_least_1_page" };
    }
    if (!s.globalHeader || typeof s.globalHeader !== "object") {
      s.globalHeader = { nav: [], showCart: true, sticky: true };
    }
    if (!s.globalFooter || typeof s.globalFooter !== "object") {
      s.globalFooter = { brand: { name: "Shop" }, columns: [] };
    }
    for (let p = 0; p < s.pages.length; p++) {
      const page = s.pages[p];
      if (!page || typeof page.slug !== "string") {
        return { ok: false, error: `page_${p}_missing_slug` };
      }
      if (!Array.isArray(page.blocks) || page.blocks.length === 0) {
        return { ok: false, error: `page_${p}_missing_blocks` };
      }
    }

    // For v12: create a GeneratedPageSchema that's compatible with the UI.
    // Use the homepage blocks as the "blocks" field for backward compat.
    const homepage = s.pages.find(
      (p: { isHomepage?: boolean }) => p.isHomepage,
    ) ?? s.pages[0];
    const schema: GeneratedPageSchema = {
      title:
        (s.metadata as Record<string, unknown>)?.title as string ??
        "Shop",
      designFamily: s.designFamily,
      metadata: s.metadata,
      blocks: homepage.blocks,
      reasoning: s.reasoning ?? "",
      // Attach the full v12 data for the renderer
      ...(s as object),
    };
    return { ok: true, schema, version: "v12" };
  }

  // v11 single-page
  if (typeof s.title !== "string" || !s.title.trim()) {
    return { ok: false, error: "title_required" };
  }
  const hasFamily = validFamilies.includes(s.designFamily);
  const hasTheme =
    s.themeVariant === "minimal" || s.themeVariant === "cute";
  if (!hasFamily && !hasTheme) {
    return { ok: false, error: "designFamily_or_themeVariant_required" };
  }
  if (!Array.isArray(s.blocks) || s.blocks.length === 0) {
    return { ok: false, error: "blocks_required" };
  }
  return { ok: true, schema: s as GeneratedPageSchema, version: "v11" };
}

/**
 * Run the store-builder agent. Yields NDJSON events for the client UI.
 *
 * Steps:
 *   1. Enrich brief with CJ products
 *   2. Call Claude Messages API with streaming
 *   3. Handle generate_page_schema tool call
 *   4. Yield events for progress display
 */
export async function* runAgent(
  input: RunAgentInput,
): AsyncGenerator<AgentEvent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AgentNotConfiguredError();

  // Step 1: Enrich brief with real products
  let userMessage: string;
  try {
    const { enrichedBrief } = await enrichBriefWithProducts(input.prompt);
    userMessage = input.title
      ? `Store name: ${input.title}\n\n${enrichedBrief}`
      : enrichedBrief;
  } catch (err) {
    if (err instanceof NoProductsError) {
      yield {
        type: "_error",
        message: `no_products: ${err.reason} — ${err.message}`,
      };
      return;
    }
    throw err;
  }

  yield { type: "_session", id: `local-${Date.now()}` };
  yield { type: "agent.message_text", text: "กำลังค้นหาสินค้า... ✓" };

  // Step 2: Call Claude Messages API with streaming
  const client = new Anthropic({ apiKey });

  type MessageParam = { role: "user" | "assistant"; content: string | Anthropic.ContentBlockParam[] };
  const messages: MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  // Allow up to 3 turns (initial + 2 retries if schema validation fails)
  for (let turn = 0; turn < 3; turn++) {
    if (input.signal?.aborted) break;

    yield {
      type: "agent.message_text",
      text: turn === 0 ? "agent กำลังออกแบบร้าน..." : "agent กำลังแก้ไข schema...",
    };

    const stream = client.messages.stream({
      model: AGENT_MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      tools: [GENERATE_PAGE_SCHEMA_TOOL],
      tool_choice: turn === 0 ? { type: "tool", name: GENERATE_PAGE_SCHEMA_TOOL.name } : { type: "auto" },
      messages,
    });
    const response = await stream.finalMessage();

    // Process response content blocks
    let hasToolUse = false;

    for (const block of response.content) {
      if (block.type === "text" && block.text) {
        yield { type: "agent.message_text", text: block.text };
      }

      if (block.type === "tool_use" && block.name === GENERATE_PAGE_SCHEMA_TOOL.name) {
        hasToolUse = true;
        yield {
          type: "agent.custom_tool_use",
          tool_name: "generate_page_schema",
          name: "generate_page_schema",
        };

        const result = validateSchema(block.input);
        if (result.ok) {
          yield { type: "_schema", schema: result.schema };
          yield { type: "_done", terminal_via_tool: true };
          return;
        }

        // Schema validation failed — tell agent to fix and retry
        yield {
          type: "agent.message_text",
          text: `schema validation failed: ${result.error} — retrying...`,
        };

        messages.push({
          role: "assistant",
          content: response.content as Anthropic.ContentBlockParam[],
        });
        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify({
                ok: false,
                error: result.error,
                hint: "Fix the issue and call generate_page_schema again.",
              }),
              is_error: true,
            },
          ] as unknown as Anthropic.ContentBlockParam[],
        });
      }
    }

    // If no tool use, the agent responded with text only (e.g., "ไม่มีสินค้า")
    if (!hasToolUse) {
      yield { type: "_done" };
      return;
    }
  }

  yield { type: "_error", message: "agent_did_not_emit_valid_schema_after_retries" };
  yield { type: "_done" };
}
