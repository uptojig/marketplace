/**
 * Recover a landing-page generation that timed out on Vercel but
 * succeeded on Anthropic's side.
 *
 * The full v12 schema generation runs 5-8 minutes on Anthropic but
 * Vercel kills functions at 60s (Hobby) / 300s (Pro). When the local
 * function dies, the Anthropic session keeps running and DOES emit
 * the schema — operators just need a way to pull it down after the
 * fact. They paste the session_id from
 * https://platform.claude.com/workspaces/default/sessions/<sessionId>
 * here, and we replay the save+sync logic that runLandingAgentManaged
 * would have run on a successful synchronous completion.
 *
 *   POST /api/admin/stores/<id>/landing/recover
 *     body: { sessionId: "sesn_011...", mode?: "marketing" | "compliance" }
 *     200:  { ok: true, designFamily, pageCount, syncedTitles, acked }
 *     5xx:  { ok: false, error }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recoverLandingFromSession } from "@/lib/landing-agent-managed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Recovery is much faster than generation (just fetches existing
// session events) but events.list + apply + ack still wants headroom.
export const maxDuration = 60;

const bodySchema = z.object({
  // Anthropic session id format. Strict enough to catch obvious typos
  // like passing a UUID or a URL fragment instead.
  sessionId: z
    .string()
    .trim()
    .min(8)
    .max(80)
    .regex(/^sesn_[A-Za-z0-9]+$/, "expected session id like 'sesn_011…'"),
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

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { sessionId, mode } = parsed.data;

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const result = await recoverLandingFromSession({
    storeId: params.id,
    sessionId,
    mode,
  });

  if (!result.ok) {
    // Map known error strings to HTTP codes so the UI can render a
    // helpful message instead of a generic 500.
    const status =
      result.error === "no_schema_in_session"
        ? 422 // session exists but never emitted the schema (still in flight, or already cleared)
        : result.error.startsWith("fetch_events_failed")
          ? 502 // upstream Anthropic API issue
          : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json(result);
}
