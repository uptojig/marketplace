import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runLandingAgent } from "@/lib/landing-agent";
import { runLandingAgentManaged } from "@/lib/landing-agent-managed";
import { MIN_PRODUCTS_FOR_LANDING } from "@/lib/landing/min-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Streaming keeps the connection alive — Hobby plan won't kill it
// as long as we're actively sending data.
export const maxDuration = 300;

const bodySchema = z.object({
  brief: z.string().trim().min(5).max(4000),
  themeHint: z
    .enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "minimal", "cute"])
    .optional(),
  mode: z.enum(["marketing", "compliance"]).optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/**
 * POST /api/admin/stores/<id>/generate-landing
 *
 * Streams progress as NDJSON while the agent runs. This keeps the
 * serverless invocation alive (streaming responses aren't subject to
 * idle-timeout as long as data is being sent).
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { brief, themeHint, mode } = parsed.data;

  const existing = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true, landingStatus: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (existing.landingStatus === "generating") {
    return NextResponse.json(
      { ok: false, error: "already_generating" },
      { status: 409 },
    );
  }

  // Product-count gate. Marketing mode fills OfferGrid + CategoryBanner
  // blocks with real products from the store — below the floor those
  // grids look like skeletons and the agent starts repeating items or
  // hallucinating SKUs. Compliance mode (FAQ / Shipping / Returns /
  // Privacy / Terms) doesn't reference products, so we skip the gate
  // there. Mirrored client-side in landing-form.tsx so the operator
  // sees the message before they hit submit.
  if ((mode ?? "marketing") === "marketing") {
    const activeCount = await prisma.product.count({
      where: { storeId: params.id, active: true },
    });
    if (activeCount < MIN_PRODUCTS_FOR_LANDING) {
      return NextResponse.json(
        {
          ok: false,
          error: "not_enough_products",
          minRequired: MIN_PRODUCTS_FOR_LANDING,
          currentCount: activeCount,
          // `detail` is the field the existing client toast reads;
          // keep the human-readable copy here so the operator sees
          // the count even if they bypass the client-side gate.
          detail: `ต้องมีสินค้าอย่างน้อย ${MIN_PRODUCTS_FOR_LANDING} ตัว ก่อน Generate — ตอนนี้มี ${activeCount} ตัว`,
        },
        { status: 400 },
      );
    }
  }

  await prisma.store.update({
    where: { id: params.id },
    data: {
      landingStatus: "generating",
      landingError: null,
      landingBrief: brief,
      landingStartedAt: new Date(),
    },
  });

  // Stream NDJSON to keep the connection alive while the agent runs.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const write = (obj: unknown) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        } catch {
          // controller may be closed
        }
      };

      write({ type: "started", storeId: params.id });

      // Engine selection — `?engine=managed` switches to the Anthropic
      // Managed Agent path (single-shot via agent_id from env), default
      // is the local multi-step pipeline.
      const url = new URL(req.url);
      const engine = url.searchParams.get("engine");
      const useManaged = engine === "managed";

      try {
        if (useManaged) {
          await runLandingAgentManaged({
            storeId: params.id,
            brief,
            themeHint,
            mode: mode ?? "marketing",
          });
        } else {
          await runLandingAgent({ storeId: params.id, brief, themeHint });
        }
        write({ type: "done", ok: true, engine: useManaged ? "managed" : "local" });
      } catch (err) {
        console.error("landing-agent failed:", err);
        const msg = err instanceof Error ? err.message.slice(0, 500) : "unknown_error";
        write({ type: "error", message: msg });
        await prisma.store
          .update({
            where: { id: params.id },
            data: { landingStatus: "failed", landingError: msg },
          })
          .catch(() => undefined);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
