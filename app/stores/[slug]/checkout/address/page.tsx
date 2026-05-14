// /stores/{slug}/checkout/address — Step 1 of the checkout flow.
//
// Server wrapper: looks up the store to detect the design family,
// renders an editorial top header for fashion-beauty stores, then
// hands off to the client component that owns the address-book +
// guest-form + sessionStorage logic.
//
// Other families fall through to just rendering the client without
// any extra chrome (keeps existing behaviour unchanged).

import { prisma } from "@/lib/prisma";
import { isFashionBeautyStore } from "@/lib/landing/fashion-beauty";
import CheckoutAddressClient from "./address-client";

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export const dynamic = "force-dynamic";

export default async function CheckoutAddressPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { templateId: true, landingThemeVariant: true },
  });

  const isFB = isFashionBeautyStore({
    templateId: store?.templateId,
    landingThemeVariant: store?.landingThemeVariant,
  });

  if (!isFB) {
    return <CheckoutAddressClient params={params} />;
  }

  return (
    <div style={{ background: "var(--shop-bg)", minHeight: "100vh" }}>
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
      <CheckoutAddressClient params={params} />
    </div>
  );
}
