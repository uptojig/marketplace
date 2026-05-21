import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  landingContentSchema,
  type LandingContentInput,
} from "@/lib/store/landing-content";

// Admin-scoped editor for StoreLandingContent.
//
// PUT upserts the 1:1 row — sending an empty body is the same as
// "create with all defaults"; sending {heroHeadline: null} clears
// that single field; omitting a key leaves the column untouched.
// GET returns the current row (or null when the operator hasn't
// saved anything yet).

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await prisma.store.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, name: true, landingContent: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  return NextResponse.json({
    storeId: store.id,
    slug: store.slug,
    name: store.name,
    content: store.landingContent,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = landingContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = patchFromInput(parsed.data);

  try {
    const result = await prisma.storeLandingContent.upsert({
      where: { storeId: params.id },
      // Prisma upsert: `create` requires non-optional fields. Our schema
      // makes everything nullable, so we can drop the input straight in.
      create: { storeId: params.id, ...data },
      update: data,
    });
    return NextResponse.json({ ok: true, content: result });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      // FK violation — store doesn't exist
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.storeLandingContent.deleteMany({
    where: { storeId: params.id },
  });
  return NextResponse.json({ ok: true });
}

// ─── helpers ───────────────────────────────────────────────────────────

/**
 * Convert the Zod-parsed input into a Prisma update/create payload.
 * Undefined keys are dropped (column untouched); null keys are passed
 * through (column cleared); arrays/objects are JSON-stringified by
 * Prisma when the column is JSONB.
 */
export function patchFromInput(
  input: LandingContentInput,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    // `uiConfig` is a JSONB column — Prisma rejects raw `null` for nullable
    // JSON fields. Translate to `Prisma.JsonNull` so the operator can clear
    // the config back to the legacy renderer chain.
    if (k === "uiConfig") {
      out[k] =
        v === null
          ? Prisma.JsonNull
          : (v as unknown as Prisma.InputJsonValue);
      continue;
    }
    out[k] = v;
  }
  return out;
}
