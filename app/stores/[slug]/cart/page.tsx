import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
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
  // .theme-fashion-beauty / .theme-trust / .theme-business-model /
  // .theme-lifestyle / .theme-electronics-tech / .theme-specialty
  // cascade on the layout wrapper handles palette + headings; these
  // flags let us swap copy + a couple of layout details (serif/sans
  // title, divider style, mono totals, spec-row line items, etc).
  // FB takes precedence — they're disjoint in practice but we pick a
  // consistent winner if a future store row somehow matched multiple.
  const isFB = isFashionBeautyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isTrust = !isFB && isTrustStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isBusinessModel = !isFB && !isTrust && isBusinessModelStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isLifestyle = !isFB && !isTrust && !isBusinessModel && isLifestyleStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isElectronicsTech = !isFB && !isTrust && !isBusinessModel && !isLifestyle && isElectronicsTechStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isSpecialty = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && isSpecialtyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });

  return (
    <StoreCartClient
      store={store}
      isFashionBeauty={isFB}
      isTrust={isTrust}
      isBusinessModel={isBusinessModel}
      isLifestyle={isLifestyle}
      isElectronicsTech={isElectronicsTech}
      isSpecialty={isSpecialty}
    />
  );
}
