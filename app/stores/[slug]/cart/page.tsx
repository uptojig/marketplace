import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isSpecialtyStore } from "@/lib/landing/specialty";
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
  // .theme-fashion-beauty / .theme-trust / .theme-specialty cascades
  // on the layout wrapper handle the palette + headings; these flags
  // let us swap copy + a couple of layout details (serif title,
  // divider style, italic empty state, etc).
  //
  // FB wins ties, then trust, then specialty — these are disjoint
  // in practice but we pick a consistent winner if a future store
  // row somehow matched more than one.
  const isFB = isFashionBeautyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isTrust = !isFB && isTrustStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isSpecialty = !isFB && !isTrust && isSpecialtyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });

  return (
    <StoreCartClient
      store={store}
      isFashionBeauty={isFB}
      isTrust={isTrust}
      isSpecialty={isSpecialty}
    />
  );
}
