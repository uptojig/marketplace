import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { StoreCartClient } from "./cart-client";
import { FashionBeautyCartPage } from "@/components/storefront/themes/fashion-beauty/FashionBeautyCartPage";
import { TrustCartPage } from "@/components/storefront/themes/trust/TrustCartPage";
import { BusinessModelCartPage } from "@/components/storefront/themes/business-model/BusinessModelCartPage";
import { LifestyleCartPage } from "@/components/storefront/themes/lifestyle/LifestyleCartPage";
import { ElectronicsTechCartPage } from "@/components/storefront/themes/electronics-tech/ElectronicsTechCartPage";
import { SpecialtyCartPage } from "@/components/storefront/themes/specialty/SpecialtyCartPage";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";

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
      description: true,
      tagline: true,
      bannerUrl: true,
      logoUrl: true,
      primaryColor: true,
      templateId: true,
      landingThemeVariant: true,
    },
  });
  if (!store) notFound();

  // ── Multi-page template dispatch ────────────────────────────
  // When the active template ships a bespoke cart page, defer to
  // it. Items + totals live client-side in the zustand cart
  // (lib/store/cart) so the template page is responsible for
  // reading them via `useCart` exactly like StoreCartClient does.
  // We only thread server data (store identity + thresholds) so
  // the contract matches `CartProps` in lib/templates/types.ts.
  const effectiveTpl = effectiveTemplateId(store);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;
  const TemplateCartPage = template?.pages?.cart;
  if (TemplateCartPage) {
    return (
      <TemplateCartPage
        store={{
          id: store.id,
          slug: store.slug,
          name: store.name,
          description: store.description,
          tagline: store.tagline,
          logoUrl: store.logoUrl,
          bannerUrl: store.bannerUrl,
          primaryColor: store.primaryColor,
        }}
        // Client-side cart hydrates from zustand inside the
        // template; server-side we have no items to seed with.
        items={[]}
        freeShippingThreshold={990}
        flatShippingTHB={50}
      />
    );
  }

  // Tell the cart client which design family to render under. The
  // .theme-fashion-beauty / .theme-trust / .theme-business-model /
  // .theme-lifestyle / .theme-electronics-tech / .theme-specialty
  // cascade on the layout wrapper handles palette + headings; these
  // flags let us swap copy + a couple of layout details (serif/sans
  // title, divider style, mono totals, spec-row line items, etc).
  // FB takes precedence — they're disjoint in practice but we pick a
  // consistent winner if a future store row somehow matched multiple.
  const isFB = isFashionBeautyStore({
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  });
  const isTrust = !isFB && isTrustStore({
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  });
  const isBusinessModel = !isFB && !isTrust && isBusinessModelStore({
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  });
  const isLifestyle = !isFB && !isTrust && !isBusinessModel && isLifestyleStore({
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  });
  const isElectronicsTech = !isFB && !isTrust && !isBusinessModel && !isLifestyle && isElectronicsTechStore({
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  });
  const isSpecialty = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && isSpecialtyStore({
    templateId: effectiveTemplateId(store),
    landingThemeVariant: store.landingThemeVariant,
  });

  // Each design family now has a fully bespoke cart page with a
  // structurally distinct layout (not just palette / typography swaps).
  // Dispatch in family detection order. Stores whose template doesn't
  // match any family continue to use the shared StoreCartClient with
  // its old branching for graceful degradation.
  if (isFB) {
    return <FashionBeautyCartPage store={store} />;
  }
  if (isTrust) {
    return <TrustCartPage store={store} />;
  }
  if (isBusinessModel) {
    return <BusinessModelCartPage store={store} />;
  }
  if (isLifestyle) {
    return <LifestyleCartPage store={store} />;
  }
  if (isElectronicsTech) {
    return <ElectronicsTechCartPage store={store} />;
  }
  if (isSpecialty) {
    return <SpecialtyCartPage store={store} />;
  }

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
