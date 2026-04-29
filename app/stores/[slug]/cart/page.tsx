import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreCartClient } from "./cart-client";

export const dynamic = "force-dynamic";

export default async function StoreCartPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, name: true, logoUrl: true, primaryColor: true },
  });
  if (!store) notFound();

  return <StoreCartClient store={store} />;
}
