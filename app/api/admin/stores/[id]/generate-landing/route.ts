import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runLandingAgent } from "@/lib/landing-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel Pro: 300s. Hobby: 60s. We use Vercel's `waitUntil` to
// guarantee the background work runs within the allocated function
// lifetime — plain `void promise` was being reaped by Vercel the
// moment the response was flushed, so the Anthropic session never
// even got created (landingStatus stuck at "generating", no session
// in Anthropic Console). waitUntil flushes the response first, then
// keeps the function alive for the background callback up to
// maxDuration. Next 15's `after()` is the framework-level
// equivalent; we're on Next 14 so we use the Vercel SDK directly.
export const maxDuration = 300;

const bodySchema = z.object({
  brief: z.string().trim().min(5).max(4000),
  themeHint: z.enum(["minimal", "cute"]).optional(),
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
 *   body: { brief, themeHint? }
 *
 * Fire-and-forget agent run. Sets `landingStatus="generating"`
 * immediately, returns 202. The unhandled promise drives the
 * agent + persists the result via `runLandingAgent`. Admin polls
 * GET /api/admin/stores/<id>/landing for status.
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
  const { brief, themeHint } = parsed.data;

  // Quick guard against double-clicks — refuse if a run is already
  // in flight. Admin can wait or DELETE the landing row to reset.
  const existing = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true, landingStatus: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (existing.landingStatus === "generating") {
    return NextResponse.json(
      {
        ok: false,
        error: "already_generating",
        detail: "Wait for the current run to finish, or DELETE the landing row to cancel.",
      },
      { status: 409 },
    );
  }

  // Mark as generating BEFORE kicking the background job so the UI
  // can show progress immediately even if the function is killed
  // before runLandingAgent's first DB write.
  await prisma.store.update({
    where: { id: params.id },
    data: {
      landingStatus: "generating",
      landingError: null,
      landingBrief: brief,
      landingStartedAt: new Date(),
    },
  });

  // Use waitUntil so the background work has a guaranteed window
  // (up to maxDuration) — plain `void` was being killed when the
  // response flushed, leading to the stuck-generating bug.
  waitUntil(
    (async () => {
      try {
        await runLandingAgent({ storeId: params.id, brief, themeHint });
      } catch (err) {
        // runLandingAgent does its own catching, so this only fires
        // for unexpected throws. Flip the row to failed so the UI
        // doesn't stay stuck on "generating".
        console.error("landing-agent rejected at top level:", err);
        await prisma.store
          .update({
            where: { id: params.id },
            data: {
              landingStatus: "failed",
              landingError:
                err instanceof Error
                  ? err.message.slice(0, 500)
                  : "unknown_error_in_waitUntil_block",
            },
          })
          .catch(() => undefined);
      }
    })(),
  );

  return NextResponse.json(
    {
      ok: true,
      status: "generating",
      message: "Agent run started. Poll GET /api/admin/stores/<id>/landing for status.",
    },
    { status: 202 },
  );
}
