import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Internal API used by middleware to resolve custom domain → store slug
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const host = (searchParams.get("host") ?? "").toLowerCase();
  if (!host) {
    return NextResponse.json({ slug: null }, { status: 400 });
  }

  const store = await prisma.store.findUnique({
    where: { customDomain: host },
    select: { slug: true },
  });

  if (!store) {
    return NextResponse.json({ slug: null }, { status: 404 });
  }

  return NextResponse.json({ slug: store.slug });
}
