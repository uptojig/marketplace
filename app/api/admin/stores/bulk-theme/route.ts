/**
 * POST /api/admin/stores/bulk-theme
 *
 * Body: { ids: string[], landingThemeVariant: string | null }
 *
 * Updates Store.landingThemeVariant on every matching row. When the
 * variant is non-null, also nulls out the AI-generated landing JSON
 * so the theme picker takes over the storefront render (same side
 * effect as the per-store admin picker — see /api/admin/stores/[id]).
 *
 * Admin-only.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
  landingThemeVariant: z
    .string()
    .max(40)
    .nullable()
    .transform((v) => {
      if (v === null) return null;
      const t = v.trim();
      return t === "" ? null : t;
    }),
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

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { ids, landingThemeVariant } = parsed.data;

  // When picking a real theme (non-null), also clear AI-generated
  // landing JSON so the storefront's theme detector takes over.
  // Clearing the picker back to null leaves landingBlocks alone.
  const clearAiLanding = landingThemeVariant !== null;

  // Build the update payload outside the call so the conditional spread
  // doesn't widen the literal to a union the Prisma input checker
  // refuses to resolve. All fields are valid on
  // `StoreUncheckedUpdateManyInput`.
  const data: Prisma.StoreUncheckedUpdateManyInput = {
    landingThemeVariant,
  };
  if (clearAiLanding) {
    // `landingBlocks` is a Prisma Json column — `null` is overloaded so
    // Prisma requires `Prisma.JsonNull` to clear it explicitly.
    data.landingBlocks = Prisma.JsonNull;
    data.landingTitle = null;
    data.landingGeneratedAt = null;
    data.landingStatus = null;
    data.landingError = null;
  }
  const result = await prisma.store.updateMany({
    where: { id: { in: ids } },
    data,
  });

  return NextResponse.json({ updated: result.count });
}
