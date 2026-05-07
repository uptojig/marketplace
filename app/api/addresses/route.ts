import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolve the user this request belongs to.
 *
 *   1. NextAuth session → real user.
 *   2. Guest fallback (single shared "guest@marketplace.local" row)
 *      so unauthenticated checkout still works for the "Buy without
 *      signing up" path that /api/checkout supports.
 *
 * Replaces an earlier `getCurrentUserId()` cookie-session lookup
 * that was only ever populated by the /onboarding flow. Onboarding
 * was removed (commit 59c7c90) so the cookie always resolved null
 * and every signed-in user got dumped into the guest pool too.
 */
async function resolveUserId(): Promise<string> {
  const session = await getServerSession(authOptions).catch(() => null);
  if (session?.user?.email) {
    const u = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (u) return u.id;
  }
  const guest = await prisma.user.upsert({
    where: { email: "guest@marketplace.local" },
    update: {},
    create: { email: "guest@marketplace.local", name: "Guest" },
  });
  return guest.id;
}

export async function GET() {
  const userId = await resolveUserId();
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ addresses });
}

const createSchema = z.object({
  recipientName: z.string().min(1).max(120),
  phone: z.string().min(1).max(40),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().default(""),
  subdistrict: z.string().max(120).optional().default(""),
  district: z.string().max(120).optional().default(""),
  province: z.string().min(1).max(120),
  postalCode: z.string().min(1).max(20),
  country: z.string().default("TH"),
});

export async function POST(req: Request) {
  const userId = await resolveUserId();
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const created = await prisma.address.create({
    data: { ...parsed.data, userId },
  });
  return NextResponse.json({ address: created });
}
