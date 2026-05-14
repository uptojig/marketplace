// /stores/{slug}/checkout/confirm — Step 2 of the checkout flow.
//
// Server wrapper: looks up the store to detect the design family,
// renders the matching family's bespoke step header, then hands off
// to the client component that owns the address summary, shipping
// option, payment selection, and order-create call.
//
// Stores not matching any family fall through to just rendering the
// client without any extra chrome (keeps existing behaviour unchanged).

import { prisma } from "@/lib/prisma";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import { isTrustStore } from "@/lib/landing/trust";
import { isBusinessModelStore } from "@/lib/landing/business-model";
import { isLifestyleStore } from "@/lib/landing/lifestyle";
import { isElectronicsTechStore } from "@/lib/landing/electronics-tech";
import { isSpecialtyStore } from "@/lib/landing/specialty";
import { TrustCheckoutHeader } from "@/components/storefront/themes/trust/TrustCheckoutHeader";
import { BusinessModelCheckoutHeader } from "@/components/storefront/themes/business-model/BusinessModelCheckoutHeader";
import { LifestyleCheckoutHeader } from "@/components/storefront/themes/lifestyle/LifestyleCheckoutHeader";
import { ElectronicsTechCheckoutHeader } from "@/components/storefront/themes/electronics-tech/ElectronicsTechCheckoutHeader";
import { SpecialtyCheckoutHeader } from "@/components/storefront/themes/specialty/SpecialtyCheckoutHeader";
import CheckoutConfirmClient from "./confirm-client";

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
          Checkout · Step 2 of 2
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
          Almost yours
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
          Review the details, choose how it travels, and confirm — we&rsquo;ll take it from there.
        </p>
      </header>
    </div>
  );
}

export default async function CheckoutConfirmPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { slug: true, templateId: true, landingThemeVariant: true },
  });
  const familyKey = {
    templateId: store ? effectiveTemplateId(store) : null,
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

  if (!isFB && !isTrust && !isBM && !isLifestyle && !isET && !isSpecialty) {
    return <CheckoutConfirmClient params={params} />;
  }

  return (
    <div style={{ background: "var(--shop-bg)", minHeight: "100vh" }}>
      {isFB && <FashionBeautyHeader />}
      {isTrust && <TrustCheckoutHeader step={2} />}
      {isBM && <BusinessModelCheckoutHeader step={2} />}
      {isLifestyle && <LifestyleCheckoutHeader step={2} />}
      {isET && <ElectronicsTechCheckoutHeader step={2} />}
      {isSpecialty && <SpecialtyCheckoutHeader step={2} />}
      <CheckoutConfirmClient params={params} />
    </div>
  );
}
