/**
 * Owner-scoped manual trigger for the Thai-title backfill.
 *
 * The save paths (catalog import / URL paste / manual create) all
 * fire `translateProductTitlesForStore` via waitUntil already, so
 * new imports get translated automatically. This endpoint exists for
 * the case where a store has products created BEFORE the backfill
 * hooks were added — the operator can hit a button on
 * /dashboard/store/products to translate everything in one shot.
 *
 *   POST /api/store/products/translate-titles
 *     body: { force?: boolean } — defaults to false (only NULL rows)
 *     200:  { ok: true, scanned, translated, failed, skipped }
 *
 * Auth: NextAuth session → user.store. The function ONLY translates
 * products in the caller's own store, so there's no IDOR vector.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  translateProductTitlesForStore,
  TranslateNotConfiguredError,
} from "@/lib/translate-titles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Translation runs through Claude Haiku in batches of 25 — give it
// breathing room. The /admin variant of this endpoint also uses 300s.
export const maxDuration = 300;

const bodySchema = z
  .object({ force: z.boolean().optional() })
  .optional();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });
  if (!user?.store) {
    return NextResponse.json({ error: "no_store" }, { status: 404 });
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  const force = parsed.success ? parsed.data?.force ?? false : false;

  try {
    const result = await translateProductTitlesForStore(user.store.id, {
      force,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof TranslateNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: "agent_not_configured" },
        { status: 503 },
      );
    }
    const msg =
      err instanceof Error ? err.message.slice(0, 500) : "unknown_error";
    console.error("[store/translate-titles] failed:", err);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 },
    );
  }
}
