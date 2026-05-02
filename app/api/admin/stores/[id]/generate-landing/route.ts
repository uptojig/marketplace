import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runLandingAgent } from "@/lib/landing-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel Pro: 300s. Hobby: 60s. We rely on fire-and-forget so the
// HTTP response returns in <2s; the agent run continues after the
// response. The agent itself takes 30s–3min, so the function may
// or may not stay alive long enough on Hobby plans (the unhandled
// promise will be killed when Vercel reclaims the function). The
// row stays in "generating" status if so — admin can retry.
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

  void runLandingAgent({
    storeId: params.id,
    brief,
    themeHint,
  }).catch((err) => {
    // Unreachable in normal flow — runLandingAgent does its own
    // catching. This is just a last-resort safety net.
    console.error("landing-agent rejected at top level:", err);
  });

  return NextResponse.json(
    {
      ok: true,
      status: "generating",
      message: "Agent run started. Poll GET /api/admin/stores/<id>/landing for status.",
    },
    { status: 202 },
  );
}
