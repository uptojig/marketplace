import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin endpoint for setting / clearing a store's agent-generated
 * landing page.
 *
 *   PATCH /api/admin/stores/<id>/landing
 *     body: { blocks: [...], title?, themeVariant?: "cute" | "minimal" }
 *     - blocks must be a JSON array of { blockType, content } shapes
 *       compatible with components/landing/BlockRenderer
 *     - When `blocks` is empty array, clears the landing page (store
 *       falls back to the generic product grid renderer).
 *
 *   DELETE /api/admin/stores/<id>/landing
 *     - Convenience endpoint to clear the landing page (same as
 *       PATCH with empty blocks).
 */

const blockSchema = z.object({
  blockType: z.string().min(1),
  content: z.record(z.string(), z.unknown()).default({}),
});

const patchSchema = z.object({
  blocks: z.array(blockSchema).max(50),
  title: z.string().max(200).optional(),
  themeVariant: z.enum(["cute", "minimal"]).optional(),
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { blocks, title, themeVariant } = parsed.data;
  const isClearing = blocks.length === 0;

  try {
    const store = await prisma.store.update({
      where: { id: params.id },
      data: {
        landingBlocks: isClearing ? Prisma.JsonNull : (blocks as unknown as Prisma.InputJsonValue),
        landingTitle: isClearing ? null : (title ?? null),
        landingThemeVariant: isClearing ? null : (themeVariant ?? "minimal"),
        landingGeneratedAt: isClearing ? null : new Date(),
      },
      select: {
        id: true,
        slug: true,
        landingTitle: true,
        landingThemeVariant: true,
        landingGeneratedAt: true,
      },
    });
    return NextResponse.json({
      ...store,
      blockCount: blocks.length,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await prisma.store.update({
      where: { id: params.id },
      data: {
        landingBlocks: Prisma.JsonNull,
        landingTitle: null,
        landingThemeVariant: null,
        landingGeneratedAt: null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    throw e;
  }
}
