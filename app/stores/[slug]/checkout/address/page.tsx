// /stores/{slug}/checkout/address — Step 1 of the checkout flow.
//
// Registry dispatch first: if the template ships a bespoke checkout
// page, render it. Otherwise fall through to the family detection
// chain.

import { prisma } from "@/lib/prisma";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import { storeToSummary } from "@/components/storefront/block-renderer";
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
import { ThemeRibbon } from "@/components/storefront/themes/_shared/ThemeRibbon";
import { TrustCheckoutHeader } from "@/components/storefront/themes/trust/TrustCheckoutHeader";
import { BusinessModelCheckoutHeader } from "@/components/storefront/themes/business-model/BusinessModelCheckoutHeader";
import { LifestyleCheckoutHeader } from "@/components/storefront/themes/lifestyle/LifestyleCheckoutHeader";
import { ElectronicsTechCheckoutHeader } from "@/components/storefront/themes/electronics-tech/ElectronicsTechCheckoutHeader";
import { SpecialtyCheckoutHeader } from "@/components/storefront/themes/specialty/SpecialtyCheckoutHeader";
import CheckoutAddressClient from "./address-client";

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export const dynamic = "force-dynamic";

function FashionBeautyHeader() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <header className="text-center">
        <p
          className="text-[11px] uppercase tracking-[0.28em]"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          Checkout · Step 1 of 2
        </p>
        <h1
          className="mt-3 text-4xl sm:text-5xl"
          style={{
            fontFamily: FB_DISPLAY_FONT,
            color: "var(--shop-ink)",
            fontWeight: 500,
            letterSpacing: "-0.005em",
            lineHeight: 1.05,
          }}
        >
          Where to send it
        </h1>
        <div
          aria-hidden
          className="mx-auto mt-4 h-px w-12"
          style={{ background: "var(--shop-accent)" }}
        />
        <p
          className="mt-4 max-w-md mx-auto text-sm italic"
          style={{
            fontFamily: FB_DISPLAY_FONT,
            color: "var(--shop-ink-muted)",
          }}
        >
          Add your shipping details — we&rsquo;ll wrap it carefully and send it on its way.
        </p>
      </header>
    </div>
  );
}

export default async function CheckoutAddressPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, name: true, logoUrl: true, bannerUrl: true, primaryColor: true, tagline: true, description: true, templateId: true, landingThemeVariant: true },
  });
  if (!store) return <CheckoutAddressClient params={params} />;

  // ── Registry dispatch (highest priority) ──
  const effectiveTpl = effectiveTemplateId(store);
  if (effectiveTpl && effectiveTpl in STORE_TEMPLATES) {
    const template = STORE_TEMPLATES[effectiveTpl as TemplateId];
    const TemplateCheckoutPage = template?.pages?.checkout;
    if (TemplateCheckoutPage) {
      return (
        <TemplateCheckoutPage
          store={storeToSummary(store)}
          items={[]}
        />
      );
    }
  }

  // ── Family detection fallback ──
  const familyKey = {
    templateId: effectiveTpl,
    landingThemeVariant: store?.landingThemeVariant,
  };
  const isFB = isFashionBeautyStore(familyKey);
  const isTrust = !isFB && isTrustStore(familyKey);
  const isBM = !isFB && !isTrust && isBusinessModelStore(familyKey);
  const isLifestyle = !isFB && !isTrust && !isBM && isLifestyleStore(familyKey);
  const isET =
    !isFB && !isTrust && !isBM && !isLifestyle && isElectronicsTechStore(familyKey);
  const isSpecialty =
    !isFB && !isTrust && !isBM && !isLifestyle && !isET && isSpecialtyStore(familyKey);
  const isEveryday = !isFB && !isTrust && !isBM && !isLifestyle && !isET && !isSpecialty && isEverydayStore(familyKey);
  const isTaobao = !isFB && !isTrust && !isBM && !isLifestyle && !isET && !isSpecialty && !isEveryday && isTaobaoStore(familyKey);
  const isPackaging = !isFB && !isTrust && !isBM && !isLifestyle && !isET && !isSpecialty && !isEveryday && !isTaobao && isPackagingStore(familyKey);
  const isCommunity = !isFB && !isTrust && !isBM && !isLifestyle && !isET && !isSpecialty && !isEveryday && !isTaobao && !isPackaging && isCommunityStore(familyKey);

  if (!isFB && !isTrust && !isBM && !isLifestyle && !isET && !isSpecialty && !isEveryday && !isTaobao && !isPackaging && !isCommunity) {
    return <CheckoutAddressClient params={params} />;
  }

  return (
    <div style={{ background: "var(--shop-bg)", minHeight: "100vh" }}>
      {isFB && <FashionBeautyHeader />}
      {isTrust && <TrustCheckoutHeader step={1} />}
      {isBM && <BusinessModelCheckoutHeader step={1} />}
      {isLifestyle && <LifestyleCheckoutHeader step={1} />}
      {isET && <ElectronicsTechCheckoutHeader step={1} />}
      {isSpecialty && <SpecialtyCheckoutHeader step={1} />}
      <ThemeRibbon
        variant="checkout"
        isEveryday={isEveryday}
        isTaobao={isTaobao}
        isPackaging={isPackaging}
        isCommunity={isCommunity}
      />
      <CheckoutAddressClient params={params} />
    </div>
  );
}
