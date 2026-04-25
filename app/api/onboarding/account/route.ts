import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setUserCookie } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or name" }, { status: 400 });
  }
  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { name: parsed.data.name },
    create: { email: parsed.data.email, name: parsed.data.name },
    include: { store: true },
  });
  setUserCookie(user.id);
  return NextResponse.json({
    userId: user.id,
    role: user.role,
    hasStore: !!user.store,
    storeSlug: user.store?.slug ?? null,
  });
}
