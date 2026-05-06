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

/**
 * Walk the agent-emitted schema and collect Thai title/description
 * overrides per externalProductId. Then update the matching DB
 * Product rows so non-schema surfaces (cart drawer, product detail,
 * checkout) also show Thai copy.
 *
 * Looks at:
 *   - OfferGrid blocks: `content.products[].titleTh` keyed by `product_id`
 *   - ProductHero blocks: `content.product_id` + `content.titleTh / headline`
 *
 * Skips entries whose product_id doesn't match any DB row (e.g. agent
 * hallucinated an id) so the update is purely additive.
 */
async function syncProductTranslationsFromSchema(
  storeId: string,
  schema: Record<string, unknown> | null,
): Promise<number> {
  if (!schema) return 0;

  type Override = { titleTh?: string; descriptionTh?: string };
  const byExternalId = new Map<string, Override>();

  const pages = (schema.pages as unknown[]) ?? [];
  for (const page of pages) {
    const blocks = ((page as Record<string, unknown>).blocks as unknown[]) ?? [];
    for (const block of blocks) {
      const b = block as Record<string, unknown>;
      const blockType = (b.blockType ?? b.type) as string | undefined;
      const c = (b.content ?? {}) as Record<string, unknown>;

      if (blockType === "OfferGrid") {
        const list = ((c.products as unknown[]) ?? (c.items as unknown[])) ?? [];
        for (const item of list) {
          const it = item as Record<string, unknown>;
          const externalId = (it.product_id ??
            it.productId ??
            it.id) as string | undefined;
          if (!externalId) continue;
          const titleTh = (it.titleTh ?? it.title_th) as string | undefined;
          const descTh = (it.descriptionTh ??
            it.description_th ??
            it.description) as string | undefined;
          if (titleTh || descTh) {
            const prev = byExternalId.get(externalId) ?? {};
            byExternalId.set(externalId, {
              titleTh: prev.titleTh ?? titleTh,
              descriptionTh: prev.descriptionTh ?? descTh,
            });
          }
        }
      }

      if (blockType === "ProductHero" || blockType === "Hero") {
        const externalId = (c.product_id ?? c.productId) as string | undefined;
        if (!externalId) continue;
        const titleTh = (c.titleTh ?? c.headline ?? c.title) as
          | string
          | undefined;
        const descTh = (c.descriptionTh ?? c.subheadline ?? c.description) as
          | string
          | undefined;
        if (titleTh || descTh) {
          const prev = byExternalId.get(externalId) ?? {};
          byExternalId.set(externalId, {
            titleTh: prev.titleTh ?? titleTh,
            descriptionTh: prev.descriptionTh ?? descTh,
          });
        }
      }
    }
  }

  if (byExternalId.size === 0) return 0;

  // Run all updates in parallel — `updateMany` would let DB do the
  // matching but we have a per-row payload, so a Promise.all of
  // individual updates (scoped to this store) is the cleanest path.
  const updates = await Promise.all(
    Array.from(byExternalId.entries()).map(([externalId, override]) =>
      prisma.product
        .updateMany({
          where: { storeId, externalProductId: externalId },
          data: {
            ...(override.titleTh ? { titleTh: override.titleTh } : {}),
            ...(override.descriptionTh
              ? { descriptionTh: override.descriptionTh }
              : {}),
          },
        })
        .catch(() => ({ count: 0 })),
    ),
  );
  return updates.reduce((sum, r) => sum + (r.count ?? 0), 0);
}

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
  /**
   * Generation mode:
   *   - "marketing" (default): Home/Products/About/Contact — 4 pages
   *   - "compliance": FAQ/Shipping/Returns/Privacy/Terms — 5 pages, merged
   *     into the existing schema (preserves globalHeader / globalFooter /
   *     metadata / marketing pages)
   * Splitting these into two calls keeps each generation under Anthropic's
   * SSE body timeout (~5min) and lets operators regenerate either set
   * independently.
   */
  mode?: "marketing" | "compliance";
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
      // Compliance-mode merge needs to read existing schema (we ONLY append
      // the new compliance pages; preserve marketing pages + chrome).
      landingBlocks: true,
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

    const mode = args.mode ?? "marketing";
    // Compliance mode prepends a SKILL-recognized phrase so the agent
    // (per its mode-aware rule 8) emits ONLY faq/shipping/returns/
    // privacy/terms instead of the marketing 4. Existing
    // globalHeader/globalFooter/metadata are preserved on the marketplace
    // side via merge below — agent doesn't need to re-emit them.
    const briefForAgent =
      mode === "compliance"
        ? `Generate compliance pages for the storefront below.\nหน้าเงื่อนไข — emit only FAQ + Shipping + Returns + Privacy + Terms (5 pages). Skip globalHeader/globalFooter — they're already set.\n\n${args.brief}`
        : args.brief;

    const prompt = composePrompt({
      storeName: store.name,
      brief: briefForAgent,
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

    let schemaToSave: Record<string, unknown> = capturedSchema;

    if (mode === "compliance") {
      // Merge: keep existing globalHeader / globalFooter / metadata /
      // marketing pages, ONLY swap in the new compliance pages by slug.
      const existingSchema = (store.landingBlocks ?? null) as Record<
        string,
        unknown
      > | null;
      const existingPages =
        ((existingSchema?.pages as unknown[]) ?? []) as Array<
          Record<string, unknown>
        >;
      const newPages = ((capturedSchema.pages as unknown[]) ?? []) as Array<
        Record<string, unknown>
      >;
      const newSlugs = new Set(newPages.map((p) => p.slug as string));

      // Drop any pre-existing compliance pages then append fresh ones.
      const merged = [
        ...existingPages.filter(
          (p) => !newSlugs.has(p.slug as string),
        ),
        ...newPages,
      ];

      schemaToSave = {
        ...existingSchema,
        ...capturedSchema,
        pages: merged,
        // Keep the existing chrome — agent doesn't re-emit these in
        // compliance mode; if it accidentally did, ignore in favour
        // of what we already had.
        globalHeader:
          existingSchema?.globalHeader ?? capturedSchema.globalHeader,
        globalFooter:
          existingSchema?.globalFooter ?? capturedSchema.globalFooter,
        metadata: existingSchema?.metadata ?? capturedSchema.metadata,
      };
      console.log(
        `[managed-agent] compliance merge: kept ${existingPages.length - newPages.length} existing + ${newPages.length} new pages = ${merged.length} total`,
      );
    }

    await prisma.store.update({
      where: { id: args.storeId },
      data: {
        landingBlocks: schemaToSave as never,
        // Marketing-mode generation owns title/family/color; compliance
        // mode preserves whatever's already set.
        ...(mode === "marketing"
          ? {
              landingTitle: derivedTitle,
              landingThemeVariant: capturedDesignFamily ?? "A",
              ...(capturedThemeColor
                ? { primaryColor: capturedThemeColor }
                : {}),
            }
          : {}),
        landingGeneratedAt: new Date(),
        landingStatus: "ready",
        landingError: null,
      },
    });

    console.log(
      `[managed-agent] saved ${mode} schema! title="${derivedTitle}" family=${capturedDesignFamily} color=${capturedThemeColor} ✅`,
    );

    // Sync agent's Thai product translations back into DB so product
    // detail pages (/stores/<slug>/products/<id>) and other surfaces
    // that read from prisma.product show titleTh instead of the raw
    // English supplier title.
    const synced = await syncProductTranslationsFromSchema(
      args.storeId,
      capturedSchema,
    );
    if (synced > 0) {
      console.log(
        `[managed-agent] synced ${synced} product titleTh translations from schema`,
      );
    }
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
