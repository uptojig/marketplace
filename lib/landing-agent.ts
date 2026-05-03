/**
 * Landing-page agent invocation for Basketplace.
 *
 * Reuses the persistent PromptPage agent (ANTHROPIC_AGENT_ID) — the
 * same agent that the /builder page calls — but pipes a different
 * prompt that pre-supplies the store's already-curated products.
 * The agent skips searchMarketplaceProducts (no need to discover —
 * admin picked them) and goes straight to generate_page_schema.
 *
 * Architecture:
 *   POST /api/admin/stores/<id>/generate-landing
 *     ↓ (set status="generating", returns 202)
 *   void runLandingAgent(storeId, brief, themeHint)
 *     ↓ async, fire-and-forget
 *   - Read store + active products from DB
 *   - Compose enriched user prompt with product list
 *   - startBuilderSession (Anthropic Managed Agents)
 *   - Loop tool events until generate_page_schema fires (terminal)
 *   - Save blocks + status="ready" (or "failed" on error)
 *
 * Vercel runtime: this fire-and-forget pattern works on Vercel
 * functions only as long as the function isn't terminated. On Pro
 * (300s maxDuration) the agent run usually fits. On Hobby (60s)
 * long runs may be killed mid-flight — admin sees the row stuck in
 * "generating" forever; recovery = retry.
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export class ManagedAgentNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY / ANTHROPIC_AGENT_ID / ANTHROPIC_ENVIRONMENT_ID missing");
    this.name = "ManagedAgentNotConfiguredError";
  }
}

type Block = {
  blockType: string;
  content: Record<string, unknown>;
  tailwindClasses?: string;
};

type GeneratedPageSchema = {
  title: string;
  slug?: string;
  description?: string;
  themeVariant: "minimal" | "cute";
  blocks: Block[];
  reasoning: string;
};

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ManagedAgentNotConfiguredError();
  return new Anthropic({ apiKey });
}

function validateSchema(input: unknown):
  | { ok: true; schema: GeneratedPageSchema }
  | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "schema_must_be_object" };
  }
  const s = input as Partial<GeneratedPageSchema>;
  if (typeof s.title !== "string" || !s.title.trim()) {
    return { ok: false, error: "title_required" };
  }
  if (s.themeVariant !== "minimal" && s.themeVariant !== "cute") {
    return { ok: false, error: "themeVariant_must_be_minimal_or_cute" };
  }
  if (!Array.isArray(s.blocks) || s.blocks.length === 0) {
    return { ok: false, error: "blocks_required" };
  }
  for (let i = 0; i < s.blocks.length; i++) {
    const b = s.blocks[i] as Partial<Block> | undefined;
    if (!b || typeof b !== "object") return { ok: false, error: `block_${i}_invalid` };
    if (typeof b.blockType !== "string" || !b.blockType.trim()) {
      return { ok: false, error: `block_${i}_missing_blockType` };
    }
    if (typeof b.content !== "object" || b.content === null) {
      return { ok: false, error: `block_${i}_missing_content` };
    }
  }
  return { ok: true, schema: s as GeneratedPageSchema };
}

/**
 * Build the user prompt that pipes pre-curated products into the
 * agent. The agent's persistent system prompt already knows the
 * block-tree contract; this user message just supplies the brief +
 * the product inventory it should design around.
 */
function composePrompt(args: {
  storeName: string;
  brief: string;
  // v3 design family codes (A-I) preferred; legacy "minimal" / "cute" still
  // accepted for stores carrying old data forward.
  themeHint?:
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F"
    | "G"
    | "H"
    | "I"
    | "minimal"
    | "cute";
  contactEmail?: string;
  products: Array<{
    externalProductId: string;
    title: string;
    titleTh: string | null;
    priceTHB: number;
    imageUrl: string | null;
    categoryName: string | null;
  }>;
}): string {
  const lines = [
    `Brief from operator: ${args.brief}`,
    ``,
    `Store name: ${args.storeName}`,
    args.contactEmail ? `Contact email: ${args.contactEmail}` : "",
    args.themeHint ? `Theme hint: prefer "${args.themeHint}".` : "",
    ``,
    `Products already curated for this store (${args.products.length} items). Use THESE — do NOT call searchMarketplaceProducts again. Build the page around the most visually striking items.`,
    ``,
  ].filter(Boolean);

  args.products.forEach((p, i) => {
    lines.push(
      `${i + 1}. id="${p.externalProductId}" — ${p.title}` +
        (p.titleTh ? ` (TH: ${p.titleTh})` : "") +
        ` — ฿${p.priceTHB}` +
        (p.categoryName ? ` — ${p.categoryName}` : "") +
        (p.imageUrl ? ` — image: ${p.imageUrl}` : ""),
    );
  });

  lines.push(
    ``,
    `Output the schema directly via generate_page_schema. Use ProductHero for one hero product, OfferGrid for the rest, Stats / Features / FAQ / Testimonial blocks to round out, and ALWAYS finish with ContactForm + Footer (both with contact_email = ${args.contactEmail ?? "contact@readypay.co"}).`,
    `Each block's product references must use \`content.product_id\` set to the supplied externalProductId.`,
    `Rewrite English titles into Thai selling copy in titleTh / headline / item.title fields — that's your job, not the source data's.`,
  );

  return lines.join("\n");
}

/**
 * Drives the agent session through Anthropic Managed Agents until
 * `generate_page_schema` fires. Returns the captured schema.
 */
async function runAgentSession(prompt: string): Promise<GeneratedPageSchema> {
  const client = getClient();
  const agentId = process.env.ANTHROPIC_AGENT_ID;
  const envId = process.env.ANTHROPIC_ENVIRONMENT_ID;
  if (!agentId || !envId) throw new ManagedAgentNotConfiguredError();

  // Anthropic Managed Agents: create session, send the prompt,
  // stream events. Custom-tool calls are dispatched here — the only
  // tool we serve in this flow is generate_page_schema (terminal).
  // searchMarketplaceProducts requests get a sentinel reply telling
  // the agent to use the supplied list (defensive — should not fire
  // because the prompt already says "do NOT call").
  // eslint-disable-next-line
  const c = client as any; // beta API surface still typed loosely
  // Canonical Anthropic Managed Agents shape (verified against the
  // installed SDK's SessionCreateParams + the working PromptPage
  // lib/managed-agents/index.ts pattern):
  //   - sessions.create accepts `agent` (string ID) + `environment_id`
  //     (snake-case suffix)
  //   - There is NO `initial_message` / `initialMessage` field.
  //     The first user turn is sent SEPARATELY via
  //     sessions.events.send with type "user.message".
  // Earlier attempts (`agent_id`, `environment`, `initialMessage`)
  // all returned 400 invalid_request_error from the API.
  const session = await c.beta.sessions.create({
    agent: agentId,
    environment_id: envId,
  });

  // Subscribe BEFORE sending so we don't miss the agent's first
  // events. The stream is long-lived and yields events as they fire.
  // eslint-disable-next-line
  const stream = (await c.beta.sessions.events.stream(session.id)) as AsyncIterable<any>;

  // Now post the operator's brief as the first user message.
  await c.beta.sessions.events.send(session.id, {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: prompt }],
      },
    ],
  });

  let captured: GeneratedPageSchema | null = null;

  for await (const event of stream) {
    if (event.type === "agent.custom_tool_use") {
      const toolName: string = event.tool_name ?? event.name ?? "";
      const id: string = event.id;

      if (toolName === "generate_page_schema") {
        const result = validateSchema(event.input);
        if (result.ok) captured = result.schema;
        await c.beta.sessions.events.send(session.id, {
          events: [
            {
              type: "user.custom_tool_result",
              custom_tool_use_id: id,
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    result.ok
                      ? { ok: true, received_blocks: result.schema.blocks.length }
                      : { ok: false, error: result.error },
                  ),
                },
              ],
              is_error: !result.ok,
            },
          ],
        });
        if (result.ok) break;
        continue;
      }

      // Defensive: if the agent insists on calling searchMarketplaceProducts
      // or find_products despite the prompt instruction, return a
      // sentinel that nudges it to use the supplied products instead.
      await c.beta.sessions.events.send(session.id, {
        events: [
          {
            type: "user.custom_tool_result",
            custom_tool_use_id: id,
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: false,
                  error: "use_supplied_products",
                  hint: "Skip product search. The user prompt already lists the products to feature. Call generate_page_schema directly.",
                }),
              },
            ],
            is_error: true,
          },
        ],
      });
    } else if (
      event.type === "session.status_terminated" ||
      (event.type === "session.status_idle" &&
        event.stop_reason?.type !== "requires_action")
    ) {
      break;
    }
  }

  if (!captured) {
    throw new Error("agent_did_not_emit_schema");
  }
  return captured;
}

/**
 * Public entry point — fire-and-forget from the API route.
 * Updates the Store row with the result (or the error message).
 */
export async function runLandingAgent(args: {
  storeId: string;
  brief: string;
  themeHint?:
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F"
    | "G"
    | "H"
    | "I"
    | "minimal"
    | "cute";
}): Promise<void> {
  const store = await prisma.store.findUnique({
    where: { id: args.storeId },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      products: {
        where: { active: true },
        select: {
          externalProductId: true,
          title: true,
          titleTh: true,
          priceTHB: true,
          imageUrl: true,
          categoryName: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });
  if (!store) {
    await prisma.store.update({
      where: { id: args.storeId },
      data: {
        landingStatus: "failed",
        landingError: "store_not_found",
      },
    }).catch(() => undefined);
    return;
  }

  const prompt = composePrompt({
    storeName: store.name,
    brief: args.brief,
    themeHint: args.themeHint,
    contactEmail: store.contactEmail ?? undefined,
    products: store.products.map((p) => ({
      externalProductId: p.externalProductId,
      title: p.title,
      titleTh: p.titleTh,
      priceTHB: Number(p.priceTHB),
      imageUrl: p.imageUrl,
      categoryName: p.categoryName,
    })),
  });

  try {
    const schema = await runAgentSession(prompt);
    await prisma.store.update({
      where: { id: args.storeId },
      data: {
        landingBlocks: schema.blocks as never,
        landingTitle: schema.title,
        landingThemeVariant: schema.themeVariant,
        landingGeneratedAt: new Date(),
        landingStatus: "ready",
        landingError: null,
      },
    });
  } catch (err) {
    const msg =
      err instanceof ManagedAgentNotConfiguredError
        ? "managed_agent_not_configured"
        : err instanceof Error
          ? err.message.slice(0, 500)
          : "unknown_error";
    await prisma.store
      .update({
        where: { id: args.storeId },
        data: {
          landingStatus: "failed",
          landingError: msg,
        },
      })
      .catch(() => undefined);
  }
}
