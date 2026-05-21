import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { isEverydayStore } from "@/lib/landing/everyday";
import { isTaobaoStore } from "@/lib/landing/taobao";
import { isPackagingStore } from "@/lib/landing/packaging";
import { isCommunityStore } from "@/lib/landing/community";
import { StoreCartClient } from "./cart-client";
import { FashionBeautyCartPage } from "@/components/storefront/themes/fashion-beauty/FashionBeautyCartPage";
import { TrustCartPage } from "@/components/storefront/themes/trust/TrustCartPage";
import { BusinessModelCartPage } from "@/components/storefront/themes/business-model/BusinessModelCartPage";
import { LifestyleCartPage } from "@/components/storefront/themes/lifestyle/LifestyleCartPage";
import { ElectronicsTechCartPage } from "@/components/storefront/themes/electronics-tech/ElectronicsTechCartPage";
import { SpecialtyCartPage } from "@/components/storefront/themes/specialty/SpecialtyCartPage";
import { EverydayCartPage } from "@/components/storefront/themes/everyday/EverydayCartPage";
import { TaobaoCartPage } from "@/components/storefront/themes/taobao/TaobaoCartPage";
import { PackagingCartPage } from "@/components/storefront/themes/packaging/PackagingCartPage";
import { CommunityCartPage } from "@/components/storefront/themes/community/CommunityCartPage";
import { storeToSummary } from "@/components/storefront/block-renderer";

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
      bannerUrl: true,
      primaryColor: true,
      tagline: true,
      description: true,
      templateId: true,
      landingThemeVariant: true,
    },
  });
  if (!store) notFound();

  // ── Template bespoke cart page (highest-priority generic dispatch) ──
  // Templates registered in STORE_TEMPLATES that ship their own
  // `pages.cart` component (e.g. eco-pack, bikini-beach, mega-store)
  // MUST win over the 10 family detectors below. Otherwise these
  // bespoke cart designs get silently overridden by the family
  // cart pages whenever `landingThemeVariant` is set.
  // Cart adapters are client components that read line items from
  // the zustand cart themselves, so server-side `items: []` is fine —
  // the prop only exists to satisfy the CartProps contract.
  const effectiveTpl = effectiveTemplateId(store);
  if (effectiveTpl && effectiveTpl in STORE_TEMPLATES) {
    const template = STORE_TEMPLATES[effectiveTpl as TemplateId];
    const TemplateCartPage = template?.pages?.cart;
    if (TemplateCartPage) {
      return (
        <TemplateCartPage
          store={storeToSummary(store)}
          items={[]}
        />
      );
    }
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
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isTrust = !isFB && isTrustStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isBusinessModel = !isFB && !isTrust && isBusinessModelStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isLifestyle = !isFB && !isTrust && !isBusinessModel && isLifestyleStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isElectronicsTech = !isFB && !isTrust && !isBusinessModel && !isLifestyle && isElectronicsTechStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isSpecialty = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && isSpecialtyStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isEveryday = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && !isSpecialty && isEverydayStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isTaobao = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && !isSpecialty && !isEveryday && isTaobaoStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isPackaging = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && !isSpecialty && !isEveryday && !isTaobao && isPackagingStore({
    templateId: effectiveTpl,
    landingThemeVariant: store.landingThemeVariant,
  });
  const isCommunity = !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech && !isSpecialty && !isEveryday && !isTaobao && !isPackaging && isCommunityStore({
    templateId: effectiveTpl,
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
  if (isEveryday) {
    return <EverydayCartPage store={store} />;
  }
  if (isTaobao) {
    return <TaobaoCartPage store={store} />;
  }
  if (isPackaging) {
    return <PackagingCartPage store={store} />;
  }
  if (isCommunity) {
    return <CommunityCartPage store={store} />;
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
