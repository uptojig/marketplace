import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(2).max(300).optional(),
  titleTh: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  descriptionTh: z.string().max(5000).optional().or(z.literal("")),
  priceTHB: z.number().positive().max(99999999).optional(),
  compareAtPriceTHB: z.number().positive().max(99999999).optional().nullable(),
  imageUrl: z
    .string()
    .url()
    .or(z.literal(""))
    .optional(),
  categoryName: z.string().max(100).optional().or(z.literal("")),
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
  const d = parsed.data;
  if (d.title !== undefined) data.title = d.title;
  if (d.titleTh !== undefined) data.titleTh = d.titleTh || null;
  if (d.description !== undefined) data.description = d.description || null;
  if (d.descriptionTh !== undefined) data.descriptionTh = d.descriptionTh || null;
  if (d.priceTHB !== undefined) data.priceTHB = d.priceTHB;
  if (d.compareAtPriceTHB !== undefined)
    data.compareAtPriceTHB = d.compareAtPriceTHB ?? null;
  if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl || null;
  if (d.categoryName !== undefined) data.categoryName = d.categoryName || null;
  if (d.active !== undefined) data.active = d.active;

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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
