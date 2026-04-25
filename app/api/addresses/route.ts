import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

async function resolveUserId(): Promise<string> {
  const uid = getCurrentUserId();
  if (uid) return uid;
  // Guest fallback so browsing works without login (matches /api/checkout behavior)
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
