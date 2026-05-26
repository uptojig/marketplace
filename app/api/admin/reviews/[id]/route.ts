/**
 * PATCH /api/admin/reviews/[id] — moderate (hide / unhide).
 * Body: { action: "hide" | "unhide", note?: string }
 *
 * Admin-only. Hidden reviews stay in the DB for audit + reviewer can
 * still edit; the storefront listing hides them via lib/reviews/listReviews.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hideReview, unhideReview } from "@/lib/reviews";

async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  return user?.role === "ADMIN" ? user : null;
}

const schema = z.object({
  action: z.enum(["hide", "unhide"]),
  note: z.string().trim().max(500).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.action === "hide") {
    await hideReview({
      reviewId: params.id,
      adminUserId: admin.id,
      note: parsed.data.note,
    });
  } else {
    await unhideReview(params.id);
  }
  return NextResponse.json({ ok: true });
}
