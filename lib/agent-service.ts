/**
 * Marketplace shop builder via Anthropic Managed Agents.
 *
 * Sessions show up under console.anthropic.com → Managed Agents → Sessions
 * with the agent name "Marketplace Shop Builder v12" so traces are
 * inspectable. The agent itself (system prompt + custom tool definition) is
 * created once via scripts/setup-managed-agent.mjs; this file only opens a
 * session per request and handles the generate_page_schema tool call.
 *
 * Required env:
 *   ANTHROPIC_API_KEY — Anthropic key in the workspace that owns the agent
 *   MANAGED_AGENT_ID  — agent_... id from setup-managed-agent.mjs
 *   MANAGED_ENV_ID    — env_... id from setup-managed-agent.mjs
 */

import Anthropic from "@anthropic-ai/sdk";
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
  constructor(message = "ANTHROPIC_API_KEY / MANAGED_AGENT_ID / MANAGED_ENV_ID is not set") {
    super(message);
    this.name = "AgentNotConfiguredError";
  }
}

export class AgentUpstreamError extends Error {
  constructor(
    public status: number,
    public bodyText: string,
  ) {
    super(`Anthropic API returned ${status}`);
    this.name = "AgentUpstreamError";
  }
}

type Block = {
  blockType: string;
  content: Record<string, unknown>;
};

/** v12 multi-page schema */
type MultiPageSchema = {
  schemaVersion: "12";
  metadata: Record<string, unknown>;
  designFamily: DesignFamily;
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
  const s = input as Record<string, unknown> & {
    designFamily?: string;
    schemaVersion?: string | number;
    pages?: unknown;
    globalHeader?: unknown;
    globalFooter?: unknown;
    metadata?: unknown;
    title?: string;
    themeVariant?: string;
    blocks?: unknown;
    reasoning?: string;
  };

  const validFamilies = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  if (typeof s.designFamily === "string") {
    s.designFamily = s.designFamily.replace(/^["']+|["']+$/g, "").trim();
  }
  if (typeof s.schemaVersion === "string") {
    s.schemaVersion = s.schemaVersion.replace(/^["']+|["']+$/g, "").trim();
  }

  const looksV12 =
    Array.isArray(s.pages) &&
    (s.schemaVersion === "12" ||
      s.schemaVersion === 12 ||
      s.globalHeader ||
      s.globalFooter);

  if (looksV12) {
    s.schemaVersion = "12";
    if (typeof s.designFamily !== "string" || !validFamilies.includes(s.designFamily)) {
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

    const pages = s.pages as Array<{ isHomepage?: boolean; blocks: Block[] }>;
    const homepage = pages.find((p) => p.isHomepage) ?? pages[0];
    const schema: GeneratedPageSchema = {
      title:
        ((s.metadata as Record<string, unknown>)?.title as string) ?? "Shop",
      designFamily: s.designFamily as DesignFamily,
      metadata: s.metadata as PageMetadata,
      blocks: homepage.blocks,
      reasoning: s.reasoning ?? "",
      ...(s as object),
    };
    return { ok: true, schema, version: "v12" };
  }

  if (typeof s.title !== "string" || !s.title.trim()) {
    return { ok: false, error: "title_required" };
  }
  const hasFamily = typeof s.designFamily === "string" && validFamilies.includes(s.designFamily);
  const hasTheme = s.themeVariant === "minimal" || s.themeVariant === "cute";
  if (!hasFamily && !hasTheme) {
    return { ok: false, error: "designFamily_or_themeVariant_required" };
  }
  if (!Array.isArray(s.blocks) || s.blocks.length === 0) {
    return { ok: false, error: "blocks_required" };
  }
  return { ok: true, schema: s as GeneratedPageSchema, version: "v11" };
}

/**
 * Run the store-builder agent via Managed Agents.
 *
 *   1. Enrich brief with CJ products
 *   2. Open a session referencing the pre-created agent + environment
 *   3. Stream events (open BEFORE sending the kickoff event — Pattern 7)
 *   4. When `agent.custom_tool_use` arrives for generate_page_schema:
 *        - validate; on failure send is_error so the agent can self-correct
 *        - on success yield _schema and break
 *   5. Break on terminated, or idle with stop_reason !== requires_action
 */
export async function* runAgent(
  input: RunAgentInput,
): AsyncGenerator<AgentEvent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const agentId = process.env.MANAGED_AGENT_ID;
  const envId = process.env.MANAGED_ENV_ID;
  if (!apiKey || !agentId || !envId) throw new AgentNotConfiguredError();

  // Step 1: enrich brief with real products
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

  const client = new Anthropic({ apiKey });

  // Step 2: create session
  let session;
  try {
    session = await client.beta.sessions.create({
      agent: agentId,
      environment_id: envId,
      title: input.title ? `Build: ${input.title.slice(0, 80)}` : undefined,
    });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      throw new AgentUpstreamError(e.status ?? 0, e.message);
    }
    throw e;
  }

  yield { type: "_session", id: session.id };

  // Step 3: open the stream BEFORE sending the kickoff (skill Pattern 7)
  const stream = await client.beta.sessions.events.stream(session.id);

  await client.beta.sessions.events.send(session.id, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: userMessage }],
      },
    ],
  });

  let capturedSchema: GeneratedPageSchema | null = null;

  try {
    for await (const event of stream) {
      if (input.signal?.aborted) break;

      // Forward agent text + status events to the UI verbatim
      yield event as unknown as AgentEvent;

      // Custom tool: agent emits the schema → validate → ack
      if (event.type === "agent.custom_tool_use") {
        const e = event as {
          id: string;
          tool_name?: string;
          name?: string;
          input?: unknown;
        };
        const toolName = e.tool_name ?? e.name ?? "";
        if (toolName !== "generate_page_schema") {
          // Unknown tool — tell the agent so it can recover
          await client.beta.sessions.events.send(session.id, {
            events: [
              {
                type: "user.custom_tool_result",
                custom_tool_use_id: e.id,
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      ok: false,
                      error: `unknown_tool: ${toolName}`,
                    }),
                  },
                ],
                is_error: true,
              },
            ],
          });
          continue;
        }

        const result = validateSchema(e.input);
        await client.beta.sessions.events.send(session.id, {
          events: [
            {
              type: "user.custom_tool_result",
              custom_tool_use_id: e.id,
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    result.ok
                      ? { ok: true, version: result.version }
                      : {
                          ok: false,
                          error: result.error,
                          hint: "Fix the issue and call generate_page_schema again.",
                        },
                  ),
                },
              ],
              is_error: !result.ok,
            },
          ],
        });

        if (result.ok) {
          capturedSchema = result.schema;
          yield { type: "_schema", schema: result.schema };
          // generate_page_schema is terminal — agent will idle once it sees
          // the success ack; we can break early to save turns.
          break;
        }
        continue;
      }

      // Skill Pattern 5: don't break on idle alone — only on terminated, or
      // idle with a terminal stop_reason (anything except requires_action).
      if (event.type === "session.status_terminated") break;
      if (event.type === "session.status_idle") {
        const stop = (event as { stop_reason?: { type?: string } }).stop_reason;
        if (stop?.type !== "requires_action") break;
      }
    }
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      yield {
        type: "_error",
        message: `anthropic_${err.status ?? 0}: ${err.message}`,
      };
    } else {
      yield {
        type: "_error",
        message: err instanceof Error ? err.message : "stream_failed",
      };
    }
  }

  yield { type: "_done", terminal_via_tool: !!capturedSchema };
}
