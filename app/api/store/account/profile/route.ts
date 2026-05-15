import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(120).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { name, phone } = parsed.data;
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined ? { name: name || null } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}
