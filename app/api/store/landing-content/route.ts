import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  landingContentSchema,
  type LandingContentInput,
} from "@/lib/store/landing-content";

// Vendor (owner-scoped) editor for StoreLandingContent.
//
// Resolves the store via the signed-in user's ownership relation —
// today exactly one store per user (Store.ownerId @unique). Admin
// editing for any store goes through /api/admin/stores/[id]/landing-content
// instead (they need the explicit storeId in the URL because admins
// don't "own" the stores they manage).

async function resolveOwnedStore(): Promise<
  | { ok: true; storeId: string }
  | { ok: false; status: 401 | 404 }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, status: 401 };
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: { select: { id: true } } },
  });
  if (!user?.store) return { ok: false, status: 404 };
  return { ok: true, storeId: user.store.id };
}

export async function GET() {
  const resolved = await resolveOwnedStore();
  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.status === 401 ? "Unauthorized" : "Store not found" },
      { status: resolved.status },
    );
  }
  const content = await prisma.storeLandingContent.findUnique({
    where: { storeId: resolved.storeId },
  });
  return NextResponse.json({ storeId: resolved.storeId, content });
}

export async function PUT(req: Request) {
  const resolved = await resolveOwnedStore();
  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.status === 401 ? "Unauthorized" : "Store not found" },
      { status: resolved.status },
    );
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
      where: { storeId: resolved.storeId },
      create: { storeId: resolved.storeId, ...data },
      update: data,
    });
    return NextResponse.json({ ok: true, content: result });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    throw e;
  }
}

function patchFromInput(input: LandingContentInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}
