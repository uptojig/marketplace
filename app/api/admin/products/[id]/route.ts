import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  priceTHB: z.number().positive().max(99999999).optional(),
  active: z.boolean().optional(),
});

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.priceTHB !== undefined) data.priceTHB = parsed.data.priceTHB;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id: params.id },
    data,
    select: { id: true, priceTHB: true, active: true },
  });

  return NextResponse.json({
    ...updated,
    priceTHB: Number(updated.priceTHB),
  });
}
