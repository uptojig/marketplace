/**
 * Admin endpoint: backfill `Product.titleTh` for a store.
 *
 * The landing agent already triggers this implicitly after generating
 * a homepage, but you can run it standalone to:
 *   - Backfill stores whose landing was generated before this feature
 *     existed (so all titleTh are NULL → category/PDP show English).
 *   - Re-translate after editing the prompt or model in
 *     lib/translate-titles.ts (`force: true`).
 *
 * Body: { force?: boolean } — defaults to false.
 * Response: { ok: true, scanned, translated, failed, skipped }.
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
export const maxDuration = 300;

const bodySchema = z
  .object({
    force: z.boolean().optional(),
  })
  .optional();

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

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const force = parsed.data?.force ?? false;

  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  try {
    const result = await translateProductTitlesForStore(params.id, { force });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof TranslateNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: "agent_not_configured" },
        { status: 503 },
      );
    }
    const msg = err instanceof Error ? err.message.slice(0, 500) : "unknown_error";
    console.error("[translate-titles] route failed:", err);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 },
    );
  }
}
