/**
 * Managed-Agent variant of the landing-page builder.
 *
 * Hits the Anthropic Managed Agent (the v3 landing-builder pushed via
 * promptpage's setup script — agent_id stored in ANTHROPIC_AGENT_ID,
 * environment_id in ANTHROPIC_ENVIRONMENT_ID).
 *
 * Differences from `runLandingAgent` (the local multi-step pipeline):
 *
 *   • No local SYSTEM_PROMPT — the agent's prompt lives on Anthropic's
 *     side and is updated via `node scripts/managed-agents-setup.mjs --update`.
 *   • Single-shot: agent receives the brief + product list, emits the
 *     full v12 schema in ONE call via the `generate_page_schema` tool.
 *   • No designFamily/archetype/angle picking on this side — the agent
 *     decides based on the brief.
 *
 * Same preprocessing as runLandingAgent:
 *   1. Load store + active products from DB
 *   2. If 0 products: parallel CJ + AliExpress search (and CREATE products
 *      so the store has them after generation)
 *   3. If still 0: mark `landingStatus="failed"`, `landingError="no_products"`
 *
 * Then:
 *   4. Compose prompt with store name + brief + product list
 *   5. Open managed agent session, send user message
 *   6. Stream events; on `agent.custom_tool_use` with name
 *      `generate_page_schema`, capture the schema input
 *   7. Send `user.custom_tool_result` ack so the agent finishes cleanly
 *   8. Save schema to DB and break (terminal)
 */
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";
import { aliexpressAdapter } from "@/lib/suppliers/aliexpress/adapter";

export class ManagedAgentNotConfiguredError extends Error {
  constructor() {
    super(
      "ANTHROPIC_AGENT_ID and/or ANTHROPIC_ENVIRONMENT_ID is missing. " +
        "Run promptpage's `node scripts/managed-agents-setup.mjs` and " +
        "copy the IDs into marketplace's .env.local.",
    );
    this.name = "ManagedAgentNotConfiguredError";
  }
}

type ProductForPrompt = {
  externalProductId: string;
  title: string;
  titleTh: string | null;
  priceTHB: number;
  imageUrl: string | null;
  categoryName: string | null;
};

const TH_EN_KEYWORDS: [string, string][] = [
  ["เคสมือถือ", "phone case"], ["เสื้อผ้า", "clothing"], ["รองเท้า", "shoes"],
  ["กระเป๋า", "bag"], ["แฟชั่น", "fashion"], ["เกาหลี", "korean fashion"],
  ["แว่นตา", "glasses sunglasses"], ["เครื่องประดับ", "jewelry accessories"],
  ["สัตว์เลี้ยง", "pet"], ["หูฟัง", "earphone headphone"], ["ลำโพง", "speaker bluetooth"],
  ["แบตเตอรี่", "power bank battery"], ["คอมพิวเตอร์", "computer"], ["บ้าน", "home decor"],
  ["ครัว", "kitchen"], ["เครื่องสำอาง", "cosmetics makeup"], ["สกินแคร์", "skincare"],
  ["กีฬา", "sports"], ["ออกกำลังกาย", "fitness gym"], ["แคมป์", "camping"],
  ["ของเล่น", "toys"], ["เด็ก", "kids baby"], ["รถยนต์", "car accessories"],
];

function extractSearchKeyword(brief: string): string {
  const hits: string[] = [];
  for (const [th, en] of TH_EN_KEYWORDS) {
    if (brief.includes(th)) hits.push(en);
  }
  const english = brief.match(/[a-zA-Z]{2,}/g);
  if (english) hits.push(...english);
  if (hits.length === 0) return "trending products";
  return [...new Set(hits)].slice(0, 3).join(" ");
}

function composePrompt(args: {
  storeName: string;
  brief: string;
  contactEmail?: string;
  themeHint?: string;
  products: ProductForPrompt[];
}): string {
  const lines: string[] = [
    `Brief from operator: ${args.brief}`,
    ``,
    `Store name: ${args.storeName}`,
  ];
  if (args.contactEmail) lines.push(`Contact email: ${args.contactEmail}`);
  if (args.themeHint) lines.push(`Theme hint: prefer "${args.themeHint}".`);
  lines.push(
    ``,
    `Products already curated for this store (${args.products.length} items). Use THESE — do NOT generate fake products. Build the page around the most visually striking items.`,
    ``,
  );

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
    `Each block's product references must use \`content.product_id\` set to the supplied externalProductId.`,
    `Rewrite English titles into Thai selling copy in titleTh / headline / item.title fields.`,
  );

  return lines.join("\n");
}

// SDK type narrows betas to a string-literal union. Cast through unknown so
// we don't have to bring the BetaAPI namespace into scope just for one
// header. The string is the public managed-agents beta version.
const MANAGED_BETAS = ["managed-agents-2026-04-01"] as unknown as never[];

function readIds(): { agentId: string; environmentId: string } {
  const agentId = process.env.ANTHROPIC_AGENT_ID;
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID;
  if (!agentId || !environmentId) throw new ManagedAgentNotConfiguredError();
  return { agentId, environmentId };
}

export async function runLandingAgentManaged(args: {
  storeId: string;
  brief: string;
  themeHint?: string;
  /**
   * If true, delete all existing products before fetching new ones from
   * CJ/AE based on the brief. Use when the operator changes the store
   * direction (e.g. previous brief was "kitchen", new brief is "socks") —
   * stale products from the old direction would mislead the agent.
   */
  refreshProducts?: boolean;
}): Promise<void> {
  // Optionally wipe existing products so fresh CJ/AE search can populate
  // them based on the new brief. Done BEFORE the store-load query so the
  // products list reflects the post-wipe state.
  if (args.refreshProducts) {
    const deleted = await prisma.product.deleteMany({
      where: { storeId: args.storeId },
    });
    console.log(
      `[managed-agent] refreshProducts: deleted ${deleted.count} existing products`,
    );
  }

  const store = await prisma.store.findUnique({
    where: { id: args.storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      contactEmail: true,
      products: {
        where: { active: true },
        select: {
          id: true,
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
    await prisma.store
      .update({
        where: { id: args.storeId },
        data: { landingStatus: "failed", landingError: "store_not_found" },
      })
      .catch(() => undefined);
    return;
  }

  let products: ProductForPrompt[] = store.products.map((p) => ({
    externalProductId: p.externalProductId,
    title: p.title,
    titleTh: p.titleTh,
    priceTHB: Number(p.priceTHB),
    imageUrl: p.imageUrl,
    categoryName: p.categoryName,
  }));

  console.log(
    `[managed-agent] store="${store.name}" db_products=${products.length} brief="${args.brief.slice(0, 50)}"`,
  );

  // Fallback: search CJ/AE in parallel and CREATE products in DB so the
  // store actually has them after the landing page is generated.
  if (products.length === 0) {
    console.log(`[managed-agent] 0 products in DB → searching CJ/AE...`);
    const searchKeyword = extractSearchKeyword(args.brief);

    const fetchers: Promise<void>[] = [];
    if (process.env.CJ_API_KEY) {
      fetchers.push(
        cjAdapter
          .listCatalog({ search: searchKeyword, pageSize: 6 })
          .then(async (r) => {
            console.log(
              `[managed-agent] CJ search "${searchKeyword}" returned ${r.items.length} items`,
            );
            for (const p of r.items) {
              await prisma.product.create({
                data: {
                  storeId: store.id,
                  externalProductId: p.externalProductId,
                  title: p.title,
                  titleTh: p.title,
                  description: "Imported by Agent",
                  descriptionTh: "นำเข้าโดย AI",
                  priceTHB: p.priceTHB,
                  imageUrl: p.imageUrl,
                  galleryUrls: [],
                  supplier: "CJ",
                  active: true,
                },
              });
              products.push({
                externalProductId: p.externalProductId,
                title: p.title,
                titleTh: null,
                priceTHB: p.priceTHB,
                imageUrl: p.imageUrl ?? null,
                categoryName:
                  ((p.raw as Record<string, unknown>)
                    ?.categoryName as string) ?? null,
              });
            }
          })
          .catch((err) => console.error("[managed-agent CJ] ❌", err)),
      );
    }

    if (process.env.ALIEXPRESS_APP_KEY) {
      fetchers.push(
        aliexpressAdapter
          .listCatalog({ search: searchKeyword, pageSize: 6 })
          .then(async (r) => {
            console.log(
              `[managed-agent] AE search "${searchKeyword}" returned ${r.items.length} items`,
            );
            for (const p of r.items) {
              await prisma.product.create({
                data: {
                  storeId: store.id,
                  externalProductId: p.externalProductId,
                  title: p.title,
                  titleTh: p.title,
                  description: "Imported by Agent",
                  descriptionTh: "นำเข้าโดย AI",
                  priceTHB: p.priceTHB,
                  imageUrl: p.imageUrl,
                  galleryUrls: [],
                  supplier: "ALIEXPRESS",
                  active: true,
                },
              });
              products.push({
                externalProductId: p.externalProductId,
                title: p.title,
                titleTh: null,
                priceTHB: p.priceTHB,
                imageUrl: p.imageUrl ?? null,
                categoryName: null,
              });
            }
          })
          .catch((err) => console.error("[managed-agent AE] ❌", err)),
      );
    }

    await Promise.allSettled(fetchers);
  }

  console.log(`[managed-agent] After fetch: products.length=${products.length}`);

  if (products.length === 0) {
    await prisma.store
      .update({
        where: { id: args.storeId },
        data: { landingStatus: "failed", landingError: "no_products" },
      })
      .catch(() => undefined);
    return;
  }

  // ── Open managed-agent session and stream events ──
  try {
    const { agentId, environmentId } = readIds();
    const client = new Anthropic({ timeout: 5 * 60 * 1000 });

    const prompt = composePrompt({
      storeName: store.name,
      brief: args.brief,
      contactEmail: store.contactEmail ?? undefined,
      themeHint: args.themeHint,
      products,
    });

    console.log(
      `[managed-agent] opening session agent=${agentId} env=${environmentId}`,
    );

    // Session create + event stream BEFORE sending the kickoff message
    // so we don't miss the early session.status_running event.
    // (SDK applies the managed-agents beta header automatically via
    // client.beta.* — no explicit header arg needed.)
    const session = await client.beta.sessions.create({
      agent: agentId,
      environment_id: environmentId,
      title: `landing:${store.slug}`,
      metadata: {
        surface: "marketplace.generate-landing",
        storeId: store.id,
        storeSlug: store.slug,
      },
      betas: MANAGED_BETAS,
    });

    const stream = await client.beta.sessions.events.stream(session.id, {
      betas: MANAGED_BETAS,
    });

    await client.beta.sessions.events.send(session.id, {
      events: [
        {
          type: "user.message",
          content: [{ type: "text", text: prompt }],
        },
      ],
      betas: MANAGED_BETAS,
    });

    let capturedSchema: Record<string, unknown> | null = null;
    let capturedTitle: string | null = null;
    let capturedDesignFamily: string | null = null;
    let capturedThemeColor: string | null = null;
    let done = false;

    for await (const event of stream) {
      const e = event as unknown as Record<string, unknown>;
      const type = e.type as string | undefined;

      if (type === "agent.custom_tool_use") {
        const toolEvent = e as {
          id: string;
          name?: string;
          tool_name?: string;
          input?: Record<string, unknown>;
        };
        const toolName = toolEvent.tool_name ?? toolEvent.name ?? "";

        console.log(`[managed-agent] tool_use: ${toolName}`);

        if (toolName === "generate_page_schema" || toolName === "generate_shop_html") {
          const input = toolEvent.input ?? {};
          capturedSchema = input;
          // metadata is the v3 nesting location; legacy schemas put these at
          // the top level. Read both so primaryColor cascades onto storefront.
          const meta = (input.metadata ?? {}) as Record<string, unknown>;
          capturedTitle =
            (input.title as string) ?? (meta.title as string) ?? null;
          capturedDesignFamily =
            (input.designFamily as string) ??
            (input.design_family as string) ??
            (meta.designFamily as string) ??
            null;
          capturedThemeColor =
            (input.themeColor as string) ??
            (input.theme_color as string) ??
            (meta.themeColor as string) ??
            (meta.theme_color as string) ??
            null;

          // Acknowledge so the agent finishes cleanly.
          await client.beta.sessions.events.send(session.id, {
            events: [
              {
                type: "user.custom_tool_result",
                custom_tool_use_id: toolEvent.id,
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({ ok: true, received: true }),
                  },
                ],
                is_error: false,
              },
            ],
            betas: MANAGED_BETAS,
          });

          done = true;
          break;
        } else {
          // Unknown tool — return error so agent can recover or end.
          await client.beta.sessions.events.send(session.id, {
            events: [
              {
                type: "user.custom_tool_result",
                custom_tool_use_id: toolEvent.id,
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      ok: false,
                      error: `unknown_tool:${toolName}`,
                    }),
                  },
                ],
                is_error: true,
              },
            ],
            betas: MANAGED_BETAS,
          });
        }
      }

      if (type === "session.status_terminated") break;
      if (type === "session.status_idle") {
        const stop = (e as { stop_reason?: { type?: string } }).stop_reason;
        if (stop?.type !== "requires_action") break;
      }
    }

    if (!done || !capturedSchema) {
      throw new Error("agent_did_not_emit_schema");
    }

    const derivedTitle =
      capturedTitle ??
      (args.brief.length > 50 ? `${args.brief.substring(0, 50)}...` : args.brief);

    await prisma.store.update({
      where: { id: args.storeId },
      data: {
        landingBlocks: capturedSchema as never,
        landingTitle: derivedTitle,
        landingThemeVariant: capturedDesignFamily ?? "A",
        landingGeneratedAt: new Date(),
        landingStatus: "ready",
        landingError: null,
        ...(capturedThemeColor ? { primaryColor: capturedThemeColor } : {}),
      },
    });

    console.log(
      `[managed-agent] saved schema! title="${derivedTitle}" family=${capturedDesignFamily} color=${capturedThemeColor} ✅`,
    );
  } catch (err) {
    const msg =
      err instanceof ManagedAgentNotConfiguredError
        ? "managed_agent_not_configured"
        : err instanceof Error
          ? err.message.slice(0, 500)
          : "unknown_error";
    console.error(`[managed-agent] failed:`, err);
    await prisma.store
      .update({
        where: { id: args.storeId },
        data: { landingStatus: "failed", landingError: msg },
      })
      .catch(() => undefined);
  }
}
