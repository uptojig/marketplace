import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { StoreCartClient } from "./cart-client";

export const dynamic = "force-dynamic";

export default async function StoreCartPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      primaryColor: true,
      templateId: true,
      landingThemeVariant: true,
    },
  });
  if (!store) notFound();

  // Tell the cart client which design family to render under. The
  // .theme-fashion-beauty cascade on the layout wrapper handles the
  // palette + headings; this flag lets us swap copy + a couple of
  // layout details (serif title, italic empty state, etc).
  const isFB = isFashionBeautyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });

  return <StoreCartClient store={store} isFashionBeauty={isFB} />;
}
